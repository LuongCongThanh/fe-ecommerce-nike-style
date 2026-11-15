// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Runner } from './agent-run/exec';
import { buildBaseline, compareBundles, exitCodeFor, parseBaseline, parseRouteStats, runGates, STATS_FILE, type RouteStat } from './verify-gates';

let wt: string;
beforeEach(() => {
  wt = mkdtempSync(join(tmpdir(), 'gates-'));
});
afterEach(() => rmSync(wt, { recursive: true, force: true }));

const stat = (route: string, bytes: number): RouteStat => ({ route, firstLoadUncompressedJsBytes: bytes });
const statsJson = (rows: RouteStat[]) => JSON.stringify(rows.map((r) => ({ ...r, firstLoadChunkPaths: ['.next/static/chunks/a.js'] })));

/** Fake runner: records calls, fails commands listed in `failing`, writes stats on `next build`. */
function fakeRunner(opts: { failing?: string[]; stats?: RouteStat[] } = {}) {
  const calls: string[] = [];
  const runner: Runner = async (cmd, args, o) => {
    const line = [cmd, ...args].join(' ');
    calls.push(line);
    if (line.includes('next build') && opts.stats) {
      mkdirSync(dirname(join(o.cwd, STATS_FILE)), { recursive: true });
      writeFileSync(join(o.cwd, STATS_FILE), statsJson(opts.stats));
    }
    if (opts.failing?.includes(line)) return { code: 1, stdout: 'out', stderr: `boom ${line}` };
    return { code: 0, stdout: 'fine', stderr: '' };
  };
  return { runner, calls };
}

describe('parseRouteStats', () => {
  it('reads the real Next 16 shape (array of rows)', () => {
    expect(parseRouteStats(statsJson([stat('/a', 10)]))).toEqual([stat('/a', 10)]);
  });
  it('rejects other shapes', () => {
    expect(() => parseRouteStats('{"a":1}')).toThrow(/route-bundle-stats/);
    expect(() => parseRouteStats('[{"route":"/a"}]')).toThrow(/route-bundle-stats/);
    expect(() => parseRouteStats('[null]')).toThrow(/route-bundle-stats/);
  });
});

describe('parseBaseline', () => {
  it('reads {sha, routes}; anything else is null so the baseline is rebuilt', () => {
    expect(parseBaseline(JSON.stringify({ sha: 'abc', routes: [stat('/a', 1)] }))).toEqual({ sha: 'abc', routes: [stat('/a', 1)] });
    for (const bad of ['{nope', 'null', '[]', '{"sha":1,"routes":[]}', '{"sha":"a","routes":[{"route":"/a"}]}']) {
      expect(parseBaseline(bad)).toBeNull();
    }
  });
});

describe('compareBundles (D35)', () => {
  const base = [stat('/a', 1000), stat('/b', 2000)];
  it('flags only routes above +10% and reports new routes without failing', () => {
    const r = compareBundles(base, [stat('/a', 1101), stat('/b', 2200), stat('/c', 9999)]);
    expect(r.regressions).toEqual([{ route: '/a', baseline: 1000, current: 1101, increasePct: 10.1 }]);
    expect(r.newRoutes).toEqual([stat('/c', 9999)]);
    expect(r.checked).toBe(2);
  });
  it('exactly +10% passes; shrinking passes', () => {
    expect(compareBundles(base, [stat('/a', 1100), stat('/b', 10)]).regressions).toEqual([]);
  });
});

describe('runGates test-presence gate (D38 re-checked by the script)', () => {
  it('a problem is a red gate (gate_failed, exit 1) carrying the problem text', async () => {
    const { runner } = fakeRunner();
    const report = await runGates({ worktree: wt, kind: 'logic', runner, testPresence: async () => ['kind logic: add a test'] });
    const gate = report.gates.find((g) => g.name === 'test-presence');
    expect(gate).toMatchObject({ status: 'fail' });
    expect(gate?.log).toContain('add a test');
    expect(report.failureType).toBe('gate_failed');
    expect(exitCodeFor(report)).toBe(1);
  });
  it('no problem -> passes; no provider -> gate absent', async () => {
    const { runner } = fakeRunner();
    expect(
      (await runGates({ worktree: wt, kind: 'logic', runner, testPresence: async () => [] })).gates.find((g) => g.name === 'test-presence'),
    ).toMatchObject({
      status: 'pass',
    });
    expect((await runGates({ worktree: wt, kind: 'logic', runner })).gates.some((g) => g.name === 'test-presence')).toBe(false);
  });
});

