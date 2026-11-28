// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { parseApproved } from './agent-guard';

const HOOK = resolve(__dirname, 'agent-guard.ts');
const TSX = resolve(__dirname, '../../node_modules/.bin/tsx');
const CONFIG = resolve(__dirname, 'lib/guard.fixture.json');

let main: string;
let wt: string;

function git(cwd: string, ...args: string[]) {
  execFileSync('git', args, { cwd, stdio: 'ignore' });
}

function run(input: object, env: Record<string, string> = {}, cwd = wt) {
  const r = spawnSync(TSX, [HOOK], {
    cwd,
    input: JSON.stringify({ cwd, ...input }),
    encoding: 'utf8',
    env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', CLAUDE_PROJECT_DIR: cwd, ...env },
  });
  return { code: r.status, stderr: r.stderr };
}

beforeAll(() => {
  main = realpathSync(mkdtempSync(join(tmpdir(), 'guard-main-')));
  git(main, 'init', '-q', '-b', 'dev');
  git(main, '-c', 'user.email=a@b.c', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'init');
  wt = join(main, '..', `${main.split('/').pop()}-wt`);
  git(main, 'worktree', 'add', '-q', wt, '-b', 'feat/x');
  wt = realpathSync(wt);
  mkdirSync(join(wt, '.claude'), { recursive: true });
  cpSync(CONFIG, join(wt, '.claude/agent-guard.json'));
});
afterAll(() => {
  rmSync(wt, { recursive: true, force: true });
  rmSync(main, { recursive: true, force: true });
});

const AGENT = { AGENT_RUN: '1' };
const edit = (p: string) => ({ tool_name: 'Edit', tool_input: { file_path: join(wt, p) } });

describe('agent-guard hook (process level)', () => {
  it('allows ordinary work for a human session', () => {
    expect(run(edit('.claude/settings.json')).code).toBe(0);
  });

  it('blocks reading secrets even for a human, exit 2 with a reason', () => {
    const r = run({ tool_name: 'Read', tool_input: { file_path: join(wt, '.env.local') } });
    expect(r.code).toBe(2);
    expect(r.stderr).toContain('agent-guard');
  });

  it('blocks protected writes under AGENT_RUN and records each block in state.json', () => {
    const r1 = run(edit('commitlint.config.mjs'), AGENT);
    const r2 = run({ tool_name: 'Bash', tool_input: { command: 'git push' } }, AGENT);
    expect([r1.code, r2.code]).toEqual([2, 2]);
    expect(r1.stderr).toContain('needs_approval');
    const state = JSON.parse(readFileSync(join(wt, '.agent-run/state.json'), 'utf8'));
    expect(state.blocks.map((b: { tool: string; target: string; kind: string }) => [b.tool, b.target, b.kind])).toEqual([
      ['Edit', 'commitlint.config.mjs', 'deny-path'],
      ['Bash', 'git push', 'command'],
    ]);
    expect(run(edit('src/a.ts'), AGENT).code).toBe(0);
  });

  it('honours AGENT_APPROVED', () => {
    expect(run(edit('package.json'), AGENT).code).toBe(2);
    expect(run(edit('package.json'), { ...AGENT, AGENT_APPROVED: '{"paths":["package.json"]}' }).code).toBe(0);
  });

  it('planner may only write its own plan.md', () => {
    const env = { ...AGENT, AGENT_PHASE: 'plan', AGENT_TASK_DIR: 'docs/plan/tasks/todo/01-x' };
    expect(run(edit('docs/plan/tasks/todo/01-x/plan.md'), env).code).toBe(0);
    expect(run(edit('src/a.ts'), env).code).toBe(2);
  });

  it('stops everything when .agent-stop exists in the MAIN repo root (agent runs in a worktree)', () => {
    expect(run(edit('src/a.ts'), AGENT).code).toBe(0);
    writeFileSync(join(main, '.agent-stop'), '');
    try {
      const r = run({ tool_name: 'Read', tool_input: { file_path: join(wt, 'src/a.ts') } }, AGENT);
      expect(r.code).toBe(2);
      expect(r.stderr).toContain('emergency stop');
      expect(run({ tool_name: 'Read', tool_input: { file_path: join(wt, 'src/a.ts') } }).code).toBe(0);
    } finally {
      rmSync(join(main, '.agent-stop'));
    }
  });

  it('fails closed under AGENT_RUN on garbage input, open otherwise', () => {
    const bad = (env: Record<string, string>) =>
      spawnSync(TSX, [HOOK], { cwd: wt, input: 'not json', encoding: 'utf8', env: { PATH: process.env.PATH ?? '', CLAUDE_PROJECT_DIR: wt, ...env } })
        .status;
    expect(bad(AGENT)).toBe(2);
    expect(bad({})).toBe(0);
  });
});

describe('parseApproved', () => {
  it('parses valid JSON and tolerates junk', () => {
    expect(parseApproved('{"paths":["a"],"commands":["b c"]}')).toEqual({ paths: ['a'], commands: ['b c'] });
    expect(parseApproved('{"paths":[1,"a"]}')).toEqual({ paths: ['a'], commands: [] });
    expect(parseApproved('nope')).toEqual({ paths: [], commands: [] });
    expect(parseApproved(undefined)).toEqual({ paths: [], commands: [] });
  });
});
