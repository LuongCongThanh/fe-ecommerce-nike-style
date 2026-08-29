import { useState } from 'react';

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/shell/DataTable';
import { PageHeader } from '@/shell/PageHeader';
import { CreateStaffForm } from '@/features/staff/CreateStaffForm';
import { useStaffList } from '@/features/staff/useStaffList';
import { useCreateStaff } from '@/features/staff/useStaffMutations';

export const Route = createFileRoute('/_authenticated/staff')({
  component: StaffPage,
});

function StaffPage(): React.JSX.Element {
  const { t } = useTranslation('staff');
  const [createOpen, setCreateOpen] = useState(false);
  const createStaff = useCreateStaff();
  const list = useStaffList();

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" data-icon="inline-start" />
                {t('addStaff')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addStaff')}</DialogTitle>
              </DialogHeader>
              <CreateStaffForm
                isSubmitting={createStaff.isPending}
                errorMessage={createStaff.error instanceof Error ? createStaff.error.message : null}
                onSubmit={(input) => {
                  createStaff.mutate(input, {
                    onSuccess: () => {
                      setCreateOpen(false);
                    },
                  });
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Input
        placeholder={t('searchPlaceholder')}
        value={list.search}
        onChange={(e) => {
          list.setSearch(e.target.value);
        }}
        className="max-w-sm"
      />

      <DataTable
        table={list.table}
        isLoading={list.isLoading}
        isError={list.isError}
        errorMessage={t('loadError')}
        isEmpty={list.pageStaff.length === 0}
        emptyMessage={t('empty')}
        pagination={list.pagination}
      />
    </div>
  );
}
