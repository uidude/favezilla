import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,

  use: {
    baseURL: 'http://localhost:19006',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'yarn web',
    url: 'http://localhost:19006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_OPTIONS: '--openssl-legacy-provider',
      E2E_TEST: 'true',
    },
  },
});
