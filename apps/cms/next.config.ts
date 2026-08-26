import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  // Served under the storefront's proxy at /cms (apps/storefront/microfrontends.json) — every
  // route and static asset this app emits must be prefixed so the proxy can route it correctly.
  basePath: '/cms',
  async headers() {
    return [
      // A Service Worker's scope can't exceed the directory its script is served from — served at
      // `/cms/mockServiceWorker.js`, its max scope defaults to `/cms/` (trailing slash), which
      // excludes this app's own bare root route `/cms`. This header is the browser-sanctioned way to
      // broaden that (see `packages/api-sdk/src/adapters/browser.ts`, which requests `/cms`).
      { source: '/mockServiceWorker.js', headers: [{ key: 'Service-Worker-Allowed', value: '/cms' }] },
    ];
  },
};

export default nextConfig;
