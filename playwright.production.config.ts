import { defineConfig, devices } from '@playwright/test';

import { appServerEnv, catalogHarnessServer, E2E_PORTS, localOrigin, sharedRunnerConfig, sharedUseOptions } from '@/../e2e/support/playwright-base';

const baseURL = localOrigin(E2E_PORTS.productionApp);

export default defineConfig({
  ...sharedRunnerConfig,
  testDir: './e2e/production',
  use: {
    ...sharedUseOptions,
    baseURL,
    serviceWorkers: 'allow',
  },
  webServer: [
    catalogHarnessServer(E2E_PORTS.productionCatalog),
    {
      command: `pnpm start --port ${String(E2E_PORTS.productionApp)}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: appServerEnv(baseURL, localOrigin(E2E_PORTS.productionCatalog), false),
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
