import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const catalogPort = Number(process.env.E2E_CATALOG_PORT ?? 4010);
const catalogOrigin = `http://127.0.0.1:${catalogPort}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: '**/production/**',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
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
      env: { E2E_CATALOG_PORT: String(catalogPort) },
    },
    {
      command: 'pnpm dev',
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        API_ORIGIN: catalogOrigin,
        NEXT_PUBLIC_API_MOCKING: 'true',
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
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
