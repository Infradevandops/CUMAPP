"""Add enhanced models for TextVerified migration

Revision ID: 004_add_enhanced_models
Revises: 003_add_enhanced_conversation_models
Create Date: 2024-01-15 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "004_add_enhanced_models"
down_revision = "003_add_enhanced_conversation_models"
branch_labels = None
depends_on = None


def upgrade():
    """Add enhanced models for verification, subscription, and communication"""

    # Create verification_services table
    op.create_table(
        "verification_services",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("service_name", sa.String(length=100), nullable=False),
        sa.Column("display_name", sa.String(length=200), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "SOCIAL",
                "MESSAGING",
                "TECH",
                "GAMING",
                "FINANCE",
                "ECOMMERCE",
                "OTHER",
                name="servicecategory",
            ),
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column(
            "provider",
            sa.Enum("TEXTVERIFIED", "TWILIO", "MOCK", name="verificationprovider"),
            nullable=True,
        ),
        sa.Column("provider_service_id", sa.String(length=100), nullable=True),
        sa.Column("base_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("success_rate", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column("average_delivery_time", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("website_url", sa.String(length=500), nullable=True),
        sa.Column("supported_countries", sa.JSON(), nullable=True),
        sa.Column("code_patterns", sa.JSON(), nullable=True),
        sa.Column("typical_code_length", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_service_active", "verification_services", ["is_active"], unique=False
    )
    op.create_index(
        "idx_service_category", "verification_services", ["category"], unique=False
    )
    op.create_index(
        "idx_service_name", "verification_services", ["service_name"], unique=False
    )
    op.create_index(
        "idx_service_provider", "verification_services", ["provider"], unique=False
    )
    op.create_index(
        op.f("ix_verification_services_service_name"),
        "verification_services",
        ["service_name"],
        unique=True,
    )

    # Update verification_requests table with enhanced fields
    op.add_column(
        "verification_requests", sa.Column("service_id", sa.String(), nullable=True)
    )
    op.add_column(
        "verification_requests",
        sa.Column(
            "provider",
            sa.Enum("TEXTVERIFIED", "TWILIO", "MOCK", name="verificationprovider"),
            nullable=True,
        ),
    )
    op.add_column(
        "verification_requests",
        sa.Column("provider_request_id", sa.String(length=200), nullable=True),
    )
    op.add_column(
        "verification_requests",
        sa.Column("country_code", sa.String(length=3), nullable=True),
    )
    op.add_column(
        "verification_requests", sa.Column("routing_info", sa.JSON(), nullable=True)
    )
    op.add_column(
        "verification_requests",
        sa.Column("cost_estimate", sa.Numeric(precision=10, scale=4), nullable=True),
    )
    op.add_column(
        "verification_requests",
        sa.Column("actual_cost", sa.Numeric(precision=10, scale=4), nullable=True),
    )
    op.add_column(
        "verification_requests", sa.Column("retry_count", sa.Integer(), nullable=True)
    )
    op.add_column(
        "verification_requests", sa.Column("max_retries", sa.Integer(), nullable=True)
    )
    op.add_column(
        "verification_requests",
        sa.Column("last_retry_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "verification_requests",
        sa.Column("received_messages", sa.JSON(), nullable=True),
    )
    op.add_column(
        "verification_requests", sa.Column("extracted_codes", sa.JSON(), nullable=True)
    )
    op.add_column(
        "verification_requests",
        sa.Column("auto_completed", sa.Boolean(), nullable=True),
    )
    op.add_column(
        "verification_requests",
        sa.Column("priority", sa.String(length=20), nullable=True),
    )
    op.add_column(
        "verification_requests", sa.Column("metadata", sa.JSON(), nullable=True)
    )

    # Add foreign key constraint for service_id
    op.create_foreign_key(
        None, "verification_requests", "verification_services", ["service_id"], ["id"]
    )

    # Create verification_messages table
    op.create_table(
        "verification_messages",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("verification_id", sa.String(), nullable=False),
        sa.Column("message_content", sa.Text(), nullable=False),
        sa.Column("sender_number", sa.String(length=20), nullable=True),
        sa.Column("received_at", sa.DateTime(), nullable=True),
        sa.Column("extracted_codes", sa.JSON(), nullable=True),
        sa.Column(
            "extraction_confidence", sa.Numeric(precision=5, scale=4), nullable=True
        ),
        sa.Column("provider_message_id", sa.String(length=200), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["verification_id"],
            ["verification_requests.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_message_received", "verification_messages", ["received_at"], unique=False
    )
    op.create_index(
        "idx_message_verification",
        "verification_messages",
        ["verification_id"],
        unique=False,
    )

    # Create verification_analytics table
    op.create_table(
        "verification_analytics",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("period_type", sa.String(length=20), nullable=True),
        sa.Column("service_id", sa.String(), nullable=True),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("country_code", sa.String(length=3), nullable=True),
        sa.Column("total_requests", sa.Integer(), nullable=True),
        sa.Column("successful_requests", sa.Integer(), nullable=True),
        sa.Column("failed_requests", sa.Integer(), nullable=True),
        sa.Column("cancelled_requests", sa.Integer(), nullable=True),
        sa.Column("average_completion_time", sa.Integer(), nullable=True),
        sa.Column("success_rate", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column("total_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("average_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["service_id"],
            ["verification_services.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_analytics_country_date",
        "verification_analytics",
        ["country_code", "date"],
        unique=False,
    )
    op.create_index(
        "idx_analytics_date", "verification_analytics", ["date"], unique=False
    )
    op.create_index(
        "idx_analytics_service_date",
        "verification_analytics",
        ["service_id", "date"],
        unique=False,
    )
    op.create_index(
        "idx_analytics_user_date",
        "verification_analytics",
        ["user_id", "date"],
        unique=False,
    )

    # Create subscription_plan_configs table
    op.create_table(
        "subscription_plan_configs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column(
            "plan_name",
            sa.Enum(
                "FREE",
                "BASIC",
                "STANDARD",
                "PREMIUM",
                "ENTERPRISE",
                name="subscriptionplan",
            ),
            nullable=False,
        ),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("monthly_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("quarterly_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("yearly_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("monthly_sms_limit", sa.Integer(), nullable=True),
        sa.Column("monthly_voice_minutes_limit", sa.Integer(), nullable=True),
        sa.Column("monthly_verification_limit", sa.Integer(), nullable=True),
        sa.Column("max_phone_numbers", sa.Integer(), nullable=True),
        sa.Column("api_rate_limit", sa.Integer(), nullable=True),
        sa.Column("features", sa.JSON(), nullable=True),
        sa.Column("smart_routing_enabled", sa.Boolean(), nullable=True),
        sa.Column("ai_assistant_enabled", sa.Boolean(), nullable=True),
        sa.Column("priority_support", sa.Boolean(), nullable=True),
        sa.Column("analytics_enabled", sa.Boolean(), nullable=True),
        sa.Column("sms_overage_rate", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column(
            "voice_overage_rate", sa.Numeric(precision=10, scale=4), nullable=True
        ),
        sa.Column(
            "verification_overage_rate",
            sa.Numeric(precision=10, scale=4),
            nullable=True,
        ),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_plan_active", "subscription_plan_configs", ["is_active"], unique=False
    )
    op.create_index(
        "idx_plan_name", "subscription_plan_configs", ["plan_name"], unique=False
    )
    op.create_index(
        "idx_plan_sort", "subscription_plan_configs", ["sort_order"], unique=False
    )
    op.create_index(
        op.f("ix_subscription_plan_configs_plan_name"),
        "subscription_plan_configs",
        ["plan_name"],
        unique=True,
    )

    # Create user_subscriptions table
    op.create_table(
        "user_subscriptions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("plan_id", sa.String(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "ACTIVE",
                "CANCELLED",
                "EXPIRED",
                "SUSPENDED",
                "PENDING",
                name="subscriptionstatus",
            ),
            nullable=True,
        ),
        sa.Column(
            "billing_cycle",
            sa.Enum("MONTHLY", "QUARTERLY", "YEARLY", name="billingcycle"),
            nullable=True,
        ),
        sa.Column("monthly_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("current_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False),
        sa.Column("next_billing_date", sa.DateTime(), nullable=False),
        sa.Column("trial_end_date", sa.DateTime(), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(length=200), nullable=True),
        sa.Column("stripe_customer_id", sa.String(length=200), nullable=True),
        sa.Column("monthly_sms_limit", sa.Integer(), nullable=True),
        sa.Column("monthly_voice_minutes_limit", sa.Integer(), nullable=True),
        sa.Column("monthly_verification_limit", sa.Integer(), nullable=True),
        sa.Column("max_phone_numbers", sa.Integer(), nullable=True),
        sa.Column("current_sms_usage", sa.Integer(), nullable=True),
        sa.Column("current_voice_usage", sa.Integer(), nullable=True),
        sa.Column("current_verification_usage", sa.Integer(), nullable=True),
        sa.Column("current_phone_numbers", sa.Integer(), nullable=True),
        sa.Column("last_usage_reset", sa.DateTime(), nullable=True),
        sa.Column("subscription_metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["plan_id"],
            ["subscription_plan_configs.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_subscription_billing_date",
        "user_subscriptions",
        ["next_billing_date"],
        unique=False,
    )
    op.create_index(
        "idx_subscription_status", "user_subscriptions", ["status"], unique=False
    )
    op.create_index(
        "idx_subscription_stripe",
        "user_subscriptions",
        ["stripe_subscription_id"],
        unique=False,
    )
    op.create_index(
        "idx_subscription_user", "user_subscriptions", ["user_id"], unique=False
    )

    # Create payments table
    op.create_table(
        "payments",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("subscription_id", sa.String(), nullable=True),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "PENDING",
                "COMPLETED",
                "FAILED",
                "REFUNDED",
                "CANCELLED",
                name="paymentstatus",
            ),
            nullable=True,
        ),
        sa.Column("payment_method", sa.String(length=50), nullable=True),
        sa.Column("payment_method_id", sa.String(length=200), nullable=True),
        sa.Column("stripe_payment_intent_id", sa.String(length=200), nullable=True),
        sa.Column("stripe_charge_id", sa.String(length=200), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("invoice_number", sa.String(length=100), nullable=True),
        sa.Column("billing_period_start", sa.DateTime(), nullable=True),
        sa.Column("billing_period_end", sa.DateTime(), nullable=True),
        sa.Column("failure_code", sa.String(length=100), nullable=True),
        sa.Column("failure_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("paid_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["subscription_id"],
            ["user_subscriptions.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_payment_created", "payments", ["created_at"], unique=False)
    op.create_index("idx_payment_status", "payments", ["status"], unique=False)
    op.create_index(
        "idx_payment_stripe_intent",
        "payments",
        ["stripe_payment_intent_id"],
        unique=False,
    )
    op.create_index(
        "idx_payment_subscription", "payments", ["subscription_id"], unique=False
    )
    op.create_index("idx_payment_user", "payments", ["user_id"], unique=False)

    # Create usage_records table
    op.create_table(
        "usage_records",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("subscription_id", sa.String(), nullable=True),
        sa.Column(
            "usage_type",
            sa.Enum(
                "SMS_SENT",
                "SMS_RECEIVED",
                "VOICE_MINUTES",
                "VERIFICATION_REQUEST",
                "PHONE_NUMBER_RENTAL",
                "API_CALL",
                name="usagetype",
            ),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.Column("unit_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("total_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("resource_id", sa.String(length=200), nullable=True),
        sa.Column("resource_metadata", sa.JSON(), nullable=True),
        sa.Column("billing_period_start", sa.DateTime(), nullable=False),
        sa.Column("billing_period_end", sa.DateTime(), nullable=False),
        sa.Column("is_overage", sa.Boolean(), nullable=True),
        sa.Column("usage_timestamp", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["subscription_id"],
            ["user_subscriptions.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_usage_resource", "usage_records", ["resource_id"], unique=False
    )
    op.create_index(
        "idx_usage_subscription_period",
        "usage_records",
        ["subscription_id", "billing_period_start"],
        unique=False,
    )
    op.create_index(
        "idx_usage_type_timestamp",
        "usage_records",
        ["usage_type", "usage_timestamp"],
        unique=False,
    )
    op.create_index(
        "idx_usage_user_period",
        "usage_records",
        ["user_id", "billing_period_start"],
        unique=False,
    )

    # Create subscription_analytics table
    op.create_table(
        "subscription_analytics",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("period_type", sa.String(length=20), nullable=True),
        sa.Column(
            "plan_name",
            sa.Enum(
                "FREE",
                "BASIC",
                "STANDARD",
                "PREMIUM",
                "ENTERPRISE",
                name="subscriptionplan",
            ),
            nullable=True,
        ),
        sa.Column("new_subscriptions", sa.Integer(), nullable=True),
        sa.Column("cancelled_subscriptions", sa.Integer(), nullable=True),
        sa.Column("active_subscriptions", sa.Integer(), nullable=True),
        sa.Column("total_revenue", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("total_sms_usage", sa.Integer(), nullable=True),
        sa.Column("total_voice_usage", sa.Integer(), nullable=True),
        sa.Column("total_verification_usage", sa.Integer(), nullable=True),
        sa.Column("churn_rate", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column(
            "average_revenue_per_user", sa.Numeric(precision=10, scale=2), nullable=True
        ),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_sub_analytics_date", "subscription_analytics", ["date"], unique=False
    )
    op.create_index(
        "idx_sub_analytics_plan_date",
        "subscription_analytics",
        ["plan_name", "date"],
        unique=False,
    )

    # Create communication_sessions table
    op.create_table(
        "communication_sessions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column(
            "session_type",
            sa.Enum("SMS", "MMS", "VOICE", "CONFERENCE", name="communicationtype"),
            nullable=False,
        ),
        sa.Column("external_number", sa.String(length=20), nullable=False),
        sa.Column("from_number", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("is_archived", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("last_activity_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_session_active", "communication_sessions", ["is_active"], unique=False
    )
    op.create_index(
        "idx_session_external_number",
        "communication_sessions",
        ["external_number"],
        unique=False,
    )
    op.create_index(
        "idx_session_last_activity",
        "communication_sessions",
        ["last_activity_at"],
        unique=False,
    )
    op.create_index(
        "idx_session_type", "communication_sessions", ["session_type"], unique=False
    )
    op.create_index(
        "idx_session_user", "communication_sessions", ["user_id"], unique=False
    )

    # Create communication_messages table
    op.create_table(
        "communication_messages",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("session_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column(
            "direction",
            sa.Enum("INBOUND", "OUTBOUND", name="messagedirection"),
            nullable=False,
        ),
        sa.Column(
            "message_type",
            sa.Enum("SMS", "MMS", "VOICE", "CONFERENCE", name="communicationtype"),
            nullable=True,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("from_number", sa.String(length=20), nullable=False),
        sa.Column("to_number", sa.String(length=20), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=True),
        sa.Column("provider_message_id", sa.String(length=200), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "QUEUED",
                "SENDING",
                "SENT",
                "DELIVERED",
                "FAILED",
                "UNDELIVERED",
                name="messagestatus",
            ),
            nullable=True,
        ),
        sa.Column("delivery_status", sa.String(length=50), nullable=True),
        sa.Column("error_code", sa.String(length=20), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "routing_strategy",
            sa.Enum(
                "DIRECT",
                "SMART_ROUTING",
                "COST_OPTIMIZED",
                "DELIVERY_OPTIMIZED",
                name="routingstrategy",
            ),
            nullable=True,
        ),
        sa.Column("routing_info", sa.JSON(), nullable=True),
        sa.Column("cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=True),
        sa.Column("media_urls", sa.JSON(), nullable=True),
        sa.Column("media_count", sa.Integer(), nullable=True),
        sa.Column("ai_suggested", sa.Boolean(), nullable=True),
        sa.Column("ai_confidence", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("delivered_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["communication_sessions.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_message_created", "communication_messages", ["created_at"], unique=False
    )
    op.create_index(
        "idx_message_delivery_status",
        "communication_messages",
        ["status"],
        unique=False,
    )
    op.create_index(
        "idx_message_direction", "communication_messages", ["direction"], unique=False
    )
    op.create_index(
        "idx_message_numbers",
        "communication_messages",
        ["from_number", "to_number"],
        unique=False,
    )
    op.create_index(
        "idx_message_provider_id",
        "communication_messages",
        ["provider_message_id"],
        unique=False,
    )
    op.create_index(
        "idx_message_session", "communication_messages", ["session_id"], unique=False
    )
    op.create_index(
        "idx_message_status", "communication_messages", ["status"], unique=False
    )
    op.create_index(
        "idx_message_type", "communication_messages", ["message_type"], unique=False
    )
    op.create_index(
        "idx_message_user", "communication_messages", ["user_id"], unique=False
    )

    # Create conference_calls table
    op.create_table(
        "conference_calls",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("conference_name", sa.String(length=200), nullable=False),
        sa.Column("friendly_name", sa.String(length=200), nullable=True),
        sa.Column("provider", sa.String(length=50), nullable=True),
        sa.Column("provider_conference_id", sa.String(length=200), nullable=True),
        sa.Column("max_participants", sa.Integer(), nullable=True),
        sa.Column("is_recorded", sa.Boolean(), nullable=True),
        sa.Column("recording_url", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("participant_count", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_conference_created", "conference_calls", ["created_at"], unique=False
    )
    op.create_index(
        "idx_conference_name", "conference_calls", ["conference_name"], unique=False
    )
    op.create_index(
        "idx_conference_provider_id",
        "conference_calls",
        ["provider_conference_id"],
        unique=False,
    )
    op.create_index(
        "idx_conference_status", "conference_calls", ["status"], unique=False
    )
    op.create_index(
        "idx_conference_user", "conference_calls", ["user_id"], unique=False
    )

    # Create voice_calls table
    op.create_table(
        "voice_calls",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("session_id", sa.String(), nullable=True),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column(
            "direction",
            sa.Enum("INBOUND", "OUTBOUND", name="messagedirection"),
            nullable=False,
        ),
        sa.Column("from_number", sa.String(length=20), nullable=False),
        sa.Column("to_number", sa.String(length=20), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=True),
        sa.Column("provider_call_id", sa.String(length=200), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "QUEUED",
                "RINGING",
                "IN_PROGRESS",
                "COMPLETED",
                "BUSY",
                "NO_ANSWER",
                "FAILED",
                "CANCELLED",
                name="callstatus",
            ),
            nullable=True,
        ),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column(
            "routing_strategy",
            sa.Enum(
                "DIRECT",
                "SMART_ROUTING",
                "COST_OPTIMIZED",
                "DELIVERY_OPTIMIZED",
                name="routingstrategy",
            ),
            nullable=True,
        ),
        sa.Column("routing_info", sa.JSON(), nullable=True),
        sa.Column("is_recorded", sa.Boolean(), nullable=True),
        sa.Column("recording_url", sa.String(length=500), nullable=True),
        sa.Column("recording_duration", sa.Integer(), nullable=True),
        sa.Column("conference_id", sa.String(), nullable=True),
        sa.Column("is_conference_call", sa.Boolean(), nullable=True),
        sa.Column("cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=True),
        sa.Column("quality_score", sa.Numeric(precision=3, scale=2), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("answered_at", sa.DateTime(), nullable=True),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["conference_id"],
            ["conference_calls.id"],
        ),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["communication_sessions.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_call_conference", "voice_calls", ["conference_id"], unique=False
    )
    op.create_index("idx_call_created", "voice_calls", ["created_at"], unique=False)
    op.create_index("idx_call_direction", "voice_calls", ["direction"], unique=False)
    op.create_index(
        "idx_call_provider_id", "voice_calls", ["provider_call_id"], unique=False
    )
    op.create_index("idx_call_session", "voice_calls", ["session_id"], unique=False)
    op.create_index("idx_call_status", "voice_calls", ["status"], unique=False)
    op.create_index("idx_call_user", "voice_calls", ["user_id"], unique=False)

    # Create communication_analytics table
    op.create_table(
        "communication_analytics",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("period_type", sa.String(length=20), nullable=True),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
        sa.Column("country_code", sa.String(length=3), nullable=True),
        sa.Column("sms_sent", sa.Integer(), nullable=True),
        sa.Column("sms_received", sa.Integer(), nullable=True),
        sa.Column("sms_delivered", sa.Integer(), nullable=True),
        sa.Column("sms_failed", sa.Integer(), nullable=True),
        sa.Column("calls_made", sa.Integer(), nullable=True),
        sa.Column("calls_received", sa.Integer(), nullable=True),
        sa.Column("calls_completed", sa.Integer(), nullable=True),
        sa.Column("total_call_duration", sa.Integer(), nullable=True),
        sa.Column("sms_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("voice_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("total_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("average_delivery_time", sa.Integer(), nullable=True),
        sa.Column(
            "delivery_success_rate", sa.Numeric(precision=5, scale=4), nullable=True
        ),
        sa.Column("call_success_rate", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_comm_analytics_country_date",
        "communication_analytics",
        ["country_code", "date"],
        unique=False,
    )
    op.create_index(
        "idx_comm_analytics_date", "communication_analytics", ["date"], unique=False
    )
    op.create_index(
        "idx_comm_analytics_number_date",
        "communication_analytics",
        ["phone_number", "date"],
        unique=False,
    )
    op.create_index(
        "idx_comm_analytics_user_date",
        "communication_analytics",
        ["user_id", "date"],
        unique=False,
    )

    # Add relationships to existing User model
    op.add_column("users", sa.Column("subscription_id", sa.String(), nullable=True))
    op.create_foreign_key(
        None, "users", "user_subscriptions", ["subscription_id"], ["id"]
    )

    # Update phone_numbers table with enhanced fields
    op.add_column(
        "phone_numbers", sa.Column("usage_plan", sa.String(length=50), nullable=True)
    )
    op.add_column(
        "phone_numbers", sa.Column("webhook_url", sa.String(length=500), nullable=True)
    )


def downgrade():
    """Remove enhanced models"""

    # Drop foreign key constraints first
    op.drop_constraint(None, "users", type_="foreignkey")
    op.drop_column("users", "subscription_id")

    # Drop phone_numbers enhancements
    op.drop_column("phone_numbers", "webhook_url")
    op.drop_column("phone_numbers", "usage_plan")

    # Drop tables in reverse order
    op.drop_table("communication_analytics")
    op.drop_table("voice_calls")
    op.drop_table("conference_calls")
    op.drop_table("communication_messages")
    op.drop_table("communication_sessions")
    op.drop_table("subscription_analytics")
    op.drop_table("usage_records")
    op.drop_table("payments")
    op.drop_table("user_subscriptions")
    op.drop_table("subscription_plan_configs")
    op.drop_table("verification_analytics")
    op.drop_table("verification_messages")
    op.drop_table("verification_services")

    # Drop verification_requests enhancements
    op.drop_constraint(None, "verification_requests", type_="foreignkey")
    op.drop_column("verification_requests", "metadata")
    op.drop_column("verification_requests", "priority")
    op.drop_column("verification_requests", "auto_completed")
    op.drop_column("verification_requests", "extracted_codes")
    op.drop_column("verification_requests", "received_messages")
    op.drop_column("verification_requests", "last_retry_at")
    op.drop_column("verification_requests", "max_retries")
    op.drop_column("verification_requests", "retry_count")
    op.drop_column("verification_requests", "actual_cost")
    op.drop_column("verification_requests", "cost_estimate")
    op.drop_column("verification_requests", "routing_info")
    op.drop_column("verification_requests", "country_code")
    op.drop_column("verification_requests", "provider_request_id")
    op.drop_column("verification_requests", "provider")
    op.drop_column("verification_requests", "service_id")

    # Drop enums
    op.execute("DROP TYPE IF EXISTS routingstrategy")
    op.execute("DROP TYPE IF EXISTS callstatus")
    op.execute("DROP TYPE IF EXISTS messagestatus")
    op.execute("DROP TYPE IF EXISTS messagedirection")
    op.execute("DROP TYPE IF EXISTS communicationtype")
    op.execute("DROP TYPE IF EXISTS usagetype")
    op.execute("DROP TYPE IF EXISTS paymentstatus")
    op.execute("DROP TYPE IF EXISTS billingcycle")
    op.execute("DROP TYPE IF EXISTS subscriptionstatus")
    op.execute("DROP TYPE IF EXISTS subscriptionplan")
    op.execute("DROP TYPE IF EXISTS servicecategory")
    op.execute("DROP TYPE IF EXISTS verificationprovider")
