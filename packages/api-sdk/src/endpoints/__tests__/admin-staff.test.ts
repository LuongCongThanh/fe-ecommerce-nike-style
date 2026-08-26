import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetAuthRuntime } from '../../client/fetcher';
import { registerAuthRuntimeAdapter } from '../../client/runtime';
import { resetMockStaffDbForTesting } from '../../mocks/staff-fixtures';
import { server } from '../../testing/msw-server';
import { assignAdminStaffRoles, createAdminStaff, deleteAdminStaff, getAdminStaffList, updateAdminStaff } from '../admin-staff';
import { loginStaff, refreshStaffSession } from '../staff';

async function loginAsSuperAdmin() {
  const { access } = await loginStaff({ email: 'super@admin.local', password: 'Password123' });
  registerAuthRuntimeAdapter({
    getAccessToken: () => access,
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
  return access;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  resetMockStaffDbForTesting();
});
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

describe('getAdminStaffList', () => {
  it('resolves every seeded Staff', async () => {
    await loginAsSuperAdmin();
    const result = await getAdminStaffList();

    expect(result.data.some((s) => s.email === 'staff@admin.local')).toBe(true);
  });

  it('rejects with 401 when there is no Staff session', async () => {
    await expect(getAdminStaffList()).rejects.toMatchObject({ status: 401 });
  });
});

describe('createAdminStaff', () => {
  it('creates a Staff with one or more Roles assigned', async () => {
    await loginAsSuperAdmin();
    const created = await createAdminStaff({ email: 'new.staff@admin.local', password: 'Password123', name: 'New Staff', roles: ['ADMIN_STAFF'] });

    expect(created.roles).toEqual(['ADMIN_STAFF']);

    const listed = await getAdminStaffList();
    expect(listed.data.some((s) => s.id === created.id)).toBe(true);
  });

  it('allows assigning multiple Roles at once (many-to-many)', async () => {
    await loginAsSuperAdmin();
    const created = await createAdminStaff({
      email: 'multi.role@admin.local',
      password: 'Password123',
      name: 'Multi Role',
      roles: ['ADMIN_STAFF', 'CMS_EDITOR'],
    });

    expect(created.roles).toEqual(['ADMIN_STAFF', 'CMS_EDITOR']);
  });

  it('refuses a duplicate email, with a 409', async () => {
    await loginAsSuperAdmin();
    await expect(
      createAdminStaff({ email: 'staff@admin.local', password: 'Password123', name: 'Duplicate', roles: ['ADMIN_STAFF'] }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('updateAdminStaff', () => {
  it('updates a Staff’s name/isActive without touching Roles', async () => {
    await loginAsSuperAdmin();
    const updated = await updateAdminStaff(2, { name: 'Admin Staff Updated', isActive: false });

    expect(updated.name).toBe('Admin Staff Updated');
    expect(updated.isActive).toBe(false);
    expect(updated.roles).toEqual(['ADMIN_STAFF']);
  });

  it('rejects an unknown Staff id with 404', async () => {
    await loginAsSuperAdmin();
    await expect(updateAdminStaff(999_999, { name: 'Nobody', isActive: true })).rejects.toMatchObject({ status: 404 });
  });
});

describe('deleteAdminStaff', () => {
  it('removes a Staff account', async () => {
    await loginAsSuperAdmin();
    const created = await createAdminStaff({ email: 'to.delete@admin.local', password: 'Password123', name: 'To Delete', roles: ['ADMIN_STAFF'] });

    await deleteAdminStaff(created.id);

    const listed = await getAdminStaffList();
    expect(listed.data.some((s) => s.id === created.id)).toBe(false);
  });

  it('rejects an unknown Staff id with 404', async () => {
    await loginAsSuperAdmin();
    await expect(deleteAdminStaff(999_999)).rejects.toMatchObject({ status: 404 });
  });
});

describe('assignAdminStaffRoles', () => {
  it('reassigns a Staff’s Roles to a new set — effective permissions become the union of those Roles', async () => {
    await loginAsSuperAdmin();
    const updated = await assignAdminStaffRoles(2, { roles: ['ADMIN_STAFF', 'CMS_EDITOR'] });

    expect(updated.roles).toEqual(['ADMIN_STAFF', 'CMS_EDITOR']);
  });

  it('revokes the Staff’s existing refresh session on a Role change (Decision #79) — their old refresh token can no longer rotate', async () => {
    // Log in as the target Staff (id 2) first to capture *their* refresh token.
    const { refresh: targetRefresh } = await loginStaff({ email: 'staff@admin.local', password: 'Password123' });

    await loginAsSuperAdmin();
    await assignAdminStaffRoles(2, { roles: ['CMS_EDITOR'] });

    await expect(refreshStaffSession(targetRefresh)).rejects.toMatchObject({ status: 401 });
  });

  it('rejects an unknown Staff id with 404', async () => {
    await loginAsSuperAdmin();
    await expect(assignAdminStaffRoles(999_999, { roles: ['ADMIN_STAFF'] })).rejects.toMatchObject({ status: 404 });
  });
});
