import { IS_API_MOCKING } from '../env/config';

/** Call once during app bootstrap (client-side). No-ops when `NEXT_PUBLIC_API_MOCKING` is unset. */
export async function enableApiMockingBrowser(): Promise<void> {
  if (!IS_API_MOCKING) return;

  const { worker } = await import('../testing/msw-browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
