#!/usr/bin/env python3
"""
Frontend tests for Phone Marketplace using Selenium
Tests end-to-end user interactions for searching, purchasing, and managing phone numbers
"""
import time

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


@pytest.fixture
def selenium_driver():
    """Create Selenium driver for frontend testing"""
    options = Options()
    options.add_argument("--headless")  # Run in headless mode for CI
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)  # Implicit wait for elements
    yield driver
    driver.quit()


class TestPhoneMarketplaceFrontend:
    """Test phone marketplace frontend functionality with Selenium"""

    def test_search_and_purchase_flow(self, selenium_driver):
        """Test complete search and purchase flow"""
        driver = selenium_driver
        driver.get("http://localhost:8000/phone-marketplace")  # Adjust URL as needed

        wait = WebDriverWait(driver, 10)

        # Wait for page to load and populate countries
        wait.until(EC.presence_of_element_located((By.ID, "country-select")))

        # Select US country
        country_select = driver.find_element(By.ID, "country-select")
        country_select.click()
        us_option = driver.find_element(By.CSS_SELECTOR, 'option[value="US"]')
        us_option.click()

        # Enter area code
        area_code_input = driver.find_element(By.ID, "area-code")
        area_code_input.send_keys("555")

        # Ensure SMS capability is checked (default)
        sms_checkbox = driver.find_element(By.ID, "cap-sms")
        assert sms_checkbox.is_selected()

        # Trigger search (assuming there's a search button or enter key)
        search_button = driver.find_element(
            By.ID, "search-numbers-btn"
        )  # Adjust selector if needed
        search_button.click()

        # Wait for search results
        wait.until(EC.presence_of_element_located((By.ID, "search-results")))
        results = driver.find_element(By.ID, "search-results")
        assert results.is_displayed()

        # Verify results are shown
        number_cards = results.find_elements(By.CSS_SELECTOR, ".number-card")
        assert len(number_cards) > 0, "No search results found"

        # Click on first number to show purchase modal
        first_card = number_cards[0]
        first_card.click()

        # Wait for purchase modal
        wait.until(EC.presence_of_element_located((By.ID, "purchase-details")))
        modal = driver.find_element(By.ID, "purchase-details")
        assert modal.is_displayed()

        # Verify modal content
        assert (
            "monthly_cost" in modal.text or "$" in modal.text
        ), "Purchase details not shown"

        # Simulate purchase confirmation (assume button exists)
        confirm_btn = driver.find_element(By.ID, "confirm-purchase-btn")
        confirm_btn.click()

        # Wait for success message or error
        wait.until_not(EC.presence_of_element_located((By.CLASS_NAME, "alert")))
        success_alert = driver.find_element(By.CLASS_NAME, "alert-success")
        assert (
            success_alert.is_displayed()
        ), "Purchase should succeed and show success message"

        # Verify number is removed from available list
        available_numbers = driver.find_elements(By.CSS_SELECTOR, ".number-card")
        assert (
            len(available_numbers) == 0
        ), "Purchased number should be removed from list"

    def test_view_modes_toggle(self, selenium_driver):
        """Test toggling between grid and list view modes"""
        driver = selenium_driver
        driver.get("http://localhost:8000/phone-marketplace")

        wait = WebDriverWait(driver, 10)

        # Wait for view buttons
        grid_btn = wait.until(EC.element_to_be_clickable((By.ID, "grid-view-btn")))
        list_btn = driver.find_element(By.ID, "list-view-btn")

        # Default should be grid (active)
        assert grid_btn.get_attribute("class").contains("active")
        assert not list_btn.get_attribute("class").contains("active")

        # Switch to list view
        list_btn.click()
        wait.until(EC.element_to_be_clickable((By.ID, "list-view-btn")))
        assert list_btn.get_attribute("class").contains("active")
        assert not grid_btn.get_attribute("class").contains("active")

        # Switch back to grid view
        grid_btn.click()
        wait.until(EC.element_to_be_clickable((By.ID, "grid-view-btn")))
        assert grid_btn.get_attribute("class").contains("active")
        assert not list_btn.get_attribute("class").contains("active")

    def test_number_details_and_renewal(self, selenium_driver):
        """Test viewing number details and renewing subscription"""
        driver = selenium_driver
        driver.get("http://localhost:8000/phone-marketplace")

        wait = WebDriverWait(driver, 10)

        # Assume owned numbers are loaded; click on one for details
        # Mock clicking a number (in real test, wait for owned numbers list)
        owned_list = wait.until(
            EC.presence_of_element_located((By.ID, "owned-numbers-list"))
        )
        first_owned = owned_list.find_element(
            By.CSS_SELECTOR, ".owned-number-card"
        )  # Adjust selector
        first_owned.click()

        # Wait for number details
        wait.until(EC.presence_of_element_located((By.ID, "number-details-content")))
        details = driver.find_element(By.ID, "number-details-content")
        assert details.is_displayed()
        assert "usage" in details.text or "SMS" in details.text

        # Test renewal button (assume it exists)
        renew_btn = driver.find_element(By.ID, "renew-btn")
        driver.execute_script(
            "arguments[0].click();", renew_btn
        )  # Force click if needed

        # Verify confirmation dialog and success
        wait.until(EC.alert_is_present())
        alert = driver.switch_to.alert
        alert.accept()

        # Check for success message
        success_msg = wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-success"))
        )
        assert success_msg.is_displayed()
        assert "renewed" in success_msg.text

    def test_error_handling_in_search(self, selenium_driver):
        """Test error handling during number search"""
        driver = selenium_driver
        driver.get("http://localhost:8000/phone-marketplace")

        wait = WebDriverWait(driver, 10)

        # Select country but simulate network error (mock via JS error or timeout)
        country_select = driver.find_element(By.ID, "country-select")
        country_select.click()
        us_option = driver.find_element(By.CSS_SELECTOR, 'option[value="US"]')
        us_option.click()

        # Trigger search that will fail (e.g., invalid params, but for error test)
        # In real test, intercept fetch to return error
        search_button = driver.find_element(By.ID, "search-numbers-btn")
        search_button.click()

        # Wait for error message
        error_alert = wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))
        )
        assert error_alert.is_displayed()
        assert "failed" in error_alert.text or "error" in error_alert.text
