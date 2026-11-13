import withBundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheOnNavigation: false,
  reloadOnOnline: true,
});

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// The browser calls the API same-origin through this proxy, so be-demo needs no CORS entry for the
// storefront and its cookies stay first-party. Server-only setting; see .env.example.
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:8080';

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['msw', '@mswjs/interceptors'],
  // Playwright's default baseURL is 127.0.0.1 (see playwright.config.ts) — without this, Next.js
  // blocks dev-only asset/HMR requests from that origin and no client component ever hydrates.
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${API_ORIGIN}/api/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default withNextIntl(withSerwist(withAnalyzer(nextConfig)));
