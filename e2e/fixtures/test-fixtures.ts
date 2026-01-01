import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';

// Test credentials
export const TEST_PHONE = '415 555-5555';
export const TEST_CODE = '555555';

// Extend base test with page objects
type PageObjects = {
  loginPage: LoginPage;
  profilePage: ProfilePage;
};

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await use(profilePage);
  },
});

export { expect } from '@playwright/test';
