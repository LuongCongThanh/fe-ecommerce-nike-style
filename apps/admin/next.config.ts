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
};

export default nextConfig;
