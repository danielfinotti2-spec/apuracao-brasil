import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3011', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run start -- --port 3011',
    url: 'http://127.0.0.1:3011',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
