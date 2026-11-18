/**
 * verify-gates (D19, D35): runs lint, typecheck, test, format:check (+ build on request) in a worktree and,
 * for `kind: ui`, the First Load JS gate. Prints one JSON report for scripts/agent-run (step 7).
 *
 *   pnpm verify-gates [--worktree <dir>] [--task-dir <dir> | --kind <ui|logic|refactor|docs>]
 *                     [--baseline-dir <dir>] [--repo-root <dir>] [--with-build] [--max-log-chars <n>]
 *
 * Exit codes: 0 all green, 1 gate_failed (an agent may fix it), 2 bundle_regression (D35, situation 14:
 * no agent fix, ask the human), 64 bad usage / internal error.
 *
 * Bundle metric: Next only writes `.next/diagnostics/route-bundle-stats.json` for Turbopack builds
 * (verified on Next 16.2.12: `next build --webpack`, which `pnpm build` uses, does NOT write it). The bundle
 * gate therefore runs `pnpm exec next build` (Turbopack) for both baseline and candidate, so the comparison
 * is like for like; absolute numbers differ from the shipped webpack bundles.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { realRunner, trimLog, type Runner } from './agent-run/exec';
import { z } from 'zod';

import { checkTestPresence } from '../.claude/hooks/lib/implementer-stop';

import { isTaskKind, readSpecInfo, type TaskKind } from './agent-run/spec';

export const STATS_FILE = '.next/diagnostics/route-bundle-stats.json';
export const BUNDLE_THRESHOLD = 0.1;
const BUNDLE_BUILD = { command: 'pnpm', args: ['exec', 'next', 'build'] } as const;

export interface RouteStat {
  route: string;
  firstLoadUncompressedJsBytes: number;
}

export interface Regression {
  route: string;
  baseline: number;
  current: number;
  increasePct: number;
}

export interface BundleReport {
  baselineSha: string;
  checked: number;
  threshold: number;
  regressions: Regression[];
  newRoutes: RouteStat[];
}

export type FailureType = 'gate_failed' | 'bundle_regression';

export interface GateResult {
  name: string;
  status: 'pass' | 'fail' | 'skipped';
  durationMs: number;
  log: string;
}

export interface VerifyReport {
  ok: boolean;
  worktree: string;
  kind: TaskKind | null;
  failureType: FailureType | null;
  gates: GateResult[];
  bundle?: BundleReport;
}

export interface Baseline {
  sha: string;
  routes: RouteStat[];
}

const routeStatsSchema = z.array(z.object({ route: z.string(), firstLoadUncompressedJsBytes: z.number() }));
const baselineSchema = z.object({ sha: z.string(), routes: routeStatsSchema });

/** Rows of Next's route-bundle-stats.json: `[{route, firstLoadUncompressedJsBytes, firstLoadChunkPaths}]`. */
export function parseRouteStats(json: string): RouteStat[] {
  const result = routeStatsSchema.safeParse(JSON.parse(json));
  if (!result.success) throw new Error('unexpected route-bundle-stats.json shape (expected [{route, firstLoadUncompressedJsBytes}])');
  return result.data;
}

/** A stored baseline `{sha, routes}`; null when the file is corrupt or has another shape (it is then rebuilt). */
export function parseBaseline(json: string): Baseline | null {
  try {
    const result = baselineSchema.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null; // not JSON
  }
}

export function compareBundles(baseline: RouteStat[], current: RouteStat[], threshold = BUNDLE_THRESHOLD): Omit<BundleReport, 'baselineSha'> {
  const base = new Map(baseline.map((r) => [r.route, r.firstLoadUncompressedJsBytes]));
  const regressions: Regression[] = [];
  const newRoutes: RouteStat[] = [];
  let checked = 0;
  for (const row of current) {
    const before = base.get(row.route);
    if (before === undefined) {
      newRoutes.push(row);
      continue;
    }
    checked++;
    const current = row.firstLoadUncompressedJsBytes;
    if (before > 0 && current > before * (1 + threshold)) {
      regressions.push({ route: row.route, baseline: before, current, increasePct: Math.round(((current - before) / before) * 1000) / 10 });
    }
  }
  return { checked, threshold, regressions, newRoutes };
}

