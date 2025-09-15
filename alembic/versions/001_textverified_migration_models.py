"""TextVerified Migration - Enhanced Models

Revision ID: 001_textverified_migration
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001_textverified_migration"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create enhanced models for TextVerified migration"""

    # Create user_numbers table
    op.create_table(
        "user_numbers",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=False),
        sa.Column("country_code", sa.String(length=3), nullable=False),
        sa.Column("country_name", sa.String(length=100), nullable=False),
        sa.Column("area_code", sa.String(length=10), nullable=True),
        sa.Column("region", sa.String(length=100), nullable=True),
        sa.Column("timezone", sa.String(length=50), nullable=True),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_number_id", sa.String(length=200), nullable=True),
        sa.Column(
            "routing_type",
            sa.Enum(
                "DIRECT",
                "LOCAL_NUMBER",
                "REGIONAL_HUB",
                "SMART_ROUTING",
                name="routingtype",
            ),
            nullable=True,
        ),
        sa.Column("routing_metadata", sa.JSON(), nullable=True),
        sa.Column("supports_sms", sa.Boolean(), nullable=True),
        sa.Column("supports_voice", sa.Boolean(), nullable=True),
        sa.Column("supports_mms", sa.Boolean(), nullable=True),
        sa.Column("is_toll_free", sa.Boolean(), nullable=True),
        sa.Column("is_short_code", sa.Boolean(), nullable=True),
        sa.Column("monthly_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column(
            "sms_cost_outbound", sa.Numeric(precision=10, scale=4), nullable=True
        ),
        sa.Column("sms_cost_inbound", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column(
            "voice_cost_per_minute", sa.Numeric(precision=10, scale=4), nullable=True
        ),
        sa.Column("setup_fee", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("total_sms_sent", sa.Integer(), nullable=True),
        sa.Column("total_sms_received", sa.Integer(), nullable=True),
        sa.Column("total_voice_minutes_outbound", sa.Integer(), nullable=True),
        sa.Column("total_voice_minutes_inbound", sa.Integer(), nullable=True),
        sa.Column("monthly_sms_sent", sa.Integer(), nullable=True),
        sa.Column("monthly_sms_received", sa.Integer(), nullable=True),
        sa.Column("monthly_voice_minutes", sa.Integer(), nullable=True),
        sa.Column(
            "monthly_cost_incurred", sa.Numeric(precision=10, scale=4), nullable=True
        ),
        sa.Column("last_usage_reset", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=True),
        sa.Column("auto_renew", sa.Boolean(), nullable=True),
        sa.Column("purchased_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("last_renewal_at", sa.DateTime(), nullable=True),
        sa.Column("preferred_for_countries", sa.JSON(), nullable=True),
        sa.Column("routing_priority", sa.Integer(), nullable=True),
        sa.Column("cost_optimization_enabled", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("phone_number"),
        sa.UniqueConstraint("user_id", "is_primary", name="uq_user_primary_number"),
    )

    # Create indexes for user_numbers
    op.create_index("idx_user_number_user", "user_numbers", ["user_id"])
    op.create_index("idx_user_number_country", "user_numbers", ["country_code"])
    op.create_index("idx_user_number_status", "user_numbers", ["status"])
    op.create_index("idx_user_number_provider", "user_numbers", ["provider"])
    op.create_index(
        "idx_user_number_primary", "user_numbers", ["user_id", "is_primary"]
    )
    op.create_index("idx_user_numbers_phone_number", "user_numbers", ["phone_number"])

    # Create enhanced_messages table
    op.create_table(
        "enhanced_messages",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "VERIFICATION_CODE",
                "CONVERSATION",
                "NOTIFICATION",
                "SYSTEM",
                name="messagecategory",
            ),
            nullable=False,
        ),
        sa.Column("subcategory", sa.String(length=50), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("subject", sa.String(length=200), nullable=True),
        sa.Column("from_number", sa.String(length=20), nullable=False),
        sa.Column("to_number", sa.String(length=20), nullable=False),
        sa.Column("from_number_id", sa.String(), nullable=True),
        sa.Column("to_number_id", sa.String(), nullable=True),
        sa.Column("direction", sa.String(length=10), nullable=False),
        sa.Column("message_type", sa.String(length=20), nullable=True),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_message_id", sa.String(length=200), nullable=True),
        sa.Column(
            "routing_type",
            sa.Enum(
                "DIRECT",
                "LOCAL_NUMBER",
                "REGIONAL_HUB",
                "SMART_ROUTING",
                name="routingtype",
            ),
            nullable=True,
        ),
        sa.Column("routing_info", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("delivery_status", sa.String(length=50), nullable=True),
        sa.Column("error_code", sa.String(length=20), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=True),
        sa.Column("is_starred", sa.Boolean(), nullable=True),
        sa.Column("is_archived", sa.Boolean(), nullable=True),
        sa.Column("is_spam", sa.Boolean(), nullable=True),
        sa.Column("extracted_codes", sa.JSON(), nullable=True),
        sa.Column(
            "code_extraction_confidence",
            sa.Numeric(precision=5, scale=4),
            nullable=True,
        ),
        sa.Column("auto_extracted", sa.Boolean(), nullable=True),
        sa.Column(
            "ai_category_confidence", sa.Numeric(precision=5, scale=4), nullable=True
        ),
        sa.Column("ai_suggested_reply", sa.Text(), nullable=True),
        sa.Column("ai_sentiment", sa.String(length=20), nullable=True),
        sa.Column("cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=True),
        sa.Column("verification_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("delivered_at", sa.DateTime(), nullable=True),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["from_number_id"],
            ["user_numbers.id"],
        ),
        sa.ForeignKeyConstraint(
            ["to_number_id"],
            ["user_numbers.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["verification_id"],
            ["verification_requests.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for enhanced_messages
    op.create_index("idx_enhanced_message_user", "enhanced_messages", ["user_id"])
    op.create_index("idx_enhanced_message_category", "enhanced_messages", ["category"])
    op.create_index("idx_enhanced_message_read", "enhanced_messages", ["is_read"])
    op.create_index("idx_enhanced_message_created", "enhanced_messages", ["created_at"])
    op.create_index(
        "idx_enhanced_message_verification", "enhanced_messages", ["verification_id"]
    )
    op.create_index(
        "idx_enhanced_message_provider_id", "enhanced_messages", ["provider_message_id"]
    )
    op.create_index(
        "idx_enhanced_message_inbox",
        "enhanced_messages",
        ["user_id", "category", "is_read"],
    )

    # Create country_routing table
    op.create_table(
        "country_routing",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("country_code", sa.String(length=3), nullable=False),
        sa.Column("country_name", sa.String(length=100), nullable=False),
        sa.Column("continent", sa.String(length=50), nullable=True),
        sa.Column("region", sa.String(length=100), nullable=True),
        sa.Column(
            "tier",
            sa.Enum("TIER_1", "TIER_2", "TIER_3", name="countrytier"),
            nullable=True,
        ),
        sa.Column("dial_code", sa.String(length=10), nullable=False),
        sa.Column(
            "preferred_routing_type",
            sa.Enum(
                "DIRECT",
                "LOCAL_NUMBER",
                "REGIONAL_HUB",
                "SMART_ROUTING",
                name="routingtype",
            ),
            nullable=True,
        ),
        sa.Column("supports_local_numbers", sa.Boolean(), nullable=True),
        sa.Column("supports_toll_free", sa.Boolean(), nullable=True),
        sa.Column("sms_cost_direct", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("sms_cost_local", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column(
            "voice_cost_per_minute", sa.Numeric(precision=10, scale=4), nullable=True
        ),
        sa.Column(
            "local_number_monthly_cost",
            sa.Numeric(precision=10, scale=4),
            nullable=True,
        ),
        sa.Column(
            "delivery_success_rate", sa.Numeric(precision=5, scale=4), nullable=True
        ),
        sa.Column("average_delivery_time", sa.Integer(), nullable=True),
        sa.Column("requires_registration", sa.Boolean(), nullable=True),
        sa.Column("supports_verification_services", sa.Boolean(), nullable=True),
        sa.Column("restricted_content_types", sa.JSON(), nullable=True),
        sa.Column("available_providers", sa.JSON(), nullable=True),
        sa.Column("recommended_provider", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("country_code"),
    )

    # Create indexes for country_routing
    op.create_index("idx_country_routing_tier", "country_routing", ["tier"])
    op.create_index("idx_country_routing_active", "country_routing", ["is_active"])
    op.create_index("idx_country_routing_dial_code", "country_routing", ["dial_code"])
    op.create_index(
        "idx_country_routing_country_code", "country_routing", ["country_code"]
    )

    # Create routing_decisions table
    op.create_table(
        "routing_decisions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("message_id", sa.String(), nullable=True),
        sa.Column("destination_country", sa.String(length=3), nullable=False),
        sa.Column("source_number_id", sa.String(), nullable=True),
        sa.Column(
            "routing_type_chosen",
            sa.Enum(
                "DIRECT",
                "LOCAL_NUMBER",
                "REGIONAL_HUB",
                "SMART_ROUTING",
                name="routingtype",
            ),
            nullable=False,
        ),
        sa.Column("routing_type_alternatives", sa.JSON(), nullable=True),
        sa.Column("decision_reason", sa.String(length=200), nullable=True),
        sa.Column("estimated_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("actual_cost", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("cost_savings", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("delivery_time", sa.Integer(), nullable=True),
        sa.Column("delivery_success", sa.Boolean(), nullable=True),
        sa.Column(
            "ml_confidence_score", sa.Numeric(precision=5, scale=4), nullable=True
        ),
        sa.Column("user_satisfaction_score", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["message_id"],
            ["enhanced_messages.id"],
        ),
        sa.ForeignKeyConstraint(
            ["source_number_id"],
            ["user_numbers.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for routing_decisions
    op.create_index("idx_routing_decision_user", "routing_decisions", ["user_id"])
    op.create_index(
        "idx_routing_decision_country", "routing_decisions", ["destination_country"]
    )
    op.create_index(
        "idx_routing_decision_type", "routing_decisions", ["routing_type_chosen"]
    )
    op.create_index("idx_routing_decision_created", "routing_decisions", ["created_at"])

    # Create inbox_folders table
    op.create_table(
        "inbox_folders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("color", sa.String(length=7), nullable=True),
        sa.Column("icon", sa.String(length=50), nullable=True),
        sa.Column("is_system_folder", sa.Boolean(), nullable=True),
        sa.Column("auto_categorize", sa.Boolean(), nullable=True),
        sa.Column("categorization_rules", sa.JSON(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=True),
        sa.Column("is_visible", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "name", name="uq_user_folder_name"),
    )

    # Create indexes for inbox_folders
    op.create_index("idx_inbox_folder_user", "inbox_folders", ["user_id"])
    op.create_index("idx_inbox_folder_system", "inbox_folders", ["is_system_folder"])

    # Create message_folders table
    op.create_table(
        "message_folders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("message_id", sa.String(), nullable=False),
        sa.Column("folder_id", sa.String(), nullable=False),
        sa.Column("added_at", sa.DateTime(), nullable=True),
        sa.Column("added_by_rule", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(
            ["folder_id"],
            ["inbox_folders.id"],
        ),
        sa.ForeignKeyConstraint(
            ["message_id"],
            ["enhanced_messages.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("message_id", "folder_id", name="uq_message_folder"),
    )

    # Create indexes for message_folders
    op.create_index("idx_message_folder_message", "message_folders", ["message_id"])
    op.create_index("idx_message_folder_folder", "message_folders", ["folder_id"])


def downgrade():
    """Drop enhanced models for TextVerified migration"""

    # Drop tables in reverse order
    op.drop_table("message_folders")
    op.drop_table("inbox_folders")
    op.drop_table("routing_decisions")
    op.drop_table("country_routing")
    op.drop_table("enhanced_messages")
    op.drop_table("user_numbers")

    # Drop enums
    op.execute("DROP TYPE IF EXISTS routingtype")
    op.execute("DROP TYPE IF EXISTS messagecategory")
    op.execute("DROP TYPE IF EXISTS countrytier")
