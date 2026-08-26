import { getStaffMe, loginStaff, logoutStaff, refreshStaffSession } from '@repo/api-sdk/endpoints/staff';

import { clearStaffAuth, setStaffAccessToken, setStaffRefreshToken, setStaffSession, useStaffAuthStore } from '@/core/session/staff-store';

export function getStaffAccessToken(): string | null {
  return useStaffAuthStore.getState().token;
}

export function getStaffRefreshToken(): string | null {
  return useStaffAuthStore.getState().refreshToken;
}

export async function loginStaffAction(payload: { email: string; password: string }): Promise<void> {
  const data = await loginStaff(payload);
  setStaffAccessToken(data.access);
  setStaffRefreshToken(data.refresh);
  setStaffSession({ staff: data.staff, permissions: data.permissions });
}

/** Rotates the refresh token and updates both in-memory tokens (same mock-phase, no-cookie transport as Customer auth — see `auth-fixtures.ts`). */
export async function refreshStaffAccessToken(): Promise<string> {
  const currentRefreshToken = getStaffRefreshToken();
  if (currentRefreshToken === null) {
    throw new Error('No refresh token available');
  }

  const data = await refreshStaffSession(currentRefreshToken);
  setStaffAccessToken(data.access);
  setStaffRefreshToken(data.refresh);
  return data.access;
}

/** Runs once at app mount — the refresh token only lives in memory at the mock phase, so it can't
 * survive a real F5 (see storefront's `bootstrapAuth` for the full rationale); an in-memory token
 * surviving (e.g. Fast Refresh dev) re-resolves the session via `/staff/me`. */
export async function bootstrapStaffAuth(): Promise<void> {
  if (getStaffRefreshToken() === null) {
    clearStaffAuth();
    return;
  }

  try {
    await refreshStaffAccessToken();
    const me = await getStaffMe();
    setStaffSession(me);
  } catch {
    clearStaffAuth();
  }
}

export async function performStaffLogout(): Promise<void> {
  const currentRefreshToken = getStaffRefreshToken();
  clearStaffAuth();
  if (currentRefreshToken !== null) {
    await logoutStaff(currentRefreshToken).catch(() => undefined);
  }
}
