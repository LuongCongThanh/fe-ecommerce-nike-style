'use client';

import { useRouter } from 'next/navigation';

import type { Product } from '@repo/schemas/catalog';
import { notify } from '@repo/shared/notification';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { useWishlist } from '@/app/[locale]/(shop)/_lib/hooks/useWishlist';
import { getVariantAxes, resolveSku } from '@/app/[locale]/(shop)/_lib/utils/variantResolution';

/**
 * Move to cart (glossary.md — Move to cart): a Product with ≥1 Variant navigates to the PDP so the
 * customer picks Color/Size themselves; a Product with no Variant (hidden 1:1 SKU) is added straight
 * to the cart and dropped from the wishlist. Orchestrates `useCart`/`useWishlist`/navigation/toasts as
 * one unit so `WishlistClient` only has to call `moveToCart(product)`.
 */
export function useMoveToCart(locale: string) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();

  function moveToCart(product: Pick<Product, 'id' | 'slug' | 'name' | 'skus'>): void {
    const axes = getVariantAxes(product.skus);
    const hasVariant = axes.colors.length > 0 || axes.sizes.length > 0;

    if (hasVariant) {
      router.push(`/${locale}/products/${product.slug}`);
      return;
    }

    const sku = resolveSku(product.skus, {});
    if (sku === null || sku.stock === 0) {
      notify.error('Sản phẩm đã hết hàng');
      return;
    }

    const result = addToCart(sku.id, 1, sku.stock);
    if (!result.ok) {
      notify.error('Sản phẩm này đã có đủ số lượng tồn kho trong giỏ hàng.');
      return;
    }

    removeFromWishlist(product.id);
    notify.success('Đã chuyển sản phẩm vào giỏ hàng', { description: product.name });
  }

  return { moveToCart };
}
