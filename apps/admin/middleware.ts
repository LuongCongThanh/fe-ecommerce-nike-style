import { createIntlMiddleware } from '@repo/i18n/middleware';
import { createStaffAuthMiddleware } from '@repo/shared/staff-auth/config';

import { ADMIN_ACCESS_TOKEN_COOKIE } from '@/shared/constants/auth-cookies';

const intlMiddleware = createIntlMiddleware({ cookieName: 'ADMIN_LOCALE' });

export const middleware = createStaffAuthMiddleware({
  accessTokenCookie: ADMIN_ACCESS_TOKEN_COOKIE,
  intlMiddleware,
});

export const config = {
  matcher: [String.raw`/((?!api|_next|.*\..*).*)`],
};
