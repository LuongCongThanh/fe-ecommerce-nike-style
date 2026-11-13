'use client';

import { useRouter } from 'next/navigation';

import { useCart } from '@/features/cart/hooks/useCart';
import { getVariantAxes, resolveSku } from '@/features/catalog/variantResolution';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import type { Product } from '@/lib/schemas/catalog/catalog';
import { notify } from '@/shared/lib/notification';

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
