import Cookies from 'js-cookie';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createStaffAuthStore } from '../store';

const ACCESS_TOKEN_COOKIE = 'test_access_token';

vi.mock('@repo/api-sdk/endpoints/staff', () => ({
  loginStaff: vi.fn(async () => ({
    access: 'access-token',
    refresh: 'refresh-token',
    staff: { id: 1, email: 'a@b.com', name: 'A', roles: [], isActive: true },
    permissions: [],
  })),
  logoutStaff: vi.fn(async () => undefined),
}));

const { createStaffAuthActions } = await import('../actions');

describe('staff-auth actions cookie side effects', () => {
  afterEach(() => {
    Cookies.remove(ACCESS_TOKEN_COOKIE);
  });

  it('persists the access token to a cookie on login, mirroring the middleware auth-guard pattern', async () => {
    const { loginStaffAction } = createStaffAuthActions({ accessTokenCookie: ACCESS_TOKEN_COOKIE, store: createStaffAuthStore() });

    await loginStaffAction({ email: 'a@b.com', password: 'pw' });

    expect(Cookies.get(ACCESS_TOKEN_COOKIE)).toBe('access-token');
  });

  it('clears the cookie on logout', async () => {
    const { loginStaffAction, performStaffLogout } = createStaffAuthActions({
      accessTokenCookie: ACCESS_TOKEN_COOKIE,
      store: createStaffAuthStore(),
    });

    await loginStaffAction({ email: 'a@b.com', password: 'pw' });
    await performStaffLogout();

    expect(Cookies.get(ACCESS_TOKEN_COOKIE)).toBeUndefined();
  });
});
