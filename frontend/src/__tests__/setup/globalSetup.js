/**
 * @fileoverview Global setup for Jest tests
 * Runs once before all test suites
 */

module.exports = async () => {
  // Global test setup
  console.log('🧪 Setting up global test environment...');

  // Set up global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';

  // Initialize any global test state here
  global.testEnvironment = {
    setupComplete: true,
    timestamp: new Date().toISOString()
  };

  console.log('✅ Global test setup completed');
};