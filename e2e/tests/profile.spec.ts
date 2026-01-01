import { test, expect, TEST_PHONE, TEST_CODE } from '../fixtures/test-fixtures';

test.describe('Profile', () => {
  /**
   * Note: These tests verify the app state after successful authentication.
   * Navigation to specific tabs is simplified due to React Native Web's custom components.
   */

  test('should land on home screen after login', async ({ loginPage, page }) => {
    // Attempt to login
    const canProceed = await loginPage.initiatePhoneLogin(TEST_PHONE);

    if (!canProceed) {
      test.skip(
        true,
        'reCAPTCHA challenge blocked login. Configure test phone numbers in Firebase Console.'
      );
      return;
    }

    // Complete login
    await loginPage.completePhoneLogin(TEST_CODE);

    // After login, should be on the home screen (Favorites)
    await expect(page.getByText('Favorites')).toBeVisible();

    // Verify user content is loaded
    await page.waitForLoadState('networkidle');

    // Visual regression test for favorites/home screen
    await expect(page).toHaveScreenshot('favorites-screen.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('should show settings option', async ({ loginPage, page }) => {
    // Attempt to login
    const canProceed = await loginPage.initiatePhoneLogin(TEST_PHONE);

    if (!canProceed) {
      test.skip(
        true,
        'reCAPTCHA challenge blocked login. Configure test phone numbers in Firebase Console.'
      );
      return;
    }

    // Complete login
    await loginPage.completePhoneLogin(TEST_CODE);

    // After login, wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Visual regression test - settings icon should be visible in header
    await expect(page).toHaveScreenshot('home-with-settings.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe('App Navigation', () => {
  test('should show navigation icons after login', async ({ loginPage, page }) => {
    // Login first
    const canProceed = await loginPage.initiatePhoneLogin(TEST_PHONE);

    if (!canProceed) {
      test.skip(true, 'reCAPTCHA blocked login');
      return;
    }

    await loginPage.completePhoneLogin(TEST_CODE);

    // Wait for login to fully complete and redirect
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Wait for one of these titles to appear
    try {
      await page.getByText('Favorites').waitFor({ timeout: 10000 });
    } catch {
      // If Favorites doesn't appear, check other titles
    }

    const hasTitle = await page.getByText('Favorites').isVisible() ||
                     await page.getByText('Discover').isVisible() ||
                     await page.getByText('Profiles').isVisible();

    expect(hasTitle).toBeTruthy();

    // Visual regression test for navigation state
    await expect(page).toHaveScreenshot('navigation-visible.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
