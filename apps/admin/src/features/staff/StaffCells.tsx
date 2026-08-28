import type { Staff } from '@repo/schemas/staff';
import { resolvePermissions } from '@repo/schemas/staff';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Switch } from '@repo/ui/switch';
import { useTranslation } from 'react-i18next';

import { AssignRolesDialog } from './AssignRolesDialog';
import { useDeleteStaff, useUpdateStaff } from './useStaffMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';

interface StaffCellProps {
  readonly staff: Staff;
}

/** Roles + their *effective* permissions (the union of every assigned Role, not just the Role list)
 * rendered directly, per issue #23's "UI hiển thị đúng permission hiệu lực". */
export function StaffRolesCell({ staff }: StaffCellProps): React.JSX.Element {
  const effectivePermissions = resolvePermissions(staff.roles);

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {staff.roles.map((role) => (
          <Badge key={role} variant="outline">
            {role}
          </Badge>
        ))}
      </div>
      {/* Permission list is security-relevant info, not decorative secondary text — kept legible
       * (text-foreground) instead of the low-contrast text-muted-foreground treatment (UI/UX audit finding #1). */}
      <p className="text-foreground/80 mt-1 text-xs">{effectivePermissions.join(', ')}</p>
    </div>
  );
}

export function StaffActiveCell({ staff }: StaffCellProps): React.JSX.Element {
  const updateStaff = useUpdateStaff(staff.id);

  return (
    <Switch
      checked={staff.isActive}
      disabled={updateStaff.isPending}
      onCheckedChange={(checked) => {
        updateStaff.mutate({ name: staff.name, isActive: checked });
      }}
    />
  );
}

export function StaffActionsCell({ staff }: StaffCellProps): React.JSX.Element {
  const { t } = useTranslation('staff');
  const { t: tCommon } = useTranslation('common');
  const deleteStaff = useDeleteStaff();

  return (
    <div className="flex justify-end gap-2">
      <AssignRolesDialog
        staff={staff}
        trigger={
          <Button variant="outline" size="sm">
            {t('assignRoles')}
          </Button>
        }
      />
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={deleteStaff.isPending}>
            {tCommon('actions.delete')}
          </Button>
        }
        title={t('deleteTitle', { name: staff.name })}
        description={tCommon('confirmIrreversible')}
        confirmLabel={tCommon('actions.delete')}
        loading={deleteStaff.isPending}
        onConfirm={() => {
          deleteStaff.mutate(staff.id);
        }}
      />
    </div>
  );
}
