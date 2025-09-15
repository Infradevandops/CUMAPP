#!/usr/bin/env python3
"""
Complete Database Setup Script
Sets up the entire database with migrations, indexes, and initial data
"""
import sys
import os
import subprocess
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_script(script_path, description):
    """Run a Python script and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run([sys.executable, script_path], check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            # Print last few lines of output
            lines = result.stdout.strip().split('\n')
            for line in lines[-3:]:
                if line.strip():
                    print(f"   {line}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        if e.stderr:
            print(f"   Error: {e.stderr.strip()}")
        return False

def main():
    """Main setup function"""
    print("🚀 Complete Database Setup for TextVerified Migration")
    print(f"Timestamp: {datetime.now()}")
    print("=" * 70)
    
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    
    setup_steps = [
        (os.path.join(scripts_dir, "init_textverified_migration.py"), 
         "Initialize database with enhanced models"),
        (os.path.join(scripts_dir, "run_migrations.py"), 
         "Run Alembic migrations"),
        (os.path.join(scripts_dir, "seed_country_routing.py"), 
         "Seed country routing data"),
        (os.path.join(scripts_dir, "database_maintenance.py"), 
         "Run initial database maintenance")
    ]
    
    success_count = 0
    total_steps = len(setup_steps)
    
    for step_num, (script_path, description) in enumerate(setup_steps, 1):
        print(f"\n📋 Step {step_num}/{total_steps}: {description}")
        print("-" * 50)
        
        if os.path.exists(script_path):
            if run_script(script_path, description):
                success_count += 1
            else:
                print(f"❌ Step {step_num} failed. Stopping setup.")
                break
        else:
            print(f"⚠️  Script not found: {script_path}")
    
    # Final summary
    print("\n" + "=" * 70)
    print("📊 Database Setup Summary")
    print("=" * 70)
    print(f"   Total steps: {total_steps}")
    print(f"   Successful: {success_count}")
    print(f"   Failed: {total_steps - success_count}")
    
    if success_count == total_steps:
        print("\n🎉 Database setup completed successfully!")
        print("\n📋 What's been set up:")
        print("   ✅ Enhanced data models for TextVerified migration")
        print("   ✅ Performance indexes and optimizations")
        print("   ✅ Data retention and cleanup policies")
        print("   ✅ Country routing data (15 countries)")
        print("   ✅ System inbox folders")
        print("   ✅ Database maintenance procedures")
        
        print("\n🚀 Next Steps:")
        print("   1. Start your application server")
        print("   2. Test the enhanced inbox functionality")
        print("   3. Configure TextVerified API credentials")
        print("   4. Test international routing features")
        print("   5. Monitor database performance")
        
        print("\n🔧 Maintenance:")
        print("   • Run database_maintenance.py weekly for cleanup")
        print("   • Monitor table sizes and index usage")
        print("   • Review cleanup logs regularly")
        
        return True
    else:
        print(f"\n❌ Database setup failed at step {success_count + 1}")
        print("Please check the error messages above and resolve issues before retrying.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)