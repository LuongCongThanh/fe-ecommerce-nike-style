'use client';

import { useEffect, useRef } from 'react';

import { mergeCartOnLogin } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { mergeWishlistOnLogin } from '@/app/[locale]/(shop)/_lib/hooks/useWishlist';
import { useAuth } from '@/core/session/useAuth';

/**
 * Merge cart + wishlist sau đăng nhập (Decision #36, glossary.md — Merge Wishlist) — chạy đúng 1 lần
 * khi status chuyển sang authenticated (đăng nhập/đăng ký thành công), không chạy lại mỗi lần component
 * gọi hook này re-render trong lúc đã đăng nhập. Sống ở `_lib/hooks` của shop (không phải
 * `core/session`) vì merge cart/wishlist là khái niệm của shop, còn `core/session` chỉ giữ danh tính.
 */
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
