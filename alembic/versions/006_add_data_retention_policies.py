"""Add data retention and cleanup policies

Revision ID: 006_add_data_retention_policies
Revises: 005_add_performance_indexes
Create Date: 2024-01-15 15:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "006_add_data_retention_policies"
down_revision = "005_add_performance_indexes"
branch_labels = None
depends_on = None


def upgrade():
    """Add data retention and cleanup policies"""

    # Add retention policy fields to existing tables

    # Add retention fields to verification_requests
    op.add_column(
        "verification_requests",
        sa.Column("retention_until", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "verification_requests", sa.Column("is_archived", sa.Boolean(), default=False)
    )

    # Add retention fields to communication_messages
    op.add_column(
        "communication_messages",
        sa.Column("retention_until", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "communication_messages", sa.Column("is_archived", sa.Boolean(), default=False)
    )

    # Add retention fields to voice_calls
    op.add_column(
        "voice_calls", sa.Column("retention_until", sa.DateTime(), nullable=True)
    )
    op.add_column("voice_calls", sa.Column("is_archived", sa.Boolean(), default=False))

    # Add retention fields to verification_messages
    op.add_column(
        "verification_messages",
        sa.Column("retention_until", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "verification_messages", sa.Column("is_archived", sa.Boolean(), default=False)
    )

    # Add retention fields to payments
    op.add_column(
        "payments", sa.Column("retention_until", sa.DateTime(), nullable=True)
    )
    op.add_column("payments", sa.Column("is_archived", sa.Boolean(), default=False))

    # Add retention fields to usage_records
    op.add_column(
        "usage_records", sa.Column("retention_until", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "usage_records", sa.Column("is_archived", sa.Boolean(), default=False)
    )

    # Create data_retention_policies table
    op.create_table(
        "data_retention_policies",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("table_name", sa.String(100), nullable=False),
        sa.Column("retention_days", sa.Integer(), nullable=False),
        sa.Column("archive_after_days", sa.Integer(), nullable=True),
        sa.Column("delete_after_days", sa.Integer(), nullable=True),
        sa.Column("policy_type", sa.String(50), default="time_based"),
        sa.Column("conditions", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("last_cleanup_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), default=sa.func.now()),
        sa.Column(
            "updated_at", sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_retention_table_active",
        "data_retention_policies",
        ["table_name", "is_active"],
        unique=False,
    )

    # Create cleanup_jobs table for tracking cleanup operations
    op.create_table(
        "cleanup_jobs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("job_type", sa.String(50), nullable=False),
        sa.Column("table_name", sa.String(100), nullable=False),
        sa.Column("status", sa.String(20), default="pending"),
        sa.Column("records_processed", sa.Integer(), default=0),
        sa.Column("records_archived", sa.Integer(), default=0),
        sa.Column("records_deleted", sa.Integer(), default=0),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_cleanup_status_created",
        "cleanup_jobs",
        ["status", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_cleanup_table_created",
        "cleanup_jobs",
        ["table_name", "created_at"],
        unique=False,
    )

    # Insert default retention policies
    op.execute(
        """
        INSERT INTO data_retention_policies (id, table_name, retention_days, archive_after_days, delete_after_days, policy_type, conditions, is_active)
        VALUES 
        -- Verification data retention
        ('ret_verification_requests', 'verification_requests', 365, 90, 730, 'time_based', 
         '{"archive_conditions": ["status IN (''completed'', ''failed'', ''cancelled'')"]}', true),
        
        ('ret_verification_messages', 'verification_messages', 365, 90, 730, 'time_based', 
         '{"archive_conditions": []}', true),
        
        -- Communication data retention
        ('ret_communication_messages', 'communication_messages', 1095, 365, 2190, 'time_based', 
         '{"archive_conditions": ["status = ''delivered''"]}', true),
        
        ('ret_voice_calls', 'voice_calls', 1095, 365, 2190, 'time_based', 
         '{"archive_conditions": ["status = ''completed''"]}', true),
        
        -- Payment and billing data retention (longer retention for compliance)
        ('ret_payments', 'payments', 2555, 1095, 3650, 'time_based', 
         '{"archive_conditions": ["status IN (''completed'', ''refunded'')"]}', true),
        
        ('ret_usage_records', 'usage_records', 2555, 1095, 3650, 'time_based', 
         '{"archive_conditions": []}', true),
        
        -- Analytics data retention
        ('ret_verification_analytics', 'verification_analytics', 1095, 365, 2190, 'time_based', 
         '{"archive_conditions": []}', true),
        
        ('ret_communication_analytics', 'communication_analytics', 1095, 365, 2190, 'time_based', 
         '{"archive_conditions": []}', true),
        
        ('ret_subscription_analytics', 'subscription_analytics', 1095, 365, 2190, 'time_based', 
         '{"archive_conditions": []}', true),
        
        -- Session and temporary data retention (shorter retention)
        ('ret_sessions', 'sessions', 90, 30, 180, 'time_based', 
         '{"archive_conditions": ["is_active = false"]}', true)
    """
    )

    # Create indexes for retention fields
    op.create_index(
        "idx_verification_retention",
        "verification_requests",
        ["retention_until"],
        unique=False,
    )
    op.create_index(
        "idx_verification_archived",
        "verification_requests",
        ["is_archived"],
        unique=False,
    )

    op.create_index(
        "idx_message_retention",
        "communication_messages",
        ["retention_until"],
        unique=False,
    )
    op.create_index(
        "idx_message_archived", "communication_messages", ["is_archived"], unique=False
    )

    op.create_index(
        "idx_call_retention", "voice_calls", ["retention_until"], unique=False
    )
    op.create_index("idx_call_archived", "voice_calls", ["is_archived"], unique=False)

    op.create_index(
        "idx_payment_retention", "payments", ["retention_until"], unique=False
    )
    op.create_index("idx_payment_archived", "payments", ["is_archived"], unique=False)

    op.create_index(
        "idx_usage_retention", "usage_records", ["retention_until"], unique=False
    )
    op.create_index(
        "idx_usage_archived", "usage_records", ["is_archived"], unique=False
    )

    # Create stored procedures for cleanup operations (PostgreSQL specific)
    try:
        # Function to calculate retention dates
        op.execute(
            """
            CREATE OR REPLACE FUNCTION calculate_retention_date(
                created_date TIMESTAMP,
                retention_days INTEGER
            ) RETURNS TIMESTAMP AS $$
            BEGIN
                RETURN created_date + INTERVAL '1 day' * retention_days;
            END;
            $$ LANGUAGE plpgsql;
        """
        )

        # Function to archive old records
        op.execute(
            """
            CREATE OR REPLACE FUNCTION archive_old_records(
                table_name TEXT,
                archive_after_days INTEGER
            ) RETURNS INTEGER AS $$
            DECLARE
                records_archived INTEGER := 0;
                archive_date TIMESTAMP;
            BEGIN
                archive_date := NOW() - INTERVAL '1 day' * archive_after_days;
                
                -- Update records to archived status
                EXECUTE format('
                    UPDATE %I 
                    SET is_archived = true, 
                        retention_until = calculate_retention_date(created_at, %s)
                    WHERE created_at < %L 
                    AND is_archived = false
                ', table_name, archive_after_days * 2, archive_date);
                
                GET DIAGNOSTICS records_archived = ROW_COUNT;
                RETURN records_archived;
            END;
            $$ LANGUAGE plpgsql;
        """
        )

        # Function to delete expired records
        op.execute(
            """
            CREATE OR REPLACE FUNCTION delete_expired_records(
                table_name TEXT
            ) RETURNS INTEGER AS $$
            DECLARE
                records_deleted INTEGER := 0;
            BEGIN
                EXECUTE format('
                    DELETE FROM %I 
                    WHERE retention_until IS NOT NULL 
                    AND retention_until < NOW()
                    AND is_archived = true
                ', table_name);
                
                GET DIAGNOSTICS records_deleted = ROW_COUNT;
                RETURN records_deleted;
            END;
            $$ LANGUAGE plpgsql;
        """
        )

    except Exception:
        # Skip stored procedures for non-PostgreSQL databases
        pass

    # Create triggers to automatically set retention dates (PostgreSQL specific)
    try:
        # Trigger function to set retention dates on insert
        op.execute(
            """
            CREATE OR REPLACE FUNCTION set_retention_date() RETURNS TRIGGER AS $$
            DECLARE
                policy_days INTEGER;
            BEGIN
                -- Get retention policy for this table
                SELECT retention_days INTO policy_days
                FROM data_retention_policies 
                WHERE table_name = TG_TABLE_NAME AND is_active = true
                LIMIT 1;
                
                IF policy_days IS NOT NULL THEN
                    NEW.retention_until := calculate_retention_date(NEW.created_at, policy_days);
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """
        )

        # Create triggers for each table
        tables_with_retention = [
            "verification_requests",
            "communication_messages",
            "voice_calls",
            "verification_messages",
            "payments",
            "usage_records",
        ]

        for table in tables_with_retention:
            op.execute(
                f"""
                CREATE TRIGGER trigger_set_retention_date_{table}
                BEFORE INSERT ON {table}
                FOR EACH ROW
                EXECUTE FUNCTION set_retention_date();
            """
            )

    except Exception:
        # Skip triggers for non-PostgreSQL databases
        pass


def downgrade():
    """Remove data retention and cleanup policies"""

    # Drop triggers
    try:
        tables_with_retention = [
            "verification_requests",
            "communication_messages",
            "voice_calls",
            "verification_messages",
            "payments",
            "usage_records",
        ]

        for table in tables_with_retention:
            op.execute(
                f"DROP TRIGGER IF EXISTS trigger_set_retention_date_{table} ON {table}"
            )

        # Drop functions
        op.execute("DROP FUNCTION IF EXISTS set_retention_date()")
        op.execute("DROP FUNCTION IF EXISTS delete_expired_records(TEXT)")
        op.execute("DROP FUNCTION IF EXISTS archive_old_records(TEXT, INTEGER)")
        op.execute(
            "DROP FUNCTION IF EXISTS calculate_retention_date(TIMESTAMP, INTEGER)"
        )

    except Exception:
        pass

    # Drop indexes for retention fields
    op.drop_index("idx_verification_retention", table_name="verification_requests")
    op.drop_index("idx_verification_archived", table_name="verification_requests")
    op.drop_index("idx_message_retention", table_name="communication_messages")
    op.drop_index("idx_message_archived", table_name="communication_messages")
    op.drop_index("idx_call_retention", table_name="voice_calls")
    op.drop_index("idx_call_archived", table_name="voice_calls")
    op.drop_index("idx_payment_retention", table_name="payments")
    op.drop_index("idx_payment_archived", table_name="payments")
    op.drop_index("idx_usage_retention", table_name="usage_records")
    op.drop_index("idx_usage_archived", table_name="usage_records")

    # Drop tables
    op.drop_table("cleanup_jobs")
    op.drop_table("data_retention_policies")

    # Remove retention columns
    op.drop_column("usage_records", "is_archived")
    op.drop_column("usage_records", "retention_until")
    op.drop_column("payments", "is_archived")
    op.drop_column("payments", "retention_until")
    op.drop_column("verification_messages", "is_archived")
    op.drop_column("verification_messages", "retention_until")
    op.drop_column("voice_calls", "is_archived")
    op.drop_column("voice_calls", "retention_until")
    op.drop_column("communication_messages", "is_archived")
    op.drop_column("communication_messages", "retention_until")
    op.drop_column("verification_requests", "is_archived")
    op.drop_column("verification_requests", "retention_until")
