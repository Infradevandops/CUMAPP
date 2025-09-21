/**
 * @fileoverview Global teardown for Storybook test runner
 * This file runs after all tests and cleans up the testing environment
 */

module.exports = async () => {
  // Close the MSW server after all tests
  if (global.testServer) {
    global.testServer.close();
    console.log('🧹 MSW server closed');
  }

  // Clean up any global test utilities
  if (global.testUtils) {
    delete global.testUtils;
  }

  // Clean up any test-specific DOM elements or event listeners
  if (global.testServer) {
    delete global.testServer;
  }

  // Reset any global state that might affect subsequent test runs
  if (typeof window !== 'undefined') {
    // Clear any test-specific localStorage or sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      // Ignore errors if localStorage/sessionStorage is not available
      console.warn('Could not clear storage:', error.message);
    }
  }

  console.log('✅ Global test teardown completed');
};