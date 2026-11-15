/** The flow: one task from selection to PR, or to a reported stop (D18). Every situation of D21 ends here or in a step. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { checkStopFile, type RunContext } from './context';
import type { Config, Deps } from './deps';
import { finishStep } from './finish-step';
import { implementStep, reviewStep, uiCheck, verifyAndFix } from './implement-step';
import { planStep } from './plan-step';
import { guardPreflight } from './preflight';
import { reportStop, setTaskStatus } from './report';
import { retroStep } from './retro-step';
import { Stop } from './situations';
import { parseFrontmatter } from './spec';
import { parseApproved } from './spec-file';
import { readState, updateState } from './state';
import { branchFor, readTasks, selectTask, TASKS_DIR } from './tasks';
import { syncSpec } from './finish-step';
import { trimLog } from './exec';
import { prepareWorktree } from './worktree';
import type { ReviewFinding } from './schemas';

export type RunOutcome = { kind: 'pr'; task: string; url: string } | { kind: 'stopped'; task: string | null; situation: number; action: string };

async function preStartGates(ctx: RunContext): Promise<void> {
  if (readState(ctx.worktree).preStartGatesPassed === true) return;
  const args = ['exec', 'tsx', 'scripts/verify-gates.ts', '--worktree', ctx.worktree, '--with-build'];
  const r = await ctx.deps.runner('pnpm', args, { cwd: ctx.worktree, timeoutMs: 40 * 60_000 });
  if (r.code !== 0) {
    throw new Stop(
      3,
      `Gate đỏ trước khi agent bắt đầu (dev đỏ hoặc build cần env thật): ${trimLog(`${r.stdout}\n${r.stderr}`, 600)}. Sửa dev rồi chạy lại.`,
      r.stdout,
    );
  }
  updateState(ctx.worktree, (s) => (s.preStartGatesPassed = true));
}

/** D43 bookkeeping for a worktree that already has state.json. Returns true when only the retro is left. */
function beginResume(ctx: RunContext): { retroOnly: boolean } {
  const state = readState(ctx.worktree);
  if (state.stage === 'retro-wait') return { retroOnly: true };
  const lastStop = state.lastStop as { situation?: number } | undefined;
  updateState(ctx.worktree, (s) => {
    if (lastStop?.situation !== 10) s.resumeCount = Number(s.resumeCount ?? 0) + 1;
    s.turnsUsed = 0; // 40 fresh turns
    s.fixAttempts = 0;
    s.blocks = [];
    delete s.lastStop;
  });
  return { retroOnly: false };
}

async function runTask(deps: Deps, cfg: Config, track: { task: string | null; worktree: string | null }): Promise<string> {
  checkStopFile(cfg);
  const selection = selectTask(readTasks(cfg.repoRoot), cfg.only);
  for (const s of selection.skipped) deps.log(`situation 2: skip ${s.name}, waiting for ${s.waitingFor.join(', ')}`);
  const task = selection.task;
  if (!task)
    throw new Stop(
      1,
      cfg.only
        ? `Task ${cfg.only} không ở trạng thái ready-for-agent hoặc còn blocked-by.`
        : 'Không có task ready-for-agent. Đặt trạng thái cho một task trong docs/plan/tasks.',
    );
  track.task = task.name;
  const approved = parseApproved(readFileSync(task.specPath, 'utf8'));
  setTaskStatus(cfg.repoRoot, task.name, 'in-progress');

  const branch = branchFor(task);
  const prep = await prepareWorktree(deps, cfg, task, branch);
  track.worktree = prep.worktree;
  const ctx: RunContext = { deps, cfg, task, branch, worktree: prep.worktree, taskDir: join(prep.worktree, TASKS_DIR, task.name), approved };
  syncSpec(ctx);
  await guardPreflight(deps, ctx.worktree, ctx.taskDir);

  const resume = prep.fresh ? { retroOnly: false } : beginResume(ctx);
  let minor: ReviewFinding[] = [];
  let bundleNote = '';

  if (resume.retroOnly) {
    // D43 exception: the human granted retro-turns; resume the old session, then commit and open the PR.
    const turns = Number(parseFrontmatter(readFileSync(task.specPath, 'utf8'))['retro-turns']);
    if (!(turns > 0)) throw new Stop(15, `Task ${task.name} đang chờ retro-turns: thêm retro-turns: X vào spec rồi đặt lại ready-for-agent.`);
    const saved = readState(ctx.worktree);
    minor = (saved.minorFindings as ReviewFinding[] | undefined) ?? [];
    bundleNote = typeof saved.bundleNote === 'string' ? saved.bundleNote : '';
    await retroStep(ctx, turns);
  } else {
    await preStartGates(ctx);
    checkStopFile(cfg);
    await planStep(ctx);
    checkStopFile(cfg);
    await implementStep(ctx, !prep.fresh);
    checkStopFile(cfg);
    bundleNote = await verifyAndFix(ctx);
    checkStopFile(cfg);
    const ui = await uiCheck(ctx);
    checkStopFile(cfg);
    const review = await reviewStep(ctx, ui);
    minor = review.minor;
    bundleNote = review.bundleNote ?? bundleNote;
    updateState(ctx.worktree, (s) => {
      s.minorFindings = minor;
      s.bundleNote = bundleNote;
    });
    checkStopFile(cfg);
    await retroStep(ctx, cfg.retroTurns);
  }
  checkStopFile(cfg);
  return finishStep(ctx, { minor, bundleNote });
}

export async function runAgent(deps: Deps, cfg: Config): Promise<RunOutcome> {
  const track: { task: string | null; worktree: string | null } = { task: null, worktree: null };
  try {
    const url = await runTask(deps, cfg, track);
    if (track.task) {
      const pr = /(\d+)$/.exec(url)?.[1];
      setTaskStatus(cfg.repoRoot, track.task, 'review', pr ? { pr: `#${pr}` } : {});
    }
    deps.notify(`agent-run: ${track.task} xong`, `PR đã mở: ${url}`);
    deps.log(`PR: ${url}`);
    return { kind: 'pr', task: track.task ?? '', url };
  } catch (error) {
    const stop =
      error instanceof Stop ? error : new Stop(13, `Lỗi không xử lý được: ${error instanceof Error ? error.message : String(error)}`, String(error));
    reportStop({ repoRoot: cfg.repoRoot, taskName: track.task, worktree: track.worktree, now: deps.now(), notify: deps.notify }, stop);
    deps.log(`stop (situation ${stop.situation}): ${stop.action}${stop.detail ? `\n${stop.detail}` : ''}`);
    return { kind: 'stopped', task: track.task, situation: stop.situation, action: stop.action };
  }
}
