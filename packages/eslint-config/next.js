const tseslint = require('typescript-eslint');
const nextVitals = require('eslint-config-next/core-web-vitals');
const createBaseConfig = require('./base');

/**
 * @param {{ tsconfigRootDir?: string }} [options] `nextVitals` already registers the
 * react/react-hooks/jsx-a11y plugins and their recommended rules — re-registering them here
 * throws "Cannot redefine plugin", so this only layers the Next.js-specific overrides on top.
 */
module.exports = function createNextConfig(options) {
  return tseslint.config(...createBaseConfig(options), ...nextVitals, {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  });
};
