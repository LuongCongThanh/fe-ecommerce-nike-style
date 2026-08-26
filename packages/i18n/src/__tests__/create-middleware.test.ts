// @vitest-environment node
import { NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

let receivedOptions: unknown;

vi.mock('next-intl/middleware', () => ({
  default: (options: unknown) => {
    receivedOptions = options;
    return () => NextResponse.next();
  },
}));

const { createIntlMiddleware } = await import('../create-middleware');

describe('createIntlMiddleware', () => {
  it('configures next-intl with the given cookie name and the shared locale list', () => {
    createIntlMiddleware({ cookieName: 'ADMIN_LOCALE' });

    expect(receivedOptions).toEqual({
      locales: ['vi', 'en'],
      defaultLocale: 'vi',
      localeCookie: { name: 'ADMIN_LOCALE' },
    });
  });
});
