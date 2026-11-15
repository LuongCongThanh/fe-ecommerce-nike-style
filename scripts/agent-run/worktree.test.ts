// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { defaultWorktreesDir, prepareWorktree } from './worktree';
import { Stop } from './situations';
import { fakeRunner, on } from './testkit';
import type { Task } from './tasks';
import { hasState, readState, updateState } from './state';

const dirs: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), 'wt-'));
  dirs.push(d);
  return d;
};
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

const task: Task = { name: '03-product-card', number: '03', status: 'ready-for-agent', blockedBy: [], kind: 'ui', specPath: '' };
const cfg = (worktreesDir: string) => ({ repoRoot: '/repo', worktreesDir });
const addWorktree = on('git worktree add', (args) => {
  const dir = args[args.indexOf('-b') + 2] as string;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '.env.example'), 'A=1\n');
});
const noBranch = on('git rev-parse --verify', { code: 1 });

describe('prepareWorktree (D9, D44, situation 4)', () => {
  it('creates branch + worktree from origin/dev, installs, copies .env.example, inits state', async () => {
    const base = tmp();
    const f = fakeRunner(noBranch, addWorktree);
    const r = await prepareWorktree({ runner: f.runner } as never, cfg(base), task, 'feat/03-product-card');
    expect(r).toEqual({ worktree: join(base, '03-product-card'), fresh: true });
    expect(f.calls).toEqual(
      expect.arrayContaining([
        'git fetch origin dev',
        `git worktree add -b feat/03-product-card ${join(base, '03-product-card')} origin/dev`,
        'corepack pnpm install --frozen-lockfile',
      ]),
    );
    expect(f.calls.indexOf('git fetch origin dev')).toBeLessThan(f.calls.findIndex((c) => c.startsWith('git worktree add')));
    expect(readFileSync(join(r.worktree, '.env.local'), 'utf8')).toBe('A=1\n');
    expect(hasState(r.worktree)).toBe(true);
    expect(readState(r.worktree)).toMatchObject({ turnsUsed: 0, fixAttempts: 0, resumeCount: 0 });
  });
  it('does not overwrite an existing .env.local', async () => {
    const base = tmp();
    const f = fakeRunner(
      noBranch,
      on('git worktree add', (args) => {
        const dir = args[args.indexOf('-b') + 2] as string;
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, '.env.example'), 'A=1\n');
        writeFileSync(join(dir, '.env.local'), 'KEEP\n');
      }),
    );
    const r = await prepareWorktree({ runner: f.runner } as never, cfg(base), task, 'feat/03-product-card');
    expect(readFileSync(join(r.worktree, '.env.local'), 'utf8')).toBe('KEEP\n');
  });
  it('situation 4: directory exists without state.json -> Stop(4), nothing created', async () => {
    const base = tmp();
    mkdirSync(join(base, '03-product-card'));
    const f = fakeRunner(noBranch);
    await expect(prepareWorktree({ runner: f.runner } as never, cfg(base), task, 'feat/x')).rejects.toMatchObject({ situation: 4 });
    expect(f.calls.some((c) => c.startsWith('git worktree add'))).toBe(false);
  });
  it('situation 4: branch exists without worktree', async () => {
    const base = tmp();
    const f = fakeRunner(on('git rev-parse --verify', { code: 0, stdout: 'abc' }));
    await expect(prepareWorktree({ runner: f.runner } as never, cfg(base), task, 'feat/x')).rejects.toBeInstanceOf(Stop);
  });
  it('existing worktree with state.json -> resume (fresh: false), no git changes', async () => {
    const base = tmp();
    const wt = join(base, '03-product-card');
    updateState(wt, (s) => (s.turnsUsed = 12));
    const f = fakeRunner(noBranch);
    const r = await prepareWorktree({ runner: f.runner } as never, cfg(base), task, 'feat/x');
    expect(r).toEqual({ worktree: wt, fresh: false });
    expect(f.calls.some((c) => c.startsWith('git worktree add'))).toBe(false);
  });
  it('install failure -> situation 3', async () => {
    const base = tmp();
    const f = fakeRunner(noBranch, addWorktree, on('corepack pnpm install', { code: 1, stderr: 'ERR_PNPM' }));
    await expect(prepareWorktree({ runner: f.runner } as never, cfg(base), task, 'feat/x')).rejects.toMatchObject({ situation: 3 });
  });
  it('fetch failure -> situation 11 (network)', async () => {
    const base = tmp();
    const f = fakeRunner(noBranch, on('git fetch', { code: 128, stderr: 'could not resolve host' }));
    await expect(prepareWorktree({ runner: f.runner } as never, cfg(base), task, 'feat/x')).rejects.toMatchObject({ situation: 11 });
  });
});

describe('defaultWorktreesDir', () => {
  it('is a sibling of the repo, outside it', () => {
    expect(defaultWorktreesDir('/home/u/fe-ecommerce-nike-style')).toBe('/home/u/fe-ecommerce-nike-style.worktrees');
    expect(existsSync('/nonexistent')).toBe(false);
  });
});
