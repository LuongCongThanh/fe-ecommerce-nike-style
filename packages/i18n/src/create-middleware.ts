import createMiddleware from 'next-intl/middleware';

import { DEFAULT_LOCALE, LOCALES } from './locales';

export interface CreateIntlMiddlewareOptions {
  /** Cookie name used to persist the resolved locale — kept per-app so admin/cms/storefront don't share one. */
  cookieName: string;
}

/**
 * Locale-routing-only `next-intl` middleware — does not handle auth. Apps that need an
 * auth-guard middleware compose their own logic around this (see storefront's `middleware.ts`).
 */
export function createIntlMiddleware({ cookieName }: CreateIntlMiddlewareOptions): ReturnType<typeof createMiddleware> {
  return createMiddleware({
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localeCookie: { name: cookieName },
  });
}
