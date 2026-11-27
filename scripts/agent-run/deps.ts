/** Everything agent-run needs from the outside world, injected so the whole flow runs on fakes in tests. */
import type { ClaudeRunner } from './claude';
import type { Runner } from './exec';

export type DevServerHandle = { ok: true; stop: () => Promise<void> } | { ok: false; reason: string };

export interface DevServer {
  /** Starts `pnpm dev --port <port>` in `cwd` and resolves once it answers; `ok: false` when the port is busy. */
  start: (cwd: string, port: number) => Promise<DevServerHandle>;
}

export interface Deps {
  /** git, gh, pnpm, tsx, bash: every external command except `claude` */
  runner: Runner;
  claude: ClaudeRunner;
  codexPreflight?: (cwd: string, taskDir: string) => Promise<void>;
  notify: (title: string, body: string) => void;
  now: () => Date;
  log: (line: string) => void;
  devServer: DevServer;
  /** Our pid and a liveness probe, for the one-run-at-a-time lock */
  processes: { pid: number; isAlive: (pid: number) => boolean };
}

export interface Config {
  /** Main checkout (holds docs/storefront/plan, `.agent-stop`, the inbox) */
  repoRoot: string;
  /** Run only this task (number or directory name) */
  only?: string;
  provider?: 'claude' | 'codex';
  /** D15: turns per task run (a resume gets a fresh budget) */
  turnBudget: number;
  retroTurns: number;
  /** D19: fixes shared by gate failures, Stop-hook blocks and review findings */
  maxFixes: number;
  /** Turn allowance for the PR-body writer (outside the 40, like retro) */
  prBodyTurns: number;
  devPort: number;
}

export const DEFAULTS = { turnBudget: 40, retroTurns: 5, maxFixes: 3, prBodyTurns: 6, devPort: 3100 } as const;
