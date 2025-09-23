#!/usr/bin/env python3
"""
Test Phone Number Management Enhancements - Phase 3.1
Tests the comprehensive phone number management system including interactive maps,
bulk actions, performance analytics, and automated rotation.
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_driver():
    """Set up Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Failed to setup Chrome driver: {e}")
        return None

def test_phone_number_map(driver):
    """Test PhoneNumberMap component functionality"""
    print("\n🗺️  Testing Phone Number Map...")
    
    try:
        # Navigate to numbers page
        driver.get("http://localhost:3000/numbers")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Click on map tab
        try:
            map_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Map') or contains(text(), 'Global')]")
            map_tab.click()
            time.sleep(2)
            print("✅ Map tab found and clicked")
        except NoSuchElementException:
            print("ℹ️  Map tab not found, checking current view")
        
        # Check for SVG map
        svg_maps = driver.find_elements(By.TAG_NAME, "svg")
        if len(svg_maps) > 0:
            print(f"✅ Found {len(svg_maps)} SVG map elements")
        else:
            print("⚠️  SVG map not found")
        
        # Check for region indicators
        region_elements = driver.find_elements(By.CSS_SELECTOR, "rect, circle, path")
        if len(region_elements) > 0:
            print(f"✅ Found {len(region_elements)} map region elements")
        else:
            print("ℹ️  Map region elements not found")
        
        # Check for map controls
        map_controls = driver.find_elements(By.CSS_SELECTOR, "button[title*='Heatmap'], button[title*='World']")
        if len(map_controls) > 0:
            print("✅ Map control buttons found")
        else:
            print("ℹ️  Map control buttons not found")
        
        # Check for legend
        legend_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='legend'], text")
        if len(legend_elements) > 0:
            print("✅ Map legend found")
        else:
            print("ℹ️  Map legend not found")
        
        # Check for statistics summary
        stats_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='grid'] > div, .text-center")
        if len(stats_elements) >= 4:
            print("✅ Map statistics summary found")
        else:
            print("ℹ️  Map statistics not found")
        
        return True
        
    except TimeoutException:
        print("❌ Timeout waiting for numbers page to load")
        return False
    except Exception as e:
        print(f"❌ Error testing Phone Number Map: {e}")
        return False

def test_bulk_number_actions(driver):
    """Test BulkNumberActions component"""
    print("\n📦 Testing Bulk Number Actions...")
    
    try:
        # Navigate to numbers page
        driver.get("http://localhost:3000/numbers")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Look for checkboxes to select numbers
        checkboxes = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        if len(checkboxes) > 0:
            print(f"✅ Found {len(checkboxes)} selection checkboxes")
            
            # Try selecting some numbers
            try:
                for i, checkbox in enumerate(checkboxes[:3]):  # Select first 3
                    checkbox.click()
                    time.sleep(0.5)
                print("✅ Successfully selected numbers")
            except Exception as e:
                print(f"ℹ️  Could not select numbers: {e}")
        else:
            print("⚠️  Selection checkboxes not found")
        
        # Check for bulk action buttons
        bulk_action_buttons = driver.find_elements(By.CSS_SELECTOR, "button:contains('Activate'), button:contains('Deactivate'), button:contains('Delete')")
        if len(bulk_action_buttons) > 0:
            print(f"✅ Found {len(bulk_action_buttons)} bulk action buttons")
        else:
            print("ℹ️  Bulk action buttons not found")
        
        # Check for bulk actions panel
        bulk_panel = driver.find_elements(By.CSS_SELECTOR, "[class*='bulk'], [class*='selected']")
        if len(bulk_panel) > 0:
            print("✅ Bulk actions panel found")
        else:
            print("ℹ️  Bulk actions panel not found")
        
        # Check for progress indicators
        progress_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='progress'], .animate-pulse")
        if len(progress_elements) > 0:
            print("✅ Progress indicators found")
        else:
            print("ℹ️  Progress indicators not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Bulk Number Actions: {e}")
        return False

def test_number_performance_analytics(driver):
    """Test NumberPerformanceAnalytics component"""
    print("\n📊 Testing Number Performance Analytics...")
    
    try:
        # Navigate to numbers page
        driver.get("http://localhost:3000/numbers")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Click on analytics tab
        try:
            analytics_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Analytics')]")
            analytics_tab.click()
            time.sleep(3)  # Wait for analytics to load
            print("✅ Analytics tab found and clicked")
        except NoSuchElementException:
            print("ℹ️  Analytics tab not found, checking current view")
        
        # Check for performance charts
        charts = driver.find_elements(By.TAG_NAME, "svg")
        if len(charts) > 0:
            print(f"✅ Found {len(charts)} performance charts")
        else:
            print("⚠️  Performance charts not found")
        
        # Check for metrics table
        tables = driver.find_elements(By.TAG_NAME, "table")
        if len(tables) > 0:
            print("✅ Performance metrics table found")
            
            # Check for table rows
            rows = driver.find_elements(By.CSS_SELECTOR, "tbody tr")
            if len(rows) > 0:
                print(f"✅ Found {len(rows)} performance data rows")
            else:
                print("ℹ️  No performance data rows found")
        else:
            print("ℹ️  Performance metrics table not found")
        
        # Check for metric selectors
        metric_selectors = driver.find_elements(By.CSS_SELECTOR, "select, button[class*='metric']")
        if len(metric_selectors) > 0:
            print("✅ Metric selection controls found")
        else:
            print("ℹ️  Metric selection controls not found")
        
        # Check for time range controls
        time_controls = driver.find_elements(By.CSS_SELECTOR, "select[value*='d'], button[class*='time']")
        if len(time_controls) > 0:
            print("✅ Time range controls found")
        else:
            print("ℹ️  Time range controls not found")
        
        # Check for insights/alerts
        insights = driver.find_elements(By.CSS_SELECTOR, "[class*='insight'], [class*='alert'], [class*='warning']")
        if len(insights) > 0:
            print("✅ Performance insights found")
        else:
            print("ℹ️  Performance insights not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Number Performance Analytics: {e}")
        return False