export interface RunGatesOptions {
  worktree: string;
  kind: TaskKind | null;
  runner: Runner;
  withBuild?: boolean;
  maxLogChars?: number;
  /** Required for kind ui: baseline First Load JS of the dev commit this branch is based on. */
  baseline?: () => Promise<Baseline>;
  /** Problems with the D38 test rule for this branch (reuses the Stop hook logic); any problem is a red gate. */
  testPresence?: () => Promise<string[]>;
}

export async function runGates(opts: RunGatesOptions): Promise<VerifyReport> {
  const { worktree, kind, runner } = opts;
  const gates: GateResult[] = [];
  const steps: Array<[string, string[]]> = [
    ['lint', ['lint']],
    ['typecheck', ['typecheck']],
    ['test', ['test']],
    ['format:check', ['format:check']],
    ['docs:check', ['docs:check']],
  ];
  if (opts.withBuild) steps.push(['build', ['build']]);

  const timed = async (name: string, fn: () => Promise<{ ok: boolean; log: string }>): Promise<GateResult> => {
    const started = Date.now();
    let outcome: { ok: boolean; log: string };
    try {
      outcome = await fn();
    } catch (error) {
      outcome = { ok: false, log: error instanceof Error ? error.message : String(error) };
    }
    return { name, status: outcome.ok ? 'pass' : 'fail', durationMs: Date.now() - started, log: trimLog(outcome.log, opts.maxLogChars) };
  };

  for (const [name, args] of steps) {
    gates.push(
      await timed(name, async () => {
        const r = await runner('pnpm', args, { cwd: worktree });
        return { ok: r.code === 0, log: r.code === 0 ? '' : `${r.stderr}\n${r.stdout}` };
      }),
    );
  }

  if (opts.testPresence) {
    const check = opts.testPresence;
    gates.push(
      await timed('test-presence', async () => {
        const problems = await check();
        return { ok: problems.length === 0, log: problems.join('\n') };
      }),
    );
  }

  const base: VerifyReport = { ok: true, worktree, kind, failureType: null, gates };
  let regressed = false;
  if (kind === 'ui') {
    if (gates.some((g) => g.status === 'fail')) {
      gates.push({ name: 'bundle', status: 'skipped', durationMs: 0, log: 'skipped: fix the failing gates first' });
    } else {
      let bundle: BundleReport | undefined;
      const gate = await timed('bundle', async () => {
        if (!opts.baseline) throw new Error('kind ui needs a baseline provider');
        const built = await runner(BUNDLE_BUILD.command, [...BUNDLE_BUILD.args], { cwd: worktree });
        if (built.code !== 0) return { ok: false, log: `next build failed\n${built.stderr}\n${built.stdout}` };
        const statsPath = join(worktree, STATS_FILE);
        if (!existsSync(statsPath)) return { ok: false, log: `route-bundle-stats.json not found at ${STATS_FILE}` };
        const current = parseRouteStats(readFileSync(statsPath, 'utf8'));
        const baseline = await opts.baseline();
        bundle = { baselineSha: baseline.sha, ...compareBundles(baseline.routes, current) };
        regressed = bundle.regressions.length > 0;
        const lines = bundle.regressions.map((r) => `${r.route}: ${r.baseline} -> ${r.current} bytes (+${r.increasePct}%)`);
        return { ok: !regressed, log: lines.join('\n') };
      });
      gates.push(gate);
      if (bundle) base.bundle = bundle;
    }
  }

  const failed = gates.some((g) => g.status === 'fail');
  base.ok = !failed;
  base.failureType = !failed ? null : regressed ? 'bundle_regression' : 'gate_failed';
  return base;
}

export function exitCodeFor(report: VerifyReport): number {
  return report.failureType === 'bundle_regression' ? 2 : report.failureType === 'gate_failed' ? 1 : 0;
}

export interface BuildBaselineOptions {
  /** Main checkout (owns the git dir and `.env.local`). */
  repoRoot: string;
  /** dev commit to measure. */
  sha: string;
  baselineFile: string;
  runner: Runner;
  /** Parent directory for the temporary source export. */
  tmpRoot: string;
}

