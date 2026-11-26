import { IS_API_MOCKING } from '@/integrations/backend/env/config';

/** Starts the storefront's development worker when API mocking is enabled. */
export async function enableApiMockingBrowser(): Promise<void> {
  if (!IS_API_MOCKING) return;

  const { worker } = await import('@/integrations/backend/testing/msw-browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
