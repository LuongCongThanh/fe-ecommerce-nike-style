import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
});

async function load() {
  return import('@/integrations/backend/env/config');
}

describe('readServerApiOrigin', () => {
  it('returns the configured origin without a trailing slash', async () => {
    vi.stubEnv('API_ORIGIN', 'http://backend.test:9000/');
    const { readServerApiOrigin } = await load();

    expect(readServerApiOrigin()).toBe('http://backend.test:9000');
  });

  it('falls back to the local Backend quietly outside production', async () => {
    vi.stubEnv('API_ORIGIN', '');
    vi.stubEnv('NODE_ENV', 'development');
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { readServerApiOrigin } = await load();

    expect(readServerApiOrigin()).toBe('http://localhost:8080');
    expect(error).not.toHaveBeenCalled();
  });

  it('logs loudly once when production has no origin', async () => {
    vi.stubEnv('API_ORIGIN', '');
    vi.stubEnv('NODE_ENV', 'production');
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { readServerApiOrigin } = await load();

    expect(readServerApiOrigin()).toBe('http://localhost:8080');
    readServerApiOrigin();
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[0])).toContain('API_ORIGIN');
  });
});
