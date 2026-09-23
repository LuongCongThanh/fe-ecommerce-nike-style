import type { Task } from '@/features/tasks/types';

/** Static seed rows — not `@faker-js/faker` (no other admin feature depends on it, and a handful of
 * representative rows demonstrate the table just as well without a new dependency). Only used to
 * seed `localStorage` the first time; every edit after that persists (see `useTasksState`). */
export const MOCK_TASKS: Task[] = [
  { id: 'TASK-1001', title: 'Fix checkout button alignment on mobile', status: 'in-progress', priority: 'high', label: 'bug' },
  { id: 'TASK-1002', title: 'Add CSV export to the orders table', status: 'todo', priority: 'medium', label: 'feature' },
  { id: 'TASK-1003', title: 'Write onboarding guide for new staff', status: 'backlog', priority: 'low', label: 'documentation' },
  { id: 'TASK-1004', title: 'Investigate slow category page load', status: 'todo', priority: 'high', label: 'bug' },
  { id: 'TASK-1005', title: 'Support bulk role assignment', status: 'canceled', priority: 'medium', label: 'feature' },
  { id: 'TASK-1006', title: 'Document the inventory adjustment flow', status: 'done', priority: 'low', label: 'documentation' },
];
