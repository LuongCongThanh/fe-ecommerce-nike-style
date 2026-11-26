'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/modules/auth/session/useAuth';
import { mergeCartOnLogin } from '@/modules/cart/hooks/useCart';
import { mergeWishlistOnLogin } from '@/modules/wishlist/hooks/useWishlist';

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
