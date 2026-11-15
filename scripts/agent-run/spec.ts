/** Minimal reader for the `spec.md` frontmatter (docs/plan/README.md). Only flat `key: value` lines. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const TASK_KINDS = ['ui', 'logic', 'refactor', 'docs'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

export const isTaskKind = (value: unknown): value is TaskKind => (TASK_KINDS as readonly unknown[]).includes(value);

export function parseFrontmatter(text: string): Record<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const out: Record<string, string> = {};
  if (!match?.[1]) return out;
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^([A-Za-z][\w-]*):\s*(.*?)\s*(?:#.*)?$/.exec(line);
    if (m?.[1]) out[m[1]] = m[2] ?? '';
  }
  return out;
}

export interface SpecInfo {
  kind: TaskKind | null;
  /** `allow-test-changes: true` lets a refactor task modify/delete existing tests (D38). */
  allowTestChanges: boolean;
}

export function readSpecInfo(taskDir: string): SpecInfo {
  try {
    const fm = parseFrontmatter(readFileSync(join(taskDir, 'spec.md'), 'utf8'));
    const kind = isTaskKind(fm.kind) ? fm.kind : null;
    return { kind, allowTestChanges: fm['allow-test-changes'] === 'true' };
  } catch {
    return { kind: null, allowTestChanges: false }; // no readable spec.md: unknown kind, no test rule
  }
}
