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
import { useClientDataTablePagination } from '@/features/shell/useClientDataTablePagination';

const PAGE_SIZE = 20;

export default function StaffPage(): React.JSX.Element {
  const t = useTranslations('staff');
  const tCommon = useTranslations('common');
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError } = useAdminStaffList();
  const createStaff = useCreateStaff();

  const allStaff = data?.data ?? [];
  const { pageItems: pageStaff, pagination } = useClientDataTablePagination(allStaff, PAGE_SIZE, {
    pageOf: (page, totalPages) => tCommon('pagination.pageOf', { page, totalPages }),
    previous: tCommon('pagination.previous'),
    next: tCommon('pagination.next'),
  });

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
        pagination={pagination}
      >
        {pageStaff.map((staff) => (
          <StaffRow key={staff.id} staff={staff} />
        ))}
      </DataTable>
    </div>
  );
}
