import { unstable_rethrow } from 'next/navigation';

import 'server-only';

import { ApiError } from '@/integrations/backend/client/api-error';
import { type QueryParamValue, withQueryString } from '@/integrations/backend/client/query-string';
import { readServerApiOrigin } from '@/integrations/backend/env/config';

/** Abort timeout for each public SSR request; the server reader never retries (runtime.md). */
export const SERVER_REQUEST_TIMEOUT_MS = 5_000;

/** Backend origin for server-side public reads, from the validated backend env module. */
export function serverApiOrigin(): string {
  return readServerApiOrigin();
}

function isAbortOrTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
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
    // Next.js control-flow errors (dynamic-usage bailout, redirect, notFound) must reach the framework.
    unstable_rethrow(error);
    const isTimeout = isAbortOrTimeout(error);
    throw new ApiError(0, isTimeout ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR', isTimeout ? 'Request timed out' : 'Network request failed');
  }

  if (!response.ok) throw await ApiError.fromResponse(response);

  try {
    return (await response.json()) as TResponse;
  } catch (error) {
    unstable_rethrow(error);
    // The timeout signal stays armed while the body streams; a stall there is a timeout, not bad JSON.
    if (isAbortOrTimeout(error)) throw new ApiError(0, 'REQUEST_TIMEOUT', 'Request timed out');
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'Response body is not valid JSON');
  }
}
