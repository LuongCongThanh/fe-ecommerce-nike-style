import { IS_API_MOCKING } from '../env/config';

/**
 * Call once during app bootstrap (client-side). No-ops when `NEXT_PUBLIC_API_MOCKING` is unset.
 *
 * `basePath` must match the Next.js app's own `basePath` (e.g. `/admin`, `/cms`) when it has one —
 * Next.js serves everything under `public/` (this worker script included) prefixed by `basePath`, so
 * MSW's default same-origin-root lookup (`/mockServiceWorker.js`) 404s for any app that sets one.
 * Storefront has no `basePath`, so its call site can omit this and nothing changes for it.
 *
 * `scope` must be passed explicitly too. Left to its default, the service worker's scope is the
 * *directory* of its script URL — for `/admin/mockServiceWorker.js` that's `/admin/` (trailing
 * slash) — which excludes the app's own bare root route `/admin` (no trailing slash) by strict
 * prefix matching. Anyone landing directly on `/admin` (or `/cms`) then gets every API call bypassed
 * un-mocked, which silently breaks staff auth's bootstrap/refresh calls on that exact route.
 */
export async function enableApiMockingBrowser(basePath = ''): Promise<void> {
  if (!IS_API_MOCKING) return;

  const { worker } = await import('../testing/msw-browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${basePath}/mockServiceWorker.js`, options: { scope: basePath === '' ? '/' : basePath } },
  });
}
