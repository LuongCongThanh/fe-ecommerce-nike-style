import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/app/__tests__/setup.ts'],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
