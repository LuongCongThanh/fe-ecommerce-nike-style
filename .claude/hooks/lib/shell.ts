/**
 * Minimal, conservative shell command parser for agent-guard.
 * It does NOT try to be bash: anything it cannot reason about statically
 * (command substitution, backticks, subshells, heredocs, process substitution)
 * is rejected, and the allow-list does the real work.
 */

export interface Redirect {
  op: string;
  target: string;
}

export interface Segment {
  words: string[];
  redirects: Redirect[];
  /** Directly preceded by a single `|` (reads the previous segment's output); false after `&&`, `||`, `;`, newline, `&`. */
  piped: boolean;
  andThen: boolean;
}

export type ParseResult = { ok: true; segments: Segment[] } | { ok: false; reason: string };

export function globToRegExp(pattern: string): RegExp {
  let out = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern.charAt(i);
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        if (pattern[i + 2] === '/') {
          out += '(?:.*/)?';
          i += 2;
        } else {
          out += '.*';
          i += 1;
        }
      } else out += '[^/]*';
    } else if (c === '?') out += '[^/]';
    else out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${out}$`);
}

export function matchesGlob(path: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => globToRegExp(p).test(path));
}

export interface ParseOptions {
  /**
   * Inspect instead of reject: command substitutions ($(..), backticks, <(..)), subshells and heredocs are
   * parsed and their inner commands returned as extra segments. For hooks that look for forbidden commands
   * (block-dangerous-git); agent-guard keeps the strict default because it must be able to *allow* a command.
   */
  lenient?: boolean;
}

/** Text between an opener (index `from` = first char after it) and its matching close; null when unterminated. */
function readSubstitution(input: string, from: number, kind: 'paren' | 'backtick'): { inner: string; end: number } | null {
  let depth = 1;
  let quote: '"' | "'" | null = null;
  for (let i = from; i < input.length; i++) {
    const c = input.charAt(i);
    if (c === '\\' && quote !== "'") {
      i++;
    } else if (quote) {
      if (c === quote) quote = null;
    } else if (kind === 'backtick') {
      if (c === '`') return { inner: input.slice(from, i), end: i + 1 };
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return { inner: input.slice(from, i), end: i + 1 };
  }
  return null;
}

