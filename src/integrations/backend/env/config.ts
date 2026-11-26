/**
 * Transitional environment reader retained from the former shared package. This checkout is the
 * standalone Next.js storefront; VITE_* compatibility is legacy, not another app in this repo.
 * Values are build-time settings; see docs/api-integration.md.
 */
function readEnv(viteKey: string, nextValue: string | undefined): string | undefined {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const fromVite = viteEnv?.[viteKey];
  if (fromVite !== undefined) return fromVite;

  return nextValue;
}

// Next.js inlines `NEXT_PUBLIC_*` into the client bundle only where the code names the variable
// literally (`process.env.NEXT_PUBLIC_X`); a dynamic `process.env[key]` lookup stays undefined in
// the browser. Each value is therefore read here by its literal name and passed to `readEnv`.
const hasProcess = typeof process !== 'undefined';
const nextApiMocking = hasProcess ? process.env.NEXT_PUBLIC_API_MOCKING : undefined;
const nextSiteUrl = hasProcess ? process.env.NEXT_PUBLIC_SITE_URL : undefined;

/** Baseline per docs/api-integration.md — reads whether the app should run against MSW mocks instead of the real backend. */
export const IS_API_MOCKING = readEnv('VITE_API_MOCKING', nextApiMocking) === 'true';

/** Absolute origin per docs/api-integration.md — needed because Node's `fetch` (unlike a browser) can't resolve a path-only URL. */
export const API_BASE_URL = readEnv('VITE_SITE_URL', nextSiteUrl) ?? 'http://localhost:3000';
