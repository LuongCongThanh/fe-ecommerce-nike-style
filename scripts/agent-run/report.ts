/** Every stop (D18, D22, D23): status in spec.md, one inbox line, desktop notification. Main checkout only. */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { setField } from './spec-file';
import { SITUATIONS, type Stop, type TaskStatus } from './situations';
import { hasState, readState, updateState } from './state';
import { TASKS_DIR } from './tasks';

export const INBOX_FILE = 'docs/plan/AGENT-INBOX.md';
const specFile = (repoRoot: string, taskName: string) => join(repoRoot, TASKS_DIR, taskName, 'spec.md');

export function setTaskStatus(repoRoot: string, taskName: string, status: TaskStatus, extra: Record<string, string> = {}): void {
  const file = specFile(repoRoot, taskName);
  if (!existsSync(file)) return;
  let text = setField(readFileSync(file, 'utf8'), 'status', status);
  for (const [k, v] of Object.entries(extra)) text = setField(text, k, v);
  writeFileSync(file, text);
}

const cell = (s: string) => s.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
const stamp = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const formatTime = stamp;

export function appendInbox(repoRoot: string, when: Date, task: string | null, situation: number, action: string): void {
  const file = join(repoRoot, INBOX_FILE);
  const prefix = existsSync(file) && !readFileSync(file, 'utf8').endsWith('\n') ? '\n' : '';
  appendFileSync(file, `${prefix}| ${stamp(when)} | ${task ?? '-'} | ${situation} | ${cell(action)} |\n`);
}

export interface StopContext {
  repoRoot: string;
  taskName: string | null;
  worktree: string | null;
  now: Date;
  notify: (title: string, body: string) => void;
}

const EXEMPT_FROM_HUMAN_HANDOFF = new Set([10, 15]);

export function reportStop(ctx: StopContext, stop: Stop): void {
  const info = SITUATIONS[stop.situation] ?? SITUATIONS[13]!;
  let status = info.status;
  const resumes = ctx.worktree && hasState(ctx.worktree) ? Number(readState(ctx.worktree).resumeCount ?? 0) : 0;
  if ((status === 'needs-info' || status === 'blocked') && resumes >= 2 && !EXEMPT_FROM_HUMAN_HANDOFF.has(stop.situation)) status = 'ready-for-human';
  if (ctx.taskName && status) setTaskStatus(ctx.repoRoot, ctx.taskName, status);
  if (ctx.worktree && hasState(ctx.worktree)) {
    updateState(ctx.worktree, (s) => {
      s.lastStop = { situation: stop.situation, at: ctx.now.toISOString(), action: stop.action };
    });
  }
  if (!info.notifyHuman) return;
  appendInbox(ctx.repoRoot, ctx.now, ctx.taskName, stop.situation, stop.action);
  ctx.notify(`agent-run: ${ctx.taskName ?? 'no task'} (tình huống ${stop.situation})`, stop.action);
}
