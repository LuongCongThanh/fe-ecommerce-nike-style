import { assignAdminStaffRoles, createAdminStaff, deleteAdminStaff, updateAdminStaff } from '@repo/api-sdk/endpoints/admin-staff';
import type { StaffAssignRolesInput, StaffCreateInput, StaffUpdateInput } from '@repo/schemas/staff';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminStaffKeys } from './useAdminStaffList';

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StaffCreateInput) => createAdminStaff(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminStaffKeys.list });
    },
  });
}

export function useUpdateStaff(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StaffUpdateInput) => updateAdminStaff(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminStaffKeys.list });
    },
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminStaff(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminStaffKeys.list });
    },
  });
}

/** Reassigns Roles — the mock revokes the target Staff's current session as a side effect (Decision #79). */
export function useAssignStaffRoles(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StaffAssignRolesInput) => assignAdminStaffRoles(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminStaffKeys.list });
    },
  });
}
