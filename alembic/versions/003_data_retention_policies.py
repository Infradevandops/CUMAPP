"""Data Retention and Cleanup Policies

Revision ID: 003_data_retention_policies
Revises: 002_performance_indexes
Create Date: 2024-01-15 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "003_data_retention_policies"
down_revision = "002_performance_indexes"
branch_labels = None
depends_on = None


def upgrade():
    """Add data retention and cleanup policies"""

    # Create data retention configuration table
    op.create_table(
        "data_retention_policies",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("table_name", sa.String(100), nullable=False),
        sa.Column("retention_days", sa.Integer(), nullable=False),
        sa.Column("cleanup_field", sa.String(100), nullable=False),
        sa.Column("conditions", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, default=True),
        sa.Column("last_cleanup", sa.DateTime(), nullable=True),
        sa.Column("records_cleaned", sa.Integer(), nullable=True, default=0),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("table_name"),
    )

    # Create cleanup log table
    op.create_table(
        "cleanup_logs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("table_name", sa.String(100), nullable=False),
        sa.Column("cleanup_date", sa.DateTime(), nullable=False),
        sa.Column("records_deleted", sa.Integer(), nullable=False),
        sa.Column("retention_days", sa.Integer(), nullable=False),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), nullable=True, default="completed"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for cleanup operations
    op.create_index(
        "idx_cleanup_logs_table_date", "cleanup_logs", ["table_name", "cleanup_date"]
    )
    op.create_index(
        "idx_retention_policies_active", "data_retention_policies", ["is_active"]
    )

    # Insert default retention policies
    op.execute(
        """
        INSERT INTO data_retention_policies (id, table_name, retention_days, cleanup_field, conditions, is_active, created_at, updated_at)
        VALUES 
        -- Enhanced messages retention (1 year for regular messages, 2 years for verification codes)
        ('policy_enhanced_messages', 'enhanced_messages', 365, 'created_at', 
         '{"exclude_categories": ["VERIFICATION_CODE"]}', true, NOW(), NOW()),
        
        -- Verification codes retention (2 years)
        ('policy_verification_codes', 'enhanced_messages', 730, 'created_at', 
         '{"include_categories": ["VERIFICATION_CODE"]}', true, NOW(), NOW()),
        
        -- Routing decisions retention (90 days)
        ('policy_routing_decisions', 'routing_decisions', 90, 'created_at', 
         '{}', true, NOW(), NOW()),
        
        -- Expired sessions cleanup (7 days after expiration)
        ('policy_expired_sessions', 'sessions', 7, 'expires_at', 
         '{"additional_condition": "is_active = false"}', true, NOW(), NOW()),
        
        -- Verification requests cleanup (30 days for completed/failed, 1 day for expired)
        ('policy_verification_requests', 'verification_requests', 30, 'created_at', 
         '{"status_conditions": {"completed": 30, "failed": 30, "expired": 1}}', true, NOW(), NOW()),
        
        -- Cleanup logs retention (1 year)
        ('policy_cleanup_logs', 'cleanup_logs', 365, 'created_at', 
         '{}', true, NOW(), NOW())
    """
    )

    # Create stored procedure for automated cleanup
    op.execute(
        """
        CREATE OR REPLACE FUNCTION execute_data_cleanup()
        RETURNS TABLE(
            table_name TEXT,
            records_deleted INTEGER,
            execution_time_ms INTEGER,
            status TEXT
        ) AS $$
        DECLARE
            policy_record RECORD;
            cleanup_query TEXT;
            start_time TIMESTAMP;
            end_time TIMESTAMP;
            deleted_count INTEGER;
            exec_time INTEGER;
            cleanup_id TEXT;
        BEGIN
            -- Loop through active retention policies
            FOR policy_record IN 
                SELECT * FROM data_retention_policies 
                WHERE is_active = true 
                ORDER BY table_name
            LOOP
                start_time := clock_timestamp();
                cleanup_id := 'cleanup_' || extract(epoch from start_time)::text;
                
                BEGIN
                    -- Build cleanup query based on policy
                    CASE policy_record.table_name
                        WHEN 'enhanced_messages' THEN
                            IF policy_record.conditions->>'include_categories' IS NOT NULL THEN
                                -- Specific categories only
                                cleanup_query := format(
                                    'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days'' AND category = ANY(ARRAY[%s])',
                                    policy_record.table_name,
                                    policy_record.cleanup_field,
                                    policy_record.retention_days,
                                    policy_record.conditions->>'include_categories'
                                );
                            ELSIF policy_record.conditions->>'exclude_categories' IS NOT NULL THEN
                                -- Exclude specific categories
                                cleanup_query := format(
                                    'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days'' AND category != ALL(ARRAY[%s])',
                                    policy_record.table_name,
                                    policy_record.cleanup_field,
                                    policy_record.retention_days,
                                    policy_record.conditions->>'exclude_categories'
                                );
                            ELSE
                                -- All records
                                cleanup_query := format(
                                    'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days''',
                                    policy_record.table_name,
                                    policy_record.cleanup_field,
                                    policy_record.retention_days
                                );
                            END IF;
                        
                        WHEN 'sessions' THEN
                            cleanup_query := format(
                                'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days'' AND is_active = false',
                                policy_record.table_name,
                                policy_record.cleanup_field,
                                policy_record.retention_days
                            );
                        
                        ELSE
                            -- Default cleanup query
                            cleanup_query := format(
                                'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days''',
                                policy_record.table_name,
                                policy_record.cleanup_field,
                                policy_record.retention_days
                            );
                    END CASE;
                    
                    -- Execute cleanup
                    EXECUTE cleanup_query;
                    GET DIAGNOSTICS deleted_count = ROW_COUNT;
                    
                    end_time := clock_timestamp();
                    exec_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
                    
                    -- Log successful cleanup
                    INSERT INTO cleanup_logs (
                        id, table_name, cleanup_date, records_deleted, 
                        retention_days, execution_time_ms, status, created_at
                    ) VALUES (
                        cleanup_id, policy_record.table_name, start_time, deleted_count,
                        policy_record.retention_days, exec_time, 'completed', NOW()
                    );
                    
                    -- Update policy last cleanup
                    UPDATE data_retention_policies 
                    SET last_cleanup = start_time, 
                        records_cleaned = records_cleaned + deleted_count,
                        updated_at = NOW()
                    WHERE id = policy_record.id;
                    
                    -- Return result
                    table_name := policy_record.table_name;
                    records_deleted := deleted_count;
                    execution_time_ms := exec_time;
                    status := 'completed';
                    RETURN NEXT;
                    
                EXCEPTION WHEN OTHERS THEN
                    -- Log failed cleanup
                    end_time := clock_timestamp();
                    exec_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
                    
                    INSERT INTO cleanup_logs (
                        id, table_name, cleanup_date, records_deleted, 
                        retention_days, execution_time_ms, status, error_message, created_at
                    ) VALUES (
                        cleanup_id, policy_record.table_name, start_time, 0,
                        policy_record.retention_days, exec_time, 'failed', SQLERRM, NOW()
                    );
                    
                    -- Return error result
                    table_name := policy_record.table_name;
                    records_deleted := 0;
                    execution_time_ms := exec_time;
                    status := 'failed: ' || SQLERRM;
                    RETURN NEXT;
                END;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    # Create function to get cleanup statistics
    op.execute(
        """
        CREATE OR REPLACE FUNCTION get_cleanup_stats(days_back INTEGER DEFAULT 30)
        RETURNS TABLE(
            table_name TEXT,
            total_cleanups INTEGER,
            total_records_deleted BIGINT,
            avg_execution_time_ms NUMERIC,
            last_cleanup TIMESTAMP,
            success_rate NUMERIC
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                cl.table_name,
                COUNT(*)::INTEGER as total_cleanups,
                SUM(cl.records_deleted)::BIGINT as total_records_deleted,
                AVG(cl.execution_time_ms)::NUMERIC as avg_execution_time_ms,
                MAX(cl.cleanup_date) as last_cleanup,
                (COUNT(*) FILTER (WHERE cl.status = 'completed')::NUMERIC / COUNT(*)::NUMERIC * 100) as success_rate
            FROM cleanup_logs cl
            WHERE cl.cleanup_date >= NOW() - INTERVAL '%s days'
            GROUP BY cl.table_name
            ORDER BY cl.table_name;
        END;
        $$ LANGUAGE plpgsql;
    """
    )


def downgrade():
    """Remove data retention and cleanup policies"""

    # Drop functions
    op.execute("DROP FUNCTION IF EXISTS execute_data_cleanup()")
    op.execute("DROP FUNCTION IF EXISTS get_cleanup_stats(INTEGER)")

    # Drop tables
    op.drop_table("cleanup_logs")
    op.drop_table("data_retention_policies")
