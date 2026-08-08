/**
 * Mock auth backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #12 (SF-08).
 *
 * TTLs mirror Decision #66's baseline (access 10 phút / refresh idle 7 ngày / absolute 30 ngày) in
 * *relative* shape only, scaled down to seconds so a test can actually observe expiry/rotation without
 * waiting real days — issue #12's acceptance criteria explicitly allows this ("chỉ cần đúng hành vi hết
 * hạn/refresh, chưa cần đúng số giây thật ở mock").
 *
 * Refresh token transport deviates from ADR-0010 (httpOnly cookie) for the mock phase only: a spike
 * (`e2e/_spike-cookie.spec.ts`, since removed) confirmed neither `Set-Cookie` from an MSW browser
 * Service Worker response nor a real `document.cookie`-set cookie ever reaches the SW-intercepted
 * request's `Cookie` header — browsers withhold cookies from Service Worker fetch interception
 * entirely. The refresh token is therefore kept in the same in-memory store as the access token
 * (`core/session/auth-store.ts`), sent explicitly in the refresh/logout request body instead of riding
 * a cookie. It never touches `localStorage`/`sessionStorage`, so it carries the same XSS-exposure
 * profile as the access token already does — not a regression, and F5 session-restore (`bootstrapAuth`)
 * simply can't be simulated cross-reload in mock mode as a result. See decision-log.md Decision #90.
 *
 * This backing store's own data (the mock "database") *does* persist across a full page reload, via
 * `sessionStorage` — not to be confused with the client's own auth tokens above. A real backend's
 * database obviously survives the browser reloading the page (e.g. a customer clicking a password-reset
 * link from their email opens a brand-new page); a purely in-memory mock would forget every registered
 * user and reset token on that same reload, which isn't a faithful simulation. `sessionStorage` is only
 * ever touched from here, is keyed under its own namespace, and never holds a live session's tokens.
 * Falls back to plain in-memory when `sessionStorage` isn't available (Node/vitest tests).
 */

export const ACCESS_TOKEN_TTL_MS = 5_000;
export const REFRESH_IDLE_TTL_MS = 20_000;
export const REFRESH_ABSOLUTE_TTL_MS = 40_000;
export const RESET_TOKEN_TTL_MS = 15_000;

export interface MockAuthUser {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar: string | null;
  role: 'customer' | 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
}

export type PublicAuthUser = Omit<MockAuthUser, 'password'>;

interface RefreshTokenRecord {
  userId: number;
  familyId: string;
  issuedAt: number;
  familyCreatedAt: number;
  consumed: boolean;
}

interface ResetTokenRecord {
  userId: number;
  expiresAt: number;
}

