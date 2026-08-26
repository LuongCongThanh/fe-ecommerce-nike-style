import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, isLocale, LOCALES } from '../locales';

describe('isLocale', () => {
  it('accepts every configured locale', () => {
    for (const locale of LOCALES) {
      expect(isLocale(locale)).toBe(true);
    }
  });

  it('rejects a locale that is not configured', () => {
    expect(isLocale('fr')).toBe(false);
  });
});

describe('DEFAULT_LOCALE', () => {
  it('is one of the configured locales', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });
});
