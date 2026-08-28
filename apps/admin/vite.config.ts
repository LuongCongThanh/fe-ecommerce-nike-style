import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Migration note (admin/cms → Vite + TanStack Router, see ADR to be written in Stage 4):
// mirrors the Next.js app's `@/*` alias so ported feature code needs minimal import rewrites.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    // Served under the storefront's proxy at /admin (apps/storefront/microfrontends.json) — every
    // route and static asset this app emits must be prefixed so the proxy can route it correctly.
    // Matches the old Next.js app's `basePath: '/admin'`; see main.tsx's router `basepath` and
    // __root.tsx's `enableApiMockingBrowser('/admin')` for the other two places this has to agree.
    base: '/admin/',
    server: { port: 3001 },
    plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      // @repo/api-sdk's env/config.ts reads `process.env.NEXT_PUBLIC_*` directly (shared across the
      // Next.js apps too) — statically replacing it here at build time keeps that package
      // framework-agnostic instead of forking it for Vite.
      'process.env.NEXT_PUBLIC_API_MOCKING': JSON.stringify(env.VITE_API_MOCKING ?? ''),
      'process.env.NEXT_PUBLIC_SITE_URL': JSON.stringify(env.VITE_SITE_URL ?? ''),
    },
  };
});
