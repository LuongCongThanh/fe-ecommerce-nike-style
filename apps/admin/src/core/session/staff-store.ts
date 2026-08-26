import type { Permission, Staff } from '@repo/schemas/staff';
import { create } from 'zustand';

export type StaffAuthStatus = 'initializing' | 'authenticated' | 'anonymous';

export interface StaffAuthSnapshot {
  token: string | null;
  staff: Staff | null;
  permissions: Permission[];
  status: StaffAuthStatus;
}

interface StaffAuthState extends StaffAuthSnapshot {
  refreshToken: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setSession: (data: { staff: Staff; permissions: Permission[] }) => void;
  clear: () => void;
  hasPermission: (permission: Permission) => boolean;
}

export const useStaffAuthStore = create<StaffAuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  staff: null,
  permissions: [],
  status: 'initializing',
  setAccessToken: (token) => {
    set({ token });
  },
  setRefreshToken: (refreshToken) => {
    set({ refreshToken });
  },
  setSession: ({ staff, permissions }) => {
    set({ staff, permissions, status: 'authenticated' });
  },
  clear: () => {
    set({ token: null, refreshToken: null, staff: null, permissions: [], status: 'anonymous' });
  },
  hasPermission: (permission) => get().permissions.includes(permission),
}));

export function getStaffAuthSnapshot(): StaffAuthSnapshot {
  const { token, staff, permissions, status } = useStaffAuthStore.getState();
  return { token, staff, permissions, status };
}

export function setStaffAccessToken(token: string | null): void {
  useStaffAuthStore.getState().setAccessToken(token);
}

export function setStaffRefreshToken(token: string | null): void {
  useStaffAuthStore.getState().setRefreshToken(token);
}

export function setStaffSession(data: { staff: Staff; permissions: Permission[] }): void {
  useStaffAuthStore.getState().setSession(data);
}

export function clearStaffAuth(): void {
  useStaffAuthStore.getState().clear();
}
