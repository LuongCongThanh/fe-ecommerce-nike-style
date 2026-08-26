'use client';

import { StaffRoleSchema } from '@repo/schemas/staff';
import type { StaffRole } from '@repo/schemas/staff';
import { Checkbox } from '@repo/ui/checkbox';
import { Label } from '@repo/ui/label';
import { useTranslations } from 'next-intl';

interface RoleCheckboxesProps {
  readonly value: StaffRole[];
  readonly onChange: (roles: StaffRole[]) => void;
}

/** A Staff can hold multiple Roles at once (many-to-many) — this is a checkbox group, not a single-select
 * picker, so assigning more than one Role is a first-class case in the UI, not an edge case (issue #23). */
export function RoleCheckboxes({ value, onChange }: RoleCheckboxesProps): React.JSX.Element {
  const t = useTranslations('staff');
  const toggle = (role: StaffRole, checked: boolean): void => {
    onChange(checked ? [...value, role] : value.filter((r) => r !== role));
  };

  return (
    <div className="space-y-2">
      {StaffRoleSchema.options.map((role) => (
        <div key={role} className="flex items-center gap-2">
          <Checkbox
            id={`role-${role}`}
            checked={value.includes(role)}
            onCheckedChange={(checked) => {
              toggle(role, checked === true);
            }}
          />
          <Label htmlFor={`role-${role}`} className="font-normal">
            {t(`roleLabels.${role}`)}
          </Label>
        </div>
      ))}
    </div>
  );
}
