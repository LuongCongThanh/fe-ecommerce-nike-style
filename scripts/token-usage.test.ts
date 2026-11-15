// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { classify, encodeProjectDir, measure, parseArgs, renderMarkdown, upsertTokenSection, writeMetric } from './token-usage';

const ROOT = '/work/wt/feat-x';
const assistant = (id: string, usage: Record<string, number>, files: string[] = [], timestamp = '2026-11-16T10:00:00Z') =>
  JSON.stringify({
    type: 'assistant',
    timestamp,
    message: {
      id,
      usage,
      content: files.map((file_path) => ({ type: 'tool_use', name: 'Write', input: { file_path } })),
    },
  });

describe('encodeProjectDir', () => {
  it('replaces every non-alphanumeric char with a dash', () => {
    expect(encodeProjectDir('/home/x/.claude/worktrees/foo_bar')).toBe('-home-x--claude-worktrees-foo-bar');
  });
});

describe('classify', () => {
  it.each([
    ['/work/wt/feat-x/src/a/b.ts', 'code'],
    ['/work/wt/feat-x/src/a/b.test.ts', 'test'],
    ['/work/wt/feat-x/src/a/B.test.tsx', 'test'],
    ['/work/wt/feat-x/src/a/b.spec.tsx', 'test'],
    ['/work/wt/feat-x/e2e/home.spec.ts', 'test'],
    ['/work/wt/feat-x/docs/plan/x.md', 'docs'],
    ['/work/wt/feat-x/README.md', 'docs'],
    ['/work/wt/feat-x/package.json', 'other'],
    ['/work/wt/feat-x/scripts/token-usage.ts', 'other'],
  ])('%s -> %s', (path, expected) => {
    expect(classify(path, ROOT)).toBe(expected);
  });
});

describe('parseArgs', () => {
  it('parses ids and flags', () => {
    expect(parseArgs(['abc', '--project-dir', '/p', '--out', 'm.md', '--since', '2026-11-16T00:00', '--md'])).toEqual({
      ids: ['abc'],
      projectDir: '/p',
      out: 'm.md',
      since: '2026-11-16T00:00',
      until: undefined,
      asMarkdown: true,
    });
  });
  it('rejects unknown flags, missing ids and missing values', () => {
    expect(() => parseArgs(['a', '--nope'])).toThrow(/--nope/);
    expect(() => parseArgs([])).toThrow(/sessionId/);
    expect(() => parseArgs(['a', '--out'])).toThrow(/--out/);
  });
});

describe('measure', () => {
  let base: string;
  beforeEach(() => {
    base = mkdtempSync(join(tmpdir(), 'tok-'));
    const dir = join(base, encodeProjectDir(ROOT));
    mkdirSync(join(dir, 'sess1', 'subagents'), { recursive: true });
    writeFileSync(
      join(dir, 'sess1.jsonl'),
      [
        // streamed twice, last usage wins; writes a code + test file -> split evenly
        assistant('m1', { input_tokens: 1, output_tokens: 5 }, [`${ROOT}/src/a.ts`]),
        assistant('m1', { input_tokens: 10, output_tokens: 100, cache_read_input_tokens: 40 }, [`${ROOT}/src/a.test.ts`]),
        assistant('m2', { input_tokens: 2, output_tokens: 20, cache_creation_input_tokens: 8 }),
        'not json',
        assistant('old', { output_tokens: 999 }, [], '2026-01-01T00:00:00Z'),
      ].join('\n'),
    );
    writeFileSync(join(dir, 'sess1', 'subagents', 'agent-1.jsonl'), assistant('s1', { output_tokens: 50 }, [`${ROOT}/docs/x.md`]));
    writeFileSync(join(dir, 'sess2.jsonl'), assistant('z', { output_tokens: 1 }));
  });
  afterEach(() => rmSync(base, { recursive: true, force: true }));

  it('aggregates by category, dedupes by message id and includes subagents', () => {
    const r = measure({ baseDir: base, root: ROOT, ids: ['sess1'], since: '2026-11-01T00:00' });
    expect(r.sessions).toEqual(['sess1']);
    expect(r.rows.map((x) => x.name)).toEqual(['code', 'test', 'docs', 'other', 'explore/chat', 'TOTAL']);
    const by = Object.fromEntries(r.rows.map((x) => [x.name, x]));
    expect(by['code']).toMatchObject({ output: 50, input: 5, cacheRead: 20, messages: 1 });
    expect(by['test']).toMatchObject({ output: 50, input: 5, cacheRead: 20, messages: 1 });
    expect(by['docs']).toMatchObject({ output: 50, messages: 1 });
    expect(by['explore/chat']).toMatchObject({ output: 20, cacheWrite: 8, messages: 1 });
    expect(by['TOTAL']).toMatchObject({ output: 170, messages: 3 });
  });

  it('uses projectDir (worktree path) instead of cwd, accepts id prefix and latest', () => {
    expect(measure({ baseDir: base, root: ROOT, ids: ['sess1'] }).sessions).toEqual(['sess1']);
    expect(() => measure({ baseDir: base, root: ROOT, ids: ['sess'] })).toThrow(/khớp nhiều/);
    expect(() => measure({ baseDir: base, root: ROOT, ids: ['nope'] })).toThrow(/Không tìm thấy/);
    expect(() => measure({ baseDir: base, root: '/elsewhere', ids: ['latest'] })).toThrow(/transcript/);
    expect(measure({ baseDir: base, root: ROOT, ids: ['latest'] }).sessions).toHaveLength(1);
  });
});

