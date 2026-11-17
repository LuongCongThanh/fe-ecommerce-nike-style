/** Run context shared by the steps, and `callClaude`: the one place that budgets turns and classifies failures. */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { AgentPhase, ClaudeRequest, ClaudeResponse } from './claude';
import type { Config, Deps } from './deps';
import type { ApprovedList } from './types';
import type { Task } from './tasks';
import { SITUATION, Stop } from './situations';
import { findRepeatedBlock, readState, updateState } from './state';

export interface RunContext {
  deps: Deps;
  cfg: Config;
  task: Task;
  branch: string;
  worktree: string;
  /** Task directory inside the worktree (AGENT_TASK_DIR; plan.md, report.md, metric.md live here) */
  taskDir: string;
  /** Captured at start (D43): edits to spec.md during the run have no effect */
  approved: ApprovedList;
}

export const STOP_FILE = '.agent-stop';

/** Situation 10, checked between every step (D17). The file lives in the main checkout. */
export function checkStopFile(cfg: Config): void {
  if (existsSync(join(cfg.repoRoot, STOP_FILE)))
    throw new Stop(SITUATION.stopFile, 'Đã thấy .agent-stop. Xóa file rồi chạy lại agent-run để chạy tiếp.');
}

export function agentEnv(ctx: RunContext, phase: AgentPhase): Record<string, string> {
  return {
    AGENT_RUN: '1',
    AGENT_PHASE: phase,
    AGENT_TASK_DIR: ctx.taskDir,
    AGENT_APPROVED: JSON.stringify({ paths: ctx.approved.paths, commands: ctx.approved.commands }),
  };
}

export interface CallOptions {
  phase: AgentPhase;
  prompt: string;
  agent?: string;
  resume?: string;
  schema?: object;
  /** 'task' = counts against the D15 budget; a number = its own allowance (retro, PR body), not counted */
  budget: 'task' | number;
  extraTools?: string[];
}

export function turnsLeft(ctx: RunContext): number {
  return ctx.cfg.turnBudget - (readState(ctx.worktree).turnsUsed ?? 0);
}

function budgetStop(ctx: RunContext, stage: string): Stop {
  const used = readState(ctx.worktree).turnsUsed ?? 0;
  return new Stop(
    SITUATION.turnBudget,
    `Chạm ${ctx.cfg.turnBudget} lượt (đã dùng ${used}) ở bước ${stage}. Xem diff trong ${ctx.worktree}, tăng việc nhỏ lại hoặc tự làm tiếp, rồi đặt lại ready-for-agent.`,
  );
}

/**
 * One `claude -p` call. Task-budget calls get the remaining turns as --max-turns and add their `num_turns`
 * to state.json. Returns the response for ok, and also for max_turns when the call has its own allowance
 * (the caller decides what that means: retro -> situation 15).
 */
export async function callClaude(ctx: RunContext, opts: CallOptions): Promise<ClaudeResponse> {
  checkStopFile(ctx.cfg);
  const stage = readState(ctx.worktree).stage ?? opts.phase;
  let maxTurns: number;
  if (opts.budget === 'task') {
    maxTurns = turnsLeft(ctx);
    if (maxTurns < (opts.schema ? 2 : 1)) throw budgetStop(ctx, stage);
  } else maxTurns = opts.budget;

  const req: ClaudeRequest = {
    cwd: ctx.worktree,
    prompt: opts.prompt,
    phase: opts.phase,
    agent: opts.agent,
    resume: opts.resume,
    schema: opts.schema,
    maxTurns,
    env: agentEnv(ctx, opts.phase),
    extraTools: opts.extraTools,
  };
  const resp = await ctx.deps.claude(req);
  if (resp.usage) {
    const { input, cached, output } = resp.usage;
    updateState(ctx.worktree, (s) => {
      const total = s.codexUsage ?? { input: 0, cached: 0, output: 0 };
      s.codexUsage = { input: total.input + input, cached: total.cached + cached, output: total.output + output };
    });
  }
  if (opts.budget === 'task') updateState(ctx.worktree, (s) => (s.turnsUsed = (s.turnsUsed ?? 0) + resp.numTurns));
  checkStopFile(ctx.cfg);

  const repeated = findRepeatedBlock(readState(ctx.worktree));
  if (repeated) {
    throw new Stop(
      SITUATION.repeatedBlock,
      `Hook chặn ${repeated.tool} -> ${repeated.target} ${repeated.count} lần. Quyết định: duyệt trong approved: của spec hoặc sửa spec/plan, rồi đặt lại ready-for-agent.`,
    );
  }
  if (resp.kind === 'crash')
    throw new Stop(
      SITUATION.claudeFailed,
      `${ctx.cfg.provider ?? 'claude'} lỗi (hạn mức, mạng hoặc crash): ${resp.detail}. Worktree giữ nguyên ở ${ctx.worktree}; kiểm tra rồi chạy lại.`,
      resp.detail,
    );
  if (resp.kind === 'bad_output')
    throw new Stop(SITUATION.other, `${ctx.cfg.provider ?? 'claude'} không trả JSON đúng schema: ${resp.detail}`, resp.detail);
  if (resp.kind === 'max_turns' && opts.budget === 'task') throw budgetStop(ctx, stage);
  return resp;
}

export function setStage(ctx: RunContext, stage: string): void {
  updateState(ctx.worktree, (s) => (s.stage = stage));
}
