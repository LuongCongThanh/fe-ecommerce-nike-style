import { logout, refreshSession } from '@repo/api-sdk/endpoints/auth';
import { getProfile } from '@repo/api-sdk/endpoints/profile';
import { create } from 'zustand';

import { ensureApiMockingReady } from '@/shared/lib/api-mocking';
import type { User } from '@/shared/types/user';

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous';

export interface AuthSnapshot {
  token: string | null;
  user: User | null;
  status: AuthStatus;
}

interface AuthState extends AuthSnapshot {
  refreshToken: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  status: 'initializing',
  setAccessToken: (token) => {
    set({ token });
  },
  setRefreshToken: (refreshToken) => {
    set({ refreshToken });
  },
  setUser: (user) => {
    set({ user, status: 'authenticated' });
  },
  clearAuth: () => {
    set({ token: null, refreshToken: null, user: null, status: 'anonymous' });
  },
}));

export function subscribeAuth(listener: () => void): () => void {
  return useAuthStore.subscribe(listener);
}

export function getAuthSnapshot(): AuthSnapshot {
  const { token, user, status } = useAuthStore.getState();
  return { token, user, status };
}

export function getAccessToken(): string | null {
  return useAuthStore.getState().token;
}

export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}

export function setAccessToken(token: string | null): void {
  useAuthStore.getState().setAccessToken(token);
}

export function setRefreshToken(token: string | null): void {
  useAuthStore.getState().setRefreshToken(token);
}

export function setUser(user: User): void {
  useAuthStore.getState().setUser(user);
}

export function clearAuth(): void {
  useAuthStore.getState().clearAuth();
}

/**
 * Rotates the refresh token (ADR-0010) and updates both in-memory tokens. Throws when there is no
 * refresh token to rotate — callers (the `AuthRuntimeAdapter`, `bootstrapAuth`) treat that as "not
 * logged in", not a network failure.
 */
export async function refreshAccessToken(): Promise<string> {
  const currentRefreshToken = getRefreshToken();
  if (currentRefreshToken === null) {
    throw new Error('No refresh token available');
  }

  await ensureApiMockingReady();
  const data = await refreshSession(currentRefreshToken);
  setAccessToken(data.access);
  setRefreshToken(data.refresh);
  return data.access;
}

/**
 * Chạy 1 lần lúc app mount (AuthRuntimeProvider). Vì refresh token chỉ sống trong memory ở giai đoạn
 * mock (không cookie — xem decision-log.md Decision #90: MSW browser Service Worker không forward
 * được Cookie theo cả 2 hướng), session KHÔNG thể phục hồi sau F5 thật — nếu memory đã trống (luôn
 * đúng ngay sau F5), coi như anonymous ngay, không gọi network. Refresh token còn sống trong memory
 * (ví dụ Fast Refresh dev, hoặc gọi lại trong cùng lần mount) mới thực sự thử refresh+lấy profile.
 */
export async function bootstrapAuth(): Promise<void> {
  if (getRefreshToken() === null) {
    clearAuth();
    return;
  }

  try {
    await refreshAccessToken();
    const user = await getProfile();
    setUser(user);
  } catch {
    clearAuth();
  }
}

/**
 * Clears client-side session state immediately, then revokes the refresh-token family server-side
 * (best-effort — logout succeeds client-side either way; ADR-0010 requires the revoke, not that the
 * user wait on it).
 */
export async function performLogout(): Promise<void> {
  const currentRefreshToken = getRefreshToken();
  clearAuth();
  if (currentRefreshToken !== null) {
    await ensureApiMockingReady();
    await logout(currentRefreshToken).catch(() => undefined);
  }
}
