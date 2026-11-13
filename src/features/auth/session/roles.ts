import type { User } from '@/shared/types/user';

export function isAdminRole(role: User['role'] | undefined | null): boolean {
  return role === 'admin' || role === 'staff';
}
