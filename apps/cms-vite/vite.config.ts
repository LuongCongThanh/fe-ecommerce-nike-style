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
