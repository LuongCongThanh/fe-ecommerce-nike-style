/**
 * Command runner shared by verify-gates, the Stop hook and (step 7) agent-run.
 * Always injected so tests use fakes; `realRunner` is the only place that spawns processes.
 */
import { spawn } from 'node:child_process';

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

export const realRunner: Runner = (cmd, args, opts) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env ?? process.env,
      stdio: [opts.input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
    });
    if (opts.input !== undefined) {
      child.stdin?.on('error', () => undefined);
      child.stdin?.end(opts.input);
    }
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill('SIGKILL');
        }, opts.timeoutMs)
      : undefined;
    child.stdout?.on('data', (d: Buffer) => (stdout += d.toString()));
    child.stderr?.on('data', (d: Buffer) => (stderr += d.toString()));
    child.on('error', (error) => {
      if (timer) clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: `${stderr}${error.message}\n` });
    });
    child.on('close', (code) => {
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
