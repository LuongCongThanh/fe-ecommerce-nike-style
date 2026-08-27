'use client';

import type { Permission, Staff } from '@repo/schemas/staff';
import { useEffect } from 'react';

import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';

import { createStaffAuthActions } from './actions';
import { clearStaffAuth, createStaffAuthStore, setStaffSession } from './store';

export type { StaffAuthSnapshot, StaffAuthStatus, StaffAuthStore } from './store';

export interface CreateStaffAuthModuleOptions {
  /** Cookie name that holds the staff access token — different per app (issue #24). */
  accessTokenCookie: string;
  /** The app's own typed `useRouter` (e.g. from `@/i18n/navigation`) — `StaffAuthGuard` can't import
   * an app-local routing module, so the router is injected instead. */
  useRouter: () => { push: (href: string) => void };
}

/**
 * Deepened staff session/auth module (issue #24) — one interface, instantiated once per app
 * (apps/admin, apps/cms) with that app's cookie name and typed router. Replaces what used to be five
 * byte-for-byte-identical files per app (`staff-store.ts`, `staff-auth.ts`, `StaffAuthGuard.tsx`,
 * `StaffAuthRuntimeProvider.tsx`, `useStaffAuth.ts`). Edge-safe request gating lives separately in
 * `./config` — see `createStaffAuthMiddleware`.
 */
export function createStaffAuthModule({ accessTokenCookie, useRouter }: CreateStaffAuthModuleOptions) {
  const store = createStaffAuthStore();
  const actions = createStaffAuthActions({ accessTokenCookie, store });

  function useStaffAuth() {
    const staff = store((s) => s.staff);
    const permissions = store((s) => s.permissions);
    const status = store((s) => s.status);
    const hasPermissionFn = store((s) => s.hasPermission);

    return {
      staff,
      permissions,
      isLoggedIn: staff !== null,
      isInitializing: status === 'initializing',
      hasPermission: (permission: Permission) => hasPermissionFn(permission),
      login: actions.loginStaffAction,
      logout: actions.performStaffLogout,
    };
  }

  /**
   * Client-side guard for `app/(protected)/*` — UX layer only, mirrors storefront's `AuthGuard`.
   * Real authorization must still be enforced by the backend on every protected request (issue #18's
   * acceptance criteria: "không tự quyết định quyền, không giả định đây là authorization thật").
   */
  function StaffAuthGuard({ children }: { readonly children: React.ReactNode }): React.JSX.Element | null {
    const router = useRouter();
    const { isLoggedIn, isInitializing } = useStaffAuth();

    useEffect(() => {
      if (isInitializing) return;
      if (!isLoggedIn) {
        router.push('/login');
      }
    }, [isInitializing, isLoggedIn, router]);

    if (isInitializing || !isLoggedIn) return null;
    return <>{children}</>;
  }

  function StaffAuthRuntimeProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
    useEffect(() => {
      const unregister = registerAuthRuntimeAdapter({
        getAccessToken: actions.getStaffAccessToken,
        refreshSession: actions.refreshStaffAccessToken,
        onAuthFailure: () => {
          clearStaffAuth(store);
        },
      });

      // Adapter must register first — bootstrapStaffAuth() calls refreshStaffAccessToken() through the
      // http client, and the client's interceptor reads this adapter to attach the access token.
      actions.bootstrapStaffAuth().catch(() => undefined);

      return unregister;
    }, []);

    return <>{children}</>;
  }

  return {
    useStaffAuth,
    StaffAuthGuard,
    StaffAuthRuntimeProvider,
    loginStaffAction: actions.loginStaffAction,
    performStaffLogout: actions.performStaffLogout,
    /** Test-only session setup, mirroring the old `staff-store.ts` exports that `AppShell.test.tsx` relied on. */
    clearStaffAuth: () => {
      clearStaffAuth(store);
    },
    setStaffSession: (data: { staff: Staff; permissions: Permission[] }) => {
      setStaffSession(store, data);
    },
  };
}

export type StaffAuthModule = ReturnType<typeof createStaffAuthModule>;
