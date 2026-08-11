/**
 * Mock-only stand-in for Decision #75 (PostgreSQL FTS + `unaccent` + `pg_trgm`) — issue #11 acceptance
 * criteria requires the storefront search *mock* to still find a product when the customer types
 * without Vietnamese diacritics or with a slight typo, even though the real FTS/unaccent/pg_trgm
 * implementation is explicitly Backend scope (BE-INT-008, test-traceability-matrix.md). This is plain
 * JS string comparison, not a relevance-ranked search engine.
 */

/** Strips Vietnamese diacritics (NFD decomposition) and lowercases, so "Giày" / "giay" compare equal. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousRow = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const currentRow = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      // Loop bounds guarantee every index read here is in range — TS can't infer that across the loop.
      const deletion = (previousRow[j] ?? Number.POSITIVE_INFINITY) + 1;
      const insertion = (currentRow[j - 1] ?? Number.POSITIVE_INFINITY) + 1;
      const substitution = (previousRow[j - 1] ?? Number.POSITIVE_INFINITY) + cost;
      currentRow.push(Math.min(deletion, insertion, substitution));
    }
    previousRow = currentRow;
  }

  return previousRow[b.length] ?? b.length;
}

/** A query token tolerates roughly one typo per ~4 letters — mimics `pg_trgm`'s tolerance for slight misspelling without a real trigram index. */
function tokenMatches(queryToken: string, textToken: string): boolean {
  if (textToken.includes(queryToken)) return true;
  const maxDistance = queryToken.length <= 4 ? 1 : 2;
  return levenshteinDistance(queryToken, textToken) <= maxDistance;
}

/**
 * True if `query` plausibly matches `haystack` — accent-insensitive substring match first (covers
 * "thiếu dấu"), falling back to per-token fuzzy matching (covers "sai chính tả nhẹ"). Empty query
 * matches everything (caller is expected to skip filtering on an empty search term instead).
 */
export function matchesSearchQuery(haystack: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery === '') return true;

  const normalizedHaystack = normalizeSearchText(haystack);
  if (normalizedHaystack.includes(normalizedQuery)) return true;

  const haystackTokens = normalizedHaystack.split(/\s+/).filter(Boolean);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return queryTokens.every((queryToken) => haystackTokens.some((haystackToken) => tokenMatches(queryToken, haystackToken)));
}
