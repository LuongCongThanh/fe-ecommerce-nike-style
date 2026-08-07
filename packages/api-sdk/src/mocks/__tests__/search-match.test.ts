import { describe, expect, it } from 'vitest';

import { matchesSearchQuery, normalizeSearchText } from '../search-match';

describe('normalizeSearchText', () => {
  it('strips Vietnamese diacritics and lowercases', () => {
    expect(normalizeSearchText('Giày chạy bộ')).toBe('giay chay bo');
  });

  it('maps đ/Đ to d, which NFD decomposition does not handle on its own', () => {
    expect(normalizeSearchText('Đệm êm')).toBe('dem em');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeSearchText('  Áo  ')).toBe('ao');
  });
});

describe('matchesSearchQuery', () => {
  it('matches an empty query against anything', () => {
    expect(matchesSearchQuery('Running Shoe Alpha', '')).toBe(true);
  });

  it('matches a plain case-insensitive substring', () => {
    expect(matchesSearchQuery('Running Shoe Alpha', 'running shoe')).toBe(true);
  });

  it('matches when the query is missing Vietnamese diacritics ("thiếu dấu")', () => {
    expect(matchesSearchQuery('Giày chạy bộ nhẹ, đệm êm.', 'giay chay bo')).toBe(true);
  });

  it('matches a slight misspelling via per-token fuzzy tolerance ("sai chính tả nhẹ")', () => {
    expect(matchesSearchQuery('Giày chạy bộ nhẹ, đệm êm.', 'giay chay boo')).toBe(true);
  });

  it('does not match an unrelated query', () => {
    expect(matchesSearchQuery('Running Shoe Alpha', 'backpack commuter')).toBe(false);
  });

  it('does not match when the misspelling is too large to be "slight"', () => {
    expect(matchesSearchQuery('Running Shoe Alpha', 'xyzzy')).toBe(false);
  });
});
