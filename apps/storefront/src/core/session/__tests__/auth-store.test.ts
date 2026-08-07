import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshSession } from '@repo/api-sdk/endpoints/auth';
import { getProfile } from '@repo/api-sdk/endpoints/profile';

import { bootstrapAuth, clearAuth, getAuthSnapshot, setRefreshToken } from '@/core/session/auth-store';

vi.mock('@repo/api-sdk/endpoints/auth', () => ({
  refreshSession: vi.fn(),
}));

vi.mock('@repo/api-sdk/endpoints/profile', () => ({
  getProfile: vi.fn(),
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

describe('bootstrapAuth', () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  // Refresh token is memory-only in mock mode (Decision #90) — always gone right after a real F5, so
  // this is the actual behavior on every genuine page load, not just an edge case.
  it('short-circuits to anonymous without calling the network when there is no refresh token in memory', async () => {
    await bootstrapAuth();

    expect(refreshSession).not.toHaveBeenCalled();
    const snapshot = getAuthSnapshot();
    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.token).toBeNull();
  });

  it('sets status to authenticated when a refresh token is present and both refresh and profile fetch succeed', async () => {
    setRefreshToken('old_refresh_token');
    vi.mocked(refreshSession).mockResolvedValue({ access: 'new_token', refresh: 'new_refresh_token' });
    vi.mocked(getProfile).mockResolvedValue(mockUser);

    await bootstrapAuth();

    const snapshot = getAuthSnapshot();
    expect(snapshot.status).toBe('authenticated');
    expect(snapshot.token).toBe('new_token');
    expect(snapshot.user).toEqual(mockUser);
    expect(refreshSession).toHaveBeenCalledWith('old_refresh_token');
  });

  it('sets status to anonymous when refresh fails', async () => {
    setRefreshToken('old_refresh_token');
    vi.mocked(refreshSession).mockRejectedValue(new Error('refresh failed'));

    await bootstrapAuth();

    const snapshot = getAuthSnapshot();
    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.token).toBeNull();
    expect(snapshot.user).toBeNull();
  });

  it('sets status to anonymous and clears the token when refresh succeeds but profile fetch fails', async () => {
    setRefreshToken('old_refresh_token');
    vi.mocked(refreshSession).mockResolvedValue({ access: 'new_token', refresh: 'new_refresh_token' });
    vi.mocked(getProfile).mockRejectedValue(new Error('profile fetch failed'));

    await bootstrapAuth();

    const snapshot = getAuthSnapshot();
    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.token).toBeNull();
    expect(snapshot.user).toBeNull();
  });
});
