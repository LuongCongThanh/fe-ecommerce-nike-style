/**
 * Preflight (situation 13): the guard hook must really block. If `tsx` is missing the hook crashes with
 * a non-2 exit code and Claude Code treats that as "not blocked", so agents would run unguarded.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Deps } from './deps';
import { SITUATION, Stop } from './situations';
import { updateState } from './state';

export async function guardPreflight(deps: Pick<Deps, 'runner'>, worktree: string, taskDir: string): Promise<void> {
  const tsx = join(worktree, 'node_modules', '.bin', 'tsx');
  if (!existsSync(tsx)) throw new Stop(SITUATION.other, `Thiếu ${tsx}: hook agent-guard sẽ không chạy. Chạy corepack pnpm install trong worktree.`);
  const event = JSON.stringify({
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: join(worktree, 'pnpm-lock.yaml') },
    cwd: worktree,
  });
  const r = await deps.runner(tsx, [join(worktree, '.claude/hooks/agent-guard.ts')], {
    cwd: worktree,
    input: event,
    env: {
      ...process.env,
      AGENT_RUN: '1',
      AGENT_PHASE: 'implement',
      AGENT_TASK_DIR: taskDir,
      AGENT_APPROVED: '{"paths":[],"commands":[]}',
      CLAUDE_PROJECT_DIR: worktree,
    },
    timeoutMs: 30_000,
  });
  // The probe is itself a blocked call: do not let it count towards situation 9.
  updateState(worktree, (s) => {
    s.blocks = [];
  });
  if (r.code !== 2) {
    throw new Stop(
      SITUATION.other,
      `Preflight: hook agent-guard không chặn file bị cấm (exit ${r.code}, mong đợi 2). Không giao việc cho agent. ${r.stderr.trim().slice(0, 300)}`,
      r.stderr,
    );
  }
}
