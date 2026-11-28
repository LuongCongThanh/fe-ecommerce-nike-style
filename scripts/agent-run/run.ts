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
import { SITUATION, Stop, type SituationNumber } from './situations';
import { parseFrontmatter } from './spec';
import { parseApproved } from './spec-file';
import { isStepDone, markStepDone, readState, updateState, type StepName } from './state';
import { acquireRunLock } from './run-lock';
import { wantsHandoff, writeHandoff } from './handoff-step';
import { branchFor, readTasks, recordTaskPr, selectTask, TASKS_DIR } from './tasks';
import { trimLog } from './exec';
import { prepareCheckout } from './checkout';
import type { ReviewFinding } from './schemas';

export type RunOutcome =
  | { kind: 'pr'; task: string; url: string }
  | { kind: 'stopped'; task: string | null; situation: SituationNumber; action: string }
  /** Another agent-run holds the one-task-at-a-time lock (D15); nothing was touched */
  | { kind: 'locked'; pid: number; task: string | null };

interface Track {
  task: string | null;
  worktree: string | null;
  ctx: RunContext | null;
  setLockTask: (task: string) => void;
}

async function preStartGates(ctx: RunContext): Promise<void> {
  if (readState(ctx.worktree).preStartGatesPassed === true) return;
  const args = ['exec', 'tsx', 'scripts/verify-gates.ts', '--worktree', ctx.worktree, '--with-build'];
  const r = await ctx.deps.runner('pnpm', args, { cwd: ctx.worktree, timeoutMs: 40 * 60_000 });
  if (r.code !== 0) {
    throw new Stop(
      SITUATION.preStart,
      `Gate đỏ trước khi agent bắt đầu (dev đỏ hoặc build cần env thật): ${trimLog(`${r.stdout}\n${r.stderr}`, 600)}. Sửa dev rồi chạy lại.`,
      r.stdout,
    );
  }
  updateState(ctx.worktree, (s) => (s.preStartGatesPassed = true));
}

/** D43 bookkeeping for a worktree that already has state.json. Returns true when only the retro is left. */
function beginResume(ctx: RunContext, countAsResume: boolean): { retroOnly: boolean } {
  const state = readState(ctx.worktree);
  if (state.stage === 'retro-wait') return { retroOnly: true };
  const wasStopFile = state.lastStop?.situation === SITUATION.stopFile;
  updateState(ctx.worktree, (s) => {
    if (countAsResume && !wasStopFile) s.resumeCount = (s.resumeCount ?? 0) + 1;
    s.turnsUsed = 0; // 40 fresh turns
    s.fixAttempts = 0;
    s.blocks = [];
    delete s.lastStop;
  });
  return { retroOnly: false };
}

/** Runs `body` unless `step` is already recorded in state.json (resume), then records it. */
async function once(ctx: RunContext, step: StepName, body: () => Promise<void>): Promise<void> {
  if (!isStepDone(ctx.worktree, step)) {
    await body();
    markStepDone(ctx.worktree, step);
  }
  checkStopFile(ctx.cfg);
}

