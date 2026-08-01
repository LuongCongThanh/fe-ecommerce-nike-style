import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
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
        'src/shared/hooks/**/*.{ts,tsx}',
        'src/shared/stores/**/*.{ts,tsx}',
        'src/shared/components/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        // Intentionally excluded: needs integration/e2e test, not unit test
        'src/shared/lib/http/client.ts',
        'src/shared/lib/http/api-auth.ts',
        'src/shared/lib/http/api-client.ts',
        'src/shared/lib/http/methods.ts',
        'src/shared/lib/guards/**',
        'src/shared/lib/query-client.ts',
        'src/shared/lib/env.ts',
        'src/shared/lib/monitoring/**',
        'src/shared/lib/errors/error-codes.ts',
      ],
      thresholds: {
        lines: 99,
        functions: 99,
        branches: 99,
        statements: 99,
      },
    },
  },
});
