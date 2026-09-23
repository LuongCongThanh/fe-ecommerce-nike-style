import { useState } from 'react';

import type { Staff, StaffRole } from '@repo/schemas/staff';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { useTranslation } from 'react-i18next';

import { RoleCheckboxes } from './RoleCheckboxes';
import { useAssignStaffRoles } from './useStaffMutations';

interface AssignRolesDialogProps {
  readonly staff: Staff;
  readonly trigger: React.ReactNode;
}

/** Reassigning Roles is gated on `staff:assign-role`, deliberately separate from `staff:update` — this
 * dialog is the only place Roles change (issue #23). The mock revokes the target Staff's current
 * session as a side effect (Decision #79); this UI doesn't need to do anything extra for that to hold. */
export function AssignRolesDialog({ staff, trigger }: AssignRolesDialogProps): React.JSX.Element {
  const { t } = useTranslation('staff');
  const { t: tCommon } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<StaffRole[]>(staff.roles);
  const assignRoles = useAssignStaffRoles(staff.id);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRoles(staff.roles);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('assignRolesTitle', { name: staff.name })}</DialogTitle>
          <DialogDescription>{t('assignRolesDescription')}</DialogDescription>
        </DialogHeader>

        <RoleCheckboxes value={roles} onChange={setRoles} />
        {roles.length === 0 ? <p className="text-muted-foreground text-xs">{t('atLeastOneRole')}</p> : null}
        {assignRoles.isError ? (
          <p role="alert" className="text-destructive text-sm">
            {assignRoles.error instanceof Error ? assignRoles.error.message : t('assignRolesError')}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            disabled={roles.length === 0 || assignRoles.isPending}
            onClick={() => {
              assignRoles.mutate(
                { roles },
                {
                  onSuccess: () => {
                    setOpen(false);
                  },
                },
              );
            }}
          >
            {assignRoles.isPending ? tCommon('actions.saving') : t('saveRoles')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
