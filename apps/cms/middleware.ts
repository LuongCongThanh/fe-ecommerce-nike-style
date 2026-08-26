import { createIntlMiddleware } from '@repo/i18n/middleware';

// Locale-routing only — cms has no auth yet (RBAC is a separate slice, see (protected)/layout.tsx).
export const middleware = createIntlMiddleware({ cookieName: 'CMS_LOCALE' });

export const config = {
  matcher: [String.raw`/((?!api|_next|.*\..*).*)`],
};
