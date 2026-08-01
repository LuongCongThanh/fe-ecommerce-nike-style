'use client';

import { useRouter } from 'next/navigation';

import { setAccessToken, setUser, useAuthStore } from '@/core/session/auth-store';
import { isAdminRole } from '@/core/session/roles';
import { ROUTES } from '@/shared/constants/routes';
import type { User } from '@/shared/types/user';

export function login(token: string, userData: User): void {
  setAccessToken(token);
  setUser(userData);
}

export function useIsLoggedIn(): boolean {
  const token = useAuthStore((s) => s.token);
  return token != null && token.length > 0;
}

export function useAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const isLoggedIn = token != null && token.length > 0;
  const isAdmin = isAdminRole(user?.role);

  function logout(): void {
    clearAuth();
    router.push(ROUTES.AUTH.LOGIN);
  }

  return {
    user,
    accessToken: token,
    isLoggedIn,
    isAdmin,
    authStatus: status,
    isInitializing: status === 'initializing',
    login,
    logout,
  };
}
