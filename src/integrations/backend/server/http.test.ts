// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/integrations/backend/client/api-error';
import { serverGet } from '@/integrations/backend/server/http';

vi.mock('server-only', () => ({}));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('API_ORIGIN', 'http://backend.test');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
});

async function failure(): Promise<unknown> {
  return serverGet('/sizes').then(
    () => undefined,
    (error: unknown) => error,
  );
}

describe('serverGet error mapping', () => {
  it('rethrows Next.js internal errors instead of turning them into NETWORK_ERROR', async () => {
    const internal = Object.assign(new Error('NEXT_HTTP_ERROR_FALLBACK;404'), { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' });
    fetchMock.mockRejectedValue(internal);

    expect(await failure()).toBe(internal);
  });

  it('maps a plain network failure to NETWORK_ERROR', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    expect(await failure()).toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });

  it('maps an abort while waiting for headers to REQUEST_TIMEOUT', async () => {
    fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));

    expect(await failure()).toMatchObject({ status: 0, code: 'REQUEST_TIMEOUT' });
  });

  it('maps an abort while reading the body to REQUEST_TIMEOUT, not INVALID_RESPONSE', async () => {
    const stalled = { ok: true, status: 200, json: () => Promise.reject(new DOMException('timed out', 'TimeoutError')) } as unknown as Response;
    fetchMock.mockResolvedValue(stalled);

    const error = await failure();
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: 'REQUEST_TIMEOUT' });
  });

  it('keeps INVALID_RESPONSE for a body that is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }));

    expect(await failure()).toMatchObject({ status: 200, code: 'INVALID_RESPONSE' });
  });
});
