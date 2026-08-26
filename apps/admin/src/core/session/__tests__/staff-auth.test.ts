import Cookies from 'js-cookie';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearStaffAuth } from '@/core/session/staff-store';
import { ADMIN_ACCESS_TOKEN_COOKIE } from '@/shared/constants/auth-cookies';

vi.mock('@repo/api-sdk/endpoints/staff', () => ({
  loginStaff: vi.fn(async () => ({
    access: 'access-token',
    refresh: 'refresh-token',
    staff: { id: 1, email: 'a@b.com', name: 'A', roles: [], isActive: true },
    permissions: [],
  })),
  logoutStaff: vi.fn(async () => undefined),
}));

const { loginStaffAction, performStaffLogout } = await import('../staff-auth');

describe('staff-auth cookie side effects', () => {
  afterEach(() => {
    Cookies.remove(ADMIN_ACCESS_TOKEN_COOKIE);
    clearStaffAuth();
  });

  it('persists the access token to a cookie on login, mirroring the middleware auth-guard pattern', async () => {
    await loginStaffAction({ email: 'a@b.com', password: 'pw' });

    expect(Cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)).toBe('access-token');
  });

  it('clears the cookie on logout', async () => {
    await loginStaffAction({ email: 'a@b.com', password: 'pw' });
    await performStaffLogout();

    expect(Cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)).toBeUndefined();
  });
});
