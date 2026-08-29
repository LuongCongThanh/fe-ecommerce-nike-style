import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { BASE_PATH } from './src/base-path.ts';

// Migration note (admin/cms → Vite + TanStack Router, see ADR to be written in Stage 4):
// mirrors admin-vite's setup — same alias, same env mapping for @repo/api-sdk's mock flag.
export default defineConfig({
  // Served under the storefront's proxy at /cms (apps/storefront/microfrontends.json) — every
  // route and static asset this app emits must be prefixed so the proxy can route it correctly.
  base: `${BASE_PATH}/`,
  server: { port: 3002 },
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
