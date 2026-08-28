import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Migration note (admin/cms → Vite + TanStack Router, see ADR to be written in Stage 4):
// mirrors admin-vite's setup — same alias, same env mapping for @repo/api-sdk's mock flag.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    // Served under the storefront's proxy at /cms (apps/storefront/microfrontends.json) — every
    // route and static asset this app emits must be prefixed so the proxy can route it correctly.
    // Matches the old Next.js app's `basePath: '/cms'`; see main.tsx's router `basepath` and
    // __root.tsx's `enableApiMockingBrowser('/cms')` for the other two places this has to agree.
    base: '/cms/',
    server: { port: 3002 },
    plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      'process.env.NEXT_PUBLIC_API_MOCKING': JSON.stringify(env.VITE_API_MOCKING ?? ''),
      'process.env.NEXT_PUBLIC_SITE_URL': JSON.stringify(env.VITE_SITE_URL ?? ''),
    },
  };
});
