import { StaffListResponseSchema, StaffSchema } from '@repo/schemas/staff';
import type { Staff, StaffAssignRolesInput, StaffCreateInput, StaffListResponse, StaffUpdateInput } from '@repo/schemas/staff';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ADMIN_STAFF_API = {
  LIST: `${API_BASE_URL}/api/admin/staff/`,
  DETAIL: (id: number) => `${API_BASE_URL}/api/admin/staff/${String(id)}/`,
  ROLES: (id: number) => `${API_BASE_URL}/api/admin/staff/${String(id)}/roles/`,
} as const;

/** SUPER_ADMIN's Staff/Role management (issue #23) — CRUD on `staff:create/read/update/delete`, Role
 * (re)assignment on the separate, more-sensitive `staff:assign-role` permission (Decision #78-79). */
export async function getAdminStaffList(): Promise<StaffListResponse> {
  return apiClient.get<StaffListResponse>(ADMIN_STAFF_API.LIST, undefined, { schema: StaffListResponseSchema });
}

export async function createAdminStaff(input: StaffCreateInput): Promise<Staff> {
  return apiClient.post<Staff>(ADMIN_STAFF_API.LIST, input, { schema: StaffSchema });
}

/** Profile fields only — Role reassignment is `assignAdminStaffRoles` below. */
export async function updateAdminStaff(id: number, input: StaffUpdateInput): Promise<Staff> {
  return apiClient.patch<Staff>(ADMIN_STAFF_API.DETAIL(id), input, { schema: StaffSchema });
}

export async function deleteAdminStaff(id: number): Promise<void> {
  await apiClient.delete<unknown>(ADMIN_STAFF_API.DETAIL(id));
}

/** Reassigns a Staff's Roles (many-to-many — effective permissions are the union of every assigned
 * Role) and revokes their current session (Decision #79). */
export async function assignAdminStaffRoles(id: number, input: StaffAssignRolesInput): Promise<Staff> {
  return apiClient.patch<Staff>(ADMIN_STAFF_API.ROLES(id), input, { schema: StaffSchema });
}
