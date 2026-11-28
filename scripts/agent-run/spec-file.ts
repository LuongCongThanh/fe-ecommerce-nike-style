/**
 * Read/modify the frontmatter of a task `spec.md` (docs/plan/README.md).
 * Only the subset the task format uses: flat `key: value`, plus lists (inline `[a, b]` or `- a` blocks)
 * for `blocked-by` and the nested `approved: {files, commands}` of D43.
 */
import type { ApprovedList } from './types';

interface Fence {
  start: number; // index just after the opening fence line
  end: number; // index of the closing fence
  lines: string[];
}

function fence(text: string): Fence | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m || m[1] === undefined) return null;
  return { start: 4, end: m[0].length - 3, lines: m[1].split(/\r?\n/) };
}

/** Replace (or add) `key: value`; a trailing `# comment` on the old line is dropped. */
export function setField(text: string, key: string, value: string): string {
  const f = fence(text);
  if (!f) return `---\n${key}: ${value}\n---\n${text}`;
  const re = new RegExp(`^${key}:`);
  const lines = [...f.lines];
  const i = lines.findIndex((l) => re.test(l));
  if (i >= 0) lines[i] = `${key}: ${value}`;
  else lines.push(`${key}: ${value}`);
  return `---\n${lines.join('\n')}\n---${text.slice(f.end + 3)}`;
}

export function splitInline(s: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: string | null = null;
  for (const ch of s) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === ',') {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
}

const unquote = (s: string) => s.replace(/^(["'])(.*)\1$/, '$2');

/** Items of the list under `lines[i]` (`key: [a, b]` inline, or following `- item` lines). */
function listAt(lines: string[], i: number): string[] {
  const inline = /:\s*\[(.*)\]\s*(?:#.*)?$/.exec(lines[i] ?? '');
  if (inline) return splitInline(inline[1] ?? '');
  const items: string[] = [];
  for (let j = i + 1; j < lines.length; j++) {
    const m = /^\s*-\s+(.*?)\s*$/.exec(lines[j] ?? '');
    if (!m) break;
    items.push(unquote(m[1] ?? ''));
  }
  return items;
}

export function parseBlockedBy(text: string): string[] {
  const f = fence(text);
  if (!f) return [];
  const i = f.lines.findIndex((l) => /^blocked-by:/.test(l));
  return i < 0 ? [] : listAt(f.lines, i);
}

export function parseApproved(text: string): ApprovedList {
  const out: ApprovedList = { paths: [], commands: [] };
  const f = fence(text);
  if (!f) return out;
  const start = f.lines.findIndex((l) => /^approved:\s*(?:#.*)?$/.test(l));
  if (start < 0) return out;
  const block: string[] = [];
  for (let j = start + 1; j < f.lines.length; j++) {
    const l = f.lines[j] ?? '';
    if (/^\S/.test(l)) break;
    block.push(l);
  }
  const fi = block.findIndex((l) => /^\s+files:/.test(l));
  const ci = block.findIndex((l) => /^\s+commands:/.test(l));
  if (fi >= 0) out.paths = listAt(block, fi);
  if (ci >= 0) out.commands = listAt(block, ci);
  return out;
}

export function appendQuestions(text: string, questions: string[], when: string, who: string): string {
  const body = questions.map((q) => `- ${q}`).join('\n');
  return `${text.replace(/\s*$/, '\n')}\n## Câu hỏi cho người duyệt (${who}, ${when})\n\n${body}\n`;
}
