import { afterEach, describe, expect, it, vi } from 'vitest';

describe('enableApiMockingBrowser', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock('../../testing/msw-browser');
  });

  it('registers the worker with a scope covering the app basePath root, not just its subpaths', async () => {
    // The service worker's default scope is the *directory* of its script URL — for
    // "/admin/mockServiceWorker.js" that's "/admin/" (trailing slash), which excludes the app's own
    // bare root route "/admin" (no trailing slash) by strict prefix matching. That silently breaks API
    // mocking (and, downstream, staff auth) for anyone landing directly on "/admin" or "/cms".
    vi.stubEnv('NEXT_PUBLIC_API_MOCKING', 'true');
    const start = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../../testing/msw-browser', () => ({ worker: { start } }));

    const { enableApiMockingBrowser } = await import('../browser');
    await enableApiMockingBrowser('/admin');

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceWorker: expect.objectContaining({
          url: '/admin/mockServiceWorker.js',
          options: expect.objectContaining({ scope: '/admin' }),
        }),
      }),
    );
  });

  it('scopes to the site root when the app has no basePath', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MOCKING', 'true');
    const start = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../../testing/msw-browser', () => ({ worker: { start } }));

    const { enableApiMockingBrowser } = await import('../browser');
    await enableApiMockingBrowser();

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceWorker: expect.objectContaining({
          url: '/mockServiceWorker.js',
          options: expect.objectContaining({ scope: '/' }),
        }),
      }),
    );
  });

  it('does nothing when mocking is disabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MOCKING', 'false');

    const { enableApiMockingBrowser } = await import('../browser');

    await expect(enableApiMockingBrowser('/admin')).resolves.toBeUndefined();
  });
});
