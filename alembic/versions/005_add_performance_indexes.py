"""Add performance indexes and optimization

Revision ID: 005_add_performance_indexes
Revises: 004_add_enhanced_models
Create Date: 2024-01-15 14:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "005_add_performance_indexes"
down_revision = "004_add_enhanced_models"
branch_labels = None
depends_on = None


def upgrade():
    """Add performance indexes for frequently queried fields"""

    # Composite indexes for verification_requests
    op.create_index(
        "idx_verification_user_status_created",
        "verification_requests",
        ["user_id", "status", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_verification_service_status_created",
        "verification_requests",
        ["service_id", "status", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_verification_expires_status",
        "verification_requests",
        ["expires_at", "status"],
        unique=False,
    )
    op.create_index(
        "idx_verification_country_created",
        "verification_requests",
        ["country_code", "created_at"],
        unique=False,
    )

    # Composite indexes for communication_messages
    op.create_index(
        "idx_message_user_created_type",
        "communication_messages",
        ["user_id", "created_at", "message_type"],
        unique=False,
    )
    op.create_index(
        "idx_message_session_created_status",
        "communication_messages",
        ["session_id", "created_at", "status"],
        unique=False,
    )
    op.create_index(
        "idx_message_direction_status_created",
        "communication_messages",
        ["direction", "status", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_message_from_to_created",
        "communication_messages",
        ["from_number", "to_number", "created_at"],
        unique=False,
    )

    # Composite indexes for voice_calls
    op.create_index(
        "idx_call_user_created_status",
        "voice_calls",
        ["user_id", "created_at", "status"],
        unique=False,
    )
    op.create_index(
        "idx_call_direction_status_created",
        "voice_calls",
        ["direction", "status", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_call_duration_created",
        "voice_calls",
        ["duration", "created_at"],
        unique=False,
    )

    # Composite indexes for user_subscriptions
    op.create_index(
        "idx_subscription_user_status_billing",
        "user_subscriptions",
        ["user_id", "status", "next_billing_date"],
        unique=False,
    )
    op.create_index(
        "idx_subscription_plan_status_created",
        "user_subscriptions",
        ["plan_id", "status", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_subscription_trial_end",
        "user_subscriptions",
        ["trial_end_date"],
        unique=False,
    )

    # Composite indexes for payments
    op.create_index(
        "idx_payment_user_status_created",
        "payments",
        ["user_id", "status", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_payment_subscription_created",
        "payments",
        ["subscription_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "idx_payment_amount_created", "payments", ["amount", "created_at"], unique=False
    )

    # Composite indexes for usage_records
    op.create_index(
        "idx_usage_user_type_period",
        "usage_records",
        ["user_id", "usage_type", "billing_period_start"],
        unique=False,
    )
    op.create_index(
        "idx_usage_subscription_type_period",
        "usage_records",
        ["subscription_id", "usage_type", "billing_period_start"],
        unique=False,
    )
    op.create_index(
        "idx_usage_timestamp_type",
        "usage_records",
        ["usage_timestamp", "usage_type"],
        unique=False,
    )

    # Composite indexes for phone_numbers
    op.create_index(
        "idx_phone_owner_status_country",
        "phone_numbers",
        ["owner_id", "status", "country_code"],
        unique=False,
    )
    op.create_index(
        "idx_phone_expires_status",
        "phone_numbers",
        ["expires_at", "status"],
        unique=False,
    )
    op.create_index(
        "idx_phone_provider_country",
        "phone_numbers",
        ["provider", "country_code"],
        unique=False,
    )

    # Composite indexes for communication_sessions
    op.create_index(
        "idx_session_user_active_updated",
        "communication_sessions",
        ["user_id", "is_active", "last_activity_at"],
        unique=False,
    )
    op.create_index(
        "idx_session_external_type_active",
        "communication_sessions",
        ["external_number", "session_type", "is_active"],
        unique=False,
    )

    # Composite indexes for conversations (if exists)
    try:
        op.create_index(
            "idx_conversation_user_status_updated",
            "conversations",
            ["created_by", "status", "last_message_at"],
            unique=False,
        )
        op.create_index(
            "idx_conversation_external_active",
            "conversations",
            ["external_number", "is_archived"],
            unique=False,
        )
    except Exception:
        # Table might not exist in all environments
        pass

    # Partial indexes for active records (PostgreSQL specific)
    try:
        # Only index active verification requests
        op.execute(
            """
            CREATE INDEX CONCURRENTLY idx_verification_active_created 
            ON verification_requests (created_at) 
            WHERE status IN ('pending', 'active')
        """
        )

        # Only index active phone numbers
        op.execute(
            """
            CREATE INDEX CONCURRENTLY idx_phone_active_expires 
            ON phone_numbers (expires_at) 
            WHERE status = 'active'
        """
        )

        # Only index undelivered messages
        op.execute(
            """
            CREATE INDEX CONCURRENTLY idx_message_undelivered_created 
            ON communication_messages (created_at) 
            WHERE status IN ('queued', 'sending', 'sent')
        """
        )

        # Only index active subscriptions
        op.execute(
            """
            CREATE INDEX CONCURRENTLY idx_subscription_active_billing 
            ON user_subscriptions (next_billing_date) 
            WHERE status = 'active'
        """
        )

    except Exception:
        # Fallback for non-PostgreSQL databases
        pass

    # Text search indexes for content search
    try:
        # Full-text search on message content (PostgreSQL)
        op.execute(
            """
            CREATE INDEX CONCURRENTLY idx_message_content_search 
            ON communication_messages 
            USING gin(to_tsvector('english', content))
        """
        )

        # Full-text search on verification service names
        op.execute(
            """
            CREATE INDEX CONCURRENTLY idx_service_name_search 
            ON verification_services 
            USING gin(to_tsvector('english', service_name || ' ' || display_name))
        """
        )

    except Exception:
        # Fallback for non-PostgreSQL databases - use regular indexes
        op.create_index(
            "idx_message_content_text",
            "communication_messages",
            ["content"],
            unique=False,
            postgresql_using="gin",
        )
        op.create_index(
            "idx_service_display_name",
            "verification_services",
            ["display_name"],
            unique=False,
        )


def downgrade():
    """Remove performance indexes"""

    # Drop composite indexes
    op.drop_index(
        "idx_verification_user_status_created", table_name="verification_requests"
    )
    op.drop_index(
        "idx_verification_service_status_created", table_name="verification_requests"
    )
    op.drop_index("idx_verification_expires_status", table_name="verification_requests")
    op.drop_index(
        "idx_verification_country_created", table_name="verification_requests"
    )

    op.drop_index("idx_message_user_created_type", table_name="communication_messages")
    op.drop_index(
        "idx_message_session_created_status", table_name="communication_messages"
    )
    op.drop_index(
        "idx_message_direction_status_created", table_name="communication_messages"
    )
    op.drop_index("idx_message_from_to_created", table_name="communication_messages")

    op.drop_index("idx_call_user_created_status", table_name="voice_calls")
    op.drop_index("idx_call_direction_status_created", table_name="voice_calls")
    op.drop_index("idx_call_duration_created", table_name="voice_calls")

    op.drop_index(
        "idx_subscription_user_status_billing", table_name="user_subscriptions"
    )
    op.drop_index(
        "idx_subscription_plan_status_created", table_name="user_subscriptions"
    )
    op.drop_index("idx_subscription_trial_end", table_name="user_subscriptions")

    op.drop_index("idx_payment_user_status_created", table_name="payments")
    op.drop_index("idx_payment_subscription_created", table_name="payments")
    op.drop_index("idx_payment_amount_created", table_name="payments")

    op.drop_index("idx_usage_user_type_period", table_name="usage_records")
    op.drop_index("idx_usage_subscription_type_period", table_name="usage_records")
    op.drop_index("idx_usage_timestamp_type", table_name="usage_records")

    op.drop_index("idx_phone_owner_status_country", table_name="phone_numbers")
    op.drop_index("idx_phone_expires_status", table_name="phone_numbers")
    op.drop_index("idx_phone_provider_country", table_name="phone_numbers")

    op.drop_index(
        "idx_session_user_active_updated", table_name="communication_sessions"
    )
    op.drop_index(
        "idx_session_external_type_active", table_name="communication_sessions"
    )

    # Drop conversation indexes if they exist
    try:
        op.drop_index(
            "idx_conversation_user_status_updated", table_name="conversations"
        )
        op.drop_index("idx_conversation_external_active", table_name="conversations")
    except Exception:
        pass

    # Drop partial indexes
    try:
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_verification_active_created")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_phone_active_expires")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_message_undelivered_created")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_subscription_active_billing")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_message_content_search")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_service_name_search")
    except Exception:
        pass

    # Drop fallback indexes
    try:
        op.drop_index("idx_message_content_text", table_name="communication_messages")
        op.drop_index("idx_service_display_name", table_name="verification_services")
    except Exception:
        pass