describe('runGates', () => {
  it('runs the four gates, passes, exit 0', async () => {
    const { runner, calls } = fakeRunner();
    const report = await runGates({ worktree: wt, kind: 'logic', runner });
    expect(calls).toEqual(['pnpm lint', 'pnpm typecheck', 'pnpm test', 'pnpm format:check']);
    expect(report.ok).toBe(true);
    expect(report.failureType).toBeNull();
    expect(report.gates.map((g) => g.status)).toEqual(['pass', 'pass', 'pass', 'pass']);
    expect(exitCodeFor(report)).toBe(0);
  });

  it('a red gate gets a trimmed log, failureType gate_failed, exit 1; other gates still run', async () => {
    const { runner, calls } = fakeRunner({ failing: ['pnpm test'] });
    const report = await runGates({ worktree: wt, kind: 'docs', runner, maxLogChars: 5 });
    expect(calls).toHaveLength(4);
    const test = report.gates.find((g) => g.name === 'test');
    expect(test?.status).toBe('fail');
    expect(test?.log.length).toBeLessThan(60);
    expect(test?.log).toContain('trimmed');
    expect(report.failureType).toBe('gate_failed');
    expect(exitCodeFor(report)).toBe(1);
  });

  it('adds a build gate on request', async () => {
    const { runner, calls } = fakeRunner();
    await runGates({ worktree: wt, kind: 'logic', runner, withBuild: true });
    expect(calls.at(-1)).toBe('pnpm build');
  });

  it('kind ui: bundle regression is its own failure type, exit 2', async () => {
    const { runner, calls } = fakeRunner({ stats: [stat('/a', 1500), stat('/new', 5)] });
    const report = await runGates({ worktree: wt, kind: 'ui', runner, baseline: async () => ({ sha: 'abc', routes: [stat('/a', 1000)] }) });
    expect(calls).toContain('pnpm exec next build');
    expect(report.failureType).toBe('bundle_regression');
    expect(report.bundle?.baselineSha).toBe('abc');
    expect(report.bundle?.regressions[0]).toMatchObject({ route: '/a', increasePct: 50 });
    expect(report.bundle?.newRoutes).toEqual([stat('/new', 5)]);
    expect(exitCodeFor(report)).toBe(2);
  });

  it('kind ui within budget passes and lists new routes', async () => {
    const { runner } = fakeRunner({ stats: [stat('/a', 1050), stat('/new', 5)] });
    const report = await runGates({ worktree: wt, kind: 'ui', runner, baseline: async () => ({ sha: 'abc', routes: [stat('/a', 1000)] }) });
    expect(report.ok).toBe(true);
    expect(report.bundle?.newRoutes).toHaveLength(1);
  });

  it('kind ui: bundle gate is skipped when another gate is red', async () => {
    const { runner, calls } = fakeRunner({ failing: ['pnpm lint'], stats: [] });
    const report = await runGates({ worktree: wt, kind: 'ui', runner, baseline: async () => ({ sha: 'x', routes: [] }) });
    expect(calls).not.toContain('pnpm exec next build');
    expect(report.gates.find((g) => g.name === 'bundle')?.status).toBe('skipped');
    expect(report.failureType).toBe('gate_failed');
  });

  it('non-ui kinds never build for the bundle', async () => {
    const { runner, calls } = fakeRunner();
    await runGates({ worktree: wt, kind: 'logic', runner });
    expect(calls.join('\n')).not.toContain('next build');
  });

  it('a missing stats file or baseline error is a plain gate failure with the reason', async () => {
    const { runner } = fakeRunner();
    const report = await runGates({ worktree: wt, kind: 'ui', runner, baseline: async () => ({ sha: 'x', routes: [] }) });
    const bundle = report.gates.find((g) => g.name === 'bundle');
    expect(bundle?.status).toBe('fail');
    expect(bundle?.log).toContain('route-bundle-stats');
    expect(report.failureType).toBe('gate_failed');
  });
});

describe('buildBaseline', () => {
  it('builds a detached dev worktree, writes <sha>.json, removes the worktree', async () => {
    const repo = join(wt, 'repo');
    mkdirSync(repo);
    writeFileSync(join(repo, '.env.local'), 'X=1');
    const calls: string[] = [];
    const runner: Runner = async (cmd, args, o) => {
      const line = [cmd, ...args].join(' ');
      calls.push(`${o.cwd === repo ? 'repo' : 'dev'}: ${line}`);
      if (line.startsWith('git worktree add')) mkdirSync(args[args.length - 2] as string, { recursive: true });
      if (line.includes('next build')) {
        mkdirSync(dirname(join(o.cwd, STATS_FILE)), { recursive: true });
        writeFileSync(join(o.cwd, STATS_FILE), statsJson([stat('/a', 7)]));
      }
      return { code: 0, stdout: '', stderr: '' };
    };
    const out = join(wt, 'baseline', 'abc123.json');
    const routes = await buildBaseline({ repoRoot: repo, sha: 'abc123', baselineFile: out, runner, tmpRoot: join(wt, 'tmp') });
    expect(routes).toEqual([stat('/a', 7)]);
    expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({ sha: 'abc123', routes: [stat('/a', 7)] });
    expect(calls.map((c) => c.replace(wt, ''))).toEqual([
      expect.stringMatching(/^repo: git worktree add --detach .*abc123$/),
      expect.stringMatching(/^dev: pnpm install --frozen-lockfile$/),
      'dev: pnpm exec next build',
      expect.stringMatching(/^repo: git worktree remove --force /),
    ]);
    expect(existsSync(out)).toBe(true);
  });

  it('removes the worktree and throws when the build fails', async () => {
    const calls: string[] = [];
    const runner: Runner = async (cmd, args) => {
      const line = [cmd, ...args].join(' ');
      calls.push(line);
      return { code: line.includes('next build') ? 1 : 0, stdout: '', stderr: 'bad' };
    };
    await expect(buildBaseline({ repoRoot: wt, sha: 's', baselineFile: join(wt, 'b.json'), runner, tmpRoot: join(wt, 't') })).rejects.toThrow(
      /baseline/,
    );
    expect(calls.at(-1)).toMatch(/^git worktree remove --force/);
  });
});
