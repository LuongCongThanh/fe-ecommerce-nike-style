/**
 * Stop hook of the implementer (D38). Logic: lib/implementer-stop.ts.
 * Self-gates on env (AGENT_RUN=1, AGENT_PHASE=implement), so it is harmless in human sessions.
 * Block = exit 2 + reason on stderr (fed back to the agent). Internal errors never wedge the stop (exit 0).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { realRunner } from '../../scripts/agent-run/exec';

import { evaluateStop } from './lib/implementer-stop';

async function main(): Promise<number> {
  if (process.env.AGENT_RUN !== '1' || process.env.AGENT_PHASE !== 'implement') return 0;
  try {
    let root = process.env.CLAUDE_PROJECT_DIR;
    if (!root) {
      const input: unknown = JSON.parse(readFileSync(0, 'utf8'));
      root =
        (typeof input === 'object' && input !== null && 'cwd' in input && typeof input.cwd === 'string' ? input.cwd : undefined) ?? process.cwd();
    }
    const decision = await evaluateStop({ root, env: process.env, runner: realRunner });
    if (decision.allow) return 0;
    process.stderr.write(`implementer-stop: ${decision.reason}\n`);
    return 2;
  } catch (error) {
    process.stderr.write(`implementer-stop: internal error, allowing stop: ${error instanceof Error ? error.message : String(error)}\n`);
    return 0;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  main().then((code) => process.exit(code));
}
