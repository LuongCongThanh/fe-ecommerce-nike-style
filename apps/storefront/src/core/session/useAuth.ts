'use client';

import { useRouter } from 'next/navigation';

import { useLocale } from 'next-intl';

import { performLogout, setAccessToken, setUser, useAuthStore } from '@/core/session/auth-store';
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
  const locale = useLocale();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  const isLoggedIn = token != null && token.length > 0;
  const isAdmin = isAdminRole(user?.role);

  function logout(): void {
    performLogout().catch(() => undefined);
    router.push(`/${locale}${ROUTES.AUTH.LOGIN}`);
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
