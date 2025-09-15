#!/usr/bin/env python3
"""
Database Maintenance Script
Handles routine maintenance tasks including cleanup, optimization, and health checks
"""
import sys
import os
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db, engine
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DatabaseMaintenance:
    """Database maintenance operations"""
    
    def __init__(self):
        self.db = next(get_db())
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db.close()
    
    def run_data_cleanup(self) -> Dict[str, Any]:
        """Execute data cleanup based on retention policies"""
        logger.info("🧹 Starting data cleanup...")
        
        try:
            result = self.db.execute(text("SELECT * FROM execute_data_cleanup()"))
            cleanup_results = result.fetchall()
            
            total_deleted = sum(row.records_deleted for row in cleanup_results)
            total_time = sum(row.execution_time_ms for row in cleanup_results)
            
            logger.info(f"✅ Cleanup completed: {total_deleted} records deleted in {total_time}ms")
            
            # Log individual table results
            for row in cleanup_results:
                if row.records_deleted > 0:
                    logger.info(f"  📋 {row.table_name}: {row.records_deleted} records deleted")
                elif 'failed' in row.status:
                    logger.warning(f"  ❌ {row.table_name}: {row.status}")
            
            return {
                'success': True,
                'total_records_deleted': total_deleted,
                'total_execution_time_ms': total_time,
                'table_results': [dict(row._mapping) for row in cleanup_results]
            }
            
        except Exception as e:
            logger.error(f"❌ Data cleanup failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_cleanup_statistics(self, days_back: int = 30) -> Dict[str, Any]:
        """Get cleanup statistics for the specified period"""
        logger.info(f"📊 Getting cleanup statistics for last {days_back} days...")
        
        try:
            result = self.db.execute(
                text("SELECT * FROM get_cleanup_stats(:days_back)"),
                {'days_back': days_back}
            )
            stats = result.fetchall()
            
            return {
                'success': True,
                'period_days': days_back,
                'statistics': [dict(row._mapping) for row in stats]
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get cleanup statistics: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_table_sizes(self) -> Dict[str, Any]:
        """Analyze table sizes and growth patterns"""
        logger.info("📏 Analyzing table sizes...")
        
        try:
            # Get table sizes
            size_query = text("""
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
                    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            """)
            
            result = self.db.execute(size_query)
            table_sizes = result.fetchall()
            
            # Get row counts for main tables
            main_tables = [
                'enhanced_messages', 'user_numbers', 'verification_requests',
                'routing_decisions', 'users', 'sessions', 'country_routing'
            ]
            
            row_counts = {}
            for table in main_tables:
                try:
                    count_result = self.db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    row_counts[table] = count_result.scalar()
                except:
                    row_counts[table] = 0
            
            return {
                'success': True,
                'table_sizes': [dict(row._mapping) for row in table_sizes],
                'row_counts': row_counts,
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Table size analysis failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def check_index_usage(self) -> Dict[str, Any]:
        """Check index usage statistics"""
        logger.info("🔍 Checking index usage...")
        
        try:
            index_query = text("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_tup_read,
                    idx_tup_fetch,
                    idx_scan,
                    CASE 
                        WHEN idx_scan = 0 THEN 'UNUSED'
                        WHEN idx_scan < 10 THEN 'LOW_USAGE'
                        WHEN idx_scan < 100 THEN 'MODERATE_USAGE'
                        ELSE 'HIGH_USAGE'
                    END as usage_level
                FROM pg_stat_user_indexes 
                WHERE schemaname = 'public'
                ORDER BY idx_scan DESC
            """)
            
            result = self.db.execute(index_query)
            index_stats = result.fetchall()
            
            # Categorize indexes
            unused_indexes = [idx for idx in index_stats if idx.usage_level == 'UNUSED']
            low_usage_indexes = [idx for idx in index_stats if idx.usage_level == 'LOW_USAGE']
            
            return {
                'success': True,
                'total_indexes': len(index_stats),
                'unused_indexes': len(unused_indexes),
                'low_usage_indexes': len(low_usage_indexes),
                'index_statistics': [dict(row._mapping) for row in index_stats],
                'recommendations': self._generate_index_recommendations(unused_indexes, low_usage_indexes)
            }
            
        except Exception as e:
            logger.error(f"❌ Index usage check failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_index_recommendations(self, unused_indexes: List, low_usage_indexes: List) -> List[str]:
        """Generate index optimization recommendations"""
        recommendations = []
        
        if unused_indexes:
            recommendations.append(f"Consider dropping {len(unused_indexes)} unused indexes to save space")
        
        if low_usage_indexes:
            recommendations.append(f"Review {len(low_usage_indexes)} low-usage indexes for potential optimization")
        
        if not unused_indexes and not low_usage_indexes:
            recommendations.append("All indexes are being used effectively")
        
        return recommendations
    
    def vacuum_analyze_tables(self, tables: List[str] = None) -> Dict[str, Any]:
        """Run VACUUM ANALYZE on specified tables or all tables"""
        if tables is None:
            tables = [
                'enhanced_messages', 'user_numbers', 'verification_requests',
                'routing_decisions', 'users', 'sessions'
            ]
        
        logger.info(f"🔧 Running VACUUM ANALYZE on {len(tables)} tables...")
        
        results = {}
        for table in tables:
            try:
                start_time = datetime.now()
                self.db.execute(text(f"VACUUM ANALYZE {table}"))
                self.db.commit()
                end_time = datetime.now()
                
                execution_time = (end_time - start_time).total_seconds()
                results[table] = {
                    'success': True,
                    'execution_time_seconds': execution_time
                }
                logger.info(f"  ✅ {table}: {execution_time:.2f}s")
                
            except Exception as e:
                results[table] = {
                    'success': False,
                    'error': str(e)
                }
                logger.error(f"  ❌ {table}: {e}")
        
        return {
            'success': True,
            'table_results': results,
            'total_tables': len(tables)
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive database health check"""
        logger.info("🏥 Performing database health check...")
        
        health_status = {
            'overall_status': 'healthy',
            'checks': {},
            'warnings': [],
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }
        
        # Check database connection
        try:
            self.db.execute(text("SELECT 1"))
            health_status['checks']['connection'] = 'OK'
        except Exception as e:
            health_status['checks']['connection'] = 'FAILED'
            health_status['errors'].append(f"Database connection failed: {e}")
            health_status['overall_status'] = 'unhealthy'
        
        # Check table existence
        inspector = inspect(engine)
        expected_tables = [
            'users', 'user_numbers', 'enhanced_messages', 'verification_requests',
            'country_routing', 'routing_decisions', 'inbox_folders', 'message_folders'
        ]
        
        existing_tables = inspector.get_table_names()
        missing_tables = [table for table in expected_tables if table not in existing_tables]
        
        if missing_tables:
            health_status['checks']['tables'] = 'MISSING'
            health_status['errors'].append(f"Missing tables: {missing_tables}")
            health_status['overall_status'] = 'unhealthy'
        else:
            health_status['checks']['tables'] = 'OK'
        
        # Check data integrity
        try:
            # Check for orphaned records
            orphaned_checks = [
                ("enhanced_messages with invalid user_id", 
                 "SELECT COUNT(*) FROM enhanced_messages em LEFT JOIN users u ON em.user_id = u.id WHERE u.id IS NULL"),
                ("user_numbers with invalid user_id",
                 "SELECT COUNT(*) FROM user_numbers un LEFT JOIN users u ON un.user_id = u.id WHERE u.id IS NULL"),
                ("verification_requests with invalid user_id",
                 "SELECT COUNT(*) FROM verification_requests vr LEFT JOIN users u ON vr.user_id = u.id WHERE u.id IS NULL")
            ]
            
            orphaned_found = False
            for check_name, query in orphaned_checks:
                result = self.db.execute(text(query))
                count = result.scalar()
                if count > 0:
                    health_status['warnings'].append(f"{check_name}: {count} orphaned records")
                    orphaned_found = True
            
            if not orphaned_found:
                health_status['checks']['data_integrity'] = 'OK'
            else:
                health_status['checks']['data_integrity'] = 'WARNINGS'
                
        except Exception as e:
            health_status['checks']['data_integrity'] = 'FAILED'
            health_status['errors'].append(f"Data integrity check failed: {e}")
        
        # Set overall status
        if health_status['errors']:
            health_status['overall_status'] = 'unhealthy'
        elif health_status['warnings']:
            health_status['overall_status'] = 'warning'
        
        return health_status

def main():
    """Main maintenance function"""
    print("🔧 Database Maintenance Script")
    print("=" * 50)
    
    with DatabaseMaintenance() as maintenance:
        # Run health check
        health = maintenance.health_check()
        print(f"\n🏥 Health Status: {health['overall_status'].upper()}")
        
        if health['errors']:
            print("❌ Errors found:")
            for error in health['errors']:
                print(f"  - {error}")
        
        if health['warnings']:
            print("⚠️  Warnings:")
            for warning in health['warnings']:
                print(f"  - {warning}")
        
        # Run data cleanup
        cleanup_result = maintenance.run_data_cleanup()
        if cleanup_result['success']:
            print(f"\n🧹 Cleanup: {cleanup_result['total_records_deleted']} records deleted")
        
        # Get cleanup statistics
        stats = maintenance.get_cleanup_statistics(30)
        if stats['success'] and stats['statistics']:
            print(f"\n📊 Cleanup Statistics (30 days):")
            for stat in stats['statistics']:
                print(f"  📋 {stat['table_name']}: {stat['total_records_deleted']} deleted, "
                      f"{stat['success_rate']:.1f}% success rate")
        
        # Analyze table sizes
        size_analysis = maintenance.analyze_table_sizes()
        if size_analysis['success']:
            print(f"\n📏 Largest Tables:")
            for table in size_analysis['table_sizes'][:5]:  # Top 5
                print(f"  📋 {table['tablename']}: {table['size']}")
        
        # Check index usage
        index_check = maintenance.check_index_usage()
        if index_check['success']:
            print(f"\n🔍 Index Analysis:")
            print(f"  Total indexes: {index_check['total_indexes']}")
            print(f"  Unused indexes: {index_check['unused_indexes']}")
            for rec in index_check['recommendations']:
                print(f"  💡 {rec}")
        
        # Run VACUUM ANALYZE
        vacuum_result = maintenance.vacuum_analyze_tables()
        if vacuum_result['success']:
            print(f"\n🔧 VACUUM ANALYZE completed on {vacuum_result['total_tables']} tables")
    
    print("\n✅ Database maintenance completed!")

if __name__ == "__main__":
    main()