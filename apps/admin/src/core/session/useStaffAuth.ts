'use client';

import type { Permission } from '@repo/schemas/staff';

import { loginStaffAction, performStaffLogout } from '@/core/session/staff-auth';
import { useStaffAuthStore } from '@/core/session/staff-store';

export function useStaffAuth() {
  const staff = useStaffAuthStore((s) => s.staff);
  const permissions = useStaffAuthStore((s) => s.permissions);
  const status = useStaffAuthStore((s) => s.status);
  const hasPermissionFn = useStaffAuthStore((s) => s.hasPermission);

  return {
    staff,
    permissions,
    isLoggedIn: staff !== null,
    isInitializing: status === 'initializing',
    hasPermission: (permission: Permission) => hasPermissionFn(permission),
    login: loginStaffAction,
    logout: performStaffLogout,
  };
}
