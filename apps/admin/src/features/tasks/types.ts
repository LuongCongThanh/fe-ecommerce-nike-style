/** Demo-only types — no backend endpoint exists for tasks yet (ported from shadcn-admin's Tasks
 * feature as an example CRUD screen). Deliberately NOT in `@repo/schemas`: that package is the
 * source of truth for real API contracts, and this has none. */
export const TASK_STATUSES = ['backlog', 'todo', 'in-progress', 'done', 'canceled'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_LABELS = ['bug', 'feature', 'documentation'] as const;
export type TaskLabel = (typeof TASK_LABELS)[number];

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly label: TaskLabel;
}

export type TaskInput = Omit<Task, 'id'>;
