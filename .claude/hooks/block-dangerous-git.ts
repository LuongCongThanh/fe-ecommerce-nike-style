// PreToolUse hook (matcher: Bash). Blocks destructive git commands, exit code 2.
// Plain `git push` stays allowed (settings.json allows it); force pushes do not.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OPERATORS = new Set([';', '&&', '||', '|', '&', '\n']);
const SHELLS = new Set(['bash', 'sh', 'zsh']);
// Global git options that take a separate value argument.
const GLOBAL_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);

function tokenize(command: string): string[][] {
  const segments: string[][] = [];
  let tokens: string[] = [];
  let word = '';
  let hasWord = false;
  let quote: '"' | "'" | null = null;

  const endWord = () => {
    if (hasWord) tokens.push(word);
    word = '';
    hasWord = false;
  };
  const endSegment = () => {
    endWord();
    if (tokens.length > 0) segments.push(tokens);
    tokens = [];
  };

  for (let i = 0; i < command.length; i++) {
    const ch = command[i]!;
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < command.length) word += command[++i];
      else word += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      hasWord = true;
    } else if (ch === '\\' && i + 1 < command.length) {
      word += command[++i];
      hasWord = true;
    } else if (/\s/.test(ch) && ch !== '\n') {
      endWord();
    } else if (OPERATORS.has(ch)) {
      endSegment();
    } else {
      word += ch;
      hasWord = true;
    }
  }
  endSegment();
  return segments;
}

function hasShortFlag(args: string[], letter: string): boolean {
  return args.some((a) => /^-[A-Za-z]+$/.test(a) && a.includes(letter));
}

function checkGit(args: string[]): string | null {
  let i = 0;
  while (i < args.length && args[i]!.startsWith('-')) {
    i += GLOBAL_WITH_VALUE.has(args[i]!) ? 2 : 1;
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

/** Returns the matched rule name when the command contains a blocked git call, else null. */
export function findDangerousGit(command: string): string | null {
  for (const tokens of tokenize(command)) {
    const [program, ...args] = tokens;
    if (!program) continue;
    const name = program.split('/').pop()!;
    if (name === 'git') {
      const hit = checkGit(args);
      if (hit) return hit;
    } else if (SHELLS.has(name) && args[0] === '-c' && args[1]) {
      const hit = findDangerousGit(args[1]);
      if (hit) return hit;
    }
  }
  return null;
}

function main(): void {
  let command = '';
  try {
    const input = JSON.parse(readFileSync(0, 'utf8')) as { tool_input?: { command?: unknown } };
    if (typeof input.tool_input?.command === 'string') command = input.tool_input.command;
  } catch {
    process.exit(0);
  }
  const hit = findDangerousGit(command);
  if (hit) {
    console.error(
      `BLOCKED: '${command}' matches destructive git rule '${hit}'. The user has prevented you from running this; ask them to run it themselves if it is really needed.`,
    );
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
