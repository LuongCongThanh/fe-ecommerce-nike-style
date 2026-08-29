/**
 * Mock backing store for Better Auth's own REST contract (`/sign-in/email`, `/get-session`,
 * `/sign-out` — see `packages/shared/src/better-auth/index.tsx`) — a separate concern from
 * `staff-fixtures.ts`'s JWT-based `/api/staff/*` handlers (the old staff-auth module those exist
 * for is no longer used by `apps/admin`, but other tests may still rely on them, so they're left
 * alone rather than repurposed).
 *
 * Reuses the same seeded accounts (`findStaffByEmail` et al. from `staff-fixtures.ts`) so
 * `super@admin.local` / `staff@admin.local` / `editor@cms.local` (all `Password123`) work the same
 * way they used to under the old mock login flow.
 *
 * `get-session` auto-authenticates as `super@admin.local` whenever nothing has explicitly logged
 * out — this is a deliberate mock-only convenience (not a real session), because a real cookie
 * round-trip through MSW's Service Worker interception turned out unreliable in practice (the
 * documented `/login` flow kept bouncing back even after a "successful" sign-in). Signing in as a
 * different seeded account, or signing out, both still work and override the auto-login for the
 * rest of that page load; a full reload resets back to auto-super-admin. None of this applies once
 * a real Better Auth backend is wired up — this whole file only exists behind `VITE_API_MOCKING`.
 */
import { findStaffByAccessToken, findStaffByEmail, findStaffById, permissionsFor, toPublicStaff } from './staff-fixtures';

export const BETTER_AUTH_COOKIE_NAME = 'better-auth.session_token';

const AUTO_LOGIN_STAFF_ID = 1; // super@admin.local — see SEED_STAFF in staff-fixtures.ts

interface MockSession {
  token: string;
  staffId: number;
  createdAt: number;
}

const sessions = new Map<string, MockSession>();
let explicitlySignedOut = false;

// Off by default — only `enableApiMockingBrowser` (real app bootstrap, never the Node test suite)
// turns this on. Without this gate, every "rejects with 401 when there is no Staff session" unit
// test in `packages/api-sdk` would start passing for the wrong reason (auto-login, not a real
// session) instead of catching an actual regression.
let autoLoginEnabled = false;

export function setMockAutoLoginEnabled(enabled: boolean): void {
  autoLoginEnabled = enabled;
}

export function createMockSession(staffId: number): string {
  explicitlySignedOut = false;
  const token = crypto.randomUUID();
  sessions.set(token, { token, staffId, createdAt: Date.now() });
  return token;
}

export function destroyMockSession(token: string): void {
  sessions.delete(token);
  explicitlySignedOut = true;
}

function extractCookieValue(cookieHeader: string | null, name: string): string | null {
  if (cookieHeader === null) return null;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

interface ResolvedMockSession {
  token: string;
  staffId: number;
}

/** Resolves who's "logged in" for a request — first a real cookie-backed session (works when the
 * cookie made it through), then the auto-login fallback (see file doc comment), unless something
 * explicitly signed out during this page load. */
export function resolveMockSession(cookieHeader: string | null): ResolvedMockSession | undefined {
  const token = extractCookieValue(cookieHeader, BETTER_AUTH_COOKIE_NAME);
  const session = token === null ? undefined : sessions.get(token);
  if (session) return session;

  if (!autoLoginEnabled || explicitlySignedOut) return undefined;

  return { token: 'auto-login', staffId: AUTO_LOGIN_STAFF_ID };
}

export function mockLogin(email: string, password: string): { ok: true; staff: ReturnType<typeof toPublicStaff>; token: string } | { ok: false } {
  const staff = findStaffByEmail(email);
  if (staff?.password !== password || !staff.isActive) return { ok: false };

  return { ok: true, staff: toPublicStaff(staff), token: createMockSession(staff.id) };
}

/** Resolves the signed-in staff for any `/api/admin/*` mock handler — tries the old JWT
 * `Authorization: Bearer` header first (still what every existing `packages/api-sdk` test
 * registers via `registerAuthRuntimeAdapter`), then falls back to the Better Auth session cookie
 * (what `apps/admin` actually sends at runtime, `credentials: 'include'` in the fetcher). Neither
 * path is "the old one being repurposed" — this just accepts either, so business endpoints don't
 * 401 for everyone now that admin's session module no longer produces a bearer token. Real backend
 * note: whatever verifies these routes for real must be taught to check a Better Auth session the
 * same way; this is a mock-only bridge. */
export function findStaffFromRequest(request: Request): ReturnType<typeof findStaffById> {
  const byToken = findStaffByAccessToken(request.headers.get('authorization'));
  if (byToken !== undefined) return byToken;

  const session = resolveMockSession(request.headers.get('cookie'));
  return session === undefined ? undefined : findStaffById(session.staffId);
}

export { findStaffByEmail, findStaffById, permissionsFor, toPublicStaff };
