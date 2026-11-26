import { describe, expect, it } from 'vitest';

import { makeQueryClient } from '@/providers/query-client';
import { ApiError } from '@/integrations/backend/client/api-error';

function retryPolicy() {
  const retry = makeQueryClient().getDefaultOptions().queries?.retry;
  if (typeof retry !== 'function') throw new Error('retry policy must be a function');
  return retry;
}

describe('makeQueryClient', () => {
  it('keeps the cache policy: 60s stale time, no refetch on window focus, no mutation retry', () => {
    const options = makeQueryClient().getDefaultOptions();

    expect(options.queries?.staleTime).toBe(60_000);
    expect(options.queries?.refetchOnWindowFocus).toBe(false);
    expect(options.mutations?.retry).toBe(false);
  });

  it('does not set a default mutation onError, so only useApiMutation toasts', () => {
    expect(makeQueryClient().getDefaultOptions().mutations?.onError).toBeUndefined();
  });

  it('returns an independent client per call', () => {
    expect(makeQueryClient()).not.toBe(makeQueryClient());
  });

  it('never retries 4xx API errors', () => {
    const retry = retryPolicy();

    expect(retry(0, new ApiError(404, 'NOT_FOUND', 'bad'))).toBe(false);
    expect(retry(0, new ApiError(400, 'BAD', 'bad'))).toBe(false);
  });

  it('retries 5xx API errors and unknown errors at most twice', () => {
    const retry = retryPolicy();

    expect(retry(0, new ApiError(500, 'SERVER', 'boom'))).toBe(true);
    expect(retry(1, new Error('network'))).toBe(true);
    expect(retry(2, new Error('network'))).toBe(false);
  });
});
