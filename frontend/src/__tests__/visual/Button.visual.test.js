/**
 * @fileoverview Visual regression tests for Button component
 * Tests visual appearance across different variants, states, and sizes
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Visual regression tests for Button component
 * These tests ensure visual consistency across different button states and variants
 */
test.describe('Button Component Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe for accessibility testing
    await injectAxe(page);

    // Set consistent viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Add visual test helper
    await page.addStyleTag({
      content: `
        .visual-test-helper {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(255, 0, 0, 0.1);
          color: red;
          padding: 4px 8px;
          font-size: 12px;
          z-index: 9999;
          border-radius: 4px;
        }
      `
    });
  });

  test('Button - Primary Variant', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--primary');

    // Wait for component to render
    await page.waitForSelector('[data-testid="button"]');

    // Add visual test indicator
    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Primary Variant';
      document.body.appendChild(helper);
    });

    // Run accessibility check
    await checkA11y(page);

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('button-primary.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide'
    });
  });

  test('Button - Secondary Variant', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--secondary');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Secondary Variant';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-secondary.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Outline Variant', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--outline');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Outline Variant';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-outline.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Ghost Variant', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--ghost');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Ghost Variant';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-ghost.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Different Sizes', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--sizes');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Different Sizes';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-sizes.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Loading States', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--loading');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Loading States';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-loading.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Disabled States', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--disabled');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Disabled States';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-disabled.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - With Icons', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--with-icons');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button With Icons';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-with-icons.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Interactive States', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--interactive-states');

    await page.waitForSelector('[data-testid="button"]');

    // Test hover state
    await page.hover('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Interactive States';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-interactive.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Focus States', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--focus-states');

    await page.waitForSelector('[data-testid="button"]');

    // Test focus state
    await page.focus('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Focus States';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-focus.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Error States', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--error-states');

    await page.waitForSelector('[data-testid="button"]');

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Error States';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-error.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Responsive Design', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'wide', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/?path=/story/components-atoms-button--responsive');

      await page.waitForSelector('[data-testid="button"]');

      await page.evaluate(({ viewportName }) => {
        const helper = document.createElement('div');
        helper.className = 'visual-test-helper';
        helper.textContent = `Button Responsive - ${viewportName}`;
        document.body.appendChild(helper);
      }, { viewportName: viewport.name });

      await checkA11y(page);

      await expect(page).toHaveScreenshot(`button-responsive-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Button - Dark Theme', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--dark-theme');

    await page.waitForSelector('[data-testid="button"]');

    // Enable dark theme
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Dark Theme';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-dark-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - High Contrast', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--high-contrast');

    await page.waitForSelector('[data-testid="button"]');

    // Enable high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            --color-primary-500: #0000ff !important;
            --color-gray-900: #000000 !important;
            --color-gray-100: #ffffff !important;
          }
        }
      `
    });

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button High Contrast';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-high-contrast.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button - Animation States', async ({ page }) => {
    await page.goto('/?path=/story/components-atoms-button--animation-states');

    await page.waitForSelector('[data-testid="button"]');

    // Wait for any animations to complete
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const helper = document.createElement('div');
      helper.className = 'visual-test-helper';
      helper.textContent = 'Button Animation States';
      document.body.appendChild(helper);
    });

    await checkA11y(page);

    await expect(page).toHaveScreenshot('button-animations.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});