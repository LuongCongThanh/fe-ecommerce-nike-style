import { createIntlMiddleware } from '@repo/i18n/middleware';
import { createStaffAuthMiddleware } from '@repo/shared/staff-auth/config';

import { CMS_ACCESS_TOKEN_COOKIE } from '@/shared/constants/auth-cookies';

// Same staff-auth gate as apps/admin (issue #24) — see @repo/shared/staff-auth/config, own cookie.
const intlMiddleware = createIntlMiddleware({ cookieName: 'CMS_LOCALE' });

export const middleware = createStaffAuthMiddleware({
  accessTokenCookie: CMS_ACCESS_TOKEN_COOKIE,
  intlMiddleware,
});

export const config = {
  matcher: [String.raw`/((?!api|_next|.*\..*).*)`],
};
