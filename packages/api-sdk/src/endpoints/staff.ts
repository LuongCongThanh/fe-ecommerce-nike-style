import { StaffMeResponseSchema, StaffSessionResponseSchema } from '@repo/schemas/staff';
import type { StaffMeResponse, StaffSessionResponse } from '@repo/schemas/staff';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const STAFF_API = {
  LOGIN: `${API_BASE_URL}/api/staff/login/`,
  REFRESH: `${API_BASE_URL}/api/staff/refresh/`,
  LOGOUT: `${API_BASE_URL}/api/staff/logout/`,
  ME: `${API_BASE_URL}/api/staff/me/`,
} as const;

export interface StaffLoginPayload {
  email: string;
  password: string;
}

export interface StaffRefreshSessionResponse {
  access: string;
  refresh: string;
}

export type { StaffMeResponse, StaffSessionResponse };

/** Staff login for `apps/admin`/`apps/cms` — a separate identity/session from storefront Customer auth (issue #18/#24). */
export async function loginStaff(payload: StaffLoginPayload): Promise<StaffSessionResponse> {
  return apiClient.post<StaffSessionResponse>(STAFF_API.LOGIN, payload, { skipRefresh: true, schema: StaffSessionResponseSchema });
}

export async function refreshStaffSession(refreshToken: string): Promise<StaffRefreshSessionResponse> {
  return apiClient.post<StaffRefreshSessionResponse>(STAFF_API.REFRESH, { refreshToken }, { skipRefresh: true });
}

export async function logoutStaff(refreshToken: string): Promise<void> {
  await apiClient.post<unknown>(STAFF_API.LOGOUT, { refreshToken }, { skipRefresh: true });
}

/** The signed-in Staff's own resolved permission set — UX-layer show/hide only, never the source of
 * authorization truth (issue #18/#24: a real backend must still enforce every `/api/admin/*`/`/api/cms/*` request). */
export async function getStaffMe(): Promise<StaffMeResponse> {
  return apiClient.get<StaffMeResponse>(STAFF_API.ME, undefined, { schema: StaffMeResponseSchema });
}
