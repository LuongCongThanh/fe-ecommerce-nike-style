/**
 * Shared state file of an agent run: `<worktree>/.agent-run/state.json` (gitignored).
 * Written by the guard hook (blocks) and by scripts/agent-run (step 7: turns, fix counters, ...).
 * Unknown keys are preserved so each writer can add its own fields.
 */
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface BlockRecord {
  tool: string;
  /** Relative path for file tools, full command string for Bash */
  target: string;
  /** ISO timestamp */
  at: string;
  /** Guard deny kind (deny-path, ask-path, command, ...); optional so older writers stay valid */
  kind?: string;
}

export interface AgentRunState {
  blocks: BlockRecord[];
  [key: string]: unknown;
}

export const STATE_DIR = '.agent-run';
export const STATE_FILE = 'state.json';

export function stateDir(worktreeRoot: string): string {
  return join(worktreeRoot, STATE_DIR);
}

export function statePath(worktreeRoot: string): string {
  return join(stateDir(worktreeRoot), STATE_FILE);
}

export function hasState(worktreeRoot: string): boolean {
  return existsSync(statePath(worktreeRoot));
}

/** Missing or corrupt file -> fresh state (a corrupt file is never thrown on: hooks must not crash). */
export function readState(worktreeRoot: string): AgentRunState {
  try {
    const parsed: unknown = JSON.parse(readFileSync(statePath(worktreeRoot), 'utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      return { ...obj, blocks: Array.isArray(obj.blocks) ? (obj.blocks as BlockRecord[]) : [] };
    }
  } catch {
    // fall through
  }
  return { blocks: [] };
}

export function writeState(worktreeRoot: string, state: AgentRunState): void {
  mkdirSync(stateDir(worktreeRoot), { recursive: true });
  const tmp = `${statePath(worktreeRoot)}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(tmp, statePath(worktreeRoot));
}

const LOCK_STALE_MS = 5000;
const LOCK_TIMEOUT_MS = 3000;

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Read-modify-write under a lock file; hooks of parallel tool calls run as separate processes. */
export function updateState(worktreeRoot: string, fn: (state: AgentRunState) => void): AgentRunState {
  mkdirSync(stateDir(worktreeRoot), { recursive: true });
  const lock = `${statePath(worktreeRoot)}.lock`;
  const started = Date.now();
  for (;;) {
    try {
      closeSync(openSync(lock, 'wx'));
      break;
    } catch {
      try {
        if (Date.now() - statSync(lock).mtimeMs > LOCK_STALE_MS) rmSync(lock, { force: true });
      } catch {
        // lock vanished: retry
      }
      if (Date.now() - started > LOCK_TIMEOUT_MS) rmSync(lock, { force: true });
      sleepSync(15);
    }
  }
  try {
    const state = readState(worktreeRoot);
    fn(state);
    writeState(worktreeRoot, state);
    return state;
  } finally {
    rmSync(lock, { force: true });
  }
}

export function recordBlock(worktreeRoot: string, block: Omit<BlockRecord, 'at'> & { at?: string }): AgentRunState {
  return updateState(worktreeRoot, (s) => {
    s.blocks.push({ ...block, at: block.at ?? new Date().toISOString() });
  });
}

export function countBlocks(state: AgentRunState, tool: string, target: string): number {
  return state.blocks.filter((b) => b.tool === tool && b.target === target).length;
}

export interface RepeatedBlock {
  tool: string;
  target: string;
  count: number;
}

/** Situation 9 (D21): the same tool + target blocked `threshold` (default 3) or more times. */
export function findRepeatedBlock(state: AgentRunState, threshold = 3): RepeatedBlock | null {
  const counts = new Map<string, RepeatedBlock>();
  for (const b of state.blocks) {
    const key = `${b.tool}\u0000${b.target}`;
    const entry = counts.get(key) ?? { tool: b.tool, target: b.target, count: 0 };
    entry.count++;
    counts.set(key, entry);
    if (entry.count >= threshold) return entry;
  }
  return null;
}
