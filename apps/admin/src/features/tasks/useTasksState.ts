import { useLocalCollection } from '@/shell/useLocalCollection';
import { MOCK_TASKS } from '@/features/tasks/mock-data';
import type { Task, TaskInput } from '@/features/tasks/types';

export interface TasksState {
  readonly tasks: Task[];
  readonly addTask: (input: TaskInput) => void;
  readonly updateTask: (id: string, input: TaskInput) => void;
  readonly removeTask: (id: string) => void;
  readonly removeTasks: (ids: readonly string[]) => void;
}

const ID_PREFIX = 'TASK-';

/** Local-only CRUD (`localStorage`, seeded from `MOCK_TASKS` on first run) — there is no backend
 * for tasks (decision: mock data first, real API is a later phase once this domain gets one). */
export function useTasksState(): TasksState {
  const tasks = useLocalCollection<Task>('admin.tasks', MOCK_TASKS);

  return {
    tasks: tasks.items,
    addTask: (input) => {
      tasks.add({ id: tasks.nextId(ID_PREFIX), ...input });
    },
    updateTask: (id, input) => {
      tasks.update(id, { id, ...input });
    },
    removeTask: tasks.remove,
    removeTasks: tasks.removeMany,
  };
}
