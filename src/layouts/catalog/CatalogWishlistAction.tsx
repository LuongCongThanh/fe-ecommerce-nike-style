'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useIsWishlisted } from '@/features/wishlist/hooks/useWishlist';
import { SPRING_MOMENTUM, SPRING_UI } from '@/shared/styles/motion';

interface CatalogWishlistActionProps {
  readonly productId: string;
}

/**
 * Wishlist heart composed into a catalog `ProductCard` slot. Catalog never imports wishlist; this layout
 * owner subscribes to the wishlist and renders the overlay button. Favouriting is the one place a little
 * overshoot is earned.
 */
export function CatalogWishlistAction({ productId }: CatalogWishlistActionProps): React.JSX.Element {
  const t = useTranslations('product');
  const { isWishlisted, toggle } = useIsWishlisted(productId);

  return (
    <motion.button
      type="button"
      aria-label={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
      aria-pressed={isWishlisted}
      onClick={() => {
        toggle();
      }}
      whileTap={{ scale: 0.88 }}
      transition={SPRING_UI}
      className="bg-background/80 hover:bg-background focus-visible:ring-ring absolute top-3 right-3 flex size-10 items-center justify-center rounded-full backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <motion.span key={String(isWishlisted)} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={SPRING_MOMENTUM} className="flex">
        <Heart className={isWishlisted ? 'text-accent-600 fill-accent-600 size-4' : 'text-foreground size-4'} />
      </motion.span>
    </motion.button>
  );
}
