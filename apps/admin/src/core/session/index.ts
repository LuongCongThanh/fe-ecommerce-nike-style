'use client';

import { createStaffAuthModule } from '@repo/shared/staff-auth';

import { useRouter } from '@/i18n/navigation';
import { ADMIN_ACCESS_TOKEN_COOKIE } from '@/shared/constants/auth-cookies';

/**
 * Staff session/auth, deepened into one shared module (issue #24) — see
 * `@repo/shared/staff-auth`'s `createStaffAuthModule`. This file is the only place admin declares
 * "which cookie, which router" — everything else (store, login/logout/refresh, the guard, the
 * runtime provider) lives in the shared module and is proven once by its own tests.
 */
export const { useStaffAuth, StaffAuthGuard, StaffAuthRuntimeProvider, loginStaffAction, performStaffLogout, clearStaffAuth, setStaffSession } =
  createStaffAuthModule({
    accessTokenCookie: ADMIN_ACCESS_TOKEN_COOKIE,
    useRouter,
  });
