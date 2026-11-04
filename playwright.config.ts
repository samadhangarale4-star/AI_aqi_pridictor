import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4180',
    ...devices['Desktop Chrome'],
    headless: true,
  },
  webServer: {
    command: 'node tests/start-server.mjs',
    url: 'http://127.0.0.1:4180',
    timeout: 60_000,
    reuseExistingServer: false,
  },
});
