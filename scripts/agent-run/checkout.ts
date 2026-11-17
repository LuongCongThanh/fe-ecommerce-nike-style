/** Checkout preparation (D9, D43, D44; situations 3, 4, 11). */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { Config, Deps } from './deps';
import { trimLog } from './exec';
import { SITUATION, Stop } from './situations';
import { hasState, readState, updateState, writeState } from './state';
import { TASKS_DIR, type Task } from './tasks';

export interface PreparedCheckout {
  worktree: string;
  /** false = existing worktree with state.json: resume (D43) */
  fresh: boolean;
  /** An earlier run switched branches but died before the install finished; setup was completed now. Not a human-answered resume. */
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

export async function prepareCheckout(
  deps: Pick<Deps, 'runner'>,
  cfg: Pick<Config, 'repoRoot'>,
  task: Task,
  branch: string,
  spec: string,
): Promise<PreparedCheckout> {
  const worktree = cfg.repoRoot;
  const { runner } = deps;
  const git = (args: string[]) => runner('git', args, { cwd: worktree });
  const blocked = (message: string): never => {
    throw new Stop(SITUATION.workspaceBusy, message);
  };
  const current = await git(['branch', '--show-current']);
  if (current.code !== 0 || !current.stdout.trim()) blocked('Checkout phải ở trên một branch trước khi chạy task.');
  const state = hasState(worktree) ? readState(worktree) : null;
  if (state && (!state.task || !state.branch)) blocked('state.json thiếu thông tin task hoặc branch. Kiểm tra trạng thái local trước khi chạy.');

  if (state && state.stage !== 'done') {
    if (state.task !== task.name) blocked(`Checkout đang giữ task ${state.task}. Tiếp tục task đó trước khi chạy ${task.name}.`);
    if (state.branch !== branch || current.stdout.trim() !== branch) blocked(`Chuyển về branch ${state.branch} để tiếp tục ${task.name}.`);
    const supported = await git(['cat-file', '-e', 'HEAD:scripts/agent-run/checkout.ts']);
    if (supported.code !== 0) blocked('Branch task chưa có runner dùng checkout hiện tại.');
    if (state.installPending !== true) return { worktree, fresh: false };
    await installDeps(runner, worktree);
    return { worktree, fresh: false, recoveredSetup: true };
  }

  const status = await git(['status', '--porcelain', '--untracked-files=all']);
  if (status.code !== 0 || status.stdout.trim()) blocked('Checkout còn thay đổi. Commit hoặc tự cất thay đổi trước khi bắt đầu task mới.');

  const branchCheck = await git(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`]);
  if (branchCheck.code !== 1) blocked(`Branch ${branch} đã tồn tại. Kiểm tra công việc cũ trên branch trước khi bắt đầu task mới.`);

  const fetch = await git(['fetch', 'origin', 'dev']);
  if (fetch.code !== 0) throw new Stop(SITUATION.claudeFailed, `git fetch origin dev lỗi: ${trimLog(fetch.stderr, 500)}`, fetch.stderr);

  // A checkout of an older dev would bring back the old gate that creates a Git worktree.
  const supported = await git(['cat-file', '-e', 'origin/dev:scripts/agent-run/checkout.ts']);
  if (supported.code !== 0) blocked('origin/dev chưa có runner dùng checkout hiện tại. Cập nhật dev trước khi chạy task mới.');

  const checkout = await git(['switch', '--no-overwrite-ignore', '-c', branch, 'origin/dev']);
  if (checkout.code !== 0) throw new Stop(SITUATION.other, `Không thể chuyển branch task: ${trimLog(checkout.stderr, 800)}`, checkout.stderr);

  // Start with new state so no step or session from the previous task is reused.
  writeState(worktree, {
    blocks: [],
    turnsUsed: 0,
    fixAttempts: 0,
    resumeCount: 0,
    preStartGatesPassed: false,
    installPending: true,
    stage: 'created',
    branch,
    task: task.name,
    startedAt: new Date().toISOString(),
  });
  const specFile = join(worktree, TASKS_DIR, task.name, 'spec.md');
  mkdirSync(dirname(specFile), { recursive: true });
  writeFileSync(specFile, spec);
  await installDeps(runner, worktree);
  return { worktree, fresh: true };
}
