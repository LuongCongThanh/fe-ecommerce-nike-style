import { IS_API_MOCKING } from '../env/config';

/** Call once during server bootstrap (e.g. Next.js `instrumentation.ts`). No-ops when `NEXT_PUBLIC_API_MOCKING` is unset. */
export async function enableApiMockingServer(): Promise<void> {
  if (!IS_API_MOCKING) return;

  const { server } = await import('../testing/msw-server');
  server.listen({ onUnhandledRequest: 'bypass' });
}
