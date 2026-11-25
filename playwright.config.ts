import { defineConfig, devices } from '@playwright/test';

import { appServerEnv, catalogHarnessServer, E2E_PORTS, localOrigin, sharedRunnerConfig, sharedUseOptions } from '@/../e2e/support/playwright-base';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localOrigin(E2E_PORTS.devApp);
const catalogPort = Number(process.env.E2E_CATALOG_PORT ?? E2E_PORTS.devCatalog);

export default defineConfig({
  ...sharedRunnerConfig,
  testDir: './e2e',
  testIgnore: '**/production/**',
  use: {
    ...sharedUseOptions,
    baseURL,
  },
  webServer: [
    catalogHarnessServer(catalogPort),
    {
      command: 'pnpm dev',
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: appServerEnv(baseURL, localOrigin(catalogPort), true),
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
