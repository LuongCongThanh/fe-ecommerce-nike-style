import { useMemo, useState } from 'react';

import type { RowSelectionState, SortingState, Table } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { DataTablePagination } from '@/shell/DataTable';
import { selectColumn } from '@/shell/selectColumn';
import { usePaginationLabels } from '@/shell/usePaginationLabels';
import { useSortedClientDataTable } from '@/shell/useSortedClientDataTable';
import { TaskActionsCell, TaskLabelCell, TaskPriorityCell, TaskStatusCell } from '@/features/tasks/TaskCells';
import type { Task, TaskInput } from '@/features/tasks/types';
import { useTasksState } from '@/features/tasks/useTasksState';

const PAGE_SIZE = 10;

export interface TaskListModel {
  readonly table: Table<Task>;
  readonly pageTasks: Task[];
  readonly selectedIds: string[];
  readonly addTask: (input: TaskInput) => void;
  readonly removeSelected: () => void;
  readonly pagination: DataTablePagination;
}

const columnHelper = createColumnHelper<Task>();

/** The task list behind one interface: persisted state, selection, sorting, columns and pagination. */
export function useTaskList(): TaskListModel {
  const { t } = useTranslation('tasks');
  const paginationLabels = usePaginationLabels();
  const state = useTasksState();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  const columns = useMemo(
    () => [
      selectColumn<Task>(),
      columnHelper.accessor('id', {
        header: t('columns.id'),
        cell: (info) => <span className="text-muted-foreground font-mono text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('title', { header: t('columns.title'), cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
      columnHelper.display({ id: 'status', header: t('columns.status'), cell: ({ row }) => <TaskStatusCell status={row.original.status} /> }),
      columnHelper.display({
        id: 'priority',
        header: t('columns.priority'),
        cell: ({ row }) => <TaskPriorityCell priority={row.original.priority} />,
      }),
      columnHelper.display({ id: 'label', header: t('columns.label'), cell: ({ row }) => <TaskLabelCell label={row.original.label} /> }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => <TaskActionsCell task={row.original} state={state} />,
      }),
    ],
    [t, state],
  );

  const {
    table,
    pageItems: pageTasks,
    pagination,
  } = useSortedClientDataTable(state.tasks, columns, sorting, setSorting, PAGE_SIZE, paginationLabels);

  return {
    table,
    pageTasks,
    selectedIds,
    addTask: state.addTask,
    removeSelected: () => {
      state.removeTasks(selectedIds);
      setRowSelection({});
    },
    pagination,
  };
}
