import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/features/auth/session/useAuth';
import { mergeCartAfterLogin } from '@/lib/api/endpoints/cart';
import { mergeWishlistAfterLogin } from '@/lib/api/endpoints/wishlist';
import { useMergeGuestDataOnLogin } from '@/layouts/hooks/useMergeGuestDataOnLogin';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-intl', () => ({ useLocale: () => 'vi' }));
vi.mock('@/lib/api/endpoints/cart', () => ({ mergeCartAfterLogin: vi.fn(), getSkusByIds: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/api/endpoints/wishlist', () => ({ mergeWishlistAfterLogin: vi.fn(), getProductsByIds: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/api/endpoints/auth', () => ({ logout: vi.fn().mockResolvedValue(undefined) }));

const user = {
  id: 1,
  email: 'user@test.com',
  firstName: 'User',
  lastName: 'Test',
  avatar: null,
  role: 'customer' as const,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};

function useProbe() {
  useMergeGuestDataOnLogin();
  return useAuth();
}

beforeEach(() => {
  vi.mocked(mergeCartAfterLogin).mockResolvedValue([]);
  vi.mocked(mergeWishlistAfterLogin).mockResolvedValue([]);
});

describe('useMergeGuestDataOnLogin', () => {
  it('merges the guest cart and wishlist once when the session becomes authenticated, not before', async () => {
    const { result, rerender } = renderHook(useProbe);

    expect(mergeCartAfterLogin).not.toHaveBeenCalled();
    expect(mergeWishlistAfterLogin).not.toHaveBeenCalled();

    await act(async () => {
      result.current.login('token', user);
    });
    rerender();

    expect(mergeCartAfterLogin).toHaveBeenCalledTimes(1);
    expect(mergeWishlistAfterLogin).toHaveBeenCalledTimes(1);
  });

  it('swallows merge failures instead of crashing the layout', async () => {
    vi.mocked(mergeCartAfterLogin).mockRejectedValue(new Error('cart'));
    vi.mocked(mergeWishlistAfterLogin).mockRejectedValue(new Error('wishlist'));
    const { result } = renderHook(useProbe);

    await act(async () => {
      result.current.logout();
    });
    await act(async () => {
      result.current.login('token', user);
    });

    expect(result.current.isLoggedIn).toBe(true);
  });
});
