import 'server-only';

import { ApiError } from '@/integrations/backend/client/api-error';
import { type QueryParamValue, withQueryString } from '@/integrations/backend/client/query-string';

/** Abort timeout for each public SSR request; the server reader never retries (runtime.md). */
export const SERVER_REQUEST_TIMEOUT_MS = 5_000;

const DEFAULT_API_ORIGIN = 'http://localhost:8080';

/**
 * Backend origin for server-side public reads. Server-only setting (`API_ORIGIN`, the same one
 * `next.config.ts` proxies `/api/v1` to); it never reaches the browser bundle.
 */
export function serverApiOrigin(): string {
  const origin = process.env.API_ORIGIN;
  return (origin === undefined || origin === '' ? DEFAULT_API_ORIGIN : origin).replace(/\/+$/, '');
}

/**
 * Anonymous, uncached GET against the Backend's public `/api/v1`. No cookie, Authorization header,
 * auth adapter or refresh: a user's session can never reach a public SSR request. Failures become
 * `ApiError` with the same semantics as the browser transport (`status` 0 for network/timeout).
 */
export async function serverGet<TResponse>(path: string, params?: Record<string, QueryParamValue>): Promise<TResponse> {
  const url = withQueryString(`${serverApiOrigin()}/api/v1${path}`, params);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
      signal: AbortSignal.timeout(SERVER_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    throw new ApiError(0, isTimeout ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR', isTimeout ? 'Request timed out' : 'Network request failed');
  }

  if (!response.ok) throw await ApiError.fromResponse(response);

  try {
    return (await response.json()) as TResponse;
  } catch {
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'Response body is not valid JSON');
  }
}
