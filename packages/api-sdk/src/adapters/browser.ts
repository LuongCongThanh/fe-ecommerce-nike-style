import { IS_API_MOCKING } from '../env/config';

/**
 * Call once during app bootstrap (client-side). No-ops when `NEXT_PUBLIC_API_MOCKING` is unset.
 *
 * `basePath` must match the Next.js app's own `basePath` (e.g. `/admin`, `/cms`) when it has one —
 * Next.js serves everything under `public/` (this worker script included) prefixed by `basePath`, so
 * MSW's default same-origin-root lookup (`/mockServiceWorker.js`) 404s for any app that sets one.
 * Storefront has no `basePath`, so its call site can omit this and nothing changes for it.
 */
export async function enableApiMockingBrowser(basePath = ''): Promise<void> {
  if (!IS_API_MOCKING) return;

  const { worker } = await import('../testing/msw-browser');
  await worker.start({ onUnhandledRequest: 'bypass', serviceWorker: { url: `${basePath}/mockServiceWorker.js` } });
}
