import { create } from 'zustand';

/**
 * Mock/stub auth session, shaped after Better Auth's client session contract
 * (`{ user, session }` + `signIn`/`signOut`) so swapping in the real
 * `better-auth/react` client later (Stage 4 — needs a real auth server) is a
 * drop-in replacement of this store, not a rewrite of every consumer.
 *
 * For now `signIn` accepts any email/password and grants a fixed mock staff
 * account — mirrors how the old Next.js admin's staff auth was mocked via
 * MSW before a real backend existed.
 */
export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly permissions: readonly string[];
}

interface AuthState {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  hasPermission: (permission: string) => boolean;
}

const MOCK_USER: AuthUser = {
  id: 'staff-1',
  name: 'Admin User',
  email: 'admin@example.com',
  permissions: ['*'],
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Stage 1 stub keeps the real signature (email/password) so swapping in real validation later isn't an API change.
  signIn: async (email, password) => {
    // Stage 1 stub: accepts any credentials. Real validation moves to the
    // mock/real auth backend in a later stage.
    await Promise.resolve();
    set({ user: MOCK_USER, isAuthenticated: true });
  },
  signOut: () => {
    set({ user: null, isAuthenticated: false });
  },
  hasPermission: (permission) => {
    const { user } = get();
    return user !== null && (user.permissions.includes('*') || user.permissions.includes(permission));
  },
}));
