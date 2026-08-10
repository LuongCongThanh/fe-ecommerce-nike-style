import type { LucideIcon } from 'lucide-react';
import { Flame, Footprints, Shirt, ShoppingBag, Watch } from 'lucide-react';

export interface NavSubCategory {
  slug: string;
  name: string;
}

export interface NavCategory {
  slug: string;
  name: string;
  icon: LucideIcon;
  productCount: number;
  sub: NavSubCategory[];
}

// English taxonomy — the single source of truth for category name/slug across the header
// (DesktopMegaMenu, MobileNav) and the homepage (home.ts's homeCategoriesData derives from this
// array instead of hand-duplicating it, so the two surfaces can't drift out of sync again).
//
// Top-level slugs/names match `mockCategories` (packages/api-sdk/src/mocks/catalog-fixtures.ts,
// Decision #95) 1:1, so `/categories/[slug]` resolves for every top-level link. `sub` slugs are
// flat (no `{parent}/` prefix) because `/categories/[slug]` is a single dynamic segment, not a
// catch-all — a nested slug would 404 before even reaching the category-not-found data check. Most
// `sub` entries still have no matching leaf Category/Product in the mock fixture (placeholder
// taxonomy, richer than the seeded mock data) and will hit "Category not found" until backed.
export const NAV_CATEGORIES: [NavCategory, ...NavCategory[]] = [
  {
    slug: 'tops',
    name: 'Tops',
    icon: Shirt,
    productCount: 120,
    sub: [
      { slug: 't-shirts', name: 'T-Shirts' },
      { slug: 'shirts', name: 'Shirts' },
      { slug: 'jackets', name: 'Jackets' },
      { slug: 'hoodies', name: 'Hoodies & Sweatshirts' },
      { slug: 'polos', name: 'Polo Shirts' },
      { slug: 'tank-tops', name: 'Tank Tops' },
    ],
  },
  {
    slug: 'bottoms',
    name: 'Bottoms',
    icon: Shirt,
    productCount: 85,
    sub: [
      { slug: 'jeans', name: 'Jeans' },
      { slug: 'dress-pants', name: 'Dress Pants' },
      { slug: 'shorts', name: 'Shorts' },
      { slug: 'athletic-pants', name: 'Athletic Pants' },
      { slug: 'chinos', name: 'Chinos' },
    ],
  },
  {
    slug: 'shoes',
    name: 'Shoes',
    icon: Footprints,
    productCount: 64,
    sub: [
      { slug: 'running', name: 'Running' },
      { slug: 'basketball', name: 'Basketball' },
      { slug: 'sneakers', name: 'Sneakers' },
      { slug: 'leather-shoes', name: 'Leather Shoes' },
      { slug: 'sandals', name: 'Sandals & Slides' },
      { slug: 'boots', name: 'Boots & Chelsea' },
      { slug: 'loafers', name: 'Loafers' },
    ],
  },
  {
    slug: 'bags',
    name: 'Bags',
    icon: ShoppingBag,
    productCount: 48,
    sub: [
      { slug: 'backpacks', name: 'Backpacks' },
      { slug: 'tote-bags', name: 'Tote Bags' },
      { slug: 'crossbody-bags', name: 'Crossbody Bags' },
      { slug: 'handbags', name: 'Handbags' },
      { slug: 'clutches', name: 'Clutches' },
    ],
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    icon: Watch,
    productCount: 200,
    sub: [
      { slug: 'watches', name: 'Watches' },
      { slug: 'hats', name: 'Hats & Caps' },
      { slug: 'sunglasses', name: 'Sunglasses' },
      { slug: 'belts', name: 'Belts' },
      { slug: 'wallets', name: 'Wallets & Cardholders' },
      { slug: 'jewelry', name: 'Jewelry' },
    ],
  },
  {
    slug: 'sale',
    name: 'Sale',
    icon: Flame,
    productCount: 310,
    sub: [
      { slug: 'flash-sale', name: 'Flash Sale' },
      { slug: 'up-to-50-off', name: 'Up to 50% Off' },
      { slug: 'clearance', name: 'Clearance' },
      { slug: 'bundle-deals', name: 'Bundle Deals' },
    ],
  },
];
