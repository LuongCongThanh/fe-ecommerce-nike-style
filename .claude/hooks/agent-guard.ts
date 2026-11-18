/**
 * PreToolUse hook: enforces .claude/agent-guard.json (D8/D17/D40).
 * IO only; the decision lives in lib/guard.ts. Contract: docs/agents/runner.md, "Guard contract".
 *
 * Env: AGENT_RUN=1, AGENT_PHASE (plan|implement|retro|review), AGENT_TASK_DIR, AGENT_APPROVED
 *      ({"paths":[...],"commands":[...]}), CLAUDE_PROJECT_DIR.
 * Block = exit 2 + reason on stderr (shown to the agent). Under AGENT_RUN=1 every internal
 * error also blocks (fail closed); outside AGENT_RUN it never wedges a human session.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { recordBlock } from '../../scripts/agent-run/state';

import { decide, guardConfigSchema, hookInputSchema, type Approved, type HookInput } from './lib/guard';

function readStdin(): string {
  return readFileSync(0, 'utf8');
}

/** Root of the MAIN checkout (not the worktree) via the shared git dir. */
export function mainRepoRoot(cwd: string): string | null {
  try {
    const out = execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return dirname(resolve(cwd, out));
  } catch {
    return null; // not a git checkout: the caller falls back to the project root
  }
}

export function parseApproved(raw: string | undefined): Approved {
  const empty: Approved = { paths: [], commands: [] };
  if (!raw) return empty;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return empty;
    const strings = (list: unknown): string[] => (Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []);
    return { paths: strings('paths' in value ? value.paths : undefined), commands: strings('commands' in value ? value.commands : undefined) };
  } catch {
    return empty; // not JSON: nothing approved (the safe direction)
  }
}

function main(): number {
  const agentRun = process.env.AGENT_RUN === '1';
  let input: HookInput | undefined;
  let root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  try {
    input = hookInputSchema.parse(JSON.parse(readStdin()));
    if (!process.env.CLAUDE_PROJECT_DIR && input.cwd) root = input.cwd;
    const config = guardConfigSchema.parse(JSON.parse(readFileSync(join(root, '.claude/agent-guard.json'), 'utf8')));
    const mainRoot = agentRun ? (mainRepoRoot(root) ?? root) : root;
    const decision = decide(input, {
      config,
      agentRun,
      phase: process.env.AGENT_PHASE || undefined,
      taskDir: process.env.AGENT_TASK_DIR || undefined,
      approved: parseApproved(process.env.AGENT_APPROVED),
      projectRoot: root,
      stopFileExists: agentRun && existsSync(join(mainRoot, config.stopFile)),
    });
    if (decision.allow) return 0;
    if (agentRun) {
      try {
        recordBlock(root, { tool: input.tool_name, target: decision.target, kind: decision.kind });
      } catch {
        // counting must never change the decision
      }
    }
    process.stderr.write(`agent-guard: ${decision.reason}\n`);
    return 2;
  } catch (error) {
    process.stderr.write(`agent-guard: internal error: ${error instanceof Error ? error.message : String(error)}\n`);
    return agentRun ? 2 : 0;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  process.exit(main());
}
