/** Worktree preparation (D9, D43, D44; situations 3, 4, 11). */
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Config, Deps } from './deps';
import { trimLog } from './exec';
import { SITUATION, Stop } from './situations';
import { hasState, readState, updateState } from './state';
import type { Task } from './tasks';

/** `<repo>.worktrees` next to the repo (outside it); override with --worktrees or AGENT_RUN_WORKTREES. */
export const defaultWorktreesDir = (repoRoot: string): string => `${repoRoot.replace(/\/+$/, '')}.worktrees`;

export interface PreparedWorktree {
  worktree: string;
  /** false = existing worktree with state.json: resume (D43) */
  fresh: boolean;
  /** An earlier run created the worktree but died before the install finished; setup was completed now. Not a human-answered resume. */
  recoveredSetup?: boolean;
}

/** `pnpm install` + `.env.local`; clears `installPending` so an interrupted setup is retried on resume. */
async function installDeps(runner: Deps['runner'], worktree: string): Promise<void> {
  const install = await runner('corepack', ['pnpm', 'install', '--frozen-lockfile'], { cwd: worktree });
  if (install.code !== 0)
    throw new Stop(SITUATION.preStart, `pnpm install trong worktree lỗi: ${trimLog(`${install.stdout}\n${install.stderr}`, 800)}`, install.stderr);

  const example = join(worktree, '.env.example');
  const local = join(worktree, '.env.local');
  if (existsSync(example) && !existsSync(local)) copyFileSync(example, local);
  updateState(worktree, (s) => {
    s.installPending = false;
    s.stage = 'prepared';
  });
}

export async function prepareWorktree(
  deps: Pick<Deps, 'runner'>,
  cfg: Pick<Config, 'repoRoot' | 'worktreesDir'>,
  task: Task,
  branch: string,
): Promise<PreparedWorktree> {
  const worktree = join(cfg.worktreesDir, task.name);
  const { runner } = deps;
  const branchExists = (await runner('git', ['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`], { cwd: cfg.repoRoot })).code === 0;
  const dirExists = existsSync(worktree);

  if (dirExists || branchExists) {
    if (dirExists && hasState(worktree)) {
      if (readState(worktree).installPending !== true) return { worktree, fresh: false };
      await installDeps(runner, worktree);
      return { worktree, fresh: false, recoveredSetup: true };
    }
    throw new Stop(
      SITUATION.worktreeExists,
      `Worktree hoặc branch của task ${task.name} đã có mà không có state.json (${worktree}, ${branch}). Không ghi đè: xóa tay hoặc tự làm tiếp.`,
    );
  }

  const fetch = await runner('git', ['fetch', 'origin', 'dev'], { cwd: cfg.repoRoot });
  if (fetch.code !== 0) throw new Stop(SITUATION.claudeFailed, `git fetch origin dev lỗi (mạng?): ${trimLog(fetch.stderr, 500)}`, fetch.stderr);

  const add = await runner('git', ['worktree', 'add', '-b', branch, worktree, 'origin/dev'], { cwd: cfg.repoRoot });
  if (add.code !== 0) throw new Stop(SITUATION.other, `git worktree add lỗi: ${trimLog(add.stderr, 800)}`, add.stderr);

  // State exists from here on (before the slow install), so an interrupted run resumes instead of hitting situation 4.
  updateState(worktree, (s) => {
    s.turnsUsed = 0;
    s.fixAttempts = 0;
    s.resumeCount = 0;
    s.preStartGatesPassed = false;
    s.installPending = true;
    s.stage = 'created';
    s.branch = branch;
    s.task = task.name;
  });
  await installDeps(runner, worktree);
  return { worktree, fresh: true };
}
