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
        'import-x/order': 'warn',
        'import-x/no-relative-parent-imports': 'error',
      },
    },
  );
};
