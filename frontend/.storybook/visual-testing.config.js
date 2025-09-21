/**
 * @fileoverview Visual testing configuration for Storybook
 * This configuration sets up visual regression testing with Chromatic and accessibility testing
 */

module.exports = {
  // Chromatic configuration
  chromatic: {
    projectToken: process.env.CHROMATIC_PROJECT_TOKEN,
    buildScriptName: 'build-storybook',
    skip: process.env.CI ? 'dependabot' : false,
    autoAcceptChanges: process.env.CHROMATIC_AUTO_ACCEPT_CHANGES || false,
    exitZeroOnChanges: process.env.CHROMATIC_EXIT_ZERO_ON_CHANGES || false,
    externals: [
      'https://fonts.googleapis.com/**',
      'https://fonts.gstatic.com/**',
    ],
    onlyChanged: true,
    skipStories: [
      // Skip stories that are known to be flaky or not suitable for visual testing
      '**/Playground/**',
      '**/Examples/**',
    ],
  },

  // Accessibility testing configuration
  accessibility: {
    enabled: true,
    // Run accessibility tests on these stories
    includeStories: [
      '**/atoms/**',
      '**/molecules/**',
      '**/organisms/**',
    ],
    // Skip accessibility tests for these stories
    excludeStories: [
      '**/Playground/**',
      '**/Examples/**',
    ],
    // Accessibility rules to check
    rules: {
      'color-contrast': 'error',
      'img-alt': 'error',
      'button-name': 'error',
      'link-name': 'error',
      'label': 'error',
      'heading-order': 'warn',
      'landmark-one-main': 'warn',
      'page-has-heading-one': 'warn',
      'region': 'warn',
    },
  },

  // Visual regression testing configuration
  visualRegression: {
    enabled: true,
    // Baseline branch for comparison
    baselineBranch: 'main',
    // Thresholds for visual differences
    failureThreshold: 0.01, // 1% difference threshold
    failureThresholdType: 'percent',
    // Viewports to test
    viewports: [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'wide', width: 1920, height: 1080 },
    ],
    // Stories to include in visual testing
    includeStories: [
      '**/atoms/**',
      '**/molecules/**',
      '**/organisms/**',
      '**/pages/**',
    ],
    // Stories to exclude from visual testing
    excludeStories: [
      '**/Playground/**',
      '**/Examples/**',
      '**/Tests/**',
    ],
  },

  // Performance testing configuration
  performance: {
    enabled: true,
    // Lighthouse performance budgets
    budgets: {
      'performance': 80,
      'accessibility': 90,
      'best-practices': 85,
      'seo': 85,
      'pwa': 50,
    },
    // Core Web Vitals thresholds
    coreWebVitals: {
      LCP: 2500, // Largest Contentful Paint
      FID: 100,  // First Input Delay
      CLS: 0.1,  // Cumulative Layout Shift
    },
  },

  // Cross-browser testing configuration
  crossBrowser: {
    enabled: process.env.CI === 'true',
    browsers: [
      { name: 'chrome', version: 'latest' },
      { name: 'firefox', version: 'latest' },
      { name: 'safari', version: 'latest' },
      { name: 'edge', version: 'latest' },
    ],
    // Viewports for cross-browser testing
    viewports: [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
    ],
  },

  // Test runner configuration
  testRunner: {
    // Parallel execution
    parallel: 4,
    // Timeout for individual tests
    timeout: 30000,
    // Retry failed tests
    retries: 2,
    // Reporter configuration
    reporters: [
      'default',
      ['jest-junit', {
        outputDirectory: 'test-results',
        outputName: 'visual-test-results.xml',
      }],
      ['@storybook/test-runner/playwright', {
        outputDir: 'test-results/playwright',
      }],
    ],
  },

  // Custom test hooks
  hooks: {
    // Before all tests
    beforeAll: async (page) => {
      // Set up global test environment
      await page.setViewport({ width: 1280, height: 720 });

      // Add any global setup for visual testing
      await page.addInitScript(() => {
        // Disable animations for consistent screenshots
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        `;
        document.head.appendChild(style);
      });
    },

    // Before each test
    beforeEach: async (page, context) => {
      // Clear any existing state
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Set consistent timing
      await page.clock.install({ time: Date.now() });
    },

    // After each test
    afterEach: async (page, context) => {
      // Clean up after each test
      await page.clock.uninstall();
    },

    // After all tests
    afterAll: async (page, context) => {
      // Global cleanup
      console.log('✅ Visual testing completed');
    },
  },
};