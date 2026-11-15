/** Task discovery and selection (D11, D23; situations 1 and 2 of D21). */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseBlockedBy } from './spec-file';
import { parseFrontmatter, TASK_KINDS, type TaskKind } from './spec';

export const TASKS_DIR = 'docs/plan/tasks';

export interface Task {
  /** Directory name, e.g. `03-product-card` */
  name: string;
  number: string;
  status: string;
  blockedBy: string[];
  kind: TaskKind | null;
  specPath: string;
}

export function readTasks(repoRoot: string): Task[] {
  const base = join(repoRoot, TASKS_DIR);
  if (!existsSync(base)) return [];
  const tasks: Task[] = [];
  for (const name of readdirSync(base).sort()) {
    const specPath = join(base, name, 'spec.md');
    if (!existsSync(specPath)) continue;
    const text = readFileSync(specPath, 'utf8');
    const fm = parseFrontmatter(text);
    tasks.push({
      name,
      number: /^(\d+)/.exec(name)?.[1] ?? name,
      status: fm.status ?? 'todo',
      blockedBy: parseBlockedBy(text),
      kind: (TASK_KINDS as readonly string[]).includes(fm.kind ?? '') ? (fm.kind as TaskKind) : null,
      specPath,
    });
  }
  return tasks;
}

export interface Selection {
  task: Task | null;
  /** Situation 2: ready tasks skipped because a `blocked-by` is not `done` */
  skipped: { name: string; waitingFor: string[] }[];
}

export function selectTask(tasks: Task[], only?: string): Selection {
  const status = new Map(tasks.map((t) => [t.name, t.status]));
  const skipped: Selection['skipped'] = [];
  for (const t of tasks) {
    if (t.status !== 'ready-for-agent') continue;
    if (only !== undefined && t.number !== only && t.name !== only) continue;
    const waitingFor = t.blockedBy.filter((b) => status.get(b) !== 'done');
    if (waitingFor.length > 0) {
      skipped.push({ name: t.name, waitingFor });
      continue;
    }
    return { task: t, skipped };
  }
  return { task: null, skipped };
}

export const slugOf = (name: string): string => name.replace(/^\d+-/, '');

const TYPE_BY_KIND: Record<TaskKind, string> = { ui: 'feat', logic: 'feat', refactor: 'refactor', docs: 'docs' };

/** `<type>/<NN>-<slug>` (D32) with type derived from `kind`. */
export function branchFor(task: Task): string {
  return `${task.kind ? TYPE_BY_KIND[task.kind] : 'feat'}/${task.name}`;
}
