#!/usr/bin/env python3
"""
Initialize TextVerified Migration Database
Creates tables, runs migrations, and seeds initial data
"""
import os
import sys
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import create_tables, engine, get_db
from models.enhanced_models import *
from models.user_models import Base
from scripts.seed_country_routing import seed_country_routing


def init_database():
    """Initialize the database with enhanced models for TextVerified migration"""

    print("🚀 Initializing TextVerified Migration Database...")
    print(f"Timestamp: {datetime.now()}")
    print("-" * 60)

    try:
        # Step 1: Create all tables
        print("📋 Step 1: Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")

        # Step 2: Seed country routing data
        print("\n🌍 Step 2: Seeding country routing data...")
        seed_country_routing()
        print("✅ Country routing data seeded successfully")

        # Step 3: Create default inbox folders for system
        print("\n📁 Step 3: Creating system inbox folders...")
        create_system_folders()
        print("✅ System inbox folders created successfully")

        # Step 4: Verify database integrity
        print("\n🔍 Step 4: Verifying database integrity...")
        verify_database()
        print("✅ Database integrity verified")

        print("\n" + "=" * 60)
        print("🎉 TextVerified Migration Database Initialization Complete!")
        print("=" * 60)

        # Print summary
        print_summary()

    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        raise


def create_system_folders():
    """Create default system inbox folders"""

    system_folders = [
        {
            "name": "Inbox",
            "description": "All incoming messages",
            "color": "#007bff",
            "icon": "inbox",
            "is_system_folder": True,
            "sort_order": 1,
        },
        {
            "name": "Verification Codes",
            "description": "SMS verification codes from services",
            "color": "#28a745",
            "icon": "key",
            "is_system_folder": True,
            "sort_order": 2,
            "auto_categorize": True,
            "categorization_rules": {"category": "VERIFICATION_CODE"},
        },
        {
            "name": "Conversations",
            "description": "Two-way SMS conversations",
            "color": "#17a2b8",
            "icon": "comment",
            "is_system_folder": True,
            "sort_order": 3,
            "auto_categorize": True,
            "categorization_rules": {"category": "CONVERSATION"},
        },
        {
            "name": "Notifications",
            "description": "System and service notifications",
            "color": "#ffc107",
            "icon": "bell",
            "is_system_folder": True,
            "sort_order": 4,
            "auto_categorize": True,
            "categorization_rules": {"category": "NOTIFICATION"},
        },
        {
            "name": "Sent",
            "description": "Messages you have sent",
            "color": "#6c757d",
            "icon": "paper-plane",
            "is_system_folder": True,
            "sort_order": 5,
        },
        {
            "name": "Starred",
            "description": "Important messages you have starred",
            "color": "#fd7e14",
            "icon": "star",
            "is_system_folder": True,
            "sort_order": 6,
        },
        {
            "name": "Archive",
            "description": "Archived messages",
            "color": "#6f42c1",
            "icon": "archive",
            "is_system_folder": True,
            "sort_order": 7,
        },
        {
            "name": "Spam",
            "description": "Spam and unwanted messages",
            "color": "#dc3545",
            "icon": "exclamation-triangle",
            "is_system_folder": True,
            "sort_order": 8,
        },
    ]

    db = next(get_db())

    try:
        # Check if system folders already exist
        existing_count = (
            db.query(InboxFolder).filter(InboxFolder.is_system_folder == True).count()
        )
        if existing_count > 0:
            print(
                f"  System folders already exist ({existing_count} folders). Skipping creation."
            )
            return

        # Create system folders (these will be templates for user folders)
        for folder_data in system_folders:
            # Create a template folder with user_id as 'system'
            folder_data["user_id"] = "system"
            folder = InboxFolder(**folder_data)
            db.add(folder)

        db.commit()
        print(f"  Created {len(system_folders)} system inbox folder templates")

    except Exception as e:
        db.rollback()
        print(f"  Error creating system folders: {e}")
        raise
    finally:
        db.close()


def verify_database():
    """Verify database integrity and relationships"""

    db = next(get_db())

    try:
        # Check table counts
        country_count = db.query(CountryRouting).count()
        folder_count = db.query(InboxFolder).count()

        print(f"  Country routing records: {country_count}")
        print(f"  System inbox folders: {folder_count}")

        # Verify some key relationships and constraints
        if country_count == 0:
            raise Exception("No country routing data found")

        if folder_count == 0:
            raise Exception("No system folders found")

        # Test a sample query to ensure indexes work
        sample_country = (
            db.query(CountryRouting).filter(CountryRouting.country_code == "US").first()
        )
        if not sample_country:
            raise Exception("Could not find US country routing data")

        print(
            f"  Sample country: {sample_country.country_name} ({sample_country.country_code})"
        )

    except Exception as e:
        print(f"  Database verification failed: {e}")
        raise
    finally:
        db.close()


def print_summary():
    """Print a summary of the initialized database"""

    db = next(get_db())

    try:
        # Get counts
        country_count = db.query(CountryRouting).count()
        folder_count = db.query(InboxFolder).count()

        # Get tier distribution
        tier_counts = {}
        countries = db.query(CountryRouting).all()
        for country in countries:
            tier = country.tier
            tier_counts[tier] = tier_counts.get(tier, 0) + 1

        print("\n📊 Database Summary:")
        print(f"  • Countries supported: {country_count}")
        print(f"  • System inbox folders: {folder_count}")
        print("\n🌍 Country Distribution:")
        for tier, count in tier_counts.items():
            print(f"  • {tier.value}: {count} countries")

        print("\n🔧 Key Features Enabled:")
        print("  • Smart international routing")
        print("  • Cost optimization algorithms")
        print("  • Enhanced inbox management")
        print("  • Message categorization")
        print("  • Verification code extraction")
        print("  • Multi-provider support")

        print("\n📋 Next Steps:")
        print("  1. Start the application server")
        print("  2. Create user accounts")
        print("  3. Configure TextVerified API credentials")
        print("  4. Test SMS verification workflows")
        print("  5. Monitor routing decisions and costs")

    except Exception as e:
        print(f"Error generating summary: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
