/**
 * @fileoverview Custom Jest matchers for Storybook testing
 * These matchers extend Jest's functionality for component and accessibility testing
 */

const { toHaveNoViolations } = require('jest-axe');

// Custom matcher for checking component accessibility
expect.extend({
  toBeAccessible(received) {
    const { axe, toHaveNoViolations } = require('jest-axe');
    const { printReceived, matcherHint } = require('jest-matcher-utils');

    if (typeof received !== 'object' || received === null) {
      return {
        message: () => 'Expected component to be accessible, but received non-object',
        pass: false,
      };
    }

    const pass = toHaveNoViolations(received);

    return {
      message: () => {
        if (pass) {
          return matcherHint('.toBeAccessible', 'component', '') +
                 '\n\nExpected component to be accessible, but found accessibility violations';
        } else {
          return matcherHint('.toBeAccessible', 'component', '') +
                 '\n\nExpected component to be accessible, and it is!';
        }
      },
      pass,
    };
  },

  // Custom matcher for checking component props
  toHaveValidProps(received, expectedProps = {}) {
    const { printReceived, matcherHint } = require('jest-matcher-utils');

    if (typeof received !== 'object' || received === null) {
      return {
        message: () => 'Expected component to have valid props, but received non-object',
        pass: false,
      };
    }

    const receivedProps = received.props || {};
    const pass = Object.keys(expectedProps).every(key =>
      receivedProps.hasOwnProperty(key) &&
      receivedProps[key] === expectedProps[key]
    );

    return {
      message: () => {
        if (pass) {
          return matcherHint('.toHaveValidProps', 'component', JSON.stringify(expectedProps)) +
                 '\n\nExpected component to have valid props, but found mismatched props';
        } else {
          return matcherHint('.toHaveValidProps', 'component', JSON.stringify(expectedProps)) +
                 '\n\nExpected component to have valid props, and it does!';
        }
      },
      pass,
    };
  },

  // Custom matcher for checking component state
  toHaveState(received, expectedState) {
    const { printReceived, matcherHint } = require('jest-matcher-utils');

    if (typeof received !== 'object' || received === null) {
      return {
        message: () => 'Expected component to have state, but received non-object',
        pass: false,
      };
    }

    const receivedState = received.state || {};
    const pass = Object.keys(expectedState).every(key =>
      receivedState.hasOwnProperty(key) &&
      receivedState[key] === expectedState[key]
    );

    return {
      message: () => {
        if (pass) {
          return matcherHint('.toHaveState', 'component', JSON.stringify(expectedState)) +
                 '\n\nExpected component to have state, but found mismatched state';
        } else {
          return matcherHint('.toHaveState', 'component', JSON.stringify(expectedState)) +
                 '\n\nExpected component to have state, and it does!';
        }
      },
      pass,
    };
  },

  // Custom matcher for checking component styles
  toHaveStyle(received, expectedStyles) {
    const { printReceived, matcherHint } = require('jest-matcher-utils');

    if (typeof received !== 'object' || received === null) {
      return {
        message: () => 'Expected component to have styles, but received non-object',
        pass: false,
      };
    }

    const receivedStyles = received.style || {};
    const pass = Object.keys(expectedStyles).every(key =>
      receivedStyles[key] === expectedStyles[key]
    );

    return {
      message: () => {
        if (pass) {
          return matcherHint('.toHaveStyle', 'component', JSON.stringify(expectedStyles)) +
                 '\n\nExpected component to have styles, but found mismatched styles';
        } else {
          return matcherHint('.toHaveStyle', 'component', JSON.stringify(expectedStyles)) +
                 '\n\nExpected component to have styles, and it does!';
        }
      },
      pass,
    };
  },

  // Custom matcher for checking component children
  toHaveChildren(received, expectedCount) {
    const { printReceived, matcherHint } = require('jest-matcher-utils');

    if (typeof received !== 'object' || received === null) {
      return {
        message: () => 'Expected component to have children, but received non-object',
        pass: false,
      };
    }

    const children = received.children || [];
    const childrenCount = Array.isArray(children) ? children.length : 1;
    const pass = childrenCount === expectedCount;

    return {
      message: () => {
        if (pass) {
          return matcherHint('.toHaveChildren', 'component', expectedCount.toString()) +
                 '\n\nExpected component to have ' + expectedCount + ' children, but found ' + childrenCount;
        } else {
          return matcherHint('.toHaveChildren', 'component', expectedCount.toString()) +
                 '\n\nExpected component to have ' + expectedCount + ' children, and it does!';
        }
      },
      pass,
    };
  },
});

// Export the axe matcher for accessibility testing
expect.extend(toHaveNoViolations);

// Global test utilities
global.testMatchers = {
  // Helper to create mock component props
  createMockProps: (componentName, overrides = {}) => ({
    'data-testid': `${componentName}-test`,
    className: 'test-component',
    ...overrides,
  }),

  // Helper to create mock component state
  createMockState: (initialState = {}) => ({
    ...initialState,
    isLoading: false,
    error: null,
  }),

  // Helper to create mock component styles
  createMockStyles: (styles = {}) => ({
    base: {
      display: 'block',
      boxSizing: 'border-box',
    },
    ...styles,
  }),

  // Helper to create mock event handlers
  createMockHandlers: (handlers = {}) => ({
    onClick: jest.fn(),
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    ...handlers,
  }),
};

console.log('✅ Custom Jest matchers loaded');