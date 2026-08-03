/** Baseline per FE-EXECUTION.md §2.7 — reads whether the app should run against MSW mocks instead of the real backend. */
export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'true';

/** Absolute origin per FE-EXECUTION.md §2.11 (`NEXT_PUBLIC_SITE_URL`) — needed because Node's `fetch` (unlike a browser) can't resolve a path-only URL. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
