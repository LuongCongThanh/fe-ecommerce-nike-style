// @vitest-environment node
import { Linter } from 'eslint';
import reactPlugin from 'eslint-plugin-react';
import { describe, expect, it } from 'vitest';

describe('React lint dependency compatibility', () => {
  it('matches render props and still rejects unstable component props', () => {
    const linter = new Linter();
    const config = [
      {
        plugins: { react: reactPlugin },
        languageOptions: {
          ecmaVersion: 2022 as const,
          sourceType: 'module' as const,
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        settings: { react: { version: '19.2' } },
        rules: { 'react/no-unstable-nested-components': 'error' as const },
      },
    ];

    expect(linter.verify('const App = () => <Panel renderItem={() => <span />} />;', config)).toEqual([]);
    expect(linter.verify('const App = () => <Panel item={() => <span />} />;', config)).toEqual([
      expect.objectContaining({ ruleId: 'react/no-unstable-nested-components', severity: 2 }),
    ]);
  });
});
