import { afterEach, describe, expect, it, vi } from 'vitest';

describe('enableApiMockingServer', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('boots the MSW node server and intercepts matching requests when mocking is enabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MOCKING', 'true');

    const { enableApiMockingServer } = await import('../server');
    const { server } = await import('../../testing/msw-server');

    await enableApiMockingServer();
    try {
      const response = await fetch('http://localhost:3000/api/catalog/products');
      expect(response.ok).toBe(true);
    } finally {
      server.close();
    }
  });

  it('does nothing when mocking is disabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MOCKING', 'false');

    const { enableApiMockingServer } = await import('../server');

    await expect(enableApiMockingServer()).resolves.toBeUndefined();
  });
});
