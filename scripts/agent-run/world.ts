/** Test world for the whole flow: temp repo + fake runner/claude/notify. No process is ever spawned. */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { ClaudeRequest, ClaudeResponse } from './claude';
import type { Config, Deps } from './deps';
import { fakeRunner, on, type FakeRunner, type Handler } from './testkit';

export type Role = 'planner' | 'implementer' | 'reviewer' | 'retro' | 'retro-need' | 'pr-body' | 'ui' | 'handoff';

export function roleOf(req: ClaudeRequest): Role {
  if (req.prompt.startsWith('/mattpocock-skills:handoff')) return 'handoff';
  if (req.agent === 'planner') return 'planner';
  if (req.agent === 'implementer') return 'implementer';
  if (req.agent === 'reviewer') return 'reviewer';
  if (req.phase === 'retro') return req.schema ? 'retro-need' : 'retro';
  if (JSON.stringify(req.schema ?? {}).includes('"body"')) return 'pr-body';
  return 'ui';
}

export const reply = (structured: unknown, o: Partial<ClaudeResponse> = {}): ClaudeResponse => ({
  kind: 'ok',
  sessionId: 'sess-1',
  numTurns: 3,
  costUsd: 0,
  structured,
  result: null,
  detail: '',
  ...o,
});

export const TASK_SPEC = (fm: string) => `---\nstatus: ready-for-agent\nkind: logic\n${fm}\n---\n\n# Spec 01: demo\n`;
export const PR_URL = 'https://github.com/o/r/pull/42';

export interface World {
  deps: Deps;
  cfg: Config;
  repo: string;
  worktrees: string;
  runner: FakeRunner;
  /** Requests seen by the fake claude, in order, with their role */
  claudeCalls: { role: Role; req: ClaudeRequest }[];
  notices: string[];
  logs: string[];
  /** Replace the script for a role: called per request, falls back to the happy default when it returns undefined */
  script: Partial<Record<Role, (req: ClaudeRequest, n: number) => ClaudeResponse | void | Promise<ClaudeResponse | void>>>;
  wt: (task: string) => string;
  devServer: { started: number[]; stopped: number; busy: boolean };
  /** Fake process table: `pid` is ours, `alive` are the other pids that answer a liveness probe */
  proc: { pid: number; alive: Set<number> };
}

export function makeWorld(opts: { tasks?: Record<string, string>; handlers?: Handler[] } = {}): World {
  const repo = mkdtempSync(join(tmpdir(), 'run-repo-'));
  const worktrees = repo;
  const tasks = opts.tasks ?? { '01-demo': TASK_SPEC('') };
  for (const [name, text] of Object.entries(tasks)) {
    mkdirSync(join(repo, 'docs/storefront/plan/todo', name), { recursive: true });
    writeFileSync(join(repo, 'docs/storefront/plan/todo', name, 'spec.md'), text);
  }
  mkdirSync(join(repo, '.agent-run'), { recursive: true });
  writeFileSync(join(repo, '.agent-run/AGENT-INBOX.md'), '| Thời gian | Task | Tình huống | Việc cần làm |\n| --- | --- | --- | --- |\n');
  const wt = (_task: string) => repo;
  let branch = 'dev';

  const handlers: Handler[] = [
    ...(opts.handlers ?? []),
    on('git rev-parse --verify', { code: 1 }),
    on('git branch --show-current', () => ({ stdout: branch })),
    on('git status --porcelain --untracked-files=all', { stdout: '' }),
    on('git switch --no-overwrite-ignore -c', (args) => {
      branch = args[args.indexOf('-c') + 1] ?? '';
      const dir = repo;
      mkdirSync(join(dir, 'node_modules/.bin'), { recursive: true });
      mkdirSync(join(dir, 'docs/storefront/plan/todo'), { recursive: true });
      writeFileSync(join(dir, 'node_modules/.bin/tsx'), '');
      writeFileSync(join(dir, '.env.example'), 'X=1\n');
    }),
    (cmd, args) => (cmd.endsWith('node_modules/.bin/tsx') && args[0]?.endsWith('agent-guard.ts') ? { code: 2, stderr: 'blocked' } : undefined),
    on('pnpm exec tsx scripts/verify-gates.ts', { code: 0, stdout: '{"ok":true}' }),
    on('git status --porcelain', { stdout: ' M src/a.ts\n' }),
    on('gh pr create', { stdout: `${PR_URL}\n` }),
  ];
  const runner = fakeRunner(...handlers);
  const claudeCalls: World['claudeCalls'] = [];
  const counts: Partial<Record<Role, number>> = {};
  const script: World['script'] = {};
  const notices: string[] = [];
  const logs: string[] = [];
  const devServer = { started: [] as number[], stopped: 0, busy: false };
  const proc = { pid: 31337, alive: new Set<number>() };

  const defaults: Record<Role, (req: ClaudeRequest) => ClaudeResponse> = {
    planner: (req) => {
      writeFileSync(join(req.env.AGENT_TASK_DIR as string, 'plan.md'), '# Plan\n');
      return reply({ result: 'ok', reason: 'planned' });
    },
    implementer: () => reply({ result: 'ok', reason: 'done', commit_message: 'feat(demo): add the thing' }, { sessionId: 'impl-1' }),
    reviewer: () => reply({ result: 'ok', reason: 'fine', findings: [] }),
    retro: () => reply(undefined, { sessionId: 'impl-1', numTurns: 4 }),
    'retro-need': () => reply({ turns_needed: 4, reason: 'more to review' }),
    'pr-body': () => reply({ body: 'body' }),
    ui: (req) => {
      const artifact = /UI_ARTIFACT=(.+)/.exec(req.prompt)?.[1] as string;
      writeFileSync(artifact, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      return reply({
        result: 'ok',
        reason: 'fine',
        findings: [],
        evidence: {
          url: 'http://localhost:3100/vi',
          viewport: { width: 390, height: 844 },
          state: 'catalog loaded',
          actions: ['opened catalog'],
          artifact,
        },
      });
    },
    handoff: () => reply(undefined, { result: '# Handoff\n' }),
  };

  const deps: Deps = {
    runner: runner.runner,
    claude: async (req) => {
      const role = roleOf(req);
      counts[role] = (counts[role] ?? 0) + 1;
      claudeCalls.push({ role, req });
      const custom = await script[role]?.(req, counts[role] as number);
      return custom ?? defaults[role](req);
    },
    notify: (t, b) => notices.push(`${t}: ${b}`),
    now: () => new Date(2026, 10, 16, 9, 30),
    log: (l) => logs.push(l),
    processes: { pid: proc.pid, isAlive: (pid) => proc.alive.has(pid) },
    devServer: {
      start: (_cwd, port) => {
        devServer.started.push(port);
        return Promise.resolve(
          devServer.busy ? { ok: false as const, reason: 'port busy' } : { ok: true as const, stop: () => Promise.resolve(void devServer.stopped++) },
        );
      },
    },
  };
  const cfg: Config = { repoRoot: repo, turnBudget: 40, retroTurns: 5, maxFixes: 3, prBodyTurns: 6, devPort: 3100 };
  return { deps, cfg, repo, worktrees, runner, claudeCalls, notices, logs, script, wt, devServer, proc };
}
