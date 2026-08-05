import { enableApiMockingBrowser } from '@repo/api-sdk/adapters/browser';

/**
 * Memoized MSW browser-worker bootstrap for client-side `@repo/api-sdk` calls. No-ops (resolves
 * immediately) when `NEXT_PUBLIC_API_MOCKING` is unset — see `enableApiMockingBrowser`. Query hooks
 * should `await` this before calling an SDK endpoint, so the very first client-side fetch after
 * mount isn't a race against the MSW worker still starting up (see `FoundationCheck` for the
 * original single-page version of this gate — this is the shared, reusable form of it).
 */
let readyPromise: Promise<void> | null = null;

export async function ensureApiMockingReady(): Promise<void> {
  readyPromise ??= enableApiMockingBrowser();
  return readyPromise;
}
