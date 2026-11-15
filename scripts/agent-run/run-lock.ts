/**
 * One task at a time (D15): `<main repo>/.agent-run/run.lock` holds `{pid, task, startedAt}` while a run is active.
 * A lock whose pid no longer answers is stale and is replaced. Gitignored with the rest of `.agent-run/`.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { z } from 'zod';

export const RUN_LOCK = '.agent-run/run.lock';

const lockSchema = z.object({ pid: z.number(), task: z.string().nullable(), startedAt: z.string() });
export type RunLockInfo = z.infer<typeof lockSchema>;

export type LockResult = { ok: true; setTask: (task: string) => void; release: () => void } | { ok: false; pid: number; task: string | null };

function readLock(file: string): RunLockInfo | null {
  try {
    const parsed = lockSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // missing or unreadable: treated as no lock
  }
}

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' ? error.code : undefined;
}

export function acquireRunLock(repoRoot: string, proc: { pid: number; isAlive: (pid: number) => boolean }, now: Date): LockResult {
  const file = join(repoRoot, RUN_LOCK);
  mkdirSync(dirname(file), { recursive: true });
  const write = (info: RunLockInfo, flag: 'wx' | 'w') => writeFileSync(file, `${JSON.stringify(info)}\n`, { flag });
  const mine: RunLockInfo = { pid: proc.pid, task: null, startedAt: now.toISOString() };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      write(mine, 'wx');
      return {
        ok: true,
        setTask: (task) => write({ ...mine, task }, 'w'),
        release: () => {
          if (readLock(file)?.pid === proc.pid) rmSync(file, { force: true });
        },
      };
    } catch (error) {
      if (errorCode(error) !== 'EEXIST') throw error;
      const held = readLock(file);
      if (held && held.pid !== proc.pid && proc.isAlive(held.pid)) return { ok: false, pid: held.pid, task: held.task };
      rmSync(file, { force: true }); // stale (dead pid), unreadable, or ours from an earlier crash: take it over
    }
  }
  throw new Error(`could not acquire ${file}`);
}

/** Remove the lock if this pid owns it (signal handlers, where runAgent's own release cannot run). */
export function releaseRunLock(repoRoot: string, pid: number): void {
  const file = join(repoRoot, RUN_LOCK);
  if (readLock(file)?.pid === pid) rmSync(file, { force: true });
}
