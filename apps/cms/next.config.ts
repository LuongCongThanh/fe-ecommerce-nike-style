import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  // Served under the storefront's proxy at /cms (apps/storefront/microfrontends.json) — every
  // route and static asset this app emits must be prefixed so the proxy can route it correctly.
  basePath: '/cms',
};

export default nextConfig;
