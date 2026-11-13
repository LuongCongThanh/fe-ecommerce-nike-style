// Inlined from the former packages/eslint-config (base + next + react-rules).
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import nextVitals from 'eslint-config-next/core-web-vitals';

/**
 * @param {{ tsconfigRootDir?: string }} [options] `tsconfigRootDir` must be the consuming
 * package's own directory (e.g. `import.meta.dirname`) — without it, type-aware rules would
 * resolve tsconfig.json relative to this package instead of the caller's.
 */
function createBaseConfig(options = {}) {
  const { tsconfigRootDir = import.meta.dirname } = options;

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
      files: ['**/*.{test,spec}.{js,jsx,ts,tsx}', 'src/testing/**'],
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
}

const strictReactRules = {
  'react/button-has-type': 'error',
  'react/iframe-missing-sandbox': 'error',
  'react/jsx-boolean-value': ['error', 'never'],
  'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  'react/no-array-index-key': 'error',
  'react/no-danger-with-children': 'error',
  'react/no-unstable-nested-components': 'error',
  'react/self-closing-comp': 'error',
  'react-hooks/exhaustive-deps': 'error',
};

/** `nextVitals` already registers react/react-hooks/jsx-a11y — only layer Next overrides on top. */
export default function createNextConfig(options) {
  return tseslint.config(...createBaseConfig(options), ...nextVitals, {
    rules: {
      ...strictReactRules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  });
}
