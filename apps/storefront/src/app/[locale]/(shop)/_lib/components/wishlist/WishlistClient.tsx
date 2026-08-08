'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { useWishlist } from '@/app/[locale]/(shop)/_lib/hooks/useWishlist';
import { getProductPriceRange } from '@/app/[locale]/(shop)/_lib/utils/priceRange';
import { getVariantAxes, resolveSku } from '@/app/[locale]/(shop)/_lib/utils/variantResolution';

interface WishlistClientProps {
  readonly locale: string;
}

export function WishlistClient({ locale }: WishlistClientProps) {
  const router = useRouter();
  const { products, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  /**
   * Move to cart (glossary.md — Move to cart): a Product with ≥1 Variant navigates to the PDP so the
   * customer picks Color/Size themselves; a Product with no Variant (hidden 1:1 SKU) is added straight
   * to the cart and dropped from the wishlist.
   */
  const handleMoveToCart = (product: (typeof products)[number]) => {
    const axes = getVariantAxes(product.skus);
    const hasVariant = axes.colors.length > 0 || axes.sizes.length > 0;

    if (hasVariant) {
      router.push(`/${locale}/products/${product.slug}`);
      return;
    }

    const sku = resolveSku(product.skus, {});
    if (sku === null || sku.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    const result = addToCart(sku.id, 1, sku.stock);
    if (!result.ok) {
      toast.error('Sản phẩm này đã có đủ số lượng tồn kho trong giỏ hàng.');
      return;
    }

    removeFromWishlist(product.id);
    toast.success('Đã chuyển sản phẩm vào giỏ hàng', { description: product.name });
  };

  if (isLoading) {
    return <p className="text-muted-foreground py-12 text-center">Đang tải…</p>;
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="bg-muted flex size-20 items-center justify-center rounded-full">
          <Heart className="text-muted-foreground size-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Danh sách yêu thích đang trống</h2>
          <p className="text-muted-foreground mt-2 text-sm">Bấm biểu tượng trái tim trên sản phẩm để lưu vào đây.</p>
        </div>
        <Button asChild size="lg">
          <Link href={`/${locale}/products`}>Khám phá sản phẩm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const { min, isRange } = getProductPriceRange(product);
        return (
          <div key={product.id} className="bg-card flex flex-col gap-3 overflow-hidden rounded-xl border p-4">
            <Link href={`/${locale}/products/${product.slug}`} className="bg-muted relative block aspect-square overflow-hidden rounded-lg">
              <Image src={product.images[0] ?? '/placeholder-product.png'} alt={product.name} fill className="object-cover" sizes="33vw" />
            </Link>
            <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
            <p className="text-brand-600 text-lg font-bold tabular-nums">
              {isRange ? <span className="text-muted-foreground mr-1 text-xs font-normal">Từ</span> : null}
              {formatCurrency(min)}
            </p>
            <div className="mt-auto flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => {
                  handleMoveToCart(product);
                }}
              >
                <ShoppingCart className="size-4" />
                Thêm vào giỏ
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Xoá khỏi yêu thích"
                onClick={() => {
                  removeFromWishlist(product.id);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
