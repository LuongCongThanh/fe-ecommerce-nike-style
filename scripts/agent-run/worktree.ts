/** Worktree preparation (D9, D43, D44; situations 3, 4, 11). */
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Config, Deps } from './deps';
import { trimLog } from './exec';
import { Stop } from './situations';
import { hasState, updateState } from './state';
import type { Task } from './tasks';

/** `<repo>.worktrees` next to the repo (outside it); override with --worktrees or AGENT_RUN_WORKTREES. */
export const defaultWorktreesDir = (repoRoot: string): string => `${repoRoot.replace(/\/+$/, '')}.worktrees`;

export interface PreparedWorktree {
  worktree: string;
  /** false = existing worktree with state.json: resume (D43) */
  fresh: boolean;
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
    if (dirExists && hasState(worktree)) return { worktree, fresh: false };
    throw new Stop(
      4,
      `Worktree hoặc branch của task ${task.name} đã có mà không có state.json (${worktree}, ${branch}). Không ghi đè: xóa tay hoặc tự làm tiếp.`,
    );
  }

  const fetch = await runner('git', ['fetch', 'origin', 'dev'], { cwd: cfg.repoRoot });
  if (fetch.code !== 0) throw new Stop(11, `git fetch origin dev lỗi (mạng?): ${trimLog(fetch.stderr, 500)}`, fetch.stderr);

  const add = await runner('git', ['worktree', 'add', '-b', branch, worktree, 'origin/dev'], { cwd: cfg.repoRoot });
  if (add.code !== 0) throw new Stop(13, `git worktree add lỗi: ${trimLog(add.stderr, 800)}`, add.stderr);

  const install = await runner('corepack', ['pnpm', 'install', '--frozen-lockfile'], { cwd: worktree });
  if (install.code !== 0)
    throw new Stop(3, `pnpm install trong worktree lỗi: ${trimLog(`${install.stdout}\n${install.stderr}`, 800)}`, install.stderr);

  const example = join(worktree, '.env.example');
  const local = join(worktree, '.env.local');
  if (existsSync(example) && !existsSync(local)) copyFileSync(example, local);

  // State exists from here on, so an interrupted run is resumable instead of "worktree without state" (situation 4).
  updateState(worktree, (s) => {
    s.turnsUsed = 0;
    s.fixAttempts = 0;
    s.resumeCount = 0;
    s.preStartGatesPassed = false;
    s.stage = 'prepared';
    s.branch = branch;
    s.task = task.name;
  });
  return { worktree, fresh: true };
}
