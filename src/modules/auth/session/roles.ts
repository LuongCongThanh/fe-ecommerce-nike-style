import type { User } from '@/integrations/backend/models/user.types';

export function isAdminRole(role: User['role'] | undefined | null): boolean {
  return role === 'admin' || role === 'staff';
}
