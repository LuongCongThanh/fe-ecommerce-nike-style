/** Task discovery and selection (D11, D23; situations 1 and 2 of D21). */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseBlockedBy } from './spec-file';
import { isTaskKind, parseFrontmatter, type TaskKind } from './spec';

export const TASKS_DIR = 'docs/plan/tasks/todo';
export const TASK_DIRECTORIES = [TASKS_DIR, 'docs/plan/tasks/done', 'docs/plan/tasks/wontfix'] as const;

export interface Task {
  /** Directory name, e.g. `03-product-card` */
  name: string;
  number: string;
  status: string;
  blockedBy: string[];
  kind: TaskKind | null;
  specPath: string;
  wayfinder?: boolean;
  archived?: boolean;
}

const prDir = (root: string): string => join(root, '.agent-run', 'prs');

export function recordTaskPr(root: string, task: string, url: string): void {
  const dir = prDir(root);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, task);
  writeFileSync(file + '.tmp', url + '\n');
  renameSync(file + '.tmp', file);
}

/** Read only the labels field (inline or dash list), never remove decision records used by blockers. */
function isWayfinder(text: string): boolean {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
  const labels = /^labels:[^\n]*(?:\r?\n[ \t]*-[ \t]+[^\n]*)*/m.exec(frontmatter)?.[0] ?? '';
  return /wayfinder:/i.test(labels) || /^Type:\s*(?:research|prototype|grilling|task)\s*$/im.test(text);
}

export function readTasks(repoRoot: string): Task[] {
  const tasks: Task[] = [];
  for (const directory of TASK_DIRECTORIES) {
    const base = join(repoRoot, directory);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base).sort()) {
      const specPath = join(base, name, 'spec.md');
      if (!existsSync(specPath)) continue;
      const text = readFileSync(specPath, 'utf8');
      const fm = parseFrontmatter(text);
      tasks.push({
        name,
        number: /^(\d+)/.exec(name)?.[1] ?? name,
        status: fm.status === 'ready-for-agent' && existsSync(join(prDir(repoRoot), name)) ? 'review' : (fm.status ?? 'todo'),
        blockedBy: parseBlockedBy(text),
        kind: isTaskKind(fm.kind) ? fm.kind : null,
        specPath,
        wayfinder: isWayfinder(text),
        archived: directory !== TASKS_DIR,
      });
    }
  }
  return tasks.sort((a, b) => a.name.localeCompare(b.name));
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
    if (t.archived || t.wayfinder || t.status !== 'ready-for-agent') continue;
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
