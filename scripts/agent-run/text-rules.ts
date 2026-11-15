/**
 * Commit message and PR text rules the script must satisfy itself, because the repo hooks/CI reject
 * violations: `.husky/commit-msg` word list, commitlint `config-conventional`, `pr-title-lint.yml`.
 */
import type { TaskKind } from './spec';

// Keep identical to .husky/commit-msg (and the PR title/body lint).
const FORBIDDEN =
  /claude|anthropic|codex|openai|chatgpt|copilot|gemini|cursor|windsurf|perplexity|deepseek|qwen|grok|llama|mistral|co-authored-by:.*(ai|bot|agent|assistant)/i;

export const hasForbiddenWord = (text: string): boolean => FORBIDDEN.test(text);

const TYPES = ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'];
const MAX_LINE = 100;

/** Returns the list of violations (empty = acceptable). */
export function validateCommitMessage(message: string): string[] {
  const problems: string[] = [];
  const lines = message.split('\n');
  const header = lines[0] ?? '';
  const m = /^([a-z]+)(\([^)\s]+\))?(!)?: (.+)$/.exec(header);
  if (!m) problems.push('header must be `type(scope): subject`');
  else {
    if (!TYPES.includes(m[1] ?? '')) problems.push(`unknown type ${m[1]}`);
    const subject = m[4] ?? '';
    if (/^[A-Z]/.test(subject)) problems.push('subject must not start with a capital');
    if (subject.endsWith('.')) problems.push('subject must not end with a period');
  }
  if (header.length > MAX_LINE) problems.push(`header longer than ${MAX_LINE}`);
  if (lines.length > 1 && lines[1] !== '') problems.push('body must start after a blank line');
  if (lines.slice(1).some((l) => l.length > MAX_LINE)) problems.push(`body line longer than ${MAX_LINE}`);
  if (hasForbiddenWord(message)) problems.push('contains a word the commit-msg hook forbids');
  return problems;
}

export interface MessageContext {
  kind: TaskKind | null;
  /** Task directory name, e.g. `03-product-card` */
  taskName: string;
  title: string;
}

const TYPE_BY_KIND: Record<TaskKind, string> = { ui: 'feat', logic: 'feat', refactor: 'refactor', docs: 'docs' };

export function fallbackCommitMessage(ctx: MessageContext): string {
  const type = ctx.kind ? TYPE_BY_KIND[ctx.kind] : 'feat';
  const [num = '', ...words] = ctx.taskName.split('-');
  const subject = `complete task ${num} ${words.join(' ')}`.trim().toLowerCase();
  const msg = `${type}: ${subject}`;
  return validateCommitMessage(msg).length === 0 ? msg : `${type}: complete task ${num}`;
}

export function pickCommitMessage(proposed: string | undefined, ctx: MessageContext): string {
  const msg = proposed?.trim();
  if (msg && validateCommitMessage(msg).length === 0) return msg;
  return fallbackCommitMessage(ctx);
}