const SEED_USERS: MockAuthUser[] = [
  {
    id: 1,
    email: 'customer@example.com',
    password: 'Password123',
    firstName: 'Khách',
    lastName: 'Hàng',
    avatar: null,
    role: 'customer',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

interface PersistedDb {
  users: MockAuthUser[];
  nextUserId: number;
  refreshTokens: [string, RefreshTokenRecord][];
  resetTokens: [string, ResetTokenRecord][];
}

const STORAGE_KEY = '__mock_auth_db__';

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

function loadPersistedDb(): PersistedDb | null {
  if (!hasSessionStorage()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as PersistedDb;
  } catch {
    return null;
  }
}

const persisted = loadPersistedDb();

export const mockUsers: MockAuthUser[] = persisted?.users ?? SEED_USERS;
let nextUserId = persisted?.nextUserId ?? mockUsers.length + 1;
const refreshTokens = new Map<string, RefreshTokenRecord>(persisted?.refreshTokens ?? []);
const resetTokens = new Map<string, ResetTokenRecord>(persisted?.resetTokens ?? []);

function persist(): void {
  if (!hasSessionStorage()) return;
  const db: PersistedDb = {
    users: mockUsers,
    nextUserId,
    refreshTokens: Array.from(refreshTokens.entries()),
    resetTokens: Array.from(resetTokens.entries()),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function toPublicUser(user: MockAuthUser): PublicAuthUser {
  const { password, ...publicUser } = user;
  return publicUser;
}

export function findUserByEmail(email: string): MockAuthUser | undefined {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(input: { email: string; password: string; firstName: string; lastName: string }): MockAuthUser {
  const user: MockAuthUser = {
    id: nextUserId++,
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    avatar: null,
    role: 'customer',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(user);
  persist();
  return user;
}

export function setUserPassword(user: MockAuthUser, password: string): void {
  user.password = password;
  persist();
}

// --- Access token — opaque, unsigned {sub, exp} blob (NOT a real JWT; mock TTL simulation only). ---

interface AccessTokenPayload {
  sub: number;
  exp: number;
}

export function encodeAccessToken(payload: AccessTokenPayload): string {
  return btoa(JSON.stringify(payload));
}

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const parsed: unknown = JSON.parse(atob(token));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as AccessTokenPayload).sub === 'number' &&
      typeof (parsed as AccessTokenPayload).exp === 'number'
    ) {
      return parsed as AccessTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/** Resolves the user for a valid, non-expired `Authorization: Bearer <access>` header — the check the fetcher's 401→refresh flow relies on. */
export function findUserByAccessToken(authorizationHeader: string | null): MockAuthUser | undefined {
  if (authorizationHeader === null || !authorizationHeader.startsWith('Bearer ')) return undefined;
  const token = authorizationHeader.slice('Bearer '.length);
  const payload = decodeAccessToken(token);
  if (payload === null || payload.exp <= Date.now()) return undefined;
  return mockUsers.find((u) => u.id === payload.sub);
}

// --- Refresh token family — rotation + reuse detection per ADR-0010, minus the cookie transport. ---

function issueSessionTokens(userId: number, familyId: string, familyCreatedAt: number): { access: string; refresh: string } {
  const now = Date.now();
  const refresh = crypto.randomUUID();
  refreshTokens.set(refresh, { userId, familyId, issuedAt: now, familyCreatedAt, consumed: false });
  persist();
  return { access: encodeAccessToken({ sub: userId, exp: now + ACCESS_TOKEN_TTL_MS }), refresh };
}

/** New login/register session — a fresh refresh-token family. */
export function createSession(userId: number): { access: string; refresh: string } {
  return issueSessionTokens(userId, crypto.randomUUID(), Date.now());
}

function revokeFamily(familyId: string): void {
  for (const [token, record] of refreshTokens) {
    if (record.familyId === familyId) refreshTokens.delete(token);
  }
  persist();
}

/** Revokes every refresh token belonging to `userId` — used by logout and password reset (ADR-0010). */
export function revokeAllSessionsForUser(userId: number): void {
  for (const [token, record] of refreshTokens) {
    if (record.userId === userId) refreshTokens.delete(token);
  }
  persist();
}

export type RotateResult = { status: 'ok'; access: string; refresh: string } | { status: 'expired' } | { status: 'reuse' };

/** Rotates a refresh token: valid+fresh → new access+refresh pair; already-consumed → reuse detected, whole family revoked; too old → expired. */
export function rotateRefreshToken(token: string): RotateResult {
  const record = refreshTokens.get(token);
  if (record === undefined) return { status: 'expired' };

  if (record.consumed) {
    revokeFamily(record.familyId);
    return { status: 'reuse' };
  }

  const now = Date.now();
  if (now > record.familyCreatedAt + REFRESH_ABSOLUTE_TTL_MS || now > record.issuedAt + REFRESH_IDLE_TTL_MS) {
    revokeFamily(record.familyId);
    return { status: 'expired' };
  }

  record.consumed = true;
  const next = issueSessionTokens(record.userId, record.familyId, record.familyCreatedAt);
  return { status: 'ok', ...next };
}

/** Revokes the token's whole family — used by logout (best-effort; a garbage/expired token is a no-op). */
export function revokeByRefreshToken(token: string): void {
  const record = refreshTokens.get(token);
  if (record !== undefined) revokeFamily(record.familyId);
}

// --- Password reset — single-use token + uid, short TTL (mock stand-in for the real 15-minute email link). ---

export function createResetToken(userId: number): { token: string; uid: string } {
  const token = crypto.randomUUID();
  resetTokens.set(token, { userId, expiresAt: Date.now() + RESET_TOKEN_TTL_MS });
  persist();
  return { token, uid: String(userId) };
}

/** Consumes a reset token if `token`+`uid` match a live, unexpired entry — single-use, deletes on success or failure alike. */
export function consumeResetToken(token: string, uid: string): MockAuthUser | undefined {
  const record = resetTokens.get(token);
  resetTokens.delete(token);
  persist();
  if (record === undefined || record.expiresAt <= Date.now() || String(record.userId) !== uid) return undefined;
  return mockUsers.find((u) => u.id === record.userId);
}
