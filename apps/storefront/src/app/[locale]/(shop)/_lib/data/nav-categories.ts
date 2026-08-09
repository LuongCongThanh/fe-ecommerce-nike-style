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
export const NAV_CATEGORIES: [NavCategory, ...NavCategory[]] = [
  {
    slug: 'tops',
    name: 'Tops',
    icon: Shirt,
    productCount: 120,
    sub: [
      { slug: 'tops/t-shirts', name: 'T-Shirts' },
      { slug: 'tops/shirts', name: 'Shirts' },
      { slug: 'tops/jackets', name: 'Jackets' },
      { slug: 'tops/hoodies', name: 'Hoodies & Sweatshirts' },
      { slug: 'tops/polos', name: 'Polo Shirts' },
      { slug: 'tops/tank-tops', name: 'Tank Tops' },
    ],
  },
  {
    slug: 'bottoms',
    name: 'Bottoms',
    icon: Shirt,
    productCount: 85,
    sub: [
      { slug: 'bottoms/jeans', name: 'Jeans' },
      { slug: 'bottoms/dress-pants', name: 'Dress Pants' },
      { slug: 'bottoms/shorts', name: 'Shorts' },
      { slug: 'bottoms/athletic-pants', name: 'Athletic Pants' },
      { slug: 'bottoms/chinos', name: 'Chinos' },
    ],
  },
  {
    slug: 'shoes',
    name: 'Shoes',
    icon: Footprints,
    productCount: 64,
    sub: [
      { slug: 'shoes/sneakers', name: 'Sneakers' },
      { slug: 'shoes/leather-shoes', name: 'Leather Shoes' },
      { slug: 'shoes/sandals', name: 'Sandals & Slides' },
      { slug: 'shoes/boots', name: 'Boots & Chelsea' },
      { slug: 'shoes/loafers', name: 'Loafers' },
    ],
  },
  {
    slug: 'bags',
    name: 'Bags',
    icon: ShoppingBag,
    productCount: 48,
    sub: [
      { slug: 'bags/backpacks', name: 'Backpacks' },
      { slug: 'bags/tote-bags', name: 'Tote Bags' },
      { slug: 'bags/crossbody-bags', name: 'Crossbody Bags' },
      { slug: 'bags/handbags', name: 'Handbags' },
      { slug: 'bags/clutches', name: 'Clutches' },
    ],
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    icon: Watch,
    productCount: 200,
    sub: [
      { slug: 'accessories/watches', name: 'Watches' },
      { slug: 'accessories/hats', name: 'Hats & Caps' },
      { slug: 'accessories/sunglasses', name: 'Sunglasses' },
      { slug: 'accessories/belts', name: 'Belts' },
      { slug: 'accessories/wallets', name: 'Wallets & Cardholders' },
      { slug: 'accessories/jewelry', name: 'Jewelry' },
    ],
  },
  {
    slug: 'sale',
    name: 'Sale',
    icon: Flame,
    productCount: 310,
    sub: [
      { slug: 'sale/flash-sale', name: 'Flash Sale' },
      { slug: 'sale/up-to-50-off', name: 'Up to 50% Off' },
      { slug: 'sale/clearance', name: 'Clearance' },
      { slug: 'sale/bundle-deals', name: 'Bundle Deals' },
    ],
  },
];
