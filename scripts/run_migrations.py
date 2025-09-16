#!/usr/bin/env python3
"""
Run Database Migrations
Executes all Alembic migrations for the TextVerified migration
"""
import os
import subprocess
import sys
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(
            command, shell=True, check=True, capture_output=True, text=True
        )
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"   Error: {e.stderr.strip()}")
        return False


def main():
    """Main migration function"""
    print("🚀 Database Migration Runner")
    print(f"Timestamp: {datetime.now()}")
    print("=" * 60)

    # Check if alembic is available
    if not run_command("alembic --version", "Checking Alembic installation"):
        print(
            "❌ Alembic is not installed. Please install it with: pip install alembic"
        )
        return False

    # Initialize Alembic if needed
    if not os.path.exists("alembic.ini"):
        print("⚠️  Alembic not initialized. Initializing...")
        if not run_command("alembic init alembic", "Initializing Alembic"):
            return False

    # Check current migration status
    print("\n📋 Current Migration Status:")
    run_command("alembic current", "Checking current migration")

    # Show migration history
    print("\n📚 Migration History:")
    run_command("alembic history", "Showing migration history")

    # Run migrations
    print("\n🔄 Running Migrations:")

    migrations = [
        ("001_textverified_migration", "Core TextVerified models"),
        ("002_performance_indexes", "Performance indexes and optimizations"),
        ("003_data_retention_policies", "Data retention and cleanup policies"),
    ]

    success_count = 0
    for migration_id, description in migrations:
        if run_command(f"alembic upgrade {migration_id}", f"Running {description}"):
            success_count += 1
        else:
            print(f"❌ Migration {migration_id} failed. Stopping.")
            break

    # Final status check
    print(f"\n📊 Migration Summary:")
    print(f"   Attempted: {len(migrations)} migrations")
    print(f"   Successful: {success_count} migrations")
    print(f"   Failed: {len(migrations) - success_count} migrations")

    if success_count == len(migrations):
        print("\n✅ All migrations completed successfully!")

        # Show final status
        print("\n📋 Final Migration Status:")
        run_command("alembic current", "Final migration status")

        # Verify database structure
        print("\n🔍 Verifying Database Structure:")
        try:
            from sqlalchemy import inspect

            from core.database import engine

            inspector = inspect(engine)
            tables = inspector.get_table_names()

            expected_tables = [
                "users",
                "user_numbers",
                "enhanced_messages",
                "verification_requests",
                "country_routing",
                "routing_decisions",
                "inbox_folders",
                "message_folders",
                "data_retention_policies",
                "cleanup_logs",
            ]

            missing_tables = [table for table in expected_tables if table not in tables]

            if missing_tables:
                print(f"⚠️  Missing tables: {missing_tables}")
            else:
                print("✅ All expected tables are present")

            print(f"📋 Total tables: {len(tables)}")

        except Exception as e:
            print(f"❌ Database verification failed: {e}")

        return True
    else:
        print(f"\n❌ {len(migrations) - success_count} migrations failed!")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
