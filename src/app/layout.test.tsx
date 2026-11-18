import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocaleLayout from '@/app/[locale]/layout';
import RootLayout from '@/app/layout';

const { getLocale, setRequestLocale } = vi.hoisted(() => ({
  getLocale: vi.fn(),
  setRequestLocale: vi.fn(),
}));

vi.mock('next/font/google', () => ({ Be_Vietnam_Pro: () => ({ variable: 'test-font' }) }));
vi.mock('next-intl/server', () => ({ getLocale, setRequestLocale }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
}));
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { readonly children: ReactNode }) => <section data-locale-context>{children}</section>,
}));
vi.mock('@/app/_composition/AppProviders', () => ({
  Providers: ({ children }: { readonly children: ReactNode }) => <section data-app-providers>{children}</section>,
}));
vi.mock('@/styles/globals.css', () => ({}));

beforeEach(() => {
  getLocale.mockResolvedValue('vi');
});

describe('App layout provider ownership', () => {
  it('keeps app providers for routes outside the locale segment', async () => {
    const html = renderToStaticMarkup(await RootLayout({ children: <p>Offline</p> }));
    expect(html.match(/data-app-providers/g)).toHaveLength(1);
    expect(html).toContain('Offline');
  });

  it.each(['vi', 'en'])('mounts one app provider around the %s locale context', async (locale) => {
    getLocale.mockResolvedValue(locale);
    const localized = await LocaleLayout({ children: <p>Storefront</p>, params: Promise.resolve({ locale }) });
    const html = renderToStaticMarkup(await RootLayout({ children: localized }));
    expect(html.match(/data-app-providers/g)).toHaveLength(1);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain('data-locale-context');
    expect(html).toContain('Storefront');
    expect(setRequestLocale).toHaveBeenCalledWith(locale);
  });

  it('rejects an unsupported locale before rendering its content', async () => {
    await expect(LocaleLayout({ children: <p>Invalid</p>, params: Promise.resolve({ locale: 'fr' }) })).rejects.toThrow('NOT_FOUND');
  });
});
