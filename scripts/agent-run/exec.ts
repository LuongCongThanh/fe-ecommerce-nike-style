/**
 * Command runner shared by verify-gates, the Stop hook and (step 7) agent-run.
 * Always injected so tests use fakes; `realRunner` is the only place that spawns processes.
 */
import { spawn, type ChildProcess } from 'node:child_process';

export interface RunOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  /** Written to the child's stdin (hooks read their JSON event from it) */
  input?: string;
}

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

export type Runner = (cmd: string, args: string[], opts: RunOptions) => Promise<RunResult>;

/** SIGKILL the child's whole process group (it was spawned detached, so pid === pgid); falls back to the child alone. */
function killTree(child: ChildProcess): void {
  try {
    if (child.pid !== undefined) process.kill(-child.pid, 'SIGKILL');
    else child.kill('SIGKILL');
  } catch {
    // the group is already gone (ESRCH); nothing left to kill
  }
}

/** Process groups of the commands currently running through `realRunner` (pid === pgid, spawned detached). */
const liveGroups = new Set<number>();

export const trackedGroups = (): number[] => [...liveGroups];

export interface TerminateOptions {
  /** How long a group gets after SIGTERM before SIGKILL */
  graceMs?: number;
  /** Signal sender; `-pid` targets the group. Injected in tests. */
  kill?: (target: number, signal: NodeJS.Signals) => void;
  /** Does the group still exist? Injected in tests. */
  isAlive?: (pgid: number) => boolean;
}

function groupAlive(pgid: number): boolean {
  try {
    process.kill(-pgid, 0);
    return true;
  } catch {
    // ESRCH: no process left in the group
    return false;
  }
}

/** Ctrl-C / SIGTERM path: SIGTERM every tracked group, wait `graceMs`, SIGKILL the ones still alive. */
export async function terminateTrackedGroups(options: TerminateOptions = {}): Promise<void> {
  const { graceMs = 3000, kill = (target, signal) => process.kill(target, signal), isAlive = groupAlive } = options;
  const groups = trackedGroups();
  const send = (pgid: number, signal: NodeJS.Signals) => {
    try {
      kill(-pgid, signal);
    } catch {
      // the group exited between listing and signalling
    }
  };
  for (const pgid of groups) send(pgid, 'SIGTERM');
  const deadline = Date.now() + graceMs;
  while (Date.now() < deadline && groups.some(isAlive)) await new Promise((r) => setTimeout(r, 25));
  for (const pgid of groups.filter(isAlive)) send(pgid, 'SIGKILL');
}

export const realRunner: Runner = (cmd, args, opts) =>
  new Promise((resolve) => {
    // detached = own process group, so a timeout can kill grandchildren (pnpm -> next, claude -> tools) too.
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env ?? process.env,
      stdio: [opts.input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      detached: true,
    });
    const pgid = child.pid;
    if (pgid !== undefined) liveGroups.add(pgid);
    if (opts.input !== undefined) {
      child.stdin?.on('error', () => undefined); // EPIPE when the child exits before reading: not an error for us
      child.stdin?.end(opts.input);
    }
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          killTree(child);
        }, opts.timeoutMs)
      : undefined;
    // setEncoding installs a streaming StringDecoder: multi-byte characters split across chunks stay intact.
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (d: string) => (stdout += d));
    child.stderr?.on('data', (d: string) => (stderr += d));
    child.on('error', (error) => {
      if (pgid !== undefined) liveGroups.delete(pgid);
      if (timer) clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: `${stderr}${error.message}\n` });
    });
    child.on('close', (code) => {
      if (pgid !== undefined) liveGroups.delete(pgid);
      if (timer) clearTimeout(timer);
      resolve({ code: timedOut ? 124 : (code ?? 1), stdout, stderr: timedOut ? `${stderr}timed out after ${opts.timeoutMs}ms\n` : stderr });
    });
  });

/** Keep the tail (that is where errors are) of a log, with a marker when cut. */
export function trimLog(text: string, maxChars = 4000): string {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  return `[... ${clean.length - maxChars} chars trimmed]\n${clean.slice(-maxChars)}`;
}
