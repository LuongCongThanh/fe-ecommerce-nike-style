import type { Permission, Staff } from '@repo/schemas/staff';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

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

export type StaffAuthStore = UseBoundStore<StoreApi<StaffAuthState>>;

/**
 * One store instance per `createStaffAuthModule()` call — each app (admin, cms) gets its own isolated
 * session, even though the shape and behavior are identical (issue #24: staff session/auth deepened
 * into one shared module, see `../index.tsx`).
 */
export function createStaffAuthStore(): StaffAuthStore {
  return create<StaffAuthState>((set, get) => ({
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
}

export function getStaffAuthSnapshot(store: StaffAuthStore): StaffAuthSnapshot {
  const { token, staff, permissions, status } = store.getState();
  return { token, staff, permissions, status };
}

export function setStaffAccessToken(store: StaffAuthStore, token: string | null): void {
  store.getState().setAccessToken(token);
}

export function setStaffRefreshToken(store: StaffAuthStore, token: string | null): void {
  store.getState().setRefreshToken(token);
}

export function setStaffSession(store: StaffAuthStore, data: { staff: Staff; permissions: Permission[] }): void {
  store.getState().setSession(data);
}

export function clearStaffAuth(store: StaffAuthStore): void {
  store.getState().clear();
}