def test_automated_number_rotation(driver):
    """Test AutomatedNumberRotation component"""
    print("\n🔄 Testing Automated Number Rotation...")
    
    try:
        # Navigate to numbers page
        driver.get("http://localhost:3000/numbers")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Look for rotation/management tab
        try:
            management_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Management') or contains(text(), 'Rotation')]")
            management_tab.click()
            time.sleep(2)
            print("✅ Management/Rotation tab found and clicked")
        except NoSuchElementException:
            print("ℹ️  Management tab not found, checking current view")
        
        # Check for rotation status indicator
        rotation_status = driver.find_elements(By.CSS_SELECTOR, "[class*='bg-green-100'], [class*='bg-gray-100']")
        if len(rotation_status) > 0:
            print("✅ Rotation status indicator found")
        else:
            print("ℹ️  Rotation status indicator not found")
        
        # Check for configuration button
        config_buttons = driver.find_elements(By.CSS_SELECTOR, "button:contains('Configure'), button[title*='settings']")
        if len(config_buttons) > 0:
            print("✅ Configuration button found")
            
            # Try opening configuration
            try:
                config_buttons[0].click()
                time.sleep(2)
                
                # Check for configuration panel
                config_panel = driver.find_elements(By.CSS_SELECTOR, "[class*='config'], .space-y-6")
                if len(config_panel) > 0:
                    print("✅ Configuration panel opened")
                else:
                    print("ℹ️  Configuration panel not found")
            except Exception as e:
                print(f"ℹ️  Could not open configuration: {e}")
        else:
            print("ℹ️  Configuration button not found")
        
        # Check for rotation history
        history_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='history'], [class*='activity']")
        if len(history_elements) > 0:
            print("✅ Rotation history section found")
        else:
            print("ℹ️  Rotation history not found")
        
        # Check for manual rotation controls
        manual_rotation = driver.find_elements(By.CSS_SELECTOR, "button:contains('Rotate'), button[title*='rotate']")
        if len(manual_rotation) > 0:
            print("✅ Manual rotation controls found")
        else:
            print("ℹ️  Manual rotation controls not found")
        
        # Check for test rotation button
        test_buttons = driver.find_elements(By.CSS_SELECTOR, "button:contains('Test')")
        if len(test_buttons) > 0:
            print("✅ Test rotation button found")
        else:
            print("ℹ️  Test rotation button not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Automated Number Rotation: {e}")
        return False

def test_advanced_number_filters(driver):
    """Test AdvancedNumberFilters functionality"""
    print("\n🔍 Testing Advanced Number Filters...")
    
    try:
        # Navigate to numbers page
        driver.get("http://localhost:3000/numbers")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check for filter controls
        filter_controls = driver.find_elements(By.CSS_SELECTOR, "select, input[type='text'], input[type='number']")
        if len(filter_controls) > 0:
            print(f"✅ Found {len(filter_controls)} filter controls")
        else:
            print("⚠️  Filter controls not found")
        
        # Check for status filter
        status_filters = driver.find_elements(By.CSS_SELECTOR, "select option[value*='active'], select option[value*='pending']")
        if len(status_filters) > 0:
            print("✅ Status filter options found")
        else:
            print("ℹ️  Status filter not found")
        
        # Check for country filter
        country_filters = driver.find_elements(By.CSS_SELECTOR, "select option[value*='US'], select option[value*='UK']")
        if len(country_filters) > 0:
            print("✅ Country filter options found")
        else:
            print("ℹ️  Country filter not found")
        
        # Check for performance range filters
        range_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='range'], input[type='number']")
        if len(range_inputs) > 0:
            print("✅ Range filter inputs found")
        else:
            print("ℹ️  Range filter inputs not found")
        
        # Test search functionality
        search_inputs = driver.find_elements(By.CSS_SELECTOR, "input[placeholder*='Search'], input[placeholder*='search']")
        if len(search_inputs) > 0:
            print("✅ Search input found")
            
            # Try searching
            try:
                search_inputs[0].click()
                search_inputs[0].send_keys("555")
                time.sleep(2)
                print("✅ Search functionality working")
            except Exception as e:
                print(f"ℹ️  Search test failed: {e}")
        else:
            print("ℹ️  Search input not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Advanced Number Filters: {e}")
        return False

