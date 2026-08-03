import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../api-error';
import { fetcher } from '../fetcher';

describe('fetcher', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends credentials: include and returns parsed JSON on success', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ hello: 'world' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetcher<{ hello: string }>('/api/ping');

    expect(result).toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledWith('/api/ping', expect.objectContaining({ credentials: 'include' }));
  });

  it('throws an ApiError when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Missing' } }), { status: 404 })),
    );

    await expect(fetcher('/api/missing')).rejects.toBeInstanceOf(ApiError);
  });
});
