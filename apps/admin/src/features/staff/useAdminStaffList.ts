import { getAdminStaffList } from '@repo/api-sdk/endpoints/admin-staff';
import { useQuery } from '@tanstack/react-query';

export const adminStaffKeys = {
  list: ['admin', 'staff'] as const,
};

export function useAdminStaffList() {
  return useQuery({
    queryKey: adminStaffKeys.list,
    queryFn: getAdminStaffList,
  });
}
