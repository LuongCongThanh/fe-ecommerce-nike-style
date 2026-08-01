const tseslint = require('typescript-eslint');
const importX = require('eslint-plugin-import-x');
const boundaries = require('eslint-plugin-boundaries');

module.exports = tseslint.config(
  {
    ignores: ['dist/**', '.next/**', 'coverage/**', 'test-results/**'],
  },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { 'import-x': importX, boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'feature-public', pattern: 'src/features/*/pages/**' },
        { type: 'feature-private', pattern: 'src/features/*/{components,hooks,stores,utils}/**' },
      ],
    },
    rules: {
      'import-x/order': 'warn',
      'import-x/no-relative-parent-imports': 'error',
      'boundaries/no-unknown': 'error',
      'boundaries/element-types': ['error', { default: 'disallow', rules: [{ from: 'feature-public', allow: ['feature-public'] }] }],
    },
  },
);