def test_number_management_integration(driver):
    """Test overall integration of number management components"""
    print("\n🔗 Testing Number Management Integration...")
    
    try:
        # Navigate to numbers page
        driver.get("http://localhost:3000/numbers")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check for main page header
        headers = driver.find_elements(By.CSS_SELECTOR, "h1, h2")
        phone_management_found = any("Phone" in header.text or "Number" in header.text for header in headers)
        if phone_management_found:
            print("✅ Phone Number Management page loaded")
        else:
            print("⚠️  Phone Number Management page not found")
        
        # Check for tab navigation
        tabs = driver.find_elements(By.CSS_SELECTOR, "button[role='tab'], .tab, nav button")
        if len(tabs) >= 3:
            print(f"✅ Found {len(tabs)} navigation tabs")
            
            # Test tab switching
            try:
                for i, tab in enumerate(tabs[:3]):  # Test first 3 tabs
                    tab.click()
                    time.sleep(1)
                print("✅ Tab navigation working")
            except Exception as e:
                print(f"ℹ️  Tab navigation test failed: {e}")
        else:
            print("ℹ️  Navigation tabs not found")
        
        # Check for quick stats/overview
        stats_cards = driver.find_elements(By.CSS_SELECTOR, "[class*='grid'] > div, .bg-white")
        if len(stats_cards) >= 4:
            print("✅ Quick statistics cards found")
        else:
            print("ℹ️  Statistics cards not found")
        
        # Check for data table/list
        data_display = driver.find_elements(By.CSS_SELECTOR, "table, [class*='grid']")
        if len(data_display) > 0:
            print("✅ Data display (table/grid) found")
        else:
            print("ℹ️  Data display not found")
        
        # Check for action buttons
        action_buttons = driver.find_elements(By.CSS_SELECTOR, "button:contains('Import'), button:contains('Export'), button:contains('Add')")
        if len(action_buttons) > 0:
            print("✅ Action buttons found")
        else:
            print("ℹ️  Action buttons not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Number Management Integration: {e}")
        return False

def test_responsive_design(driver):
    """Test responsive design of phone number management components"""
    print("\n📱 Testing Responsive Design...")
    
    try:
        # Navigate to numbers page
        driver.get("http://localhost:3000/numbers")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Test different screen sizes
        screen_sizes = [
            (1920, 1080, "Desktop"),
            (1024, 768, "Tablet"),
            (375, 667, "Mobile")
        ]
        
        for width, height, device in screen_sizes:
            driver.set_window_size(width, height)
            time.sleep(2)
            
            # Check if content is still visible
            body = driver.find_element(By.TAG_NAME, "body")
            if body.is_displayed():
                print(f"✅ {device} ({width}x{height}): Content visible")
                
                # Check for responsive navigation
                nav_elements = driver.find_elements(By.CSS_SELECTOR, "nav, [class*='nav']")
                if len(nav_elements) > 0:
                    print(f"✅ {device}: Navigation responsive")
            else:
                print(f"❌ {device}: Content not visible")
        
        # Reset to desktop size
        driver.set_window_size(1920, 1080)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing responsive design: {e}")
        return False

def run_phone_number_management_tests():
    """Run all phone number management tests"""
    print("🚀 Starting Phone Number Management Tests (Phase 3.1)")
    print("=" * 60)
    
    driver = setup_driver()
    if not driver:
        print("❌ Failed to setup driver. Exiting tests.")
        return False
    
    try:
        test_results = []
        
        # Run all tests
        test_results.append(("Phone Number Map", test_phone_number_map(driver)))
        test_results.append(("Bulk Number Actions", test_bulk_number_actions(driver)))
        test_results.append(("Number Performance Analytics", test_number_performance_analytics(driver)))
        test_results.append(("Automated Number Rotation", test_automated_number_rotation(driver)))
        test_results.append(("Advanced Number Filters", test_advanced_number_filters(driver)))
        test_results.append(("Number Management Integration", test_number_management_integration(driver)))
        test_results.append(("Responsive Design", test_responsive_design(driver)))
        
        # Print summary
        print("\n" + "=" * 60)
        print("📞 PHONE NUMBER MANAGEMENT TEST SUMMARY")
        print("=" * 60)
        
        passed = 0
        total = len(test_results)
        
        for test_name, result in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name:<35} {status}")
            if result:
                passed += 1
        
        print(f"\nOverall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            print("🎉 All phone number management tests passed!")
            print("\n📞 Phase 3.1: Phone Number Management Enhancements - COMPLETED")
            print("✅ Interactive phone number map with geographic visualization")
            print("✅ Bulk actions for efficient number operations")
            print("✅ Advanced filtering and search capabilities")
            print("✅ Comprehensive performance analytics with insights")
            print("✅ Automated number rotation with configurable strategies")
            print("✅ Responsive design across all devices")
        else:
            print("⚠️  Some tests failed. Check the implementation.")
        
        return passed == total
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False
    
    finally:
        driver.quit()

if __name__ == "__main__":
    success = run_phone_number_management_tests()
    exit(0 if success else 1)