import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import createNextConfig from '@repo/eslint-config/next';
import prettier from 'eslint-config-prettier';

const sharedNextConfig = createNextConfig({ tsconfigRootDir: import.meta.dirname });
const disableTypeChecked = typescript.configs['flat/disable-type-checked'];

const eslintConfig = [
  js.configs.recommended,
  ...sharedNextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  },
  {
    // Config files (this one included) aren't part of tsconfig.json's `include` — type-aware rules can't run on them.
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: disableTypeChecked.languageOptions,
    rules: disableTypeChecked.rules,
  },
  prettier,
];

export default eslintConfig;
