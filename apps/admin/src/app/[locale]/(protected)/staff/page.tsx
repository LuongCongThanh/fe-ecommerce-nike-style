'use client';

import { useState } from 'react';

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CreateStaffForm } from '@/features/staff/CreateStaffForm';
import { StaffRow } from '@/features/staff/StaffRow';
import { useAdminStaffList } from '@/features/staff/useAdminStaffList';
import { useCreateStaff } from '@/features/staff/useStaffMutations';

export default function StaffPage(): React.JSX.Element {
  const t = useTranslations('staff');
  const tLoading = useTranslations('common');
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError } = useAdminStaffList();
  const createStaff = useCreateStaff();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('title')}</h1>
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
      </div>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadError')}
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">{tLoading('loading')}</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.name')}</TableHead>
                <TableHead>{t('columns.email')}</TableHead>
                <TableHead>{t('columns.rolesPermissions')}</TableHead>
                <TableHead>{t('active')}</TableHead>
                <TableHead className="text-right">{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((staff) => (
                <StaffRow key={staff.id} staff={staff} />
              ))}
            </TableBody>
          </Table>
          {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">{t('empty')}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
