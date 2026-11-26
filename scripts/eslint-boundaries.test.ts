// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { ESLint } from 'eslint';
import importPlugin from 'eslint-plugin-import';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { restrictedPathZones } from '../eslint.boundaries.mjs';

let root: string;
let eslint: ESLint;

function write(path: string, contents = 'export const value = 1;\n'): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

// Fixture tree with one file per boundary root.
const TARGETS = [
  'src/app/[locale]/layout.js',
  'src/providers/AppProviders.js',
  'src/layouts/Header.js',
  'src/modules/cart/useCart.js',
  'src/shared/flag.js',
  'src/integrations/backend/client.js',
];

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'eslint-boundaries-'));
  for (const target of TARGETS) write(target);
  eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.js'],
        languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        plugins: { import: importPlugin },
        settings: { 'import/resolver': { node: { extensions: ['.js'] } } },
        rules: { 'import/no-restricted-paths': ['error', { zones: restrictedPathZones, basePath: root }] },
      },
    ],
  });
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

async function lint(file: string, importPath: string): Promise<string[]> {
  const fromFile = join(root, file);
  // Walk up to the fixture root, then down to the target, so resolution never depends on aliases.
  const specifier = `${'../'.repeat(file.split('/').length - 1)}${importPath}`;
  const [result] = await eslint.lintText(`import { value } from '${specifier}';\nexport { value };\n`, { filePath: fromFile });
  return (result?.messages ?? []).map((message) => message.ruleId ?? message.message);
}

describe('restrictedPathZones', () => {
  it.each([
    ['src/modules/cart/useApp.js', 'src/app/[locale]/layout.js'],
    ['src/modules/cart/useApp.js', 'src/providers/AppProviders.js'],
    ['src/modules/cart/useHeader.js', 'src/layouts/Header.js'],
    ['src/shared/useCart.js', 'src/modules/cart/useCart.js'],
    ['src/shared/useCartNew.js', 'src/modules/cart/useCart.js'],
    ['src/integrations/backend/useLayout.js', 'src/layouts/Header.js'],
  ])('blocks %s importing %s', async (file, importPath) => {
    await expect(lint(file, importPath)).resolves.toEqual(['import/no-restricted-paths']);
  });

  it.each([
    ['src/layouts/HeaderCart.js', 'src/modules/cart/useCart.js'],
    ['src/providers/Bootstrap.js', 'src/integrations/backend/client.js'],
    ['src/modules/cart/useFlag.js', 'src/shared/flag.js'],
    ['src/modules/cart/useClient.js', 'src/integrations/backend/client.js'],
    ['src/shared/useClient.js', 'src/integrations/backend/client.js'],
  ])('allows %s importing %s', async (file, importPath) => {
    await expect(lint(file, importPath)).resolves.toEqual([]);
  });
});
