'use client';

import { createStaffAuthModule } from '@repo/shared/staff-auth';

import { useRouter } from '@/i18n/navigation';
import { CMS_ACCESS_TOKEN_COOKIE } from '@/shared/constants/auth-cookies';

/**
 * Staff session/auth, deepened into one shared module (issue #24) — see
 * `@repo/shared/staff-auth`'s `createStaffAuthModule`. This file is the only place cms declares
 * "which cookie, which router" — everything else (store, login/logout/refresh, the guard, the
 * runtime provider) lives in the shared module and is proven once by its own tests.
 *
 * A single file, not a `core/session/index.ts` barrel directory (code review on PR #73) — same
 * `@/core/session` import path for every consumer, without reading as a re-export barrel.
 */
export const { useStaffAuth, StaffAuthGuard, StaffAuthRuntimeProvider, loginStaffAction, performStaffLogout, clearStaffAuth, setStaffSession } =
  createStaffAuthModule({
    accessTokenCookie: CMS_ACCESS_TOKEN_COOKIE,
    useRouter,
  });
