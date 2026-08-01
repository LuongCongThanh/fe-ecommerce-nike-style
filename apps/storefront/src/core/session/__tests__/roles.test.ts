import { describe, expect, it } from 'vitest';

import { isAdminRole } from '@/core/session/roles';

describe('isAdminRole', () => {
  it('returns true for admin', () => {
    expect(isAdminRole('admin')).toBe(true);
  });

  it('returns true for staff', () => {
    expect(isAdminRole('staff')).toBe(true);
  });

  it('returns false for customer', () => {
    expect(isAdminRole('customer')).toBe(false);
  });

  it('returns false when role is undefined or null', () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });
});
