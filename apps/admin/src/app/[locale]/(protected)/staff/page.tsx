'use client';

import { useState } from 'react';

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CreateStaffForm } from '@/features/staff/CreateStaffForm';
import { StaffRow } from '@/features/staff/StaffRow';
import { useAdminStaffList } from '@/features/staff/useAdminStaffList';
import { useCreateStaff } from '@/features/staff/useStaffMutations';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';

const PAGE_SIZE = 20;

export default function StaffPage(): React.JSX.Element {
  const t = useTranslations('staff');
  const tCommon = useTranslations('common');
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminStaffList();
  const createStaff = useCreateStaff();

  const allStaff = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(allStaff.length / PAGE_SIZE));
  const pageStaff = allStaff.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

      <DataTable
        headers={[t('columns.name'), t('columns.email'), t('columns.rolesPermissions'), t('active'), t('columns.actions')]}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={pageStaff.length === 0}
        emptyMessage={t('empty')}
        pagination={{
          page,
          totalPages,
          onPrevious: () => {
            setPage((p) => p - 1);
          },
          onNext: () => {
            setPage((p) => p + 1);
          },
          label: tCommon('pagination.pageOf', { page, totalPages }),
          previousLabel: tCommon('pagination.previous'),
          nextLabel: tCommon('pagination.next'),
        }}
      >
        {pageStaff.map((staff) => (
          <StaffRow key={staff.id} staff={staff} />
        ))}
      </DataTable>
    </div>
  );
}
