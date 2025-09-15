"""Performance Indexes and Optimizations

Revision ID: 002_performance_indexes
Revises: 001_textverified_migration
Create Date: 2024-01-15 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_performance_indexes'
down_revision = '001_textverified_migration'
branch_labels = None
depends_on = None

def upgrade():
    """Add performance indexes and optimizations"""
    
    # Composite indexes for frequently queried combinations
    
    # User messages inbox queries (user_id + category + read status + created_at)
    op.create_index(
        'idx_enhanced_message_inbox_performance',
        'enhanced_messages',
        ['user_id', 'category', 'is_read', 'created_at'],
        postgresql_using='btree'
    )
    
    # User messages by verification (user_id + verification_id + created_at)
    op.create_index(
        'idx_enhanced_message_verification_user',
        'enhanced_messages',
        ['user_id', 'verification_id', 'created_at'],
        postgresql_using='btree'
    )
    
    # Message search by content (for full-text search)
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enhanced_message_content_search
        ON enhanced_messages USING gin(to_tsvector('english', content))
    """)
    
    # User numbers performance indexes
    op.create_index(
        'idx_user_number_active_primary',
        'user_numbers',
        ['user_id', 'status', 'is_primary'],
        postgresql_using='btree'
    )
    
    # Country routing performance
    op.create_index(
        'idx_country_routing_performance',
        'country_routing',
        ['country_code', 'is_active', 'tier'],
        postgresql_using='btree'
    )
    
    # Routing decisions analytics
    op.create_index(
        'idx_routing_decision_analytics',
        'routing_decisions',
        ['user_id', 'destination_country', 'created_at'],
        postgresql_using='btree'
    )
    
    # Time-based partitioning preparation for large tables
    op.create_index(
        'idx_enhanced_message_created_month',
        'enhanced_messages',
        [sa.text("date_trunc('month', created_at)")],
        postgresql_using='btree'
    )
    
    op.create_index(
        'idx_routing_decision_created_month',
        'routing_decisions',
        [sa.text("date_trunc('month', created_at)")],
        postgresql_using='btree'
    )
    
    # Verification requests performance
    op.create_index(
        'idx_verification_user_status_created',
        'verification_requests',
        ['user_id', 'status', 'created_at'],
        postgresql_using='btree'
    )
    
    # User sessions cleanup index
    op.create_index(
        'idx_session_cleanup',
        'sessions',
        ['expires_at', 'is_active'],
        postgresql_using='btree'
    )
    
    # API keys performance
    op.create_index(
        'idx_apikey_user_active_used',
        'api_keys',
        ['user_id', 'is_active', 'last_used'],
        postgresql_using='btree'
    )

def downgrade():
    """Remove performance indexes"""
    
    # Drop composite indexes
    op.drop_index('idx_enhanced_message_inbox_performance', 'enhanced_messages')
    op.drop_index('idx_enhanced_message_verification_user', 'enhanced_messages')
    op.drop_index('idx_user_number_active_primary', 'user_numbers')
    op.drop_index('idx_country_routing_performance', 'country_routing')
    op.drop_index('idx_routing_decision_analytics', 'routing_decisions')
    op.drop_index('idx_enhanced_message_created_month', 'enhanced_messages')
    op.drop_index('idx_routing_decision_created_month', 'routing_decisions')
    op.drop_index('idx_verification_user_status_created', 'verification_requests')
    op.drop_index('idx_session_cleanup', 'sessions')
    op.drop_index('idx_apikey_user_active_used', 'api_keys')
    
    # Drop full-text search index
    op.execute("DROP INDEX IF EXISTS idx_enhanced_message_content_search")