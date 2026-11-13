/**
 * Reads one setting under whichever name the consuming bundler exposes: `VITE_*` on
 * `import.meta.env` for the Vite apps (admin, cms), `NEXT_PUBLIC_*` on `process.env` for the Next.js
 * app (storefront).
 *
 * This package used to read `process.env.NEXT_PUBLIC_*` only, so each Vite app had to statically
 * replace those expressions through a `define` block — a Next-shaped name leaking into a package
 * that serves all three apps. Note this does not make the values dynamic: both bundlers still
 * substitute them at build time, so changing one needs a rebuild.
 */
function readEnv(viteKey: string, nextKey: string): string | undefined {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const fromVite = viteEnv?.[viteKey];
  if (fromVite !== undefined) return fromVite;

  return typeof process === 'undefined' ? undefined : process.env[nextKey];
}

/** Baseline per FE-EXECUTION.md §2.7 — reads whether the app should run against MSW mocks instead of the real backend. */
export const IS_API_MOCKING = readEnv('VITE_API_MOCKING', 'NEXT_PUBLIC_API_MOCKING') === 'true';

/** Absolute origin per FE-EXECUTION.md §2.11 — needed because Node's `fetch` (unlike a browser) can't resolve a path-only URL. */
export const API_BASE_URL = readEnv('VITE_SITE_URL', 'NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000';
