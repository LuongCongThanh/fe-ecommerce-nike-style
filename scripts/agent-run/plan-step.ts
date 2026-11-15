/** Planner step (situations 5, 6). */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { formatTime } from './report';
import { callClaude, setStage, type RunContext } from './context';
import { plannerPrompt } from './prompts';
import { plannerResult } from './results';
import { plannerSchema } from './schemas';
import { appendQuestions } from './spec-file';
import { SITUATION, Stop } from './situations';

/** Questions go to the MAIN checkout spec: that is where the human answers (D43). */
export function writeQuestions(ctx: RunContext, questions: string[], who: string): void {
  const file = ctx.task.specPath;
  writeFileSync(file, appendQuestions(readFileSync(file, 'utf8'), questions, formatTime(ctx.deps.now()), who));
}

export async function planStep(ctx: RunContext): Promise<void> {
  const planFile = join(ctx.taskDir, 'plan.md');
  if (existsSync(planFile)) return; // resumed run: plan.md is already there (D43)
  setStage(ctx, 'planning');
  const resp = await callClaude(ctx, { phase: 'plan', agent: 'planner', prompt: plannerPrompt(ctx.taskDir), schema: plannerSchema, budget: 'task' });
  const r = plannerResult(resp.structured);
  if (r.result === 'need_info') {
    writeQuestions(ctx, r.questions?.length ? r.questions : [r.reason], 'planner');
    throw new Stop(
      SITUATION.needInfo,
      `Planner hỏi ${r.questions?.length ?? 1} câu trong spec ${ctx.task.name}. Trả lời rồi đặt lại ready-for-agent.`,
      r.reason,
    );
  }
  if (r.result === 'blocked') {
    if (r.reason.startsWith('needs_approval')) {
      throw new Stop(
        SITUATION.needsApproval,
        `Plan cần quyền chưa duyệt: ${r.reason}. Thêm approved: (files/commands) vào spec ${ctx.task.name} rồi đặt lại ready-for-agent.`,
        r.reason,
      );
    }
    throw new Stop(SITUATION.other, `Planner báo blocked: ${r.reason}`, r.reason);
  }
  if (!existsSync(planFile)) throw new Stop(SITUATION.other, 'Planner trả ok nhưng không có plan.md trong thư mục task.');
}
