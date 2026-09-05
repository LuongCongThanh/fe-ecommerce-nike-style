'use client';

import { Avatar, AvatarFallback } from '@repo/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useStaffAuth } from '@/core/session';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Avatar + dropdown showing the real signed-in Staff (`useStaffAuth`) — name/email, no "My Profile /
 * Settings / Pricing / FAQ" links, since none of those pages exist in this app yet (honest UI: a
 * link to nowhere is worse than no link). Logout is real (`useStaffAuth().logout`); `StaffAuthGuard`
 * handles the redirect to `/login` once the session clears. */
export function UserMenu(): React.JSX.Element | null {
  const t = useTranslations('common');
  const { staff, logout } = useStaffAuth();

  if (staff === null) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
        <Avatar size="sm">
          <AvatarFallback className="bg-brand-500 text-white">{initialsOf(staff.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">{staff.name}</span>
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{staff.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            void logout();
          }}
        >
          <LogOut />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
