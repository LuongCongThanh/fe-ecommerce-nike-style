/** Handoff (skill table, situations 7 and 8): the implementer session writes down where it stopped. Never throws. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { agentEnv, type RunContext } from './context';
import { handoffPrompt } from './prompts';
import { SITUATION, type SituationNumber } from './situations';
import { readState } from './state';

export const HANDOFF_FILE = 'handoff.md';
const HANDOFF_TURNS = 3;
const HANDOFF_SITUATIONS: readonly SituationNumber[] = [SITUATION.gatesRed, SITUATION.turnBudget];

export const wantsHandoff = (situation: SituationNumber): boolean => HANDOFF_SITUATIONS.includes(situation);

/**
 * Resumes the implementer session with a small allowance that is not counted against the task budget and
 * writes the reply to `<taskDir>/handoff.md`. A failure is only logged: it must never hide the original stop.
 */
export async function writeHandoff(ctx: RunContext): Promise<void> {
  try {
    const session = readState(ctx.worktree).implementerSession;
    if (session === undefined) return;
    const resp = await ctx.deps.claude({
      cwd: ctx.worktree,
      prompt: handoffPrompt(ctx.taskDir),
      phase: 'retro',
      resume: session,
      maxTurns: HANDOFF_TURNS,
      env: agentEnv(ctx, 'retro'),
    });
    const text = resp.result?.trim();
    if (resp.kind !== 'ok' || !text) {
      ctx.deps.log(`handoff: no document written (${resp.kind}${resp.detail ? `: ${resp.detail}` : ''})`);
      return;
    }
    mkdirSync(ctx.taskDir, { recursive: true });
    writeFileSync(join(ctx.taskDir, HANDOFF_FILE), `${text}\n`);
    ctx.deps.log(`handoff written: ${join(ctx.taskDir, HANDOFF_FILE)}`);
  } catch (error) {
    ctx.deps.log(`handoff failed (the original stop stands): ${error instanceof Error ? error.message : String(error)}`);
  }
}
