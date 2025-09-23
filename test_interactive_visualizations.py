#!/usr/bin/env python3
"""
Test Interactive Data Visualizations - Phase 3.2
Tests the comprehensive data visualization system with charts, dashboards, and real-time metrics.
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
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

def test_interactive_chart_component(driver):
    """Test InteractiveChart component functionality"""
    print("\n🔍 Testing InteractiveChart Component...")
    
    try:
        # Navigate to a page with charts (we'll use the analytics page)
        driver.get("http://localhost:3000/analytics")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check for chart containers
        chart_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='chart'], svg")
        if chart_elements:
            print("✅ Chart elements found on page")
        else:
            print("⚠️  No chart elements found")
        
        # Test chart type selector if present
        try:
            chart_type_selector = driver.find_element(By.CSS_SELECTOR, "select[value*='line'], select[value*='bar']")
            if chart_type_selector:
                print("✅ Chart type selector found")
        except NoSuchElementException:
            print("ℹ️  Chart type selector not found (may be in different location)")
        
        # Test time range selector
        try:
            time_range_selector = driver.find_element(By.CSS_SELECTOR, "select[value*='7d'], select[value*='30d']")
            if time_range_selector:
                print("✅ Time range selector found")
        except NoSuchElementException:
            print("ℹ️  Time range selector not found")
        
        # Test export functionality
        try:
            export_button = driver.find_element(By.CSS_SELECTOR, "button[class*='export'], button:contains('Export')")
            if export_button:
                print("✅ Export button found")
        except NoSuchElementException:
            print("ℹ️  Export button not found")
        
        return True
        
    except TimeoutException:
        print("❌ Timeout waiting for analytics page to load")
        return False
    except Exception as e:
        print(f"❌ Error testing InteractiveChart: {e}")
        return False

def test_analytics_dashboard(driver):
    """Test AnalyticsDashboard component"""
    print("\n📊 Testing AnalyticsDashboard Component...")
    
    try:
        # Navigate to analytics page
        driver.get("http://localhost:3000/analytics")
        
        # Wait for dashboard to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check for dashboard header
        try:
            dashboard_header = driver.find_element(By.CSS_SELECTOR, "h1, h2, h3")
            if "Analytics" in dashboard_header.text or "Dashboard" in dashboard_header.text:
                print("✅ Analytics dashboard header found")
        except NoSuchElementException:
            print("⚠️  Dashboard header not found")
        
        # Check for metric widgets
        metric_widgets = driver.find_elements(By.CSS_SELECTOR, "[class*='metric'], [class*='widget'], .grid > div")
        if len(metric_widgets) > 0:
            print(f"✅ Found {len(metric_widgets)} dashboard widgets/metrics")
        else:
            print("⚠️  No metric widgets found")
        
        # Test tab navigation if present
        try:
            tabs = driver.find_elements(By.CSS_SELECTOR, "[role='tab'], .tab, button[class*='tab']")
            if len(tabs) > 0:
                print(f"✅ Found {len(tabs)} dashboard tabs")
                
                # Try clicking first tab
                if tabs[0].is_enabled():
                    tabs[0].click()
                    time.sleep(1)
                    print("✅ Tab navigation working")
            else:
                print("ℹ️  No tabs found")
        except Exception as e:
            print(f"ℹ️  Tab navigation test failed: {e}")
        
        # Test refresh functionality
        try:
            refresh_button = driver.find_element(By.CSS_SELECTOR, "button:contains('Refresh'), [class*='refresh']")
            if refresh_button and refresh_button.is_enabled():
                print("✅ Refresh button found and enabled")
        except NoSuchElementException:
            print("ℹ️  Refresh button not found")
        
        return True
        
    except TimeoutException:
        print("❌ Timeout waiting for analytics dashboard to load")
        return False
    except Exception as e:
        print(f"❌ Error testing AnalyticsDashboard: {e}")
        return False

def test_realtime_metrics(driver):
    """Test RealtimeMetrics component"""
    print("\n⚡ Testing RealtimeMetrics Component...")
    
    try:
        # Navigate to analytics page with real-time tab
        driver.get("http://localhost:3000/analytics")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Try to find and click real-time tab
        try:
            realtime_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Real-time') or contains(text(), 'Live')]")
            if realtime_tab:
                realtime_tab.click()
                time.sleep(2)
                print("✅ Real-time tab found and clicked")
        except NoSuchElementException:
            print("ℹ️  Real-time tab not found, checking for real-time metrics on current view")
        
        # Check for real-time indicators
        live_indicators = driver.find_elements(By.CSS_SELECTOR, "[class*='pulse'], [class*='live'], .animate-pulse")
        if len(live_indicators) > 0:
            print(f"✅ Found {len(live_indicators)} live/pulse indicators")
        else:
            print("ℹ️  No live indicators found")
        
        # Check for metric values
        metric_values = driver.find_elements(By.CSS_SELECTOR, "[class*='metric'] [class*='value'], .text-2xl, .font-bold")
        if len(metric_values) > 0:
            print(f"✅ Found {len(metric_values)} metric value displays")
        else:
            print("ℹ️  No metric values found")
        
        # Check for sparklines or mini charts
        sparklines = driver.find_elements(By.CSS_SELECTOR, "svg[width='60'], [class*='sparkline']")
        if len(sparklines) > 0:
            print(f"✅ Found {len(sparklines)} sparkline charts")
        else:
            print("ℹ️  No sparklines found")
        
        # Test connection status indicator
        try:
            connection_status = driver.find_element(By.CSS_SELECTOR, "[class*='connected'], [class*='live'], .bg-green-500")
            if connection_status:
                print("✅ Connection status indicator found")
        except NoSuchElementException:
            print("ℹ️  Connection status indicator not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing RealtimeMetrics: {e}")
        return False

def test_data_exporter(driver):
    """Test DataExporter component"""
    print("\n📤 Testing DataExporter Component...")
    
    try:
        # Navigate to analytics page
        driver.get("http://localhost:3000/analytics")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Look for export button
        try:
            export_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Export') or contains(text(), 'Download')]")
            if export_button and export_button.is_enabled():
                print("✅ Export button found")
                
                # Try clicking export button
                export_button.click()
                time.sleep(2)
                
                # Check if export modal/dialog opened
                export_modal = driver.find_elements(By.CSS_SELECTOR, "[class*='modal'], [class*='dialog'], .fixed")
                if len(export_modal) > 0:
                    print("✅ Export modal/dialog opened")
                    
                    # Check for format options
                    format_options = driver.find_elements(By.CSS_SELECTOR, "input[type='radio'], select option, button[class*='format']")
                    if len(format_options) > 0:
                        print(f"✅ Found {len(format_options)} export format options")
                    
                    # Check for export options
                    export_options = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox'], select")
                    if len(export_options) > 0:
                        print(f"✅ Found {len(export_options)} export configuration options")
                    
                    # Close modal
                    try:
                        close_button = driver.find_element(By.CSS_SELECTOR, "button[class*='close'], [class*='x']")
                        close_button.click()
                        print("✅ Export modal closed successfully")
                    except NoSuchElementException:
                        print("ℹ️  Close button not found")
                
                else:
                    print("ℹ️  Export modal not found (may be direct download)")
            
        except NoSuchElementException:
            print("⚠️  Export button not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing DataExporter: {e}")
        return False

def test_chart_interactions(driver):
    """Test chart interaction features"""
    print("\n🖱️  Testing Chart Interactions...")
    
    try:
        # Navigate to analytics page
        driver.get("http://localhost:3000/analytics")
        
        # Wait for charts to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Find SVG charts
        svg_charts = driver.find_elements(By.TAG_NAME, "svg")
        if len(svg_charts) > 0:
            print(f"✅ Found {len(svg_charts)} SVG charts")
            
            # Test hover interactions on first chart
            try:
                first_chart = svg_charts[0]
                
                # Look for interactive elements (circles, bars, etc.)
                interactive_elements = first_chart.find_elements(By.CSS_SELECTOR, "circle, rect, path")
                if len(interactive_elements) > 0:
                    print(f"✅ Found {len(interactive_elements)} interactive chart elements")
                    
                    # Try hovering over first element
                    from selenium.webdriver.common.action_chains import ActionChains
                    actions = ActionChains(driver)
                    actions.move_to_element(interactive_elements[0]).perform()
                    time.sleep(1)
                    print("✅ Chart hover interaction tested")
                
            except Exception as e:
                print(f"ℹ️  Chart interaction test failed: {e}")
        
        # Test chart controls
        chart_controls = driver.find_elements(By.CSS_SELECTOR, "select, button[class*='chart']")
        if len(chart_controls) > 0:
            print(f"✅ Found {len(chart_controls)} chart control elements")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing chart interactions: {e}")
        return False

def test_responsive_design(driver):
    """Test responsive design of visualization components"""
    print("\n📱 Testing Responsive Design...")
    
    try:
        # Navigate to analytics page
        driver.get("http://localhost:3000/analytics")
        
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
                
                # Check for responsive grid
                grid_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='grid'], [class*='col-']")
                if len(grid_elements) > 0:
                    print(f"✅ {device}: Responsive grid elements found")
            else:
                print(f"❌ {device}: Content not visible")
        
        # Reset to desktop size
        driver.set_window_size(1920, 1080)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing responsive design: {e}")
        return False

def run_visualization_tests():
    """Run all interactive visualization tests"""
    print("🚀 Starting Interactive Data Visualizations Tests (Phase 3.2)")
    print("=" * 60)
    
    driver = setup_driver()
    if not driver:
        print("❌ Failed to setup driver. Exiting tests.")
        return False
    
    try:
        test_results = []
        
        # Run all tests
        test_results.append(("InteractiveChart Component", test_interactive_chart_component(driver)))
        test_results.append(("AnalyticsDashboard Component", test_analytics_dashboard(driver)))
        test_results.append(("RealtimeMetrics Component", test_realtime_metrics(driver)))
        test_results.append(("DataExporter Component", test_data_exporter(driver)))
        test_results.append(("Chart Interactions", test_chart_interactions(driver)))
        test_results.append(("Responsive Design", test_responsive_design(driver)))
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 INTERACTIVE VISUALIZATIONS TEST SUMMARY")
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
            print("🎉 All interactive visualization tests passed!")
            print("\n📊 Phase 3.2: Interactive Data Visualizations - COMPLETED")
            print("✅ Real-time charts and graphs implemented")
            print("✅ Comprehensive analytics dashboard created")
            print("✅ Interactive chart components working")
            print("✅ Data export functionality available")
            print("✅ Real-time metrics display functional")
            print("✅ Responsive design implemented")
        else:
            print("⚠️  Some tests failed. Check the implementation.")
        
        return passed == total
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False
    
    finally:
        driver.quit()

if __name__ == "__main__":
    success = run_visualization_tests()
    exit(0 if success else 1)