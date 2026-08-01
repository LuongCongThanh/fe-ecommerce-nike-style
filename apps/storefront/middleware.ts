import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { USER_ROLE_COOKIE } from '@/shared/constants/auth-cookies';

const intlMiddleware = createMiddleware({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
});

const PROTECTED_PATTERNS = [/^\/(vi|en)\/admin/, /^\/(vi|en)\/checkout/, /^\/(vi|en)\/orders/, /^\/(vi|en)\/profile/];

const ADMIN_PATTERN = /^\/(vi|en)\/admin/;

const AUTH_ONLY_PATTERNS = [/^\/(vi|en)\/login$/, /^\/(vi|en)\/register$/];

export function middleware(request: NextRequest): ReturnType<typeof intlMiddleware> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token');
  const isLoggedIn = token != null && token.value.length > 0;

  const locale = pathname.startsWith('/en/') ? 'en' : 'vi';

  if (PROTECTED_PATTERNS.some((p) => p.test(pathname))) {
    if (!isLoggedIn) {
      const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/${locale}/login?returnUrl=${returnUrl}`, request.url));
    }

    // Optimistic UX check — KHÔNG phải authorization thật. Cookie chỉ là hint để tránh
    // user thường thấy flash UI admin trước khi Django trả 403. Authorization thật (role,
    // permission, ownership) phải được Django API enforce lại — middleware không decode/
    // verify access token, chỉ đọc cookie nên có thể bị giả mạo phía nào cũng phải recheck.
    if (ADMIN_PATTERN.test(pathname)) {
      const isAdmin = request.cookies.get(USER_ROLE_COOKIE)?.value === 'true';
      if (!isAdmin) {
        return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
      }
    }
  }

  if (AUTH_ONLY_PATTERNS.some((p) => p.test(pathname))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [String.raw`/((?!api|_next|.*\..*).*)`],
};
