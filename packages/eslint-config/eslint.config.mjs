import typescript from 'typescript-eslint';

import createBaseConfig from './base.js';

const disableTypeChecked = typescript.configs.disableTypeChecked;

export default [
  ...createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: disableTypeChecked.languageOptions,
    rules: {
      ...disableTypeChecked.rules,
      // These presets are intentionally authored as CommonJS for broad config compatibility.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
