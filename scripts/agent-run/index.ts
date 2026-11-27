/**
 * agent-run (D18): drives one task from `ready-for-agent` to a PR into `dev`, or stops and tells the human.
 *
 *   pnpm agent-run [--task NN] [--provider claude|codex]
 *
 * Exit codes: 0 PR opened, 1 stopped (see .agent-run/AGENT-INBOX.md), 64 usage error.
 * Docs: docs/agents/runner.md; task index: docs/storefront/plan/README.md.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { guardConfigSchema } from '../../.claude/hooks/lib/guard';

import { realClaude } from './claude';
import { codexProvider } from './codex';
import { DEFAULTS, type Config, type Deps } from './deps';
import { realDevServer } from './dev-server';
import { realRunner, terminateTrackedGroups } from './exec';
import { runAgent } from './run';
import { releaseRunLock } from './run-lock';

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
  if (args.has('worktrees') || process.env.AGENT_RUN_WORKTREES) {
    process.stderr.write('agent-run: bỏ --worktrees hoặc AGENT_RUN_WORKTREES để dùng checkout hiện tại.\n');
    return 64;
  }
  const provider = args.get('provider') ?? process.env.AGENT_RUN_PROVIDER ?? 'claude';
  if (provider !== 'claude' && provider !== 'codex') {
    process.stderr.write('agent-run: --provider phải là claude hoặc codex\n');
    return 64;
  }
  const top = await realRunner('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: process.cwd() });
  if (top.code !== 0) {
    process.stderr.write('agent-run: not inside a git repository\n');
    return 64;
  }
  const repoRoot = dirname(top.stdout.trim());
  const checkout = await realRunner('git', ['rev-parse', '--show-toplevel'], { cwd: process.cwd() });
  if (checkout.code !== 0 || resolve(checkout.stdout.trim()) !== repoRoot) {
    process.stderr.write('agent-run: chạy từ checkout chính của repository.\n');
    return 64;
  }
  const guard = guardConfigSchema.parse(JSON.parse(readFileSync(join(repoRoot, '.claude/agent-guard.json'), 'utf8')));
  const cfg: Config = {
    repoRoot,
    provider,
    only: args.get('task'),
    ...DEFAULTS,
  };
  const codex = provider === 'codex' ? codexProvider(realRunner, repoRoot) : undefined;
  if (args.has('check-provider')) {
    if (codex) await codex.preflight(repoRoot, repoRoot);
    else {
      const check = await realRunner('claude', ['--version'], { cwd: repoRoot });
      if (check.code !== 0) throw new Error(check.stderr.trim());
    }
    process.stdout.write(`agent-run: ${provider} sẵn sàng\n`);
    return 0;
  }
  const deps: Deps = {
    runner: realRunner,
    claude: codex?.run ?? realClaude(realRunner, guard),
    codexPreflight: codex?.preflight,
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
