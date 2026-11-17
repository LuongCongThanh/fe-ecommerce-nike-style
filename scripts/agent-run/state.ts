/**
 * Shared state file of an agent run: `<worktree>/.agent-run/state.json` (gitignored).
 * Written by the guard hook (blocks) and by scripts/agent-run (step 7: turns, fix counters, ...).
 * Unknown keys are preserved so each writer can add its own fields.
 */
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { isReviewFinding, type ReviewFinding } from './schemas';
import { SITUATIONS, type SituationNumber } from './situations';

export interface BlockRecord {
  tool: string;
  /** Relative path for file tools, full command string for Bash */
  target: string;
  /** ISO timestamp */
  at: string;
  /** Guard deny kind (deny-path, ask-path, command, ...); optional so older writers stay valid */
  kind?: string;
}

/** Steps of one run, in order. A resumed run skips the ones recorded in `completedSteps` (D43). */
export const STEPS = ['plan', 'implement', 'gates', 'review', 'retro', 'committed', 'pushed'] as const;
export type StepName = (typeof STEPS)[number];

export interface LastStop {
  situation: SituationNumber;
  at: string;
  action: string;
}

export interface AgentRunState {
  blocks: BlockRecord[];
  // Known fields (written by agent-run); each is validated by readState, so a wrong-typed value reads as absent.
  stage?: string;
  startedAt?: string;
  provider?: 'claude' | 'codex';
  codexUsage?: { input: number; cached: number; output: number };
  turnsUsed?: number;
  fixAttempts?: number;
  resumeCount?: number;
  lastStop?: LastStop;
  completedSteps?: StepName[];
  implementerSession?: string;
  commitMessage?: string;
  commitSubject?: string;
  prBody?: string;
  prUrl?: string;
  bundleNote?: string;
  minorFindings?: ReviewFinding[];
  preStartGatesPassed?: boolean;
  /** Worktree created but `pnpm install` has not finished yet (set until it does) */
  installPending?: boolean;
  branch?: string;
  task?: string;
  retro?: { turnsNeeded: number; reason: string };
  // Unknown keys written by other writers are preserved.
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

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function isBlockRecord(v: unknown): v is BlockRecord {
  return isRecord(v) && isString(v.tool) && isString(v.target) && isString(v.at) && (v.kind === undefined || isString(v.kind));
}

function isSituationNumber(v: unknown): v is SituationNumber {
  return typeof v === 'number' && Object.hasOwn(SITUATIONS, v);
}

function isLastStop(v: unknown): v is LastStop {
  return isRecord(v) && isSituationNumber(v.situation) && isString(v.at) && isString(v.action);
}

const isStepName = (v: unknown): v is StepName => (STEPS as readonly unknown[]).includes(v);

function isRetroInfo(v: unknown): v is { turnsNeeded: number; reason: string } {
  return isRecord(v) && isFiniteNumber(v.turnsNeeded) && isString(v.reason);
}

/** Per known field: its guard. A value failing its guard is dropped (reads as absent), never trusted. */
const FIELD_GUARDS: Record<string, (v: unknown) => boolean> = {
  stage: isString,
  startedAt: isString,
  provider: (v) => v === 'claude' || v === 'codex',
  codexUsage: (v) => isRecord(v) && [v.input, v.cached, v.output].every(isFiniteNumber),
  turnsUsed: isFiniteNumber,
  fixAttempts: isFiniteNumber,
  resumeCount: isFiniteNumber,
  lastStop: isLastStop,
  completedSteps: (v) => Array.isArray(v) && v.every(isStepName),
  implementerSession: isString,
  commitMessage: isString,
  commitSubject: isString,
  prBody: isString,
  prUrl: isString,
  bundleNote: isString,
  minorFindings: (v) => Array.isArray(v) && v.every(isReviewFinding),
  preStartGatesPassed: (v) => typeof v === 'boolean',
  installPending: (v) => typeof v === 'boolean',
  branch: isString,
  task: isString,
  retro: isRetroInfo,
};

/** Missing or corrupt file -> fresh state (a corrupt file is never thrown on: hooks must not crash). */
export function readState(worktreeRoot: string): AgentRunState {
  try {
    const parsed: unknown = JSON.parse(readFileSync(statePath(worktreeRoot), 'utf8'));
    if (isRecord(parsed)) {
      const kept: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(parsed)) {
        const guard = FIELD_GUARDS[key];
        if (key !== 'blocks' && (!guard || guard(value))) kept[key] = value;
      }
      const blocks = Array.isArray(parsed.blocks) ? parsed.blocks.filter(isBlockRecord) : [];
      return { ...kept, blocks };
    }
  } catch {
    // missing or corrupt file: fall through to a fresh state
  }
  return { blocks: [] };
}

export function writeState(worktreeRoot: string, state: AgentRunState): void {
  mkdirSync(stateDir(worktreeRoot), { recursive: true });
  const tmp = `${statePath(worktreeRoot)}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(tmp, statePath(worktreeRoot));
}

const LOCK_STALE_MS = 30_000;
const LOCK_TIMEOUT_MS = 10_000;

export interface UpdateOptions {
  /** How long to wait for the lock before throwing */
  timeoutMs?: number;
  /** A lock file older than this is taken as left behind by a dead process and removed */
  staleMs?: number;
}

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function errorCode(error: unknown): string | undefined {
  return isRecord(error) && isString(error.code) ? error.code : undefined;
}

/**
 * Read-modify-write under a lock file; hooks of parallel tool calls run as separate processes.
 * Only "lock already exists" (EEXIST) is retried. A lock is only removed when it is older than `staleMs`
 * (its owner died); waiting longer than `timeoutMs` for a live lock throws instead of stealing it, so two
 * writers can never interleave and lose an update.
 */
export function updateState(worktreeRoot: string, fn: (state: AgentRunState) => void, options: UpdateOptions = {}): AgentRunState {
  const timeoutMs = options.timeoutMs ?? LOCK_TIMEOUT_MS;
  const staleMs = options.staleMs ?? LOCK_STALE_MS;
  mkdirSync(stateDir(worktreeRoot), { recursive: true });
  const lock = `${statePath(worktreeRoot)}.lock`;
  const started = Date.now();
  for (;;) {
    try {
      closeSync(openSync(lock, 'wx'));
      break;
    } catch (error) {
      if (errorCode(error) !== 'EEXIST') throw error;
      try {
        if (Date.now() - statSync(lock).mtimeMs > staleMs) rmSync(lock, { force: true });
      } catch {
        // the lock vanished between open and stat: just retry
      }
      if (Date.now() - started > timeoutMs) throw new Error(`state lock ${lock} is held by another process (waited ${timeoutMs}ms)`);
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

export function isStepDone(worktreeRoot: string, step: StepName): boolean {
  return readState(worktreeRoot).completedSteps?.includes(step) ?? false;
}

export function markStepDone(worktreeRoot: string, step: StepName): void {
  updateState(worktreeRoot, (s) => {
    const done = s.completedSteps ?? [];
    if (!done.includes(step)) s.completedSteps = [...done, step];
  });
}

/** Forget `step` and every later step (its work must be redone, e.g. after the implementer asked a question). */
export function resetStepsFrom(worktreeRoot: string, step: StepName): void {
  const cut = STEPS.indexOf(step);
  updateState(worktreeRoot, (s) => {
    s.completedSteps = (s.completedSteps ?? []).filter((x) => STEPS.indexOf(x) < cut);
  });
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
