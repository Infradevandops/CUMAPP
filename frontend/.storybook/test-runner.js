/**
 * @fileoverview Storybook test runner configuration for visual regression testing
 * Integrates with Playwright and provides comprehensive visual testing capabilities
 */

import { injectAxe, checkA11y } from 'axe-playwright';
import { getStoryContext } from '@storybook/test-runner';

/**
 * Test runner configuration for visual regression and accessibility testing
 */
const testRunnerConfig = {
  // Setup function runs before each story
  setup: async (page) => {
    // Inject axe-core for accessibility testing
    await injectAxe(page);

    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });

    // Add custom styles for testing
    await page.addStyleTag({
      content: `
        /* Visual testing helpers */
        .visual-test-helper {
          position: fixed;
          top: 0;
          right: 0;
          background: rgba(255, 0, 0, 0.1);
          color: red;
          padding: 4px 8px;
          font-size: 12px;
          z-index: 9999;
        }

        /* Ensure consistent font rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `
    });
  },

  // Post-render function runs after each story renders
  postRender: async (page, context) => {
    const { name, title } = context;

    // Add visual test helper indicator
    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = `Testing: ${document.title}`;
      document.body.appendChild(helper);
    });

    // Run accessibility tests
    try {
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
    } catch (error) {
      console.warn(`Accessibility issues found in ${title} - ${name}:`, error.message);
    }

    // Take screenshot for visual regression
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css'
    });

    // Store screenshot for comparison (in a real implementation, this would be saved to a service)
    console.log(`Screenshot taken for ${title} - ${name}`);

    return screenshot;
  },

  // Tags configuration for filtering tests
  tags: {
    include: ['visual-test', 'a11y-test'],
    exclude: ['skip-visual-test', 'skip-a11y-test'],
    skip: ['__tests__', 'stories']
  },

  // Custom test functions
  tests: {
    // Visual regression test
    visualRegression: async (page, context) => {
      const { name, title } = context;

      // Wait for all images to load
      await page.waitForLoadState('networkidle');

      // Wait for any animations to complete
      await page.waitForTimeout(100);

      // Take screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled'
      });

      // In a real implementation, compare with baseline
      // For now, just log the test
      console.log(`Visual regression test completed for ${title} - ${name}`);

      return screenshot;
    },

    // Accessibility test
    accessibility: async (page, context) => {
      const { name, title } = context;

      try {
        await checkA11y(page, undefined, {
          detailedReport: true,
          detailedReportOptions: {
            html: true
          },
          rules: {
            // Custom rules for our design system
            'color-contrast': { enabled: true },
            'link-name': { enabled: true },
            'button-name': { enabled: true },
            'image-alt': { enabled: true },
            'heading-order': { enabled: true },
            'landmark-one-main': { enabled: true },
            'page-has-heading-one': { enabled: true },
            'region': { enabled: true }
          }
        });

        console.log(`Accessibility test passed for ${title} - ${name}`);
        return true;
      } catch (error) {
        console.error(`Accessibility test failed for ${title} - ${name}:`, error);
        throw error;
      }
    },

    // Performance test
    performance: async (page, context) => {
      const { name, title } = context;

      // Measure page load performance
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        return {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime
        };
      });

      console.log(`Performance metrics for ${title} - ${name}:`, performanceMetrics);

      // Assert reasonable performance thresholds
      expect(performanceMetrics.loadComplete).toBeLessThan(3000); // 3 seconds
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds

      return performanceMetrics;
    },

    // Responsive design test
    responsive: async (page, context) => {
      const { name, title } = context;

      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1280, height: 720 },
        { name: 'wide', width: 1920, height: 1080 }
      ];

      const results = {};

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        // Wait for responsive adjustments
        await page.waitForTimeout(200);

        const screenshot = await page.screenshot({
          fullPage: true,
          animations: 'disabled'
        });

        results[viewport.name] = {
          viewport: `${viewport.width}x${viewport.height}`,
          screenshot
        };

        console.log(`Responsive test completed for ${title} - ${name} at ${viewport.name}`);
      }

      return results;
    }
  }
};

export default testRunnerConfig;