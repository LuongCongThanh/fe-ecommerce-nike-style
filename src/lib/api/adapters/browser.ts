import { IS_API_MOCKING } from '@/lib/api/env/config';

/** Starts the storefront's development worker when API mocking is enabled. */
export async function enableApiMockingBrowser(): Promise<void> {
  if (!IS_API_MOCKING) return;

  const { worker } = await import('@/lib/api/testing/msw-browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
