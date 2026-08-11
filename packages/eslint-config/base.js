const tseslint = require('typescript-eslint');
const importX = require('eslint-plugin-import-x');

/**
 * @param {{ tsconfigRootDir?: string }} [options] `tsconfigRootDir` must be the consuming
 * package's own directory (e.g. `import.meta.dirname`) — without it, type-aware rules would
 * resolve tsconfig.json relative to this package instead of the caller's.
 */
module.exports = function createBaseConfig(options = {}) {
  const { tsconfigRootDir = __dirname } = options;

  return tseslint.config(
    {
      ignores: ['dist/**', '.next/**', 'coverage/**', 'test-results/**'],
    },
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          project: true,
          tsconfigRootDir,
        },
      },
      plugins: { 'import-x': importX },
      rules: {
        'import-x/no-cycle': ['error', { ignoreExternal: true, maxDepth: 3 }],
        'import-x/no-duplicates': 'error',
        'import-x/no-relative-parent-imports': 'error',
        'import-x/order': 'error',
        'no-alert': 'error',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
      },
    },
    {
      files: ['**/*.{ts,tsx,mts,cts}'],
      rules: {
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
      },
    },
    {
      // Tests remain linted, but do not require TypeScript program analysis.
      ...tseslint.configs.disableTypeChecked,
      files: ['**/*.{test,spec}.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
      rules: {
        ...tseslint.configs.disableTypeChecked.rules,
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
    {
      // Tooling files intentionally live outside each package's tsconfig.json.
      // Lint them without rules that require TypeScript project information.
      ...tseslint.configs.disableTypeChecked,
      files: [
        '**/*.{js,jsx,mjs,cjs}',
        '**/*.config.{ts,tsx,mts,cts}',
        'eslint.config.*',
        'playwright.config.*',
        'postcss.config.*',
        'tailwind.config.*',
        'vitest.config.*',
      ],
      rules: {
        ...tseslint.configs.disableTypeChecked.rules,
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
  );
};
