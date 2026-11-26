'use client';

import { useEffect, useRef } from 'react';

import { mergeCartOnLogin } from '@/features/cart/hooks/useCart';
import { mergeWishlistOnLogin } from '@/features/wishlist/hooks/useWishlist';
import { useAuth } from '@/modules/auth/session/useAuth';

/** Shop-level orchestration: merge guest cart and wishlist once when the session becomes
 * authenticated. Keep this in the storefront shell so identity/session does not own shopping data. */
export function useMergeGuestDataOnLogin(): void {
  const { authStatus } = useAuth();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!wasAuthenticated.current && authStatus === 'authenticated') {
      mergeCartOnLogin().catch(() => undefined);
      mergeWishlistOnLogin().catch(() => undefined);
    }
    wasAuthenticated.current = authStatus === 'authenticated';
  }, [authStatus]);
}
