import { useEffect } from 'react';

import { createAuthClient } from 'better-auth/react';

import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { resolvePermissions } from '@repo/schemas/staff';
import type { Permission, Staff, StaffRole } from '@repo/schemas/staff';

export interface CreateBetterAuthModuleOptions {
  /** Better Auth server URL (e.g. `https://api.example.com`) — the backend this points at must run
   * `better-auth`'s own server handler + a DB adapter; this package only ever talks to it as a
   * client, same as any other `@repo/api-sdk` endpoint. */
  baseURL: string;
  /** The app's own typed navigate function — same injection pattern as `../staff-auth`/`../clerk-auth`
   * (can't import an app-local routing module from here). */
  useRouter: () => { push: (href: string) => void };
}

/**
 * Better Auth-backed replacement for `../staff-auth` (decision: swap Clerk for a self-hosted auth
 * library — no external SaaS account needed for local dev, unlike Clerk). Same public shape
 * (`useStaffAuth`/`StaffAuthGuard`/`StaffAuthRuntimeProvider`) as both prior modules, so
 * `apps/admin/src/core/session.ts` and every consumer (AppShell, UserMenu, NavCommandMenu,
 * routes/login.tsx) keep working unchanged.
 *
 * Known gaps, called out rather than hidden:
 * - `Staff.id` is `number` (schema) but Better Auth user IDs are strings — `hashStaffId` below is a
 *   stable-but-lossy numeric hash, same caveat the Clerk module had.
 * - Roles/permissions come from a `roles` field on the Better Auth user record — that field does
 *   NOT exist by default; the backend must add it via Better Auth's `user.additionalFields` config.
 *   Until that's wired up, every signed-in user has zero permissions.
 * - Session lives in an httpOnly cookie Better Auth's server sets — `api-sdk`'s fetcher already
 *   sends `credentials: 'include'` on every request, so no bearer token is needed here
 *   (`getAccessToken` returns `null` on purpose, unlike the Clerk module's cached JWT).
 * - The backend must independently run a Better Auth server instance with a DB adapter — that's
 *   outside this repo's frontend and is not done by this module.
 */
export function createBetterAuthModule({ baseURL, useRouter }: CreateBetterAuthModuleOptions) {
  const authClient = createAuthClient({ baseURL });

  function staffFromUser(user: { id: string; email: string; name: string; roles?: unknown } | null | undefined): Staff | null {
    if (user === null || user === undefined) return null;

    const roles = Array.isArray(user.roles) ? (user.roles as StaffRole[]) : [];

    return { id: hashStaffId(user.id), email: user.email, name: user.name, roles, isActive: true };
  }

  function useStaffAuth() {
    const { data, isPending, refetch } = authClient.useSession();
    const staff = staffFromUser(data?.user);
    const permissions: Permission[] = resolvePermissions(staff?.roles ?? []);

    return {
      staff,
      permissions,
      isLoggedIn: staff !== null,
      isInitializing: isPending,
      hasPermission: (permission: Permission) => permissions.includes(permission),
      login: async ({ email, password }: { email: string; password: string }): Promise<void> => {
        const { data, error } = await authClient.signIn.email({ email, password });
        if (error) {
          throw new Error(error.message ?? 'Sign-in failed');
        }

        // Belt-and-suspenders for mock/dev environments: a real Better Auth server's `Set-Cookie`
        // arrives over a genuine HTTP response and the browser applies it with no help needed. When
        // requests are intercepted by MSW's Service Worker, `Set-Cookie` from a handler-built
        // `Response` is not reliably applied to the real cookie jar (an MSW/browser limitation, not
        // a Better Auth one) — so `getSession()`/`refetch()` right after sign-in can still see no
        // session. Writing the cookie here directly is a harmless no-op against a real backend (an
        // httpOnly cookie of the same name silently rejects this write) and fixes it under MSW.
        if (typeof data.token === 'string' && data.token !== '') {
          document.cookie = `better-auth.session_token=${data.token}; Path=/`;
        }

        // `useSession()` is a shared store across every subscriber (including `StaffAuthGuard` on
        // whatever page navigates next) — without this explicit refetch, the caller's `navigate()`
        // right after `login()` resolves can land on the guard before the store re-reads the new
        // session, bouncing straight back to `/login`.
        await refetch();
      },
      logout: async (): Promise<void> => {
        await authClient.signOut();
        document.cookie = 'better-auth.session_token=; Path=/; Max-Age=0';
        await refetch();
      },
    };
  }

  function StaffAuthGuard({ children }: { readonly children: React.ReactNode }): React.JSX.Element | null {
    const router = useRouter();
    const { data, isPending } = authClient.useSession();

    useEffect(() => {
      if (isPending) return;
      if (data === null) {
        router.push('/login');
      }
    }, [isPending, data, router]);

    if (isPending || data === null) return null;
    return <>{children}</>;
  }

  /** No bearer token to cache here (see doc comment above) — this only exists so a 401 triggers the
   * same `onAuthFailure` cleanup hook the fetcher already calls for every auth backend. */
  function StaffAuthRuntimeProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
    useEffect(
      () =>
        registerAuthRuntimeAdapter({
          getAccessToken: () => null,
          refreshSession: async () => {
            const { data } = await authClient.getSession();
            if (data === null) {
              throw new Error('No active Better Auth session');
            }
            return '';
          },
          onAuthFailure: () => undefined,
        }),
      [],
    );

    return <>{children}</>;
  }

  return { useStaffAuth, StaffAuthGuard, StaffAuthRuntimeProvider };
}

/** Not a real identifier — `Staff.id` is typed `number` (schema shared with the old staff-auth
 * backend), Better Auth's is a string. Stable per user id, nothing more (same caveat as the Clerk
 * module this replaces had). */
function hashStaffId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (Math.imul(hash, 31) + userId.charCodeAt(i)) | 0;
  }
  return hash;
}

export type BetterAuthModule = ReturnType<typeof createBetterAuthModule>;
