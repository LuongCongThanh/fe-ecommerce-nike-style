import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';
import vitestPlugin from 'eslint-plugin-vitest';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwindcss from 'eslint-plugin-tailwindcss';
import unusedImports from 'eslint-plugin-unused-imports';
import boundaries from 'eslint-plugin-boundaries';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import sonarjs from 'eslint-plugin-sonarjs';
import path from 'node:path';

const tailwindEntryCss = path.join(import.meta.dirname, 'src/app/globals.css');
const disableTypeChecked = typescript.configs['flat/disable-type-checked'];

const eslintConfig = [
  ...nextVitals,
  js.configs.recommended,
  ...typescript.configs['flat/strict-type-checked'],
  ...typescript.configs['flat/stylistic-type-checked'],

  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.husky/**',
      'public/**',
      'src/**/*.d.ts',
      '.skills/**',
      '.claude/**',
      '.agent/**',
      '.agents/**',
    ],
  },

  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: disableTypeChecked.languageOptions,
    rules: disableTypeChecked.rules,
  },

  // Boundaries: cross-route-group isolation settings (global, applies to all files)
  // When adding a new route group (e.g. (admin)), no config changes needed — the pattern auto-detects it.
  {
    settings: {
      'boundaries/elements': [
        {
          type: 'app-feature',
          // capture[0] = locale segment, capture[1] = route group name e.g. (shop), (auth)
          pattern: 'src/app/*/(*)/_lib/**',
          capture: ['_locale', 'group'],
        },
        {
          type: 'shared',
          pattern: 'src/shared/**',
        },
        {
          type: 'core-session',
          pattern: 'src/core/session/**',
        },
      ],
      'boundaries/ignore': ['**/*.test.*', '**/*.spec.*', '**/*.d.ts', '.next/**'],
    },
  },

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'simple-import-sort': simpleImportSort,
      tailwindcss,
      'unused-imports': unusedImports,
      'no-relative-import-paths': noRelativeImportPaths,
      boundaries,
      sonarjs,
    },
    rules: {
      // `no-undef` không đáng tin trên TypeScript; compiler xử lý chính xác hơn.
      'no-undef': 'off',

      // Dùng plugin unused-imports làm nguồn sự thật duy nhất cho unused code.
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],

      // Giữ tính chặt nhưng tránh rule formatting gây nhiễu.
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
      '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: { boolean: false, string: false } }],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^react-dom$', '^react/', '^next$', '^next/'],
            [String.raw`^\u0000`],
            ['^node:'],
            [String.raw`^@?\w`],
            ['^@/'],
            [String.raw`^.+\.s?css$`],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      'tailwindcss/classnames-order': 'off',
      'tailwindcss/no-custom-classname': 'off', // false positives on data-[*]:* variants until eslint-plugin-tailwindcss v4 stable
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/enforces-shorthand': 'error',
      'tailwindcss/no-unnecessary-arbitrary-value': 'error',

      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/default': 'off',
      'import/no-absolute-path': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-relative-packages': 'error',
      'import/no-cycle': ['error', { ignoreExternal: true, maxDepth: 3 }],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared/**/*',
              from: './src/app/**/*',
              message: 'Shared code cannot import from app features.',
            },
            {
              target: './src/shared/constants/**/*',
              from: ['./src/shared/components/**/*', './src/shared/hooks/**/*', './src/shared/lib/**/*'],
              message: 'Shared constants must stay foundational and cannot depend on UI, hooks, or lib code.',
            },
            {
              target: './src/shared/types/**/*',
              from: ['./src/shared/components/**/*', './src/shared/hooks/**/*', './src/shared/lib/**/*'],
              message: 'Shared types must remain dependency-light and cannot import UI, hooks, or lib code.',
            },
            {
              target: './src/shared/hooks/**/*',
              from: './src/shared/components/**/*',
              message: 'Hooks must not depend on shared UI components.',
            },
            {
              target: './src/shared/lib/**/*',
              from: './src/shared/components/**/*',
              message: 'Shared lib code must not depend on shared UI components.',
            },
            {
              target: './src/shared/components/base/**/*',
              from: './src/shared/components/common/**/*',
              message: 'Base UI primitives cannot depend on higher-level shared components.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/router',
              message: 'App Router projects must use next/navigation instead of next/router.',
            },
            {
              name: 'next/head',
              message: 'Prefer the Metadata API in the App Router instead of next/head.',
            },
          ],
        },
      ],

      'no-relative-import-paths/no-relative-import-paths': ['error', { allowSameFolder: false, rootDir: 'src', prefix: '@' }],

      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/prefer-read-only-props': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['coerce', 'ternary'] }],
      'react/no-array-index-key': 'error',
      'react/iframe-missing-sandbox': 'error',
      'react/no-unescaped-entities': 'off',
      'react/no-unstable-nested-components': 'error',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      // Group A — Bug prevention
      'react/button-has-type': 'error',
      'react/hook-use-state': 'error',
      'react/checked-requires-onchange-or-readonly': 'error',
      'react/forward-ref-uses-ref': 'error',
      'react/destructuring-assignment': ['error', 'always'],

      'react-hooks/exhaustive-deps': 'error',

      // Group B — Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
        // Functions: camelCase for utils, PascalCase for React components
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        // Parameters: allow PascalCase for component props passed as parameters (e.g. Icon: ComponentType)
        { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
        // Properties intentionally unrestricted: API responses may use snake_case
        { selector: 'property', format: null },
        // Object literal methods: allow UPPER_CASE for constants (e.g. API_ENDPOINTS.PRODUCT: () => ...)
        { selector: 'objectLiteralMethod', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE', 'PascalCase'] },
      ],

      // Group C — Code quality (SonarJS)
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-dead-store': 'error',
      'sonarjs/no-hook-setter-in-body': 'error',
      'sonarjs/no-uniq-key': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/prefer-immediate-return': 'error',

      // Group D — Accessibility: upgrade nextVitals 'warn' → 'error' + new rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      // Cross-route-group isolation: (shop) cannot import from (auth) and vice versa.
      // New route groups are auto-detected via the capture pattern — no config update needed.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
            { from: { element: { type: 'core-session' } }, allow: { to: { element: { type: 'shared' } } } },
            {
              from: { element: { type: 'app-feature' } },
              allow: {
                to: [
                  { element: { type: 'shared' } },
                  { element: { type: 'core-session' } },
                  { element: { type: 'app-feature', captured: { group: '{{from.captured.group}}' } } },
                ],
              },
            },
          ],
        },
      ],

      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-arrow-callback': 'error',

      'comma-dangle': 'off',
      semi: 'off',
      quotes: 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'computed-property-spacing': 'off',
      'key-spacing': 'off',
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.mts', '.cts'] },
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.mts', '.cts'],
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'] },
      tailwindcss: {
        // eslint-plugin-tailwindcss v4 stable: cssConfigPath thay `config`; `cn`/`clsx`/`cva` đã nằm trong defaults của `functions`
        cssConfigPath: tailwindEntryCss,
      },
    },
  },

  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}'],
    plugins: { vitest: vitestPlugin },
    languageOptions: {
      ...disableTypeChecked.languageOptions,
      parser: typescriptParser,
      parserOptions: {
        ...disableTypeChecked.languageOptions.parserOptions,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...vitestPlugin.environments.env.globals,
        require: 'readonly',
        window: 'readonly',
        document: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
      },
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      ...disableTypeChecked.rules,

      'no-undef': 'off',
      'no-console': 'off',
      '@next/next/no-img-element': 'off',
      // Not type-aware — must be explicitly turned off for tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-restricted-imports': 'off',
      'simple-import-sort/imports': 'off',
      'import/no-anonymous-default-export': 'off',
      'import/no-restricted-paths': 'off',
      'react/no-unstable-nested-components': 'off',
      'react/no-array-index-key': 'off',
      'react/destructuring-assignment': 'off',
      'react/button-has-type': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/no-dead-store': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
  },

  {
    files: [
      'next.config.*',
      'jest.config.*',
      'postcss.config.*',
      'eslint.config.*',
      'tailwind.config.*',
      '.prettierrc.*',
      'vitest.config.*',
      'playwright.config.*',
      'lint-staged.config.*',
    ],
    languageOptions: {
      ...disableTypeChecked.languageOptions,
      parser: typescriptParser,
      parserOptions: {
        ...disableTypeChecked.languageOptions.parserOptions,
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      ...disableTypeChecked.rules,
      'no-undef': 'off',
      'no-console': 'off',
      // Not type-aware — must be explicitly turned off for config files
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-restricted-imports': 'off',
      'import/no-anonymous-default-export': 'off',
      'import/no-commonjs': 'off',
      'import/no-cycle': 'off',
    },
  },

  prettier,
];

export default eslintConfig;
