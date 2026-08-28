import { useMemo, useState } from 'react';

import type { Staff } from '@repo/schemas/staff';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { createFileRoute } from '@tanstack/react-router';
import type { SortingState } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CreateStaffForm } from '@/features/staff/CreateStaffForm';
import { StaffActionsCell, StaffActiveCell, StaffRolesCell } from '@/features/staff/StaffCells';
import { useAdminStaffList } from '@/features/staff/useAdminStaffList';
import { useCreateStaff } from '@/features/staff/useStaffMutations';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';
import { useSortedClientDataTable } from '@/features/shell/useSortedClientDataTable';

export const Route = createFileRoute('/_authenticated/staff')({
  component: StaffPage,
});

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<Staff>();

function StaffPage(): React.JSX.Element {
  const { t } = useTranslation('staff');
  const { t: tCommon } = useTranslation('common');
  const [createOpen, setCreateOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, isError } = useAdminStaffList();
  const createStaff = useCreateStaff();

  const allStaff = data?.data ?? [];

  /* eslint-disable react/no-unstable-nested-components -- these are TanStack column-def `header`/`cell` renderers, not
   * JSX-mounted nested components; the whole `columns` array is memoized below so their identity is stable across renders. */
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: t('columns.name'), cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
      columnHelper.accessor('email', {
        header: t('columns.email'),
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'rolesPermissions',
        header: t('columns.rolesPermissions'),
        cell: ({ row }) => <StaffRolesCell staff={row.original} />,
      }),
      columnHelper.display({
        id: 'active',
        header: t('active'),
        enableSorting: false,
        cell: ({ row }) => <StaffActiveCell staff={row.original} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => <StaffActionsCell staff={row.original} />,
      }),
    ],
    [t],
  );
  /* eslint-enable react/no-unstable-nested-components */

  const {
    table,
    pageItems: pageStaff,
    pagination,
  } = useSortedClientDataTable(allStaff, columns, sorting, setSorting, PAGE_SIZE, {
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
        table={table}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={pageStaff.length === 0}
        emptyMessage={t('empty')}
        pagination={pagination}
      />
    </div>
  );
}
