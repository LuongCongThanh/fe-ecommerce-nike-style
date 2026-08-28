import { getStaffMe, loginStaff, logoutStaff, refreshStaffSession } from '@repo/api-sdk/endpoints/staff';
import Cookies from 'js-cookie';

import { clearStaffAuth, setStaffAccessToken, setStaffRefreshToken, setStaffSession, type StaffAuthStore } from './store';

export interface CreateStaffAuthActionsOptions {
  /** Cookie name that holds the staff access token — different per app (issue #24). */
  accessTokenCookie: string;
  store: StaffAuthStore;
}

export interface StaffAuthActions {
  getStaffAccessToken: () => string | null;
  getStaffRefreshToken: () => string | null;
  loginStaffAction: (payload: { email: string; password: string }) => Promise<void>;
  refreshStaffAccessToken: () => Promise<string>;
  bootstrapStaffAuth: () => Promise<void>;
  performStaffLogout: () => Promise<void>;
}

/**
 * Staff login/logout/refresh/bootstrap wired to one cookie + one store — shared by apps/admin and
 * apps/cms (issue #24): same Staff identity (`@repo/api-sdk/endpoints/staff`), separate cookie/session
 * slot per app, passed in via `accessTokenCookie`.
 */
export function createStaffAuthActions({ accessTokenCookie, store }: CreateStaffAuthActionsOptions): StaffAuthActions {
  function getStaffAccessToken(): string | null {
    return store.getState().token;
  }

  function getStaffRefreshToken(): string | null {
    return store.getState().refreshToken;
  }

  async function loginStaffAction(payload: { email: string; password: string }): Promise<void> {
    const data = await loginStaff(payload);
    setStaffAccessToken(store, data.access);
    setStaffRefreshToken(store, data.refresh);
    setStaffSession(store, { staff: data.staff, permissions: data.permissions });
    // Access token also lives in a cookie so a server/edge-side auth guard (no access to the
    // in-memory store) can gate protected routes — same mock-phase, cookie-mirrors-memory pattern
    // as storefront. The Vite apps don't have such a guard yet; the cookie is still set for parity.
    Cookies.set(accessTokenCookie, data.access);
  }

  /** Rotates the refresh token and updates both in-memory tokens (same mock-phase, no-cookie transport as Customer auth — see `auth-fixtures.ts`). */
  async function refreshStaffAccessToken(): Promise<string> {
    const currentRefreshToken = getStaffRefreshToken();
    if (currentRefreshToken === null) {
      throw new Error('No refresh token available');
    }

    const data = await refreshStaffSession(currentRefreshToken);
    setStaffAccessToken(store, data.access);
    setStaffRefreshToken(store, data.refresh);
    return data.access;
  }

  /** Runs once at app mount — the refresh token only lives in memory at the mock phase, so it can't
   * survive a real F5 (see storefront's `bootstrapAuth` for the full rationale); an in-memory token
   * surviving (e.g. Fast Refresh dev) re-resolves the session via `/staff/me`. */
  async function bootstrapStaffAuth(): Promise<void> {
    if (getStaffRefreshToken() === null) {
      clearStaffAuth(store);
      return;
    }

    try {
      await refreshStaffAccessToken();
      const me = await getStaffMe();
      setStaffSession(store, me);
    } catch {
      clearStaffAuth(store);
    }
  }

  async function performStaffLogout(): Promise<void> {
    const currentRefreshToken = getStaffRefreshToken();
    clearStaffAuth(store);
    Cookies.remove(accessTokenCookie);
    if (currentRefreshToken !== null) {
      await logoutStaff(currentRefreshToken).catch(() => undefined);
    }
  }

  return {
    getStaffAccessToken,
    getStaffRefreshToken,
    loginStaffAction,
    refreshStaffAccessToken,
    bootstrapStaffAuth,
    performStaffLogout,
  };
}
