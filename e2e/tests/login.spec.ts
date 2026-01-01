import { test, expect, TEST_PHONE, TEST_CODE } from '../fixtures/test-fixtures';

test.describe('Login', () => {
  test('should display the login screen correctly', async ({ loginPage, page }) => {
    // Navigate to login screen
    await loginPage.goto();

    // Verify we're on the login screen with correct branding
    await loginPage.isOnLoginScreen();

    // Visual regression test for login screen
    await expect(page).toHaveScreenshot('login-screen.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('should navigate to phone login flow', async ({ loginPage, page }) => {
    await loginPage.goto();

    // Select phone login method
    await loginPage.selectPhoneLogin();

    // Verify phone number input is displayed
    await expect(page.locator('input[type="tel"]')).toBeVisible();

    // Visual regression test for phone input screen
    await expect(page).toHaveScreenshot('phone-input-screen.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('should enter phone number and attempt verification', async ({
    loginPage,
    page,
  }) => {
    // Navigate to login screen
    await loginPage.goto();

    // Select phone login method
    await loginPage.selectPhoneLogin();

    // Enter phone number
    await loginPage.enterPhoneNumber(TEST_PHONE);

    // Visual regression test for phone number entered
    await expect(page).toHaveScreenshot('phone-number-entered.png', {
      maxDiffPixelRatio: 0.05,
    });

    // Click continue to initiate verification
    await loginPage.clickContinue();
    await page.waitForTimeout(3000); // Wait for response

    // At this point, either:
    // 1. reCAPTCHA challenge appears (common in dev without configured test numbers)
    // 2. Verification code input appears (if test phone numbers are configured)
    const hasRecaptcha = await loginPage.hasRecaptcha();
    const hasCodeInput = await loginPage.waitForVerificationCodeInput();

    if (hasRecaptcha) {
      // Document that reCAPTCHA appeared - this is expected without Firebase test config
      console.log(
        'Note: reCAPTCHA challenge appeared. To enable full login testing, ' +
          'configure test phone numbers in Firebase Console.'
      );
    } else if (hasCodeInput) {
      // Visual regression test for verification screen
      await expect(page).toHaveScreenshot('verification-screen.png', {
        maxDiffPixelRatio: 0.05,
      });

      // Enter verification code and complete login
      await loginPage.enterVerificationCode(TEST_CODE);

      await loginPage.clickVerify();
      await loginPage.waitForNetworkIdle();

      // Wait for redirect to complete
      await page.waitForTimeout(2000);

      // Visual regression test for logged-in home screen
      await expect(page).toHaveScreenshot('home-after-login.png', {
        maxDiffPixelRatio: 0.05,
      });

      // Verify successful login
      await expect(page).not.toHaveURL('/login');
    }

    // Test passes either way - we've verified the login flow works up to external dependencies
    expect(hasRecaptcha || hasCodeInput).toBeTruthy();
  });
});
