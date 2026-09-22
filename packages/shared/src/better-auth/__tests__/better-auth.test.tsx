import { act, render, renderHook, screen } from '@testing-library/react';
import { createAuthClient } from 'better-auth/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthRuntimeAdapter, getAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';

import { createBetterAuthModule } from '../index';

vi.mock('better-auth/react', () => ({
  createAuthClient: vi.fn(),
}));

interface MockSessionUser {
  id: string;
  email: string;
  name: string;
  roles?: unknown;
}

function createMockAuthClient(overrides?: { useSession?: { data: { user: MockSessionUser } | null; isPending: boolean } }) {
  const refetch = vi.fn().mockResolvedValue(undefined);
  const signInEmail = vi.fn();
  const signOut = vi.fn().mockResolvedValue(undefined);
  const getSession = vi.fn();
  const sessionState = overrides?.useSession ?? { data: null, isPending: false };

  return {
    client: {
      useSession: vi.fn().mockReturnValue({ ...sessionState, refetch }),
      signIn: { email: signInEmail },
      signOut,
      getSession,
    },
    refetch,
    signInEmail,
    signOut,
    getSession,
  };
}

function setupModule(sessionState?: { data: { user: MockSessionUser } | null; isPending: boolean }) {
  const mock = createMockAuthClient(sessionState !== undefined ? { useSession: sessionState } : undefined);
  vi.mocked(createAuthClient).mockReturnValue(mock.client as never);

  const push = vi.fn();
  const module = createBetterAuthModule({ baseURL: 'http://localhost/api/auth', useRouter: () => ({ push }) });

  return { ...module, ...mock, push };
}

describe('createBetterAuthModule', () => {
  beforeEach(() => {
    document.cookie = 'better-auth.session_token=; Path=/; Max-Age=0';
  });

  afterEach(() => {
    clearAuthRuntimeAdapter();
  });

  describe('useStaffAuth', () => {
    it('maps a signed-in Better Auth user to a Staff with resolved permissions', () => {
      const { useStaffAuth } = setupModule({
        data: { user: { id: 'u1', email: 'alice@example.com', name: 'Alice', roles: ['ADMIN_STAFF'] } },
        isPending: false,
      });

      const { result } = renderHook(() => useStaffAuth());

      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.staff).toMatchObject({ email: 'alice@example.com', name: 'Alice', roles: ['ADMIN_STAFF'], isActive: true });
      expect(typeof result.current.staff?.id).toBe('number');
      expect(result.current.hasPermission('catalog:read')).toBe(true);
      expect(result.current.hasPermission('staff:delete')).toBe(false);
    });

    it('treats a missing session as logged out with no permissions', () => {
      const { useStaffAuth } = setupModule({ data: null, isPending: false });

      const { result } = renderHook(() => useStaffAuth());

      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.staff).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(result.current.hasPermission('catalog:read')).toBe(false);
    });

    it('treats a user with no roles field as having zero permissions', () => {
      const { useStaffAuth } = setupModule({
        data: { user: { id: 'u2', email: 'bob@example.com', name: 'Bob' } },
        isPending: false,
      });

      const { result } = renderHook(() => useStaffAuth());

      expect(result.current.staff).toMatchObject({ roles: [] });
      expect(result.current.permissions).toEqual([]);
    });

    it('reports isInitializing while the session is still pending', () => {
      const { useStaffAuth } = setupModule({ data: null, isPending: true });

      const { result } = renderHook(() => useStaffAuth());

      expect(result.current.isInitializing).toBe(true);
    });

    it('login() writes the session cookie and refetches when Better Auth returns a token (MSW Set-Cookie workaround)', async () => {
      const { useStaffAuth, signInEmail, refetch } = setupModule();
      signInEmail.mockResolvedValue({ data: { token: 'tok-123' }, error: null });

      const { result } = renderHook(() => useStaffAuth());

      await act(async () => {
        await result.current.login({ email: 'alice@example.com', password: 'correct horse' });
      });

      expect(signInEmail).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'correct horse' });
      expect(document.cookie).toContain('better-auth.session_token=tok-123');
      expect(refetch).toHaveBeenCalled();
    });

    it('login() throws with the server message and does not write a cookie when sign-in fails', async () => {
      const { useStaffAuth, signInEmail } = setupModule();
      signInEmail.mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } });

      const { result } = renderHook(() => useStaffAuth());

      await expect(result.current.login({ email: 'alice@example.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
      expect(document.cookie).not.toContain('better-auth.session_token=tok');
    });

    it('logout() clears the session cookie and refetches', async () => {
      const { useStaffAuth, signOut, refetch } = setupModule({
        data: { user: { id: 'u1', email: 'alice@example.com', name: 'Alice', roles: ['ADMIN_STAFF'] } },
        isPending: false,
      });
      document.cookie = 'better-auth.session_token=tok-123; Path=/';

      const { result } = renderHook(() => useStaffAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(signOut).toHaveBeenCalled();
      expect(document.cookie).not.toContain('better-auth.session_token=tok-123');
      expect(refetch).toHaveBeenCalled();
    });
  });

  describe('StaffAuthGuard', () => {
    it('redirects to /login when there is no active session', () => {
      const { StaffAuthGuard, push } = setupModule({ data: null, isPending: false });

      render(
        <StaffAuthGuard>
          <div>protected content</div>
        </StaffAuthGuard>,
      );

      expect(push).toHaveBeenCalledWith('/login');
      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    });

    it('renders children once a session is present', () => {
      const { StaffAuthGuard, push } = setupModule({
        data: { user: { id: 'u1', email: 'alice@example.com', name: 'Alice', roles: ['ADMIN_STAFF'] } },
        isPending: false,
      });

      render(
        <StaffAuthGuard>
          <div>protected content</div>
        </StaffAuthGuard>,
      );

      expect(screen.getByText('protected content')).toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
    });

    it('renders nothing and does not redirect while the session is still pending', () => {
      const { StaffAuthGuard, push } = setupModule({ data: null, isPending: true });

      render(
        <StaffAuthGuard>
          <div>protected content</div>
        </StaffAuthGuard>,
      );

      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
    });
  });

  describe('StaffAuthRuntimeProvider', () => {
    it('registers a runtime adapter with no cached access token (Better Auth uses a cookie, not a bearer token)', () => {
      const { StaffAuthRuntimeProvider } = setupModule();

      render(
        <StaffAuthRuntimeProvider>
          <div>app</div>
        </StaffAuthRuntimeProvider>,
      );

      const adapter = getAuthRuntimeAdapter();
      expect(adapter).not.toBeNull();
      expect(adapter?.getAccessToken()).toBeNull();
    });

    it('refreshSession() resolves once a session exists', async () => {
      const { StaffAuthRuntimeProvider, getSession } = setupModule();
      getSession.mockResolvedValue({ data: { user: { id: 'u1' } } });

      render(
        <StaffAuthRuntimeProvider>
          <div>app</div>
        </StaffAuthRuntimeProvider>,
      );

      await expect(getAuthRuntimeAdapter()?.refreshSession()).resolves.toBe('');
      expect(getSession).toHaveBeenCalled();
    });

    it('refreshSession() rejects when Better Auth reports no active session', async () => {
      const { StaffAuthRuntimeProvider, getSession } = setupModule();
      getSession.mockResolvedValue({ data: null });

      render(
        <StaffAuthRuntimeProvider>
          <div>app</div>
        </StaffAuthRuntimeProvider>,
      );

      await expect(getAuthRuntimeAdapter()?.refreshSession()).rejects.toThrow('No active Better Auth session');
    });
  });
});
