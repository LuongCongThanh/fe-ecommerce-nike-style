/**
 * Transitional environment reader retained from the former shared package. This checkout is the
 * standalone Next.js storefront; VITE_* compatibility is legacy, not another app in this repo.
 * Values are build-time settings; see docs/architecture/api-integration.md.
 */
function readEnv(viteKey: string, nextValue: string | undefined): string | undefined {
  // Vite types `import.meta.env` as always present with no string index, but under Next.js it is
  // undefined at runtime: mark it optional and read the key without an index signature.
  const viteEnv = (import.meta as Partial<ImportMeta>).env;
  const fromVite: unknown = viteEnv === undefined ? undefined : Reflect.get(viteEnv, viteKey);
  if (typeof fromVite === 'string') return fromVite;

  return nextValue;
}

// Next.js inlines `NEXT_PUBLIC_*` into the client bundle only where the code names the variable
// literally (`process.env.NEXT_PUBLIC_X`); a dynamic `process.env[key]` lookup stays undefined in
// the browser. Each value is therefore read here by its literal name and passed to `readEnv`.
const hasProcess = typeof process !== 'undefined';
const nextApiMocking = hasProcess ? process.env.NEXT_PUBLIC_API_MOCKING : undefined;
const nextSiteUrl = hasProcess ? process.env.NEXT_PUBLIC_SITE_URL : undefined;

/** Baseline per docs/architecture/api-integration.md — reads whether the app should run against MSW mocks instead of the real backend. */
export const IS_API_MOCKING = readEnv('VITE_API_MOCKING', nextApiMocking) === 'true';

/** Absolute origin per docs/architecture/api-integration.md — needed because Node's `fetch` (unlike a browser) can't resolve a path-only URL. */
export const API_BASE_URL = readEnv('VITE_SITE_URL', nextSiteUrl) ?? 'http://localhost:3000';

const DEFAULT_SERVER_API_ORIGIN = 'http://localhost:8080';
let warnedMissingServerOrigin = false;

/**
 * Backend origin for server-side public reads (`API_ORIGIN`, the same server-only setting
 * `next.config.ts` proxies `/api/v1` to). Read at call time, never exposed to the browser. A missing
 * value falls back to the local Backend for development; in production that is a misconfiguration, so
 * it is logged loudly (once per process).
 */
export function readServerApiOrigin(): string {
  const configured = hasProcess ? process.env.API_ORIGIN : undefined;
  if (configured === undefined || configured === '') {
    if (hasProcess && process.env.NODE_ENV === 'production' && !warnedMissingServerOrigin) {
      warnedMissingServerOrigin = true;
      console.error(`[backend] API_ORIGIN is not set in production; server reads fall back to ${DEFAULT_SERVER_API_ORIGIN}.`);
    }
    return DEFAULT_SERVER_API_ORIGIN;
  }
  return configured.replace(/\/+$/, '');
}
