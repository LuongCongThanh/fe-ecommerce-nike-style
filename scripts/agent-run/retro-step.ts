/** Retro (D26, D43 exception; situation 15): resumes the implementer session with its own turn allowance. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { callClaude, setStage, type RunContext } from './context';
import { REPORT_HEADING, retroNeedPrompt, retroPrompt } from './prompts';
import { retroNeedResult } from './results';
import { retroNeedSchema } from './schemas';
import { SITUATION, Stop } from './situations';
import { markStepDone, readState, updateState } from './state';

export async function retroStep(ctx: RunContext, turns: number): Promise<void> {
  setStage(ctx, 'retro');
  const session = readState(ctx.worktree).implementerSession;
  if (session === undefined) {
    // D26: the retro must look back at the implementer's own session; without it there is nothing to resume.
    throw new Stop(
      SITUATION.other,
      `Không có session implementer nào được ghi lại cho task ${ctx.task.name}, nên không chạy được retro (D26). Kiểm tra ${ctx.worktree}/.agent-run/state.json, rồi chạy retro tay hoặc bỏ qua.`,
    );
  }
  const resp = await callClaude(ctx, { phase: 'retro', resume: session, prompt: retroPrompt(ctx.taskDir, ctx.task.kind), budget: turns });
  if (resp.kind === 'max_turns') {
    // One extra resume (not counted) asks how many more turns are needed.
    const ask = await callClaude(ctx, { phase: 'retro', resume: session, prompt: retroNeedPrompt(), schema: retroNeedSchema, budget: 3 });
    const need = ask.kind === 'ok' ? retroNeedResult(ask.structured) : { turns_needed: 5, reason: `không hỏi được: ${ask.detail}` };
    updateState(ctx.worktree, (s) => {
      s.stage = 'retro-wait';
      s.retro = { turnsNeeded: need.turns_needed, reason: need.reason };
    });
    throw new Stop(
      SITUATION.retroTurns,
      `retro task ${ctx.task.name} cần thêm ${need.turns_needed} lượt: ${need.reason}. Thêm retro-turns: ${need.turns_needed} vào spec rồi đặt lại ready-for-agent.`,
      need.reason,
    );
  }
  markStepDone(ctx.worktree, 'retro');
  const report = join(ctx.taskDir, 'report.md');
  if (!existsSync(report) || !readFileSync(report, 'utf8').includes(REPORT_HEADING)) {
    ctx.deps.log(`retro: ${REPORT_HEADING} missing in report.md (the agent did not append its proposals)`);
  }
}
