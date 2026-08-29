/**
 * Case-insensitive "does any of these fields contain the query" filter shared by every list page's
 * search box. Each page used to inline the same `search.trim().toLowerCase()` + `||`-chained
 * `.includes()` block over its own fields; only the field selectors actually differed.
 *
 * An empty (or whitespace-only) query returns the list unchanged rather than filtering everything out.
 */
export function filterBySearch<T>(items: readonly T[], query: string, selectors: readonly ((item: T) => string)[]): T[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return [...items];

  return items.filter((item) => selectors.some((select) => select(item).toLowerCase().includes(normalized)));
}
