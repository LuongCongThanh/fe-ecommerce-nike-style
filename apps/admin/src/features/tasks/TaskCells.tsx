import { useState } from 'react';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@/shell/ConfirmDialog';
import { TaskForm } from '@/features/tasks/TaskForm';
import type { Task, TaskLabel, TaskPriority, TaskStatus } from '@/features/tasks/types';
import type { TasksState } from '@/features/tasks/useTasksState';

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>['variant']>;

const STATUS_VARIANT: Record<TaskStatus, BadgeVariant> = {
  backlog: 'outline',
  todo: 'secondary',
  'in-progress': 'info',
  done: 'success',
  canceled: 'destructive',
};

const PRIORITY_VARIANT: Record<TaskPriority, BadgeVariant> = {
  low: 'outline',
  medium: 'warning',
  high: 'destructive',
};

const LABEL_VARIANT: Record<TaskLabel, BadgeVariant> = {
  bug: 'destructive',
  feature: 'brand',
  documentation: 'secondary',
};

export function TaskStatusCell({ status }: { readonly status: TaskStatus }): React.JSX.Element {
  const { t } = useTranslation('tasks');
  return <Badge variant={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>;
}

export function TaskPriorityCell({ priority }: { readonly priority: TaskPriority }): React.JSX.Element {
  const { t } = useTranslation('tasks');
  return <Badge variant={PRIORITY_VARIANT[priority]}>{t(`priority.${priority}`)}</Badge>;
}

export function TaskLabelCell({ label }: { readonly label: TaskLabel }): React.JSX.Element {
  const { t } = useTranslation('tasks');
  return <Badge variant={LABEL_VARIANT[label]}>{t(`label.${label}`)}</Badge>;
}

export function TaskActionsCell({ task, state }: { readonly task: Task; readonly state: TasksState }): React.JSX.Element {
  const { t } = useTranslation('tasks');
  const { t: tCommon } = useTranslation('common');
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditOpen(true);
          }}
        >
          {tCommon('actions.edit')}
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editTitle')}</DialogTitle>
          </DialogHeader>
          <TaskForm
            initial={task}
            submitLabel={tCommon('actions.save')}
            onSubmit={(input) => {
              state.updateTask(task.id, input);
              setEditOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
            {tCommon('actions.delete')}
          </Button>
        }
        title={t('deleteTitle', { title: task.title })}
        description={tCommon('confirmIrreversible')}
        confirmLabel={tCommon('actions.delete')}
        onConfirm={() => {
          state.removeTask(task.id);
        }}
      />
    </div>
  );
}
