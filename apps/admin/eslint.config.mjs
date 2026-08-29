import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import createReactConfig from '@repo/eslint-config/react';
import prettier from 'eslint-config-prettier';

const sharedReactConfig = createReactConfig({ tsconfigRootDir: import.meta.dirname });
const disableTypeChecked = typescript.configs['flat/disable-type-checked'];

const eslintConfig = [
  js.configs.recommended,
  ...sharedReactConfig,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'src/routeTree.gen.ts'],
  },
  {
    // Config files (this one included) aren't part of tsconfig.json's `include` — type-aware rules can't run on them.
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: disableTypeChecked.languageOptions,
    rules: disableTypeChecked.rules,
  },
  {
    // `src/shell` is the app's foundation (chrome, table mechanics, cross-cutting hooks): every
    // feature may depend on it, and it may depend on none of them. It used to live at
    // `src/features/shell`, where that one-way direction was invisible and unenforced.
    files: ['src/shell/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/routes/*'],
              message: 'src/shell must not depend on a feature or a route — the dependency runs the other way.',
            },
          ],
        },
      ],
    },
  },
  prettier,
];

export default eslintConfig;
