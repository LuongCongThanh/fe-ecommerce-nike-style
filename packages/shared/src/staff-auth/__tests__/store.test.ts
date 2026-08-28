import type { Permission, Staff } from '@repo/schemas/staff';
import { describe, expect, it } from 'vitest';

import { clearStaffAuth, createStaffAuthStore, getStaffAuthSnapshot, setStaffAccessToken, setStaffSession } from '../store';

const STAFF: Staff = { id: 1, email: 'super@admin.local', name: 'Super Admin', roles: ['SUPER_ADMIN'], isActive: true };
const PERMISSIONS: Permission[] = ['staff:read', 'staff:assign-role'];

describe('staff-auth store', () => {
  it('starts anonymous with no staff/token/permission', () => {
    const store = createStaffAuthStore();
    clearStaffAuth(store);
    const snapshot = getStaffAuthSnapshot(store);

    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.staff).toBeNull();
    expect(snapshot.token).toBeNull();
    expect(snapshot.permissions).toEqual([]);
  });

  it('setStaffSession marks the store authenticated with the staff + resolved permissions', () => {
    const store = createStaffAuthStore();
    setStaffSession(store, { staff: STAFF, permissions: [...PERMISSIONS] });

    const snapshot = getStaffAuthSnapshot(store);
    expect(snapshot.status).toBe('authenticated');
    expect(snapshot.staff).toEqual(STAFF);
    expect(snapshot.permissions).toEqual(PERMISSIONS);
  });

  it('clearStaffAuth resets everything back to anonymous', () => {
    const store = createStaffAuthStore();
    setStaffSession(store, { staff: STAFF, permissions: [...PERMISSIONS] });
    clearStaffAuth(store);

    const snapshot = getStaffAuthSnapshot(store);
    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.staff).toBeNull();
    expect(snapshot.permissions).toEqual([]);
  });

  it('setStaffAccessToken updates only the token, independent of staff/permissions', () => {
    const store = createStaffAuthStore();
    setStaffSession(store, { staff: STAFF, permissions: [...PERMISSIONS] });
    setStaffAccessToken(store, 'new-access-token');

    const snapshot = getStaffAuthSnapshot(store);
    expect(snapshot.token).toBe('new-access-token');
    expect(snapshot.staff).toEqual(STAFF);
  });

  it('hasPermission reflects the current resolved permission set', () => {
    const store = createStaffAuthStore();
    expect(store.getState().hasPermission('staff:read')).toBe(false);

    setStaffSession(store, { staff: STAFF, permissions: [...PERMISSIONS] });
    expect(store.getState().hasPermission('staff:read')).toBe(true);
    expect(store.getState().hasPermission('content:publish')).toBe(false);
  });

  it('two instances stay isolated from each other (one per app)', () => {
    const adminStore = createStaffAuthStore();
    const cmsStore = createStaffAuthStore();

    setStaffSession(adminStore, { staff: STAFF, permissions: [...PERMISSIONS] });

    expect(getStaffAuthSnapshot(adminStore).status).toBe('authenticated');
    expect(getStaffAuthSnapshot(cmsStore).status).toBe('initializing');
  });
});
