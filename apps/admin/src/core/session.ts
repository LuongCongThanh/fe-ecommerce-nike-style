import { createStaffAuthModule } from '@repo/shared/staff-auth';
import { useNavigate } from '@tanstack/react-router';

import { ADMIN_ACCESS_TOKEN_COOKIE } from '@/shared/constants/auth-cookies';

/**
 * Staff session/auth, deepened into one shared module (issue #24) — see
 * `@repo/shared/staff-auth`'s `createStaffAuthModule`. This file is the only place admin declares
 * "which cookie, which router" — everything else (store, login/logout/refresh, the guard, the
 * runtime provider) lives in the shared module and is proven once by its own tests.
 *
 * A single file, not a `core/session/index.ts` barrel directory (matches the upstream PR #74/#73
 * convention this replaces) — same `@/core/session` import path for every consumer.
 *
 * `useRouter` here wraps TanStack Router's `useNavigate()` in the `{ push }` shape the shared
 * module expects (it can't import an app-local routing module, only Next.js's `@/i18n/navigation`
 * or TanStack's `useNavigate` — either way it's injected, not imported directly).
 */
export const { useStaffAuth, StaffAuthGuard, StaffAuthRuntimeProvider, loginStaffAction, performStaffLogout, clearStaffAuth, setStaffSession } =
  createStaffAuthModule({
    accessTokenCookie: ADMIN_ACCESS_TOKEN_COOKIE,
    useRouter: () => {
      const navigate = useNavigate();
      return { push: (href: string) => void navigate({ to: href }) };
    },
  });
