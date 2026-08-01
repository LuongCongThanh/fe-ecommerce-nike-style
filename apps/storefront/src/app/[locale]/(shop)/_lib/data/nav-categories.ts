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

export const NAV_CATEGORIES: [NavCategory, ...NavCategory[]] = [
  {
    slug: 'ao',
    name: 'Áo',
    icon: Shirt,
    productCount: 120,
    sub: [
      { slug: 'ao/ao-thun', name: 'Áo thun' },
      { slug: 'ao/ao-so-mi', name: 'Áo sơ mi' },
      { slug: 'ao/ao-khoac', name: 'Áo khoác' },
      { slug: 'ao/ao-hoodie', name: 'Hoodie & Sweatshirt' },
      { slug: 'ao/ao-polo', name: 'Áo polo' },
      { slug: 'ao/ao-ba-lo', name: 'Áo ba lỗ' },
    ],
  },
  {
    slug: 'quan',
    name: 'Quần',
    icon: Shirt,
    productCount: 85,
    sub: [
      { slug: 'quan/quan-jeans', name: 'Quần jeans' },
      { slug: 'quan/quan-tay', name: 'Quần tây' },
      { slug: 'quan/quan-short', name: 'Quần short' },
      { slug: 'quan/quan-the-thao', name: 'Quần thể thao' },
      { slug: 'quan/quan-kaki', name: 'Quần kaki' },
    ],
  },
  {
    slug: 'giay',
    name: 'Giày',
    icon: Footprints,
    productCount: 64,
    sub: [
      { slug: 'giay/giay-the-thao', name: 'Giày thể thao' },
      { slug: 'giay/giay-da', name: 'Giày da' },
      { slug: 'giay/giay-sandal', name: 'Sandal & Dép' },
      { slug: 'giay/giay-boot', name: 'Boot & Chelsea' },
      { slug: 'giay/giay-luoi', name: 'Giày lười' },
    ],
  },
  {
    slug: 'tui',
    name: 'Túi xách',
    icon: ShoppingBag,
    productCount: 48,
    sub: [
      { slug: 'tui/balo', name: 'Balo' },
      { slug: 'tui/tui-tote', name: 'Túi tote' },
      { slug: 'tui/tui-deo-cheo', name: 'Túi đeo chéo' },
      { slug: 'tui/tui-xach-tay', name: 'Túi xách tay' },
      { slug: 'tui/clutch', name: 'Ví clutch' },
    ],
  },
  {
    slug: 'phu-kien',
    name: 'Phụ kiện',
    icon: Watch,
    productCount: 200,
    sub: [
      { slug: 'phu-kien/dong-ho', name: 'Đồng hồ' },
      { slug: 'phu-kien/mu-non', name: 'Mũ & Nón' },
      { slug: 'phu-kien/kinh-mat', name: 'Kính mắt' },
      { slug: 'phu-kien/that-lung', name: 'Thắt lưng' },
      { slug: 'phu-kien/vi', name: 'Ví & Thẻ' },
      { slug: 'phu-kien/trang-suc', name: 'Trang sức' },
    ],
  },
  {
    slug: 'sale',
    name: 'Sale',
    icon: Flame,
    productCount: 310,
    sub: [
      { slug: 'sale/flash-sale', name: 'Flash Sale' },
      { slug: 'sale/giam-50', name: 'Giảm đến 50%' },
      { slug: 'sale/clearance', name: 'Thanh lý kho' },
      { slug: 'sale/combo', name: 'Mua combo tiết kiệm' },
    ],
  },
];
