'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Product } from '@repo/schemas/catalog';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import type { VariantSelection } from '@/app/[locale]/(shop)/_lib/utils/variantResolution';
import { getVariantAxes, resolveSku } from '@/app/[locale]/(shop)/_lib/utils/variantResolution';

/**
 * Variant selection + resolved-SKU state for a PDP (glossary.md — Variant/SKU). Bridges into the
 * existing `useCart`/`CartItem` shape unchanged (Decision #84/#85 — Cart stays out of scope here):
 * `variantId` becomes the resolved SKU id, `price` is always read from that SKU, never re-derived.
 */
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
      toast.error('Vui lòng chọn đầy đủ phân loại sản phẩm');
      return false;
    }
    if (selectedSku.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return false;
    }

    const variantName = [selection.color, selection.size].filter((v): v is string => v !== undefined).join(' / ');

    addToCart({
      productId: product.id,
      variantId: selectedSku.id,
      name: product.name,
      image: product.images.at(0) ?? '',
      price: selectedSku.price,
      quantity,
      variantName: variantName === '' ? undefined : variantName,
    });

    setIsAdded(true);
    toast.success(`Đã thêm ${quantity.toString()} sản phẩm vào giỏ hàng`, {
      description: product.name + (variantName === '' ? '' : ` (${variantName})`),
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
