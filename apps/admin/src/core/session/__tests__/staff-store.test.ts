import type { Permission, Staff } from '@repo/schemas/staff';
import { describe, expect, it } from 'vitest';

import { clearStaffAuth, getStaffAuthSnapshot, setStaffAccessToken, setStaffSession, useStaffAuthStore } from '../staff-store';

const STAFF: Staff = { id: 1, email: 'super@admin.local', name: 'Super Admin', roles: ['SUPER_ADMIN'], isActive: true };
const PERMISSIONS: Permission[] = ['staff:read', 'staff:assign-role'];

describe('staff-store', () => {
  it('starts anonymous with no staff/token/permission', () => {
    clearStaffAuth();
    const snapshot = getStaffAuthSnapshot();

    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.staff).toBeNull();
    expect(snapshot.token).toBeNull();
    expect(snapshot.permissions).toEqual([]);
  });

  it('setStaffSession marks the store authenticated with the staff + resolved permissions', () => {
    setStaffSession({ staff: STAFF, permissions: [...PERMISSIONS] });

    const snapshot = getStaffAuthSnapshot();
    expect(snapshot.status).toBe('authenticated');
    expect(snapshot.staff).toEqual(STAFF);
    expect(snapshot.permissions).toEqual(PERMISSIONS);
  });

  it('clearStaffAuth resets everything back to anonymous', () => {
    setStaffSession({ staff: STAFF, permissions: [...PERMISSIONS] });
    clearStaffAuth();

    const snapshot = getStaffAuthSnapshot();
    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.staff).toBeNull();
    expect(snapshot.permissions).toEqual([]);
  });

  it('setStaffAccessToken updates only the token, independent of staff/permissions', () => {
    setStaffSession({ staff: STAFF, permissions: [...PERMISSIONS] });
    setStaffAccessToken('new-access-token');

    const snapshot = getStaffAuthSnapshot();
    expect(snapshot.token).toBe('new-access-token');
    expect(snapshot.staff).toEqual(STAFF);
  });

  it('hasPermission reflects the current resolved permission set', () => {
    clearStaffAuth();
    expect(useStaffAuthStore.getState().hasPermission('staff:read')).toBe(false);

    setStaffSession({ staff: STAFF, permissions: [...PERMISSIONS] });
    expect(useStaffAuthStore.getState().hasPermission('staff:read')).toBe(true);
    expect(useStaffAuthStore.getState().hasPermission('content:publish')).toBe(false);
  });
});
