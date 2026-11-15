/** Fakes for agent-run tests: a scriptable command runner and helpers. Never spawns processes. */
import type { RunOptions, RunResult, Runner } from './exec';

export type Handler = (cmd: string, args: string[], opts: RunOptions) => Partial<RunResult> | undefined | void;

export interface FakeRunner {
  runner: Runner;
  /** `cmd arg arg` strings in call order */
  calls: string[];
  /** Options of each call, parallel to `calls` */
  opts: RunOptions[];
}

/** First handler returning a value wins; unmatched commands succeed with empty output. */
export function fakeRunner(...handlers: Handler[]): FakeRunner {
  const calls: string[] = [];
  const opts: RunOptions[] = [];
  const runner: Runner = (cmd, args, o) => {
    calls.push([cmd, ...args].join(' '));
    opts.push(o);
    for (const h of handlers) {
      const r = h(cmd, args, o);
      if (r) return Promise.resolve({ code: 0, stdout: '', stderr: '', ...r });
    }
    return Promise.resolve({ code: 0, stdout: '', stderr: '' });
  };
  return { runner, calls, opts };
}

/** Handler matching `cmd args...` by prefix of the joined command line. */
export const on =
  (prefix: string, result: Partial<RunResult> | ((args: string[], opts: RunOptions) => Partial<RunResult> | void)): Handler =>
  (cmd, args, opts) => {
    if (![cmd, ...args].join(' ').startsWith(prefix)) return undefined;
    return typeof result === 'function' ? (result(args, opts) ?? {}) : result;
  };