async function runTask(deps: Deps, cfg: Config, track: Track): Promise<string> {
  checkStopFile(cfg);
  const state = readState(cfg.repoRoot);
  if (state.stage === 'done' && state.task && state.prUrl) recordTaskPr(cfg.repoRoot, state.task, state.prUrl);
  const selection = selectTask(readTasks(cfg.repoRoot), cfg.only);
  for (const s of selection.skipped) deps.log(`situation 2: skip ${s.name}, waiting for ${s.waitingFor.join(', ')}`);
  const task = selection.task;
  if (!task)
    throw new Stop(
      SITUATION.noTask,
      cfg.only
        ? `Task ${cfg.only} không ở trạng thái ready-for-agent hoặc còn blocked-by.`
        : 'Không có task ready-for-agent. Đặt trạng thái cho một task trong docs/plan/tasks/todo.',
    );
  track.task = task.name;
  track.setLockTask(task.name);
  const spec = readFileSync(task.specPath, 'utf8');
  const approved = parseApproved(spec);
  const branch = branchFor(task);
  const prep = await prepareCheckout(deps, cfg, task, branch, spec);
  const previous = readState(prep.worktree);
  const provider = cfg.provider ?? 'claude';
  const previousProvider = previous.provider ?? (previous.implementerSession || previous.completedSteps?.length ? 'claude' : undefined);
  if (previousProvider && previousProvider !== provider)
    throw new Stop(SITUATION.workspaceBusy, `Task ${task.name} đang dùng ${previousProvider}. Chạy lại với --provider ${previousProvider}.`);
  track.worktree = prep.worktree;
  const ctx: RunContext = { deps, cfg, task, branch, worktree: prep.worktree, taskDir: join(prep.worktree, TASKS_DIR, task.name), approved };
  track.ctx = ctx;
  setTaskStatus(cfg.repoRoot, task.name, 'in-progress');
  if (provider === 'codex') {
    if (!deps.codexPreflight) throw new Stop(SITUATION.other, 'Thiếu kiểm tra hook Codex.');
    await deps.codexPreflight(ctx.worktree, ctx.taskDir);
  } else await guardPreflight(deps, ctx.worktree, ctx.taskDir);
  updateState(prep.worktree, (s) => (s.provider = provider));

  const resume = prep.fresh ? { retroOnly: false } : beginResume(ctx, prep.recoveredSetup !== true);
  let minor: ReviewFinding[] = [];
  let bundleNote = '';

  if (resume.retroOnly) {
    // D43 exception: the human granted retro-turns; resume the old session, then commit and open the PR.
    const turns = Number(parseFrontmatter(readFileSync(task.specPath, 'utf8'))['retro-turns']);
    if (!(turns > 0))
      throw new Stop(SITUATION.retroTurns, `Task ${task.name} đang chờ retro-turns: thêm retro-turns: X vào spec rồi đặt lại ready-for-agent.`);
    const saved = readState(ctx.worktree);
    minor = saved.minorFindings ?? [];
    bundleNote = saved.bundleNote ?? '';
    await retroStep(ctx, turns);
  } else {
    // Each step is skipped when state.json already records it as done, so a resume continues where the run stopped.
    await preStartGates(ctx);
    checkStopFile(cfg);
    await once(ctx, 'plan', () => planStep(ctx));
    await once(ctx, 'implement', () => implementStep(ctx, !prep.fresh));
    await once(ctx, 'gates', async () => {
      const note = await verifyAndFix(ctx);
      updateState(ctx.worktree, (s) => (s.bundleNote = note));
    });
    await once(ctx, 'review', async () => {
      const ui = await uiCheck(ctx);
      checkStopFile(cfg);
      const review = await reviewStep(ctx, ui);
      updateState(ctx.worktree, (s) => {
        s.minorFindings = review.minor;
        s.bundleNote = review.bundleNote ?? s.bundleNote ?? '';
      });
    });
    const saved = readState(ctx.worktree);
    minor = saved.minorFindings ?? [];
    bundleNote = saved.bundleNote ?? '';
    await once(ctx, 'retro', () => retroStep(ctx, cfg.retroTurns));
  }
  checkStopFile(cfg);
  return finishStep(ctx, { minor, bundleNote });
}

export async function runAgent(deps: Deps, cfg: Config): Promise<RunOutcome> {
  const lock = acquireRunLock(cfg.repoRoot, deps.processes, deps.now());
  if (!lock.ok) {
    deps.log(
      `agent-run đang chạy (pid ${lock.pid}, task ${lock.task ?? 'chưa chọn'}): mỗi lúc chỉ chạy 1 task (D15). Đợi nó xong, hoặc xóa .agent-run/run.lock nếu tiến trình đã chết.`,
    );
    return { kind: 'locked', pid: lock.pid, task: lock.task };
  }
  const track: Track = { task: null, worktree: null, ctx: null, setLockTask: lock.setTask };
  try {
    const url = await runTask(deps, cfg, track);
    if (track.task) {
      recordTaskPr(cfg.repoRoot, track.task, url);
      setTaskStatus(cfg.repoRoot, track.task, 'review');
    }
    deps.notify(`agent-run: ${track.task} xong`, `PR đã mở: ${url}`);
    deps.log(`PR: ${url}`);
    return { kind: 'pr', task: track.task ?? '', url };
  } catch (error) {
    const stop =
      error instanceof Stop
        ? error
        : new Stop(SITUATION.other, `Lỗi không xử lý được: ${error instanceof Error ? error.message : String(error)}`, String(error));
    reportStop(
      {
        repoRoot: cfg.repoRoot,
        taskName: track.task,
        preserveStatus: !track.worktree,
        worktree: track.worktree,
        now: deps.now(),
        notify: deps.notify,
      },
      stop,
    );
    deps.log(`stop (situation ${stop.situation}): ${stop.action}${stop.detail ? `\n${stop.detail}` : ''}`);
    // Skill table: situations 7 and 8 leave a handoff.md; best effort, after the human has been told.
    if (track.ctx && wantsHandoff(stop.situation)) await writeHandoff(track.ctx);
    return { kind: 'stopped', task: track.task, situation: stop.situation, action: stop.action };
  } finally {
    lock.release();
  }
}