/** Build exported dev sources at `sha` once in a temporary directory and store its route stats (D35). */
export async function buildBaseline(opts: BuildBaselineOptions): Promise<RouteStat[]> {
  const { repoRoot, sha, runner } = opts;
  mkdirSync(opts.tmpRoot, { recursive: true });
  const dir = mkdtempSync(join(opts.tmpRoot, 'baseline-'));
  const archive = join(dir, 'dev.tar');
  const source = join(dir, 'source');
  mkdirSync(source);
  const fail = (what: string, r: { stderr: string; stdout: string }): never => {
    throw new Error(`baseline ${what} failed for ${sha}:\n${trimLog(`${r.stderr}\n${r.stdout}`)}`);
  };
  try {
    const exported = await runner('git', ['archive', '--format=tar', '--output', archive, sha], { cwd: repoRoot });
    if (exported.code !== 0) return fail('archive', exported);
    const extracted = await runner('tar', ['-xf', archive], { cwd: source });
    if (extracted.code !== 0) return fail('extract', extracted);
    const env = join(repoRoot, '.env.local');
    if (existsSync(env)) copyFileSync(env, join(source, '.env.local'));
    const installed = await runner('pnpm', ['install', '--frozen-lockfile'], { cwd: source, env: { ...process.env, HUSKY: '0' } });
    if (installed.code !== 0) return fail('install', installed);
    const built = await runner(BUNDLE_BUILD.command, [...BUNDLE_BUILD.args], { cwd: source });
    if (built.code !== 0) return fail('build', built);
    const routes = parseRouteStats(readFileSync(join(source, STATS_FILE), 'utf8'));
    mkdirSync(dirname(opts.baselineFile), { recursive: true });
    writeFileSync(opts.baselineFile, `${JSON.stringify({ sha, routes }, null, 2)}\n`);
    return routes;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

/** Baseline provider for the CLI: file per dev sha, built on first use. */
export function fileBaseline(opts: { worktree: string; repoRoot: string; baselineDir: string; runner: Runner }): () => Promise<Baseline> {
  return async () => {
    const sha = git(opts.worktree, 'merge-base', 'HEAD', 'origin/dev');
    const file = join(opts.baselineDir, `${sha}.json`);
    const stored = existsSync(file) ? parseBaseline(readFileSync(file, 'utf8')) : null;
    if (stored) return stored;
    const routes = await buildBaseline({
      repoRoot: opts.repoRoot,
      sha,
      baselineFile: file,
      runner: opts.runner,
      tmpRoot: join(opts.baselineDir, '..', 'tmp'),
    });
    return { sha, routes };
  };
}

function parseArgs(argv: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? '';
    if (!a.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out.set(a.slice(2), 'true');
    else {
      out.set(a.slice(2), next);
      i++;
    }
  }
  return out;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  const worktree = resolve(args.get('worktree') ?? process.cwd());
  const taskDir = args.get('task-dir');
  const kindArg = args.get('kind');
  let kind: TaskKind | null = taskDir ? readSpecInfo(taskDir).kind : null;
  if (kindArg) {
    if (!isTaskKind(kindArg)) {
      process.stderr.write(`verify-gates: unknown --kind ${kindArg}\n`);
      return 64;
    }
    kind = kindArg;
  }
  const common = resolve(worktree, git(worktree, 'rev-parse', '--git-common-dir'));
  const repoRoot = resolve(args.get('repo-root') ?? dirname(common));
  const baselineDir = resolve(args.get('baseline-dir') ?? join(repoRoot, '.agent-run', 'baseline'));
  const report = await runGates({
    worktree,
    kind,
    runner: realRunner,
    withBuild: args.has('with-build'),
    maxLogChars: args.has('max-log-chars') ? Number(args.get('max-log-chars')) : undefined,
    baseline: fileBaseline({ worktree, repoRoot, baselineDir, runner: realRunner }),
    testPresence: taskDir ? () => checkTestPresence({ root: worktree, taskDir: resolve(taskDir), runner: realRunner }) : undefined,
  });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return exitCodeFor(report);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  main().then(
    (code) => process.exit(code),
    (error: unknown) => {
      process.stderr.write(`verify-gates: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exit(64);
    },
  );
}
