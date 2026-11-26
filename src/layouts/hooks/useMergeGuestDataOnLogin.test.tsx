import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  vi.clearAllMocks();
  vi.mocked(mergeCartAfterLogin).mockResolvedValue([]);
  vi.mocked(mergeWishlistAfterLogin).mockResolvedValue([]);
});

afterEach(() => {
  // Reset the real auth store through its public API: logout() clears auth synchronously.
  const { result } = renderHook(() => useAuth());
  act(() => {
    result.current.logout();
  });
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
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    const { result } = renderHook(useProbe);

    try {
      await act(async () => {
        result.current.logout();
      });
      await act(async () => {
        result.current.login('token', user);
      });
      // Let any escaped rejection surface (Node emits 'unhandledRejection' after the microtask queue drains).
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      process.off('unhandledRejection', unhandled);
    }

    expect(mergeCartAfterLogin).toHaveBeenCalledTimes(1);
    expect(mergeWishlistAfterLogin).toHaveBeenCalledTimes(1);
    expect(unhandled).not.toHaveBeenCalled();
    expect(result.current.isLoggedIn).toBe(true);
  });
});
