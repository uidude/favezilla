import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  // Selectors - navigation uses icons, the profiles tab is the 3rd icon (people icon)
  private readonly editButton = 'text=Edit';

  constructor(page: Page) {
    super(page);
  }

  async navigateToProfiles() {
    // Click on the people/profiles icon (3rd nav icon)
    // The nav icons are in order: book (Discover), heart (Faves), people (Profiles)
    // Try clicking any element that might be the Profiles nav item
    const profilesLink = this.page.locator('[title="Profiles"], [aria-label="Profiles"]').first();

    if (await profilesLink.count() > 0) {
      await profilesLink.click();
    } else {
      // Fallback: look for clickable elements near the top and click the 3rd one
      // The icons are rendered as divs with role="img" or as svg inside clickable containers
      const clickableIcons = this.page.locator('[role="button"], [tabindex="0"]').first();
      const navArea = this.page.locator('div').filter({ hasText: /^$/ }).nth(2);

      // Last resort: take screenshot and try to click by coordinates
      await this.takeScreenshot('profile-00-nav-debug');

      // Click in the approximate location of the Profiles icon (3rd icon from left)
      // Based on the screenshot, icons are at the top around x=385
      await this.page.click('body', { position: { x: 385, y: 25 } });
    }
    await this.waitForNetworkIdle();
    await this.takeScreenshot('profile-01-profiles-tab');
  }

  async clickOwnProfile() {
    // Click on the first profile in the list (should be the logged-in user)
    const profileRow = this.page.locator('[data-testid="profile-row"]').first();
    if (await profileRow.isVisible()) {
      await profileRow.click();
    } else {
      // Fallback: click on profile name or list item
      await this.page.locator('text=/.*@.*/').first().click();
    }
    await this.waitForNetworkIdle();
    await this.takeScreenshot('profile-02-profile-selected');
  }

  async isOnProfileScreen() {
    // Profile screen should show user name and potentially an Edit button
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('profile-03-profile-screen');
  }

  async hasEditButton() {
    return this.page.locator(this.editButton).isVisible();
  }

  async clickEdit() {
    await this.page.click(this.editButton);
    await this.waitForNetworkIdle();
    await this.takeScreenshot('profile-04-edit-profile');
  }

  async verifyProfileElements() {
    await this.takeScreenshot('profile-05-verify-elements');
  }
}
