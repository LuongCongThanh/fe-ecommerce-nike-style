// PreToolUse hook (matcher: Bash). Blocks destructive git commands, exit code 2.
// Plain `git push` stays allowed (settings.json allows it); force pushes do not.
// Parsing is shared with agent-guard (lib/shell.ts, lenient mode: nested commands are inspected, not rejected).
// Unparseable input: fail open for a human session (never wedge it), fail closed when AGENT_RUN=1 (unattended).
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { z } from 'zod';

import { parseCommand } from './lib/shell';

const SHELLS = new Set(['bash', 'sh', 'zsh']);
// Global git options that take a separate value argument.
const GLOBAL_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);

/** Wrappers that run the rest of the command line: name -> flags that consume a separate value. */
const WRAPPERS = new Map<string, ReadonlySet<string>>([
  ['env', new Set(['-u', '--unset', '-C', '--chdir', '-S', '--split-string'])],
  ['sudo', new Set(['-u', '-g', '-h', '-p', '-U', '-r', '-t', '-C', '-D', '-R', '-T'])],
  ['command', new Set()],
  ['nice', new Set(['-n', '--adjustment'])],
  ['xargs', new Set(['-I', '-n', '-P', '-d', '-E', '-L', '-s', '-a'])],
  ['time', new Set(['-f', '-o'])],
  ['exec', new Set(['-a'])],
  ['nohup', new Set()],
  ['timeout', new Set(['-s', '-k', '--signal', '--kill-after'])],
  ['builtin', new Set()],
]);
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

/** Drop leading `VAR=x` words and wrapper commands (with their flags) so the real program is first. */
function stripPrefixes(words: string[]): string[] {
  let rest = words;
  for (;;) {
    const [first = ''] = rest;
    if (ASSIGNMENT.test(first)) {
      rest = rest.slice(1);
      continue;
    }
    const wrapper = WRAPPERS.get(first.split('/').pop() ?? first);
    if (!wrapper) return rest;
    let i = 1;
    let afterTimeout = first.split('/').pop() === 'timeout';
    while (i < rest.length) {
      const word = rest[i] ?? '';
      if (word === '--') {
        i++;
        break;
      }
      if (word.startsWith('-') && word.length > 1) {
        i += wrapper.has(word) ? 2 : 1;
      } else if (ASSIGNMENT.test(word) || (afterTimeout && /^\d/.test(word))) {
        afterTimeout = false;
        i++;
      } else if (/^\d+$/.test(word) && first.endsWith('nice')) {
        i++; // legacy `nice -5` style value
      } else break;
    }
    rest = rest.slice(i);
  }
}

function hasShortFlag(args: string[], letter: string): boolean {
  return args.some((a) => /^-[A-Za-z]+$/.test(a) && a.includes(letter));
}

function checkGit(args: string[]): string | null {
  let i = 0;
  while (i < args.length && (args[i] ?? '').startsWith('-')) {
    i += GLOBAL_WITH_VALUE.has(args[i] ?? '') ? 2 : 1;
  }
  const sub = args[i];
  const rest = args.slice(i + 1);
  if (!sub) return null;

  switch (sub) {
    case 'push':
      if (rest.some((a) => a === '--force' || a.startsWith('--force-with-lease') || a.startsWith('+')) || hasShortFlag(rest, 'f')) {
        return 'force push';
      }
      return null;
    case 'reset':
      return rest.includes('--hard') ? 'reset --hard' : null;
    case 'clean':
      if (rest.includes('-n') || rest.includes('--dry-run') || hasShortFlag(rest, 'n')) return null;
      return rest.includes('--force') || hasShortFlag(rest, 'f') ? 'clean -f' : null;
    case 'branch':
      if (hasShortFlag(rest, 'D')) return 'branch -D';
      if ((rest.includes('--delete') || hasShortFlag(rest, 'd')) && (rest.includes('--force') || hasShortFlag(rest, 'f'))) {
        return 'branch -D';
      }
      return null;
    case 'checkout':
      return rest.includes('.') ? 'checkout .' : null;
    case 'restore':
      if (rest.includes('--staged') && !rest.includes('--worktree')) return null;
      return rest.includes('.') ? 'restore .' : null;
    default:
      return null;
  }
}

export interface FindOptions {
  /** Report an unparseable command as a hit instead of letting it through (AGENT_RUN=1) */
  failClosed?: boolean;
}

/** Returns the matched rule name when the command contains a blocked git call, else null. */
export function findDangerousGit(command: string, options: FindOptions = {}): string | null {
  const parsed = parseCommand(command, { lenient: true });
  if (!parsed.ok) return options.failClosed ? `unparseable command (${parsed.reason})` : null;
  for (const segment of parsed.segments) {
    const [program, ...args] = stripPrefixes(segment.words);
    if (!program) continue;
    const name = program.split('/').pop() ?? program;
    if (name === 'git') {
      const hit = checkGit(args);
      if (hit) return hit;
    } else if (SHELLS.has(name) && args[0] === '-c' && args[1]) {
      const hit = findDangerousGit(args[1], options);
      if (hit) return hit;
    }
  }
  return null;
}

const hookEventSchema = z.object({ tool_input: z.object({ command: z.string().optional() }).loose().optional() }).loose();

export type HookVerdict = { block: false } | { block: true; message: string };

/** Pure core of the hook: stdin text + whether this is an unattended agent run -> verdict. */
export function evaluateHook(stdin: string, agentRun: boolean): HookVerdict {
  let command = '';
  try {
    const event = hookEventSchema.parse(JSON.parse(stdin));
    command = event.tool_input?.command ?? '';
  } catch {
    // Unreadable or wrongly shaped event: fail closed for agents, fail open for humans.
    return agentRun ? { block: true, message: 'BLOCKED: the hook could not read the tool call, so it cannot be checked.' } : { block: false };
  }
  const hit = findDangerousGit(command, { failClosed: agentRun });
  if (!hit) return { block: false };
  return {
    block: true,
    message: `BLOCKED: '${command}' matches destructive git rule '${hit}'. The user has prevented you from running this; ask them to run it themselves if it is really needed.`,
  };
}

function main(): void {
  const verdict = evaluateHook(readFileSync(0, 'utf8'), process.env.AGENT_RUN === '1');
  if (verdict.block) {
    console.error(verdict.message);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
