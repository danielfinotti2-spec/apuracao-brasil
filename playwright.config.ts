import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: 'list',
  timeout: 120_000,
  expect: { timeout: 45_000 },
  use: {
    baseURL: 'http://127.0.0.1:3011',
    navigationTimeout: 120_000,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run start -- --port 3011',
    url: 'http://127.0.0.1:3011',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
