import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.test.ts', '.claude/hooks/**/*.test.ts', 'e2e/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
    globals: true,
    css: true,
    testTimeout: 10_000,
    hookTimeout: 10_000,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage/unit',
      include: [
        'src/shared/lib/**/*.{ts,tsx}',
        'src/modules/catalog/mock-content.ts',
        'src/shared/hooks/**/*.{ts,tsx}',
        'src/shared/stores/**/*.{ts,tsx}',
        'src/shared/components/{ErrorState,LoadingSpinner,PageLoader,QueryState}.tsx',
        'src/shared/utils/**/*.{ts,tsx}',
        'src/shared/{feedback,formatting,pagination,persistence,queries,styles}/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        'src/shared/lib/guards/**',
        'src/shared/lib/env.ts',
        'src/shared/monitoring/**',
        'src/shared/lib/errors/error-codes.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
