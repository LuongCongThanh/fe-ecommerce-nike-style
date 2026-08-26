import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ApiError } from '../../client/api-error';
import { resetAuthRuntime } from '../../client/fetcher';
import { registerAuthRuntimeAdapter } from '../../client/runtime';
import { server } from '../../testing/msw-server';
import { getStaffMe, loginStaff, logoutStaff, refreshStaffSession } from '../staff';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

describe('loginStaff', () => {
  it('resolves a session with the SUPER_ADMIN’s full permission set for the seeded super admin', async () => {
    const result = await loginStaff({ email: 'super@admin.local', password: 'Password123' });

    expect(result.staff.email).toBe('super@admin.local');
    expect(result.staff.roles).toEqual(['SUPER_ADMIN']);
    expect(result.permissions).toEqual(expect.arrayContaining(['staff:assign-role', 'content:publish', 'order:approve-return']));
    expect(result.access).toBeTruthy();
    expect(result.refresh).toBeTruthy();
  });

  it('resolves ADMIN_STAFF with catalog/order/inventory permissions but no staff:* or content:*', async () => {
    const result = await loginStaff({ email: 'staff@admin.local', password: 'Password123' });

    expect(result.permissions).toEqual(expect.arrayContaining(['catalog:read', 'order:approve-return', 'inventory:update']));
    expect(result.permissions).not.toEqual(expect.arrayContaining(['staff:read', 'content:read']));
  });

  it('resolves CMS_EDITOR with only content:* permissions', async () => {
    const result = await loginStaff({ email: 'editor@cms.local', password: 'Password123' });

    expect(result.permissions).toEqual(expect.arrayContaining(['content:read', 'content:publish']));
    expect(result.permissions).not.toEqual(expect.arrayContaining(['catalog:read', 'order:read', 'staff:read']));
  });

  it('rejects a wrong password with a 401 ApiError', async () => {
    await expect(loginStaff({ email: 'super@admin.local', password: 'wrong' })).rejects.toThrow(ApiError);
    await expect(loginStaff({ email: 'super@admin.local', password: 'wrong' })).rejects.toMatchObject({ status: 401 });
  });

  it('rejects an unknown email with the same 401 (no account-enumeration signal)', async () => {
    await expect(loginStaff({ email: 'nobody@admin.local', password: 'Password123' })).rejects.toMatchObject({ status: 401 });
  });
});

describe('getStaffMe', () => {
  it('resolves the signed-in staff’s profile + permissions from the access token', async () => {
    const session = await loginStaff({ email: 'staff@admin.local', password: 'Password123' });
    registerAuthRuntimeAdapter({
      getAccessToken: () => session.access,
      refreshSession: () => Promise.reject(new Error('not used in this test')),
    });

    const me = await getStaffMe();

    expect(me.staff.email).toBe('staff@admin.local');
    expect(me.permissions).toEqual(session.permissions);
  });

  it('rejects with 401 when there is no session', async () => {
    await expect(getStaffMe()).rejects.toMatchObject({ status: 401 });
  });
});

describe('refreshStaffSession / logoutStaff', () => {
  it('rotates into a new access+refresh pair', async () => {
    const session = await loginStaff({ email: 'super@admin.local', password: 'Password123' });

    const rotated = await refreshStaffSession(session.refresh);

    expect(rotated.access).toBeTruthy();
    expect(rotated.refresh).toBeTruthy();
    expect(rotated.refresh).not.toBe(session.refresh);
  });

  it('invalidates the refresh token on logout', async () => {
    const session = await loginStaff({ email: 'super@admin.local', password: 'Password123' });
    await logoutStaff(session.refresh);

    await expect(refreshStaffSession(session.refresh)).rejects.toMatchObject({ status: 401 });
  });
});
