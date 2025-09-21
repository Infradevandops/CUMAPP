/**
 * @fileoverview Global setup for Storybook test runner
 * This file runs before all tests and sets up the testing environment
 */

const { setupServer } = require('msw/node');
const { handlers } = require('../../mocks/handlers');

// Setup Mock Service Worker
const server = setupServer(...handlers);

module.exports = async () => {
  // Start the MSW server before all tests
  server.listen({
    onUnhandledRequest: 'warn', // Warn about unhandled requests
  });

  // Set up global test environment
  global.testServer = server;

  // Set up global test utilities
  global.testUtils = {
    // Helper to create mock props
    createMockProps: (componentName, overrides = {}) => {
      const baseProps = {
        // Common props that most components might need
        className: 'test-class',
        'data-testid': `${componentName}-test`,
        ...overrides,
      };
      return baseProps;
    },

    // Helper to wait for async operations
    waitForAsync: () => new Promise(resolve => setTimeout(resolve, 100)),

    // Helper to create mock events
    createMockEvent: (type, options = {}) => ({
      type,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      target: {
        value: '',
        checked: false,
        ...options,
      },
      ...options,
    }),
  };

  console.log('✅ Global test setup completed');
};