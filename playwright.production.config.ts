import { defineConfig, devices } from '@playwright/test';

const PORT = 3101;
const CATALOG_PORT = 4011;
const baseURL = `http://127.0.0.1:${PORT}`;
const catalogOrigin = `http://127.0.0.1:${CATALOG_PORT}`;
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e/production',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: isCi ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    serviceWorkers: 'allow',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm exec tsx e2e/support/catalog-server.ts',
      url: `${catalogOrigin}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: { E2E_CATALOG_PORT: String(CATALOG_PORT) },
    },
    {
      command: `pnpm start --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        API_ORIGIN: catalogOrigin,
        NEXT_PUBLIC_API_MOCKING: 'false',
        NEXT_PUBLIC_API_URL: `${baseURL}/api`,
        NEXT_PUBLIC_APP_URL: baseURL,
        NEXT_PUBLIC_SITE_URL: baseURL,
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
