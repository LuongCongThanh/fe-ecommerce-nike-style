import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useStaffAuth } from '@/core/session';

/** Read-only — there is no `staff:update-self` endpoint yet. Matches this app's own convention
 * (routes/login.tsx's disabled social buttons): no fake "Save" button that doesn't persist anything. */
export function ProfileSection(): React.JSX.Element | null {
  const { t } = useTranslation('settings');
  const { t: tStaff } = useTranslation('staff');
  const { staff, logout } = useStaffAuth();

  if (staff === null) return null;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">{t('profile.description')}</p>

      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
        <dt className="text-muted-foreground">{t('profile.name')}</dt>
        <dd className="font-medium">{staff.name}</dd>

        <dt className="text-muted-foreground">{t('profile.email')}</dt>
        <dd className="font-medium">{staff.email}</dd>

        <dt className="text-muted-foreground">{t('profile.roles')}</dt>
        <dd className="flex flex-wrap gap-1.5">
          {staff.roles.map((role) => (
            <Badge key={role} variant="outline">
              {tStaff(`roleLabels.${role}`)}
            </Badge>
          ))}
        </dd>
      </dl>

      <Button
        variant="outline"
        className="text-destructive hover:bg-destructive/10"
        onClick={() => {
          void logout();
        }}
      >
        <LogOut className="size-4" data-icon="inline-start" />
        {t('profile.signOut')}
      </Button>
    </div>
  );
}
