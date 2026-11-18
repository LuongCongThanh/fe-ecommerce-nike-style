/**
 * Transitional environment reader retained from the former shared package. This checkout is the
 * standalone Next.js storefront; VITE_* compatibility is legacy, not another app in this repo.
 * Values are build-time settings; see docs/api-integration.md.
 */
function readEnv(viteKey: string, nextKey: string): string | undefined {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const fromVite = viteEnv?.[viteKey];
  if (fromVite !== undefined) return fromVite;

  return typeof process === 'undefined' ? undefined : process.env[nextKey];
}

/** Baseline per docs/api-integration.md — reads whether the app should run against MSW mocks instead of the real backend. */
export const IS_API_MOCKING = readEnv('VITE_API_MOCKING', 'NEXT_PUBLIC_API_MOCKING') === 'true';

/** Absolute origin per docs/api-integration.md — needed because Node's `fetch` (unlike a browser) can't resolve a path-only URL. */
export const API_BASE_URL = readEnv('VITE_SITE_URL', 'NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000';
