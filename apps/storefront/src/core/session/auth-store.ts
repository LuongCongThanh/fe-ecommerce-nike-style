import { create } from 'zustand';

import { callAuthRoute } from '@/core/session/auth-route-client';
import { API } from '@/shared/constants/api-endpoints';
import { http } from '@/shared/lib/http/client';
import type { User } from '@/shared/types/user';

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous';

export interface AuthSnapshot {
  token: string | null;
  user: User | null;
  status: AuthStatus;
}

interface AuthState extends AuthSnapshot {
  setAccessToken: (token: string | null) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  status: 'initializing',
  setAccessToken: (token) => {
    set({ token });
  },
  setUser: (user) => {
    set({ user, status: 'authenticated' });
  },
  clearAuth: () => {
    set({ token: null, user: null, status: 'anonymous' });
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

export function setAccessToken(token: string | null): void {
  useAuthStore.getState().setAccessToken(token);
}

export function setUser(user: User): void {
  useAuthStore.getState().setUser(user);
}

export function clearAuth(): void {
  useAuthStore.getState().clearAuth();
}

export async function refreshAccessToken(): Promise<string> {
  const data = await callAuthRoute<{ access: string }>(API.AUTH.REFRESH);

  setAccessToken(data.access);
  return data.access;
}

// Chạy 1 lần lúc app mount (AuthRuntimeProvider) để phục hồi session sau F5 —
// refresh token httpOnly cookie vẫn còn nhưng access token trong memory đã mất.
export async function bootstrapAuth(): Promise<void> {
  try {
    await refreshAccessToken();
    const user = await http.get<User>(API.PROFILE.ME);
    setUser(user);
  } catch {
    clearAuth();
  }
}
