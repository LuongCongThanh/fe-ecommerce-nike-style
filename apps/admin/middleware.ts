import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createIntlMiddleware } from '@repo/i18n/middleware';

import { ADMIN_ACCESS_TOKEN_COOKIE } from '@/shared/constants/auth-cookies';

const intlMiddleware = createIntlMiddleware({ cookieName: 'ADMIN_LOCALE' });

const LOCALE_PREFIX_PATTERN = /^\/(vi|en)(\/.*)?$/;
const LOGIN_PATTERN = /^\/(vi|en)\/login(\/.*)?$/;

// Whole admin app requires a session except the login page itself.
function isProtectedPath(pathname: string): boolean {
  return LOCALE_PREFIX_PATTERN.test(pathname) && !LOGIN_PATTERN.test(pathname);
}

export function middleware(request: NextRequest): ReturnType<typeof intlMiddleware> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE);
  const isLoggedIn = token != null && token.value.length > 0;
  const locale = pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'vi';

  if (isProtectedPath(pathname) && !isLoggedIn) {
    const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(`/${locale}/login?returnUrl=${returnUrl}`, request.url));
  }

  if (LOGIN_PATTERN.test(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [String.raw`/((?!api|_next|.*\..*).*)`],
};
