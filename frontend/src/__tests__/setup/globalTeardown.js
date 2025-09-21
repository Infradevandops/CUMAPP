/**
 * @fileoverview Global teardown for Jest tests
 * Runs once after all test suites
 */

module.exports = async () => {
  // Global test teardown
  console.log('🧹 Cleaning up global test environment...');

  // Clean up any global test state here
  if (global.testEnvironment) {
    delete global.testEnvironment;
  }

  // Clean up any test-specific resources
  // For example: close database connections, stop servers, etc.

  console.log('✅ Global test teardown completed');
};