'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Product } from '@repo/schemas/catalog';
import { notify } from '@repo/shared/notification';
import { useLocale } from 'next-intl';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import type { VariantSelection } from '@/app/[locale]/(shop)/_lib/utils/variantResolution';
import { getVariantAxes, resolveSku } from '@/app/[locale]/(shop)/_lib/utils/variantResolution';

/** Variant selection + resolved-SKU state for a PDP (glossary.md — Variant/SKU); adds the resolved SKU straight into the Cart (issue #13). */
export function useAddToCart(product: Product) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();

  const axes = getVariantAxes(product.skus);
  const [selection, setSelection] = useState<VariantSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const selectedSku = resolveSku(product.skus, selection);
  const maxStock = selectedSku?.stock ?? 0;

  const selectColor = (color: string) => {
    setSelection((prev) => ({ ...prev, color }));
    setQuantity(1);
  };

  const selectSize = (size: string) => {
    setSelection((prev) => ({ ...prev, size }));
    setQuantity(1);
  };

  const add = (): boolean => {
    if (selectedSku === null) {
      notify.error('Vui lòng chọn đầy đủ phân loại sản phẩm');
      return false;
    }
    if (selectedSku.stock === 0) {
      notify.error('Sản phẩm đã hết hàng');
      return false;
    }

    const variantName = [selection.color, selection.size].filter((v): v is string => v !== undefined).join(' / ');

    // No Reservation at add-to-cart time (glossary.md) — just a live `available > 0` check, clamped to
    // whatever room is left after what's already in the cart; refuses rather than silently over-adding.
    const result = addToCart(selectedSku.id, quantity, selectedSku.stock);
    if (!result.ok) {
      notify.error('Sản phẩm này đã có đủ số lượng tồn kho trong giỏ hàng.');
      return false;
    }

    setIsAdded(true);
    notify.success(`Đã thêm ${result.addedQuantity.toString()} sản phẩm vào giỏ hàng`, {
      description:
        product.name +
        (variantName === '' ? '' : ` (${variantName})`) +
        (result.addedQuantity < quantity ? ' — chỉ còn đủ hàng cho số lượng này' : ''),
      action: {
        label: 'Giỏ hàng',
        onClick: () => {
          router.push(`/${locale}/cart`);
        },
      },
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);

    return true;
  };

  const buyNow = () => {
    const added = add();
    if (added) {
      router.push(`/${locale}/checkout`);
    }
  };

  return {
    axes,
    selection,
    selectedSku,
    quantity,
    isAdded,
    maxStock,
    selectColor,
    selectSize,
    setQuantity,
    add,
    buyNow,
  };
}