export function parseCommand(input: string, options: ParseOptions = {}): ParseResult {
  const lenient = options.lenient === true;
  const segments: Segment[] = [];
  const nested: Segment[] = [];
  /** Lenient mode: parse the inside of a substitution; its segments are reported next to the outer ones. */
  const absorb = (inner: string | null): ParseResult | null => {
    if (inner === null) return { ok: false, reason: 'unterminated command substitution' };
    const r = parseCommand(inner, options);
    if (!r.ok) return r;
    nested.push(...r.segments);
    return null;
  };
  let words: string[] = [];
  let redirects: Redirect[] = [];
  let word = '';
  let started = false;
  let pending: string | null = null;
  let pipedNext = false;
  let andThenNext = false;

  const endWord = (): ParseResult | null => {
    if (!started) return null;
    if (pending !== null) {
      redirects.push({ op: pending, target: word });
      pending = null;
    } else words.push(word);
    word = '';
    started = false;
    return null;
  };
  const endSegment = (): ParseResult | null => {
    endWord();
    if (pending !== null) return { ok: false, reason: 'redirection without target' };
    if (words.length > 0 || redirects.length > 0) segments.push({ words, redirects, piped: pipedNext, andThen: andThenNext });
    pipedNext = false;
    andThenNext = false;
    words = [];
    redirects = [];
    return null;
  };

  let i = 0;
  while (i < input.length) {
    const c = input.charAt(i);
    const next = input[i + 1];
    if (c === "'") {
      const end = input.indexOf("'", i + 1);
      if (end === -1) return { ok: false, reason: 'unterminated quote' };
      word += input.slice(i + 1, end);
      started = true;
      i = end + 1;
      continue;
    }
    if (c === '"') {
      i++;
      started = true;
      let closed = false;
      while (i < input.length) {
        const d = input.charAt(i);
        if (d === '"') {
          closed = true;
          i++;
          break;
        }
        if (d === '`' || (d === '$' && input[i + 1] === '(')) {
          if (!lenient) return { ok: false, reason: 'command substitution is not allowed' };
          const sub = readSubstitution(input, d === '`' ? i + 1 : i + 2, d === '`' ? 'backtick' : 'paren');
          const failed = absorb(sub?.inner ?? null);
          if (failed) return failed;
          i = sub?.end ?? input.length;
          continue;
        }
        if (d === '\\' && i + 1 < input.length) {
          const e = input.charAt(i + 1);
          if ('"\\$`'.includes(e)) word += e;
          else if (e !== '\n') word += d + e;
          i += 2;
          continue;
        }
        word += d;
        i++;
      }
      if (!closed) return { ok: false, reason: 'unterminated quote' };
      continue;
    }
    if (c === '\\') {
      if (i + 1 >= input.length) return { ok: false, reason: 'trailing backslash' };
      if (next !== '\n') {
        word += next;
        started = true;
      }
      i += 2;
      continue;
    }
    if (c === '`' || (c === '$' && next === '(')) {
      if (!lenient) return { ok: false, reason: c === '`' ? 'backticks are not allowed' : 'command substitution is not allowed' };
      const sub = readSubstitution(input, c === '`' ? i + 1 : i + 2, c === '`' ? 'backtick' : 'paren');
      const failed = absorb(sub?.inner ?? null);
      if (failed) return failed;
      started = true;
      i = sub?.end ?? input.length;
      continue;
    }
    if (c === '(' || c === ')') {
      if (!lenient) return { ok: false, reason: 'subshells are not allowed' };
      const r = endSegment();
      if (r) return r;
      i++;
      continue;
    }
    if (c === '\n' || c === ';') {
      const r = endSegment();
      if (r) return r;
      i++;
      continue;
    }
    if (c === '|' || c === '&') {
      // `&>` / `&>>` redirect both streams
      if (c === '&' && next === '>') {
        endWord();
        const op = input[i + 2] === '>' ? '&>>' : '&>';
        pending = op;
        i += op.length;
        continue;
      }
      const r = endSegment();
      if (r) return r;
      andThenNext = c === '&' && next === '&';
      pipedNext = c === '|' && next !== '|' && next !== '&'; // `|&` is not treated as a plain pipe
      i += next === c ? 2 : 1; // && || (single & = background, single | = pipe)
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\r') {
      endWord();
      i++;
      continue;
    }
    if (c === '<' || c === '>') {
      if (next === '(') {
        if (!lenient) return { ok: false, reason: 'heredocs and process substitution are not allowed' };
        const sub = readSubstitution(input, i + 2, 'paren');
        const failed = absorb(sub?.inner ?? null);
        if (failed) return failed;
        started = true;
        i = sub?.end ?? input.length;
        continue;
      }
      if (c === '<' && next === '<' && !lenient) return { ok: false, reason: 'heredocs and process substitution are not allowed' };
      // a bare fd number before the operator (2>file) is part of the operator
      if (started && pending === null && /^\d+$/.test(word)) {
        word = '';
        started = false;
      } else endWord();
      let op = c;
      let j = i + 1;
      if (c === '>' && (input[j] === '>' || input[j] === '|')) {
        op += input.charAt(j);
        j++;
      }
      if (c === '>' && input[j] === '&' && /^(\d+|-)/.test(input.slice(j + 1))) {
        const m = /^&(\d+|-)/.exec(input.slice(j));
        i = j + (m ? m[0].length : 1); // fd duplication (2>&1): no file involved
        continue;
      }
      pending = op;
      i = j;
      continue;
    }
    word += c;
    started = true;
    i++;
  }
  const r = endSegment();
  if (r) return r;
  return { ok: true, segments: [...segments, ...nested] };
}

/** Pattern `a b *`: trailing `*` = any further words (including none); otherwise exact words. */
export function matchCommand(words: readonly string[], pattern: string): boolean {
  const p = pattern.trim().split(/\s+/);
  if (p[p.length - 1] === '*') {
    const prefix = p.slice(0, -1);
    return words.length >= prefix.length && prefix.every((w, k) => words[k] === w);
  }
  return words.length === p.length && p.every((w, k) => words[k] === w);
}
