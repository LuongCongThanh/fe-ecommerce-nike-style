import { describe, expect, it } from 'vitest';

import { ApiError } from '@/integrations/backend/client/api-error';
import { QUERY_CLIENT_DEFAULTS } from '@/shared/queries/queryClientDefaults';

describe('QUERY_CLIENT_DEFAULTS', () => {
  const retry = QUERY_CLIENT_DEFAULTS.queries?.retry as (count: number, error: unknown) => boolean;

  it('keeps the browser freshness policy', () => {
    expect(QUERY_CLIENT_DEFAULTS.queries?.staleTime).toBe(60_000);
    expect(QUERY_CLIENT_DEFAULTS.queries?.refetchOnWindowFocus).toBe(false);
    expect(QUERY_CLIENT_DEFAULTS.mutations?.retry).toBe(false);
  });

  it('does not retry 4xx errors and retries others at most twice', () => {
    expect(retry(0, new ApiError(404, 'NOT_FOUND', 'x'))).toBe(false);
    expect(retry(0, new ApiError(500, 'SERVER', 'x'))).toBe(true);
    expect(retry(1, new Error('boom'))).toBe(true);
    expect(retry(2, new Error('boom'))).toBe(false);
  });
});
