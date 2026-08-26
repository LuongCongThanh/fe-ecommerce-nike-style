import { describe, expect, it } from 'vitest';

import { resolvePermissions, ROLE_PERMISSIONS } from '../staff';

describe('resolvePermissions', () => {
  it('returns exactly one Role’s permission set for a single Role', () => {
    expect(resolvePermissions(['CMS_EDITOR']).sort()).toEqual([...ROLE_PERMISSIONS.CMS_EDITOR].sort());
  });

  it('unions permissions across multiple assigned Roles, deduped (issue #23 — many-to-many Staff↔Role)', () => {
    const result = resolvePermissions(['ADMIN_STAFF', 'CMS_EDITOR']);

    expect(result).toEqual(expect.arrayContaining(['catalog:read', 'content:publish']));
    expect(new Set(result).size).toBe(result.length);
  });

  it('SUPER_ADMIN is listed with every permission — not a bypass-all code path (issue #23)', () => {
    const allOtherPermissions = new Set([...ROLE_PERMISSIONS.ADMIN_STAFF, ...ROLE_PERMISSIONS.CMS_EDITOR, 'staff:assign-role']);

    for (const permission of allOtherPermissions) {
      expect(ROLE_PERMISSIONS.SUPER_ADMIN).toContain(permission);
    }
  });

  it('returns [] for no Roles', () => {
    expect(resolvePermissions([])).toEqual([]);
  });
});
