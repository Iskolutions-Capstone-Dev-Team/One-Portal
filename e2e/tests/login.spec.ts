import { test, expect } from '@playwright/test';

test.describe.serial('One-Portal Login Flow', () => {
  const ONE_PORTAL_URL = 'http://localhost:5174';

  test.beforeEach(async ({ page }) => {
    // Disable accessibility widget to prevent it from blocking clicks
    await page.addStyleTag({ content: '[data-idp-accessibility-managed="true"] { pointer-events: none !important; }' });
  });

  test('should login as External User (Student) via Identity Provider', async ({ page }) => {
    // 1. Go to One-Portal landing page
    await page.goto(`${ONE_PORTAL_URL}/landing`);

    // Click the Login button in the header specifically
    await page.locator('header').locator('button', { hasText: 'Login' }).first().click();

    // Wait for the redirect to Identity Provider login
    await page.waitForURL('**/login**', { timeout: 15000 });

    // 2. Fill in the student credentials on the IDP login page specifically targeting the visible inputs
    await page.locator('input[type="email"]').first().fill('autoteststudent@gmail.com');
    await page.locator('input[type="password"]').first().fill('Student123!');
    
    // 3. Submit
    await page.click('button:has-text("SIGN IN")');

    // 4. Depending on the environment/account settings, it might redirect to MFA or directly back to One-Portal
    // We wait for either the One-Portal callback/dashboard OR the MFA page.
    await page.waitForFunction(() => {
      const url = window.location.href;
      return url.includes('/portal') || url.includes('/callback') || url.includes('mfa=1');
    }, { timeout: 15000 });

    // Verify it reached a successful post-login state
    const currentUrl = page.url();
    if (currentUrl.includes('mfa=1')) {
      await expect(page.locator('text=Multi-Factor Authentication')).toBeVisible();
      await expect(page.locator('text=Signed in as')).toBeVisible();
    } else {
      expect(currentUrl).not.toContain('5173/login');
      // Verify that the One-Portal dashboard is fully loaded
      await expect(page.locator('text=Explore Services')).toBeVisible();
    }
  });
});
