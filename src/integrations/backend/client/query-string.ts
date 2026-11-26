export type QueryParamValue = string | number | boolean | null | undefined | readonly string[];

/**
 * Pure URL + params joiner shared by the browser transport and the server public reader. Arrays repeat
 * the key (`?size=M&size=L`), the form the API's list filters expect; `undefined`/`null` are skipped.
 */
export function withQueryString(url: string, params?: Record<string, QueryParamValue>): string {
  if (params === undefined) return url;

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value as readonly string[]) searchParams.append(key, item);
      continue;
    }
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();

  if (query === '') return url;

  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}
