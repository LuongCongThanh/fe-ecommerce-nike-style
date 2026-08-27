import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface CreateStaffAuthMiddlewareOptions<TIntlMiddleware extends (request: NextRequest) => unknown> {
  /** Cookie name that holds the staff access token — different per app (issue #24). */
  accessTokenCookie: string;
  /** Locale-routing middleware to delegate to once the auth gate passes (see `@repo/i18n/middleware`). */
  intlMiddleware: TIntlMiddleware;
}

const LOCALE_PREFIX_PATTERN = /^\/(vi|en)(\/.*)?$/;
const LOGIN_PATTERN = /^\/(vi|en)\/login(\/.*)?$/;

// Whole app requires a session except the login page itself.
function isProtectedPath(pathname: string): boolean {
  return LOCALE_PREFIX_PATTERN.test(pathname) && !LOGIN_PATTERN.test(pathname);
}

/**
 * Builds a staff-auth-gated `middleware(request)` — cookie-based session check + redirect, then
 * delegates to `intlMiddleware`. Edge-safe: no React, no zustand — apps/admin and apps/cms import this
 * from `@repo/shared/staff-auth/config` (kept separate from `@repo/shared/staff-auth`'s client module so
 * middleware's edge bundle never pulls in the store/hooks). Shared by apps/admin and apps/cms (issue
 * #24): same gate, different cookie per app.
 */
export function createStaffAuthMiddleware<TIntlMiddleware extends (request: NextRequest) => unknown>({
  accessTokenCookie,
  intlMiddleware,
}: CreateStaffAuthMiddlewareOptions<TIntlMiddleware>): (request: NextRequest) => NextResponse | ReturnType<TIntlMiddleware> {
  return (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(accessTokenCookie);
    const isLoggedIn = token != null && token.value.length > 0;
    const locale = pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'vi';

    if (isProtectedPath(pathname) && !isLoggedIn) {
      const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/${locale}/login?returnUrl=${returnUrl}`, request.url));
    }

    if (LOGIN_PATTERN.test(pathname) && isLoggedIn) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    return intlMiddleware(request) as ReturnType<TIntlMiddleware>;
  };
}
