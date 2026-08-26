/**
 * Mock Staff auth backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #18/#24 (Admin/CMS
 * Auth/RBAC shell). Deliberately a separate store from `auth-fixtures.ts` (Customer identity vs Staff
 * identity are different accounts in this domain — a Customer never has a Role), but reuses that
 * module's `encodeAccessToken`/`decodeAccessToken` since those are pure `{sub, exp}` blob helpers with
 * nothing Customer-specific in them.
 *
 * TTLs mirror issue #18's stated profile (access 5 phút / refresh idle 8 giờ / absolute 24 giờ) in
 * *relative* shape only, scaled down to milliseconds — same test-speed rationale as `auth-fixtures.ts`.
 */
import type { Permission, Staff, StaffRole } from '@repo/schemas/staff';
import { resolvePermissions } from '@repo/schemas/staff';

import { decodeAccessToken, encodeAccessToken } from './auth-fixtures';

export const STAFF_ACCESS_TOKEN_TTL_MS = 5_000;
export const STAFF_REFRESH_IDLE_TTL_MS = 8_000;
export const STAFF_REFRESH_ABSOLUTE_TTL_MS = 24_000;

interface MockStaff {
  id: number;
  email: string;
  password: string;
  name: string;
  roles: StaffRole[];
  isActive: boolean;
}

const SEED_STAFF: MockStaff[] = [
  { id: 1, email: 'super@admin.local', password: 'Password123', name: 'Super Admin', roles: ['SUPER_ADMIN'], isActive: true },
  { id: 2, email: 'staff@admin.local', password: 'Password123', name: 'Admin Staff', roles: ['ADMIN_STAFF'], isActive: true },
  { id: 3, email: 'editor@cms.local', password: 'Password123', name: 'CMS Editor', roles: ['CMS_EDITOR'], isActive: true },
];

interface RefreshTokenRecord {
  staffId: number;
  familyId: string;
  issuedAt: number;
  familyCreatedAt: number;
  consumed: boolean;
}

interface PersistedDb {
  staff: MockStaff[];
  nextStaffId: number;
  refreshTokens: [string, RefreshTokenRecord][];
}

const STORAGE_KEY = '__mock_staff_db__';

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

let mockStaff: MockStaff[] = persisted?.staff ?? SEED_STAFF.map((s) => ({ ...s }));
const nextStaffId = persisted?.nextStaffId ?? mockStaff.length + 1;
let refreshTokens = new Map<string, RefreshTokenRecord>(persisted?.refreshTokens ?? []);

function persist(): void {
  if (!hasSessionStorage()) return;
  const db: PersistedDb = { staff: mockStaff, nextStaffId, refreshTokens: Array.from(refreshTokens.entries()) };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function toPublicStaff(staff: MockStaff): Staff {
  return { id: staff.id, email: staff.email, name: staff.name, roles: staff.roles, isActive: staff.isActive };
}

export function permissionsFor(staff: Pick<MockStaff, 'roles'>): Permission[] {
  return resolvePermissions(staff.roles);
}

export function findStaffByEmail(email: string): MockStaff | undefined {
  return mockStaff.find((s) => s.email.toLowerCase() === email.toLowerCase());
}

export function findStaffById(id: number): MockStaff | undefined {
  return mockStaff.find((s) => s.id === id);
}

/** Resolves the Staff for a valid, non-expired `Authorization: Bearer <access>` header. */
export function findStaffByAccessToken(authorizationHeader: string | null): MockStaff | undefined {
  if (!authorizationHeader?.startsWith('Bearer ')) return undefined;
  const token = authorizationHeader.slice('Bearer '.length);
  const payload = decodeAccessToken(token);
  if (payload === null || payload.exp <= Date.now()) return undefined;
  return findStaffById(payload.sub);
}

function issueSessionTokens(staffId: number, familyId: string, familyCreatedAt: number): { access: string; refresh: string } {
  const now = Date.now();
  const refresh = crypto.randomUUID();
  refreshTokens.set(refresh, { staffId, familyId, issuedAt: now, familyCreatedAt, consumed: false });
  persist();
  return { access: encodeAccessToken({ sub: staffId, exp: now + STAFF_ACCESS_TOKEN_TTL_MS }), refresh };
}

export function createStaffSession(staffId: number): { access: string; refresh: string } {
  return issueSessionTokens(staffId, crypto.randomUUID(), Date.now());
}

function revokeFamily(familyId: string): void {
  for (const [token, record] of refreshTokens) {
    if (record.familyId === familyId) refreshTokens.delete(token);
  }
  persist();
}

/** Revokes every refresh token belonging to `staffId` — used by logout, and by Role reassignment (issue #23, Decision #79). */
export function revokeAllStaffSessions(staffId: number): void {
  for (const [token, record] of refreshTokens) {
    if (record.staffId === staffId) refreshTokens.delete(token);
  }
  persist();
}

export type RotateResult = { status: 'ok'; access: string; refresh: string } | { status: 'expired' } | { status: 'reuse' };

export function rotateStaffRefreshToken(token: string): RotateResult {
  const record = refreshTokens.get(token);
  if (record === undefined) return { status: 'expired' };

  if (record.consumed) {
    revokeFamily(record.familyId);
    return { status: 'reuse' };
  }

  const now = Date.now();
  if (now > record.familyCreatedAt + STAFF_REFRESH_ABSOLUTE_TTL_MS || now > record.issuedAt + STAFF_REFRESH_IDLE_TTL_MS) {
    revokeFamily(record.familyId);
    return { status: 'expired' };
  }

  record.consumed = true;
  const next = issueSessionTokens(record.staffId, record.familyId, record.familyCreatedAt);
  return { status: 'ok', ...next };
}

export function revokeByStaffRefreshToken(token: string): void {
  const record = refreshTokens.get(token);
  if (record !== undefined) revokeFamily(record.familyId);
}

/** Reassigns `staffId`'s Roles and revokes their current sessions (issue #23, Decision #79 — a Role
 * change must not let an already-issued token keep the old permission set until it happens to expire). */
export function setStaffRoles(staffId: number, roles: StaffRole[]): MockStaff | undefined {
  const staff = findStaffById(staffId);
  if (staff === undefined) return undefined;
  staff.roles = roles;
  persist();
  revokeAllStaffSessions(staffId);
  return staff;
}

/** Test-only — resets the mock "DB" back to its seed state between FE-INT tests. */
export function resetMockStaffDbForTesting(): void {
  mockStaff = SEED_STAFF.map((s) => ({ ...s }));
  refreshTokens = new Map();
  if (hasSessionStorage()) sessionStorage.removeItem(STORAGE_KEY);
}
