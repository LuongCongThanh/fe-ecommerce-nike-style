'use client';

import { useState } from 'react';

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Plus } from 'lucide-react';

import { CreateStaffForm } from '@/features/staff/CreateStaffForm';
import { StaffRow } from '@/features/staff/StaffRow';
import { useAdminStaffList } from '@/features/staff/useAdminStaffList';
import { useCreateStaff } from '@/features/staff/useStaffMutations';

export default function StaffPage(): React.JSX.Element {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError } = useAdminStaffList();
  const createStaff = useCreateStaff();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Nhân viên</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" data-icon="inline-start" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên</DialogTitle>
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
          Không thể tải danh sách nhân viên.
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role &amp; Permission hiệu lực</TableHead>
                <TableHead>Hoạt động</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((staff) => (
                <StaffRow key={staff.id} staff={staff} />
              ))}
            </TableBody>
          </Table>
          {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">Chưa có nhân viên nào.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
