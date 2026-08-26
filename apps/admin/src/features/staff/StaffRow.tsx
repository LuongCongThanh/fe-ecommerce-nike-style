'use client';

import type { Staff } from '@repo/schemas/staff';
import { resolvePermissions } from '@repo/schemas/staff';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Switch } from '@repo/ui/switch';
import { TableCell, TableRow } from '@repo/ui/table';

import { AssignRolesDialog } from './AssignRolesDialog';
import { useDeleteStaff, useUpdateStaff } from './useStaffMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';

interface StaffRowProps {
  readonly staff: Staff;
}

/** One Staff row — Roles + their *effective* permissions (the union of every assigned Role, not just
 * the Role list) rendered directly, per issue #23's "UI hiển thị đúng permission hiệu lực". */
export function StaffRow({ staff }: StaffRowProps): React.JSX.Element {
  const updateStaff = useUpdateStaff(staff.id);
  const deleteStaff = useDeleteStaff();
  const effectivePermissions = resolvePermissions(staff.roles);

  return (
    <TableRow>
      <TableCell className="font-medium">{staff.name}</TableCell>
      <TableCell className="text-muted-foreground">{staff.email}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {staff.roles.map((role) => (
            <Badge key={role} variant="outline">
              {role}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{effectivePermissions.join(', ')}</p>
      </TableCell>
      <TableCell>
        <Switch
          checked={staff.isActive}
          disabled={updateStaff.isPending}
          onCheckedChange={(checked) => {
            updateStaff.mutate({ name: staff.name, isActive: checked });
          }}
        />
      </TableCell>
      <TableCell className="flex justify-end gap-2 text-right">
        <AssignRolesDialog
          staff={staff}
          trigger={
            <Button variant="outline" size="sm">
              Gán Role
            </Button>
          }
        />
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={deleteStaff.isPending}>
              Xoá
            </Button>
          }
          title={`Xoá nhân viên "${staff.name}"?`}
          description="Hành động này không thể hoàn tác."
          confirmLabel="Xoá"
          loading={deleteStaff.isPending}
          onConfirm={() => {
            deleteStaff.mutate(staff.id);
          }}
        />
      </TableCell>
    </TableRow>
  );
}
