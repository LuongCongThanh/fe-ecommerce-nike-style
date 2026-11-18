// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { checkDocs } from './check-docs';

let root: string;

function write(path: string, contents: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function task(name: string, frontmatter: string, body = ''): void {
  write(`docs/plan/tasks/${name}/spec.md`, `---\n${frontmatter}\n---\n\nPart of 07-workflow-structure-map\n\n${body}\n`);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'docs-check-'));
  write('package.json', '{"scripts":{}}\n');
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('checkDocs local links and anchors', () => {
  it('accepts Unicode/duplicate headings, URL-encoded fragments and reference links', async () => {
    write('docs/guide.md', '# Tổng quan\n\n## Trả hàng\n\n## Trả hàng\n');
    write('README.md', '[một](docs/guide.md#tr%E1%BA%A3-h%C3%A0ng) [hai][second]\n\n[second]: docs/guide.md#trả-hàng-1\n');
    expect(await checkDocs(root, { format: false })).toEqual([]);
  });

  it('reports missing files and anchors but ignores examples in fences and inline code', async () => {
    write('README.md', '[bad](docs/missing.md) [anchor](#missing)\n\n`[inline](x.md)`\n\n```md\n[fenced](y.md)\n```\n');
    const problems = await checkDocs(root, { format: false });
    expect(problems).toEqual(expect.arrayContaining([expect.stringContaining('docs/missing.md'), expect.stringContaining('#missing')]));
    expect(problems.join('\n')).not.toContain('x.md');
    expect(problems.join('\n')).not.toContain('y.md');
  });

  it('does not require external or documented sibling-repository targets', async () => {
    write('README.md', '[web](https://example.com) [mail](mailto:a@example.com) [backend](../be-demo/docs/api.md)\n');
    expect(await checkDocs(root, { format: false })).toEqual([]);
  });

  it('resolves parent-relative links from the nested Markdown source before classifying siblings', async () => {
    write('existing.md', '# Existing\n');
    write('docs/guide.md', '[valid](../existing.md) [missing](../missing.md)\n');
    const problems = await checkDocs(root, { format: false });
    expect(problems).toEqual([expect.stringContaining('docs/guide.md: missing local link ../missing.md')]);
    expect(problems.join('\n')).not.toContain('../existing.md');
  });
});

describe('checkDocs task graph', () => {
  it('rejects invalid metadata, missing blockers, cycles and mismatched task identity', async () => {
    task('01-one', 'status: made-up\nblocked-by: [02-missing]\nkind: nope', '# Spec 99: wrong');
    task('02-two', 'status: todo\nblocked-by: [03-three]\nkind: docs', '# Spec 02: two');
    task('03-three', 'status: todo\nblocked-by: [02-two]\nkind: docs', '# Spec 03: three');
    const text = (await checkDocs(root, { format: false })).join('\n');
    expect(text).toContain('invalid status');
    expect(text).toContain('invalid kind');
    expect(text).toContain('unknown blocker 02-missing');
    expect(text).toContain('task heading identity');
    expect(text).toContain('blocker cycle');
  });

  it('accepts the parser subset including multiline blockers and Wayfinder parent references', async () => {
    task('07-workflow-structure-map', 'status: in-progress\nblocked-by: []\nkind: docs\nlabels: [wayfinder:map]', '# Đồng bộ');
    task('08-child', 'status: done\nblocked-by:\n  - 07-workflow-structure-map\nkind: docs\nlabels:\n  - wayfinder:task', '# Child\n\nType: task');
    expect(await checkDocs(root, { format: false })).toEqual([]);
  });
});

describe('checkDocs live consumers', () => {
  it('reports literal links to removed docs in live roles but ignores historical task artifacts', async () => {
    write('.agents/skills/local/SKILL.md', 'Read docs/FRONTEND-GUIDE.md\n');
    write('docs/plan/tasks/12-history/report.md', 'Removed docs/FRONTEND-GUIDE.md\n');
    const problems = await checkDocs(root, { format: false });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('.agents/skills/local/SKILL.md');
  });

  it('reports removed document paths wrapped in backticks in live source comments', async () => {
    write('src/example.ts', '// See `docs/FRONTEND-GUIDE.md` before editing.\n');
    const problems = await checkDocs(root, { format: false });
    expect(problems).toEqual([expect.stringContaining('src/example.ts: live consumer references removed document docs/FRONTEND-GUIDE.md')]);
  });
});
