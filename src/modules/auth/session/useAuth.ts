'use client';

import { useRouter } from 'next/navigation';

import { useLocale } from 'next-intl';

import type { User } from '@/integrations/backend/models/user.types';
import { isAdminRole } from '@/modules/auth/session/roles';
import { performLogout, setAccessToken, setUser, useAuthStore } from '@/modules/auth/stores/auth.store';
import { ROUTES } from '@/shared/routing/routes';

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
