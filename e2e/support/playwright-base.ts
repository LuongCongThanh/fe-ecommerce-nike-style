import type { PlaywrightTestConfig } from '@playwright/test';

/** Ports owned by each Playwright run; the dev and production suites can run side by side. */
export const E2E_PORTS = {
  devApp: 3000,
  devCatalog: 4010,
  productionApp: 3101,
  productionCatalog: 4011,
} as const;

const isCi = Boolean(process.env.CI);

export function localOrigin(port: number): string {
  return `http://127.0.0.1:${String(port)}`;
}

/** Runner settings both suites share: CI retries/workers, timeouts, reporters and failure artifacts. */
export const sharedRunnerConfig = {
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: isCi ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
} satisfies PlaywrightTestConfig;

export const sharedUseOptions = {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
} satisfies PlaywrightTestConfig['use'];

/** The HTTP catalog harness (`e2e/support/catalog-server.ts`) on its own port. */
export function catalogHarnessServer(port: number) {
  return {
    command: 'pnpm exec tsx e2e/support/catalog-server.ts',
    url: `${localOrigin(port)}/health`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: { E2E_CATALOG_PORT: String(port) },
  };
}

/** Environment that points the app's server-side reader and browser proxy at the harness. */
export function appServerEnv(appOrigin: string, catalogOrigin: string, apiMocking: boolean): Record<string, string> {
  return {
    API_ORIGIN: catalogOrigin,
    NEXT_PUBLIC_API_MOCKING: String(apiMocking),
    NEXT_PUBLIC_API_URL: `${appOrigin}/api`,
    NEXT_PUBLIC_APP_URL: appOrigin,
    NEXT_PUBLIC_SITE_URL: appOrigin,
  };
}
