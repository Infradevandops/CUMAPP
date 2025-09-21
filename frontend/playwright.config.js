/**
 * @fileoverview Playwright configuration for visual regression testing
 * Provides comprehensive browser testing with visual comparison capabilities
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:6006',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot only when test fails */
    screenshot: 'only-on-failure',

    /* Record video for failed tests */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Visual comparison settings */
  expect: {
    /* Perform visual comparisons. */
    toHaveScreenshot: {
      /* Threshold for screenshot comparisons */
      threshold: 0.2,
      /* Maximum allowed difference in pixels */
      maxDiffPixels: 100,
      /* Allowable difference in percentage */
      maxDiffPixelRatio: 0.01,
    },
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./src/__tests__/setup/globalSetup.js'),
  globalTeardown: require.resolve('./src/__tests__/setup/globalTeardown.js'),

  /* Test match patterns */
  testMatch: [
    '**/__tests__/**/*.visual.test.{js,jsx,ts,tsx}',
    '**/*.visual.test.{js,jsx,ts,tsx}',
    '**/__tests__/**/*.screenshot.test.{js,jsx,ts,tsx}',
    '**/*.screenshot.test.{js,jsx,ts,tsx}'
  ],

  /* Ignore patterns */
  testIgnore: [
    '**/*.d.ts',
    '**/node_modules/**',
    '**/coverage/**',
    '**/storybook-static/**'
  ],

  /* Timeout settings */
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  /* Output directories */
  outputDir: 'test-results/',
  snapshotDir: '__screenshots__/',

  /* Metadata for test results */
  metadata: {
    environment: process.env.CI ? 'CI' : 'local',
    version: process.env.npm_package_version || 'dev',
  },
});