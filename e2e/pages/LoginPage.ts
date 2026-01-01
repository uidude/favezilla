import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Selectors
  private readonly phoneLoginButton = 'text=Phone';
  private readonly phoneInput = 'input[type="tel"]';
  private readonly continueButton = 'text=Continue';
  private readonly codeInput = 'input[inputmode="numeric"]';
  private readonly recaptchaFrame = 'iframe[title*="recaptcha"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForNetworkIdle();
  }

  async isOnLoginScreen() {
    await expect(this.page.getByText('Favezilla')).toBeVisible();
    await expect(
      this.page.getByText('Share your favorite books!')
    ).toBeVisible();
  }

  async selectPhoneLogin() {
    await this.page.click(this.phoneLoginButton);
  }

  async enterPhoneNumber(phoneNumber: string) {
    await this.page.fill(this.phoneInput, phoneNumber);
  }

  async clickContinue() {
    await this.page.click(this.continueButton);
  }

  async clickVerify() {
    // Use getByRole to find the actual Verify button, not text that contains "Verify"
    await this.page.getByRole('button', { name: 'Verify' }).click();
  }

  async enterVerificationCode(code: string) {
    await this.page.fill(this.codeInput, code);
  }

  async hasRecaptcha(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.recaptchaFrame, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForVerificationCodeInput(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.codeInput, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initiates phone login flow up to the point where either:
   * - reCAPTCHA challenge appears (returns false)
   * - Verification code input appears (returns true)
   *
   * Note: To bypass reCAPTCHA in testing, configure test phone numbers
   * in Firebase Console > Authentication > Sign-in method > Phone > Phone numbers for testing
   */
  async initiatePhoneLogin(phoneNumber: string): Promise<boolean> {
    await this.goto();
    await this.takeScreenshot('01-login-screen');

    await this.selectPhoneLogin();
    await this.takeScreenshot('02-phone-login-selected');

    await this.enterPhoneNumber(phoneNumber);
    await this.takeScreenshot('03-phone-number-entered');

    await this.clickContinue();
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('04-after-continue');

    // Check if reCAPTCHA appeared
    const hasRecaptcha = await this.hasRecaptcha();
    if (hasRecaptcha) {
      await this.takeScreenshot('05-recaptcha-challenge');
      return false;
    }

    return true;
  }

  /**
   * Complete login after verification code input is available
   */
  async completePhoneLogin(verificationCode: string) {
    await this.enterVerificationCode(verificationCode);
    await this.takeScreenshot('05-verification-code-entered');

    await this.clickVerify();
    await this.waitForNetworkIdle();
    await this.takeScreenshot('06-login-complete');
  }

  /**
   * Full login flow - will fail if reCAPTCHA appears
   */
  async loginWithPhone(phoneNumber: string, verificationCode: string) {
    const canProceed = await this.initiatePhoneLogin(phoneNumber);
    if (!canProceed) {
      throw new Error(
        'reCAPTCHA challenge appeared. Configure test phone numbers in Firebase Console to bypass.'
      );
    }
    await this.completePhoneLogin(verificationCode);
  }
}
