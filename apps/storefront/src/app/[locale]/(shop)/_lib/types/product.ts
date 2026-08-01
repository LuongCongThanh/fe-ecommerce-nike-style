import type { BadgeValue, Product as SharedProduct } from '@/shared/types/product';

export type { BadgeValue };

// UI size/variant selector option — distinct from API ProductVariant (which has color, size, price fields)
export type SizeOption = {
  id: string;
  label: string;
  stock: number;
};

// Shop UI product — extends shared API shape, overrides fields that differ in the UI layer
export type ProductDisplay = Omit<SharedProduct, 'category' | 'variants' | 'stock' | 'isActive' | 'createdAt' | 'updatedAt'> & {
  categorySlug: string;
  badges: BadgeValue[];
  variants: SizeOption[];
};
