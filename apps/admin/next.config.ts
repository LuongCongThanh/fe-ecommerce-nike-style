import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  // Served under the storefront's proxy at /admin (apps/storefront/microfrontends.json) — every
  // route and static asset this app emits must be prefixed so the proxy can route it correctly.
  basePath: '/admin',
  async redirects() {
    return [
      // Hitting this app's own dev port directly at its bare root (bypassing the proxy) 404s once
      // basePath is set — every real route lives under /admin/*. `basePath: false` makes this one rule
      // match the pre-basePath "/" instead, so opening the admin dev server on its own port still lands
      // somewhere real (StaffAuthGuard then sends an unauthenticated visitor on to /admin/login).
      { source: '/', destination: '/admin', basePath: false, permanent: false },
    ];
  },
  async headers() {
    return [
      // A Service Worker's scope can't exceed the directory its script is served from — served at
      // `/admin/mockServiceWorker.js`, its max scope defaults to `/admin/` (trailing slash), which
      // excludes this app's own bare root route `/admin`. This header is the browser-sanctioned way
      // to broaden that (see `packages/api-sdk/src/adapters/browser.ts`, which requests `/admin`).
      { source: '/mockServiceWorker.js', headers: [{ key: 'Service-Worker-Allowed', value: '/admin' }] },
    ];
  },
};

export default nextConfig;
