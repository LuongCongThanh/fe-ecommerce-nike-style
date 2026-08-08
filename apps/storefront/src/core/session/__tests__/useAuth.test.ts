import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logout as revokeSession } from '@repo/api-sdk/endpoints/auth';

import { clearAuth, setAccessToken, setRefreshToken } from '@/core/session/auth-store';
import { login, useAuth, useIsLoggedIn } from '@/core/session/useAuth';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('next-intl', () => ({ useLocale: () => 'vi' }));

vi.mock('@repo/api-sdk/endpoints/auth', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

const mockUser = {
  id: 1,
  email: 'user@test.com',
  firstName: 'User',
  lastName: 'Test',
  avatar: null,
  role: 'customer' as const,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};
const mockAdmin = { ...mockUser, id: 2, email: 'admin@test.com', role: 'admin' as const };

describe('useAuth', () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it('returns logged out state by default', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('updates auth state after login', () => {
    const { result } = renderHook(() => useAuth());

    act(() => login('token123', mockUser));

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user?.email).toBe('user@test.com');
    expect(result.current.authStatus).toBe('authenticated');
    expect(result.current.isInitializing).toBe(false);
  });

  it('returns admin flag from the current user', () => {
    const { result } = renderHook(() => useAuth());

    act(() => login('token123', mockAdmin));

    expect(result.current.isAdmin).toBe(true);
  });

  it('clears auth state and redirects on logout', () => {
    const { result } = renderHook(() => useAuth());

    act(() => login('token123', mockUser));
    act(() => result.current.logout());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.authStatus).toBe('anonymous');
    expect(mockPush).toHaveBeenCalledWith('/vi/login');
  });

  it('calls the revoke endpoint with the refresh token on logout (acceptance criterion — issue #12)', async () => {
    setRefreshToken('refresh_abc');
    const { result } = renderHook(() => useAuth());

    act(() => login('token123', mockUser));
    act(() => result.current.logout());

    await waitFor(() => {
      expect(revokeSession).toHaveBeenCalledWith('refresh_abc');
    });
  });

  it('does not call the revoke endpoint when there was no refresh token to revoke', async () => {
    const { result } = renderHook(() => useAuth());

    act(() => login('token123', mockUser));
    act(() => result.current.logout());

    expect(revokeSession).not.toHaveBeenCalled();
  });
});

describe('useIsLoggedIn', () => {
  beforeEach(() => {
    clearAuth();
  });

  it('returns false when no token', () => {
    const { result } = renderHook(() => useIsLoggedIn());
    expect(result.current).toBe(false);
  });

  it('returns true after token is set', () => {
    const { result } = renderHook(() => useIsLoggedIn());

    act(() => setAccessToken('tok_abc'));

    expect(result.current).toBe(true);
  });
});
