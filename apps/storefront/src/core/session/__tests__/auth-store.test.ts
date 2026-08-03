import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshSession } from '@repo/api-sdk/endpoints/auth';
import { getProfile } from '@repo/api-sdk/endpoints/profile';

import { bootstrapAuth, clearAuth, getAuthSnapshot } from '@/core/session/auth-store';

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

  it('sets status to authenticated when refresh and profile fetch both succeed', async () => {
    vi.mocked(refreshSession).mockResolvedValue({ access: 'new_token' });
    vi.mocked(getProfile).mockResolvedValue(mockUser);

    await bootstrapAuth();

    const snapshot = getAuthSnapshot();
    expect(snapshot.status).toBe('authenticated');
    expect(snapshot.token).toBe('new_token');
    expect(snapshot.user).toEqual(mockUser);
  });

  it('sets status to anonymous when refresh fails', async () => {
    vi.mocked(refreshSession).mockRejectedValue(new Error('refresh failed'));

    await bootstrapAuth();

    const snapshot = getAuthSnapshot();
    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.token).toBeNull();
    expect(snapshot.user).toBeNull();
  });

  it('sets status to anonymous and clears the token when refresh succeeds but profile fetch fails', async () => {
    vi.mocked(refreshSession).mockResolvedValue({ access: 'new_token' });
    vi.mocked(getProfile).mockRejectedValue(new Error('profile fetch failed'));

    await bootstrapAuth();

    const snapshot = getAuthSnapshot();
    expect(snapshot.status).toBe('anonymous');
    expect(snapshot.token).toBeNull();
    expect(snapshot.user).toBeNull();
  });
});
