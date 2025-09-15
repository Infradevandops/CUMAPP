#!/usr/bin/env python3
"""
Seed Country Routing Data
Populates the country_routing table with initial data for international SMS routing
"""
import sys
import os
from decimal import Decimal
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models.enhanced_models import CountryRouting, CountryTier, RoutingType

def seed_country_routing():
    """Seed the country routing table with initial data"""
    
    # Country routing data
    countries_data = [
        # Tier 1 Countries (Premium)
        {
            'country_code': 'US',
            'country_name': 'United States',
            'continent': 'North America',
            'region': 'North America',
            'tier': CountryTier.TIER_1,
            'dial_code': '+1',
            'preferred_routing_type': RoutingType.SMART_ROUTING,
            'supports_local_numbers': True,
            'supports_toll_free': True,
            'sms_cost_direct': Decimal('0.0075'),
            'sms_cost_local': Decimal('0.0075'),
            'voice_cost_per_minute': Decimal('0.013'),
            'local_number_monthly_cost': Decimal('1.00'),
            'delivery_success_rate': Decimal('0.99'),
            'average_delivery_time': 2,
            'requires_registration': False,
            'supports_verification_services': True,
            'available_providers': ['twilio', 'textverified'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'GB',
            'country_name': 'United Kingdom',
            'continent': 'Europe',
            'region': 'Western Europe',
            'tier': CountryTier.TIER_1,
            'dial_code': '+44',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': True,
            'sms_cost_direct': Decimal('0.05'),
            'sms_cost_local': Decimal('0.02'),
            'voice_cost_per_minute': Decimal('0.08'),
            'local_number_monthly_cost': Decimal('2.00'),
            'delivery_success_rate': Decimal('0.98'),
            'average_delivery_time': 3,
            'requires_registration': False,
            'supports_verification_services': True,
            'available_providers': ['twilio', 'textverified'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'CA',
            'country_name': 'Canada',
            'continent': 'North America',
            'region': 'North America',
            'tier': CountryTier.TIER_1,
            'dial_code': '+1',
            'preferred_routing_type': RoutingType.SMART_ROUTING,
            'supports_local_numbers': True,
            'supports_toll_free': True,
            'sms_cost_direct': Decimal('0.0075'),
            'sms_cost_local': Decimal('0.0075'),
            'voice_cost_per_minute': Decimal('0.013'),
            'local_number_monthly_cost': Decimal('1.00'),
            'delivery_success_rate': Decimal('0.99'),
            'average_delivery_time': 2,
            'requires_registration': False,
            'supports_verification_services': True,
            'available_providers': ['twilio', 'textverified'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'AU',
            'country_name': 'Australia',
            'continent': 'Oceania',
            'region': 'Australia and New Zealand',
            'tier': CountryTier.TIER_1,
            'dial_code': '+61',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.08'),
            'sms_cost_local': Decimal('0.03'),
            'voice_cost_per_minute': Decimal('0.12'),
            'local_number_monthly_cost': Decimal('3.00'),
            'delivery_success_rate': Decimal('0.97'),
            'average_delivery_time': 4,
            'requires_registration': False,
            'supports_verification_services': True,
            'available_providers': ['twilio', 'textverified'],
            'recommended_provider': 'twilio'
        },
        
        # Tier 2 Countries (Standard)
        {
            'country_code': 'DE',
            'country_name': 'Germany',
            'continent': 'Europe',
            'region': 'Western Europe',
            'tier': CountryTier.TIER_2,
            'dial_code': '+49',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.06'),
            'sms_cost_local': Decimal('0.02'),
            'voice_cost_per_minute': Decimal('0.09'),
            'local_number_monthly_cost': Decimal('2.50'),
            'delivery_success_rate': Decimal('0.96'),
            'average_delivery_time': 5,
            'requires_registration': True,
            'supports_verification_services': True,
            'available_providers': ['twilio', 'textverified'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'FR',
            'country_name': 'France',
            'continent': 'Europe',
            'region': 'Western Europe',
            'tier': CountryTier.TIER_2,
            'dial_code': '+33',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.06'),
            'sms_cost_local': Decimal('0.02'),
            'voice_cost_per_minute': Decimal('0.09'),
            'local_number_monthly_cost': Decimal('2.50'),
            'delivery_success_rate': Decimal('0.95'),
            'average_delivery_time': 5,
            'requires_registration': True,
            'supports_verification_services': True,
            'available_providers': ['twilio', 'textverified'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'JP',
            'country_name': 'Japan',
            'continent': 'Asia',
            'region': 'Eastern Asia',
            'tier': CountryTier.TIER_2,
            'dial_code': '+81',
            'preferred_routing_type': RoutingType.REGIONAL_HUB,
            'supports_local_numbers': False,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.10'),
            'sms_cost_local': Decimal('0.04'),
            'voice_cost_per_minute': Decimal('0.15'),
            'local_number_monthly_cost': Decimal('5.00'),
            'delivery_success_rate': Decimal('0.94'),
            'average_delivery_time': 8,
            'requires_registration': True,
            'supports_verification_services': True,
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'IN',
            'country_name': 'India',
            'continent': 'Asia',
            'region': 'Southern Asia',
            'tier': CountryTier.TIER_2,
            'dial_code': '+91',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.08'),
            'sms_cost_local': Decimal('0.02'),
            'voice_cost_per_minute': Decimal('0.05'),
            'local_number_monthly_cost': Decimal('1.50'),
            'delivery_success_rate': Decimal('0.92'),
            'average_delivery_time': 10,
            'requires_registration': True,
            'supports_verification_services': True,
            'available_providers': ['twilio', 'textverified'],
            'recommended_provider': 'textverified'
        },
        
        # Tier 3 Countries (Emerging Markets)
        {
            'country_code': 'BR',
            'country_name': 'Brazil',
            'continent': 'South America',
            'region': 'South America',
            'tier': CountryTier.TIER_3,
            'dial_code': '+55',
            'preferred_routing_type': RoutingType.REGIONAL_HUB,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.12'),
            'sms_cost_local': Decimal('0.03'),
            'voice_cost_per_minute': Decimal('0.08'),
            'local_number_monthly_cost': Decimal('2.00'),
            'delivery_success_rate': Decimal('0.90'),
            'average_delivery_time': 15,
            'requires_registration': True,
            'supports_verification_services': True,
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'MX',
            'country_name': 'Mexico',
            'continent': 'North America',
            'region': 'Central America',
            'tier': CountryTier.TIER_3,
            'dial_code': '+52',
            'preferred_routing_type': RoutingType.REGIONAL_HUB,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.10'),
            'sms_cost_local': Decimal('0.025'),
            'voice_cost_per_minute': Decimal('0.07'),
            'local_number_monthly_cost': Decimal('1.75'),
            'delivery_success_rate': Decimal('0.88'),
            'average_delivery_time': 12,
            'requires_registration': False,
            'supports_verification_services': True,
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'CN',
            'country_name': 'China',
            'continent': 'Asia',
            'region': 'Eastern Asia',
            'tier': CountryTier.TIER_3,
            'dial_code': '+86',
            'preferred_routing_type': RoutingType.DIRECT,
            'supports_local_numbers': False,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.15'),
            'sms_cost_local': Decimal('0.05'),
            'voice_cost_per_minute': Decimal('0.20'),
            'local_number_monthly_cost': Decimal('10.00'),
            'delivery_success_rate': Decimal('0.85'),
            'average_delivery_time': 20,
            'requires_registration': True,
            'supports_verification_services': False,
            'restricted_content_types': ['promotional', 'marketing'],
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        },
        
        # Additional European countries
        {
            'country_code': 'ES',
            'country_name': 'Spain',
            'continent': 'Europe',
            'region': 'Southern Europe',
            'tier': CountryTier.TIER_2,
            'dial_code': '+34',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.07'),
            'sms_cost_local': Decimal('0.025'),
            'voice_cost_per_minute': Decimal('0.10'),
            'local_number_monthly_cost': Decimal('2.25'),
            'delivery_success_rate': Decimal('0.95'),
            'average_delivery_time': 6,
            'requires_registration': True,
            'supports_verification_services': True,
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'IT',
            'country_name': 'Italy',
            'continent': 'Europe',
            'region': 'Southern Europe',
            'tier': CountryTier.TIER_2,
            'dial_code': '+39',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.08'),
            'sms_cost_local': Decimal('0.03'),
            'voice_cost_per_minute': Decimal('0.11'),
            'local_number_monthly_cost': Decimal('2.75'),
            'delivery_success_rate': Decimal('0.94'),
            'average_delivery_time': 7,
            'requires_registration': True,
            'supports_verification_services': True,
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'NL',
            'country_name': 'Netherlands',
            'continent': 'Europe',
            'region': 'Western Europe',
            'tier': CountryTier.TIER_2,
            'dial_code': '+31',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.06'),
            'sms_cost_local': Decimal('0.02'),
            'voice_cost_per_minute': Decimal('0.09'),
            'local_number_monthly_cost': Decimal('2.50'),
            'delivery_success_rate': Decimal('0.97'),
            'average_delivery_time': 4,
            'requires_registration': False,
            'supports_verification_services': True,
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        },
        {
            'country_code': 'SE',
            'country_name': 'Sweden',
            'continent': 'Europe',
            'region': 'Northern Europe',
            'tier': CountryTier.TIER_2,
            'dial_code': '+46',
            'preferred_routing_type': RoutingType.LOCAL_NUMBER,
            'supports_local_numbers': True,
            'supports_toll_free': False,
            'sms_cost_direct': Decimal('0.07'),
            'sms_cost_local': Decimal('0.025'),
            'voice_cost_per_minute': Decimal('0.10'),
            'local_number_monthly_cost': Decimal('2.25'),
            'delivery_success_rate': Decimal('0.98'),
            'average_delivery_time': 3,
            'requires_registration': False,
            'supports_verification_services': True,
            'available_providers': ['twilio'],
            'recommended_provider': 'twilio'
        }
    ]
    
    db = next(get_db())
    
    try:
        # Check if data already exists
        existing_count = db.query(CountryRouting).count()
        if existing_count > 0:
            print(f"Country routing data already exists ({existing_count} records). Skipping seed.")
            return
        
        # Insert country routing data
        for country_data in countries_data:
            country_routing = CountryRouting(**country_data)
            db.add(country_routing)
        
        db.commit()
        print(f"Successfully seeded {len(countries_data)} country routing records.")
        
        # Print summary
        tier_counts = {}
        for country in countries_data:
            tier = country['tier']
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
        
        print("\nCountry distribution by tier:")
        for tier, count in tier_counts.items():
            print(f"  {tier.value}: {count} countries")
            
    except Exception as e:
        db.rollback()
        print(f"Error seeding country routing data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding country routing data...")
    seed_country_routing()
    print("Country routing data seeding completed.")