describe('renderMarkdown + upsertTokenSection', () => {
  const rows = [
    { name: 'code', messages: 1, input: 2, cacheWrite: 3, cacheRead: 4, output: 5 },
    { name: 'TOTAL', messages: 1, input: 2, cacheWrite: 3, cacheRead: 4, output: 5 },
  ];
  const table = renderMarkdown(rows);

  it('renders be-demo table format', () => {
    expect(table).toBe(
      [
        '| Loại | Messages | Input | Cache write | Cache read | Output |',
        '| --- | --- | --- | --- | --- | --- |',
        '| code | 1 | 2 | 3 | 4 | 5 |',
        '| TOTAL | 1 | 2 | 3 | 4 | 5 |',
      ].join('\n'),
    );
  });

  it('creates a metric.md when none exists', () => {
    expect(upsertTokenSection(undefined, table, 'Sessions: s1')).toBe(`# Metric\n\n## Token (đo thật)\n\nSessions: s1\n\n${table}\n`);
  });

  it('replaces only the Token section, keeping the rest', () => {
    const existing = `# Metric 01: x\n\n| a | b |\n\n## Token (đo thật)\n\nold\n\n| old |\n\n## Ghi chú\n\nkeep\n`;
    const out = upsertTokenSection(existing, table, 'Sessions: s1');
    expect(out).toContain('# Metric 01: x');
    expect(out).toContain('## Ghi chú\n\nkeep');
    expect(out).not.toContain('| old |');
    expect(out).toContain(table);
    expect(upsertTokenSection(out, table, 'Sessions: s1')).toBe(out);
  });

  it('appends the section when missing', () => {
    const out = upsertTokenSection('# Metric 01\n\nbody\n', table, 'Sessions: s1');
    expect(out).toBe(`# Metric 01\n\nbody\n\n## Token (đo thật)\n\nSessions: s1\n\n${table}\n`);
  });

  it('writeMetric writes the file', () => {
    const d = mkdtempSync(join(tmpdir(), 'met-'));
    const f = join(d, 'metric.md');
    writeMetric(f, table, 'Sessions: s1');
    expect(readFileSync(f, 'utf8')).toContain('## Token (đo thật)');
    rmSync(d, { recursive: true, force: true });
  });
});

describe('measure with malformed transcript lines', () => {
  it('skips lines that are valid JSON but not objects, or have odd shapes', () => {
    const base = mkdtempSync(join(tmpdir(), 'tok-bad-'));
    try {
      const dir = join(base, encodeProjectDir(ROOT));
      mkdirSync(dir, { recursive: true });
      const lines = [
        'null',
        '42',
        '"s"',
        '[1]',
        JSON.stringify({ type: 'assistant', message: null }),
        JSON.stringify({ type: 'assistant', message: { id: 'z', usage: 'x' } }),
        assistant('m1', { output_tokens: 7 }),
      ];
      writeFileSync(join(dir, 's1.jsonl'), `${lines.join('\n')}\n`);
      const { rows } = measure({ baseDir: base, root: ROOT, ids: ['s1'] });
      expect(rows.find((r) => r.name === 'TOTAL')).toMatchObject({ messages: 1, output: 7 });
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
