/**
 * @fileoverview Custom Jest matchers for enhanced testing
 */

const { toBeInTheDocument, toHaveClass } = require('@testing-library/jest-dom');

// Add custom matchers to Jest
expect.extend({
  // Custom matcher for testing component visibility
  toBeVisible(received) {
    const pass = received && received.style.display !== 'none' && received.style.visibility !== 'hidden';
    return {
      message: () => `expected ${received} to be visible`,
      pass,
    };
  },

  // Custom matcher for testing component accessibility
  toBeAccessible(received) {
    // Basic accessibility check - can be enhanced with more sophisticated checks
    const hasAriaLabel = received.getAttribute('aria-label') || received.getAttribute('aria-labelledby');
    const hasAltText = received.tagName === 'IMG' && received.getAttribute('alt');
    const pass = hasAriaLabel || hasAltText || received.textContent;

    return {
      message: () => `expected ${received} to be accessible`,
      pass,
    };
  },
});

// Make custom matchers available globally
global.expect = expect;