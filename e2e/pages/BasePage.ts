import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }
}
