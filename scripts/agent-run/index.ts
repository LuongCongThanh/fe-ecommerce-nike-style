/**
 * agent-run (D18): drives one task from `ready-for-agent` to a PR into `dev`, or stops and tells the human.
 *
 *   pnpm agent-run [--task NN] [--worktrees <dir>]
 *
 * `--worktrees` / AGENT_RUN_WORKTREES: parent dir of the task worktrees (default `<repo>.worktrees`, outside the repo).
 * Exit codes: 0 PR opened, 1 stopped (see docs/plan/AGENT-INBOX.md), 64 usage error.
 * Docs: docs/plan/README.md, section "Chạy agent-run".
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { guardConfigSchema } from '../../.claude/hooks/lib/guard';

import { realClaude } from './claude';
import { DEFAULTS, type Config, type Deps } from './deps';
import { realDevServer } from './dev-server';
import { realRunner, terminateTrackedGroups } from './exec';
import { runAgent } from './run';
import { releaseRunLock } from './run-lock';
import { defaultWorktreesDir } from './worktree';

function parseArgs(argv: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? '';
    if (!a.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out.set(a.slice(2), 'true');
    else {
      out.set(a.slice(2), next);
      i++;
    }
  }
  return out;
}

/** Signal 0 only probes: EPERM means the process exists (another user's), ESRCH means it is gone. */
function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // ESRCH: gone. EPERM: alive but owned by someone else.
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EPERM';
  }
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  const top = await realRunner('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: process.cwd() });
  if (top.code !== 0) {
    process.stderr.write('agent-run: not inside a git repository\n');
    return 64;
  }
  const repoRoot = dirname(top.stdout.trim());
  const guard = guardConfigSchema.parse(JSON.parse(readFileSync(join(repoRoot, '.claude/agent-guard.json'), 'utf8')));
  const cfg: Config = {
    repoRoot,
    worktreesDir: resolve(args.get('worktrees') ?? process.env.AGENT_RUN_WORKTREES ?? defaultWorktreesDir(repoRoot)),
    only: args.get('task'),
    ...DEFAULTS,
  };
  const deps: Deps = {
    runner: realRunner,
    claude: realClaude(realRunner, guard.allowCommands),
    notify: (title, body) => void realRunner('notify-send', [title, body], { cwd: repoRoot }),
    now: () => new Date(),
    log: (line) => process.stdout.write(`[agent-run] ${line}\n`),
    devServer: realDevServer,
    processes: { pid: process.pid, isAlive: isProcessAlive },
  };
  // Children run detached (own process group), so Ctrl-C would not reach them: stop them here, free the lock, exit.
  let stopping = false;
  for (const [signal, code] of [
    ['SIGINT', 130],
    ['SIGTERM', 143],
  ] as const) {
    process.on(signal, () => {
      if (stopping) return;
      stopping = true;
      deps.log(`${signal}: stopping child processes`);
      void terminateTrackedGroups().finally(() => {
        releaseRunLock(repoRoot, process.pid);
        process.exit(code);
      });
    });
  }
  const outcome = await runAgent(deps, cfg);
  return outcome.kind === 'pr' ? 0 : 1; // stopped or locked: exit 1 (the reason is in the log / inbox)
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  main().then(
    (code) => process.exit(code),
    (error: unknown) => {
      process.stderr.write(`agent-run: ${error instanceof Error ? error.stack : String(error)}\n`);
      process.exit(64);
    },
  );
}
