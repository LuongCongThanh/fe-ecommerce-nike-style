/**
 * Decision logic of the implementer Stop hook (D38). IO lives in ../implementer-stop.ts.
 * Red -> block the stop and bump `fixAttempts` in .agent-run/state.json (shared with verify-gates, D19);
 * once it reached MAX_FIX_ATTEMPTS the stop is allowed and the agent-run script marks the task blocked.
 */
import { trimLog, type Runner } from '../../../scripts/agent-run/exec';
import { readSpecInfo } from '../../../scripts/agent-run/spec';
import { readState, updateState } from '../../../scripts/agent-run/state';

export const MAX_FIX_ATTEMPTS = 3;

export interface FileChange {
  status: string;
  path: string;
}

export type StopDecision = { allow: true } | { allow: false; reason: string };

export interface StopContext {
  root: string;
  env: { AGENT_RUN?: string; AGENT_PHASE?: string; AGENT_TASK_DIR?: string };
  runner: Runner;
}

export function parseNameStatus(out: string): FileChange[] {
  return out
    .split('\n')
    .map((l) => l.trimEnd())
    .filter(Boolean)
    .map((l) => {
      const [status = '', ...rest] = l.split('\t');
      return { status: status.charAt(0), path: rest.join('\t') };
    });
}

const isTest = (p: string) => /\.test\.tsx?$/.test(p);
const isSource = (p: string) => /\.(ts|tsx)$/.test(p) && /^(src|scripts|\.claude\/hooks)\//.test(p);

async function changedFiles(root: string, runner: Runner): Promise<FileChange[]> {
  let base = 'HEAD';
  for (const ref of ['origin/dev', 'dev']) {
    const r = await runner('git', ['merge-base', 'HEAD', ref], { cwd: root });
    if (r.code === 0 && r.stdout.trim()) {
      base = r.stdout.trim();
      break;
    }
  }
  const diff = await runner('git', ['diff', '--name-status', '--no-renames', base], { cwd: root });
  const untracked = await runner('git', ['ls-files', '--others', '--exclude-standard'], { cwd: root });
  const changes = parseNameStatus(diff.stdout);
  for (const p of untracked.stdout.split('\n').filter(Boolean)) changes.push({ status: 'A', path: p });
  return changes;
}

export async function evaluateStop(ctx: StopContext): Promise<StopDecision> {
  const { root, env, runner } = ctx;
  if (env.AGENT_RUN !== '1' || env.AGENT_PHASE !== 'implement') return { allow: true };
  if (Number(readState(root).fixAttempts ?? 0) >= MAX_FIX_ATTEMPTS) return { allow: true };

  const spec = env.AGENT_TASK_DIR ? readSpecInfo(env.AGENT_TASK_DIR) : { kind: null, allowTestChanges: false };
  const changes = await changedFiles(root, runner);
  const problems: string[] = [];

  const typecheck = await runner('pnpm', ['typecheck'], { cwd: root });
  if (typecheck.code !== 0) problems.push(`pnpm typecheck failed:\n${trimLog(`${typecheck.stdout}\n${typecheck.stderr}`)}`);

  const related = changes.filter((c) => c.status !== 'D' && isSource(c.path)).map((c) => c.path);
  if (related.length > 0) {
    const r = await runner('pnpm', ['exec', 'vitest', 'related', '--run', '--passWithNoTests', ...related], { cwd: root });
    if (r.code !== 0) problems.push(`Tests related to your changes failed:\n${trimLog(`${r.stdout}\n${r.stderr}`)}`);
  }

  const tests = changes.filter((c) => isTest(c.path));
  if ((spec.kind === 'logic' || spec.kind === 'ui') && !tests.some((c) => c.status === 'A' || c.status === 'M')) {
    problems.push(`kind ${spec.kind}: the diff must add or modify a *.test.ts(x) file. Write the test first (tdd skill).`);
  }
  if (spec.kind === 'refactor' && !spec.allowTestChanges) {
    const touched = tests.filter((c) => c.status !== 'A').map((c) => `${c.status} ${c.path}`);
    if (touched.length > 0) {
      problems.push(`kind refactor: existing tests must stay untouched (the spec does not set allow-test-changes). Revert: ${touched.join(', ')}`);
    }
  }

  if (problems.length === 0) return { allow: true };
  const state = updateState(root, (s) => {
    s.fixAttempts = Number(s.fixAttempts ?? 0) + 1;
  });
  const left = MAX_FIX_ATTEMPTS - Number(state.fixAttempts);
  return {
    allow: false,
    reason: `Not done yet (fix attempt ${String(state.fixAttempts)}/${MAX_FIX_ATTEMPTS}, ${left} left before the run is marked blocked):\n\n${problems.join('\n\n')}`,
  };
}
