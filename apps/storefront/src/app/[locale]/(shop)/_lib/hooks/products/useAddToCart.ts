'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import type { ProductDisplay, SizeOption } from '@/app/[locale]/(shop)/_lib/types/product';

export function useAddToCart(product: ProductDisplay) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<SizeOption | null>(product.variants[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const maxStock = selectedVariant?.stock ?? 99;

  const selectVariant = (variant: SizeOption) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const add = () => {
    if (product.variants.length > 0 && selectedVariant === null) {
      toast.error('Vui lòng chọn phân loại sản phẩm');
      return false;
    }

    addToCart({
      productId: product.id.toString(),
      variantId: selectedVariant?.id ?? `v-${product.id.toString()}`,
      name: product.name,
      image: product.images.at(0) ?? '',
      price: product.salePrice ?? product.price,
      quantity,
      variantName: selectedVariant?.label,
    });

    setIsAdded(true);
    toast.success(`Đã thêm ${quantity.toString()} sản phẩm vào giỏ hàng`, {
      description: product.name + (selectedVariant === null ? '' : ` (${selectedVariant.label})`),
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
    selectedVariant,
    quantity,
    isAdded,
    maxStock,
    selectVariant,
    setQuantity,
    add,
    buyNow,
  };
}
