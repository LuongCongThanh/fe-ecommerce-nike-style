import { useState } from 'react';

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@/shell/ConfirmDialog';
import { DataTable } from '@/shell/DataTable';
import { PageHeader } from '@/shell/PageHeader';
import { TaskForm } from '@/features/tasks/TaskForm';
import { useTaskList } from '@/features/tasks/useTaskList';

export const Route = createFileRoute('/_authenticated/tasks')({
  component: TasksPage,
});

function TasksPage(): React.JSX.Element {
  const { t } = useTranslation('tasks');
  const { t: tCommon } = useTranslation('common');
  const [createOpen, setCreateOpen] = useState(false);
  const list = useTaskList();

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" data-icon="inline-start" />
                {t('add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('add')}</DialogTitle>
              </DialogHeader>
              <TaskForm
                submitLabel={tCommon('actions.create')}
                onSubmit={(input) => {
                  list.addTask(input);
                  setCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <p className="text-muted-foreground -mt-2 text-sm">{t('subtitle')}</p>

      {list.selectedIds.length > 0 ? (
        <div className="flex items-center gap-3">
          <span className="text-sm">{t('selectedCount', { count: list.selectedIds.length })}</span>
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                {t('deleteSelected')}
              </Button>
            }
            title={t('deleteSelectedTitle', { count: list.selectedIds.length })}
            description={tCommon('confirmIrreversible')}
            confirmLabel={tCommon('actions.delete')}
            onConfirm={list.removeSelected}
          />
        </div>
      ) : null}

      <DataTable
        table={list.table}
        isLoading={false}
        isError={false}
        errorMessage=""
        isEmpty={list.pageTasks.length === 0}
        emptyMessage={t('empty')}
        pagination={list.pagination}
      />
    </div>
  );
}
