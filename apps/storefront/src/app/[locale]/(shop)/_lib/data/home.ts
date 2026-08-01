import type { HomeBenefit, HomeCategory, HomeHero, HomeProductHighlight, HomeTestimonial } from '@/app/[locale]/(shop)/_lib/types/home';

export const homeBenefitsData: HomeBenefit[] = [
  {
    id: 'shipping',
    icon: 'Truck',
    title: 'Miễn phí vận chuyển',
    description: 'Đơn hàng từ 300.000đ được miễn phí ship toàn quốc.',
  },
  {
    id: 'returns',
    icon: 'RotateCcw',
    title: 'Đổi trả 30 ngày',
    description: 'Không hài lòng? Đổi trả miễn phí trong vòng 30 ngày.',
  },
  {
    id: 'authentic',
    icon: 'ShieldCheck',
    title: 'Hàng chính hãng 100%',
    description: 'Cam kết tất cả sản phẩm đều có nguồn gốc rõ ràng.',
  },
  {
    id: 'support',
    icon: 'Headphones',
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ CSKH sẵn sàng hỗ trợ bất cứ lúc nào.',
  },
];

export const homeCategoriesData: HomeCategory[] = [
  { slug: 'ao', name: 'Áo', image: '/images/categories/ao.jpg', productCount: 120 },
  { slug: 'quan', name: 'Quần', image: '/images/categories/quan.jpg', productCount: 85 },
  { slug: 'giay', name: 'Giày', image: '/images/categories/giay.jpg', productCount: 64 },
  { slug: 'tui', name: 'Túi xách', image: '/images/categories/tui.jpg', productCount: 48 },
  { slug: 'phu-kien', name: 'Phụ kiện', image: '/images/categories/phu-kien.jpg', productCount: 200 },
  { slug: 'sale', name: 'Sale', image: '/images/categories/sale.jpg', productCount: 310 },
];

export const homeHeroData: HomeHero = {
  badge: 'Mới nhất 2026',
  title: 'Mua sắm thông minh,\ntiết kiệm hơn',
  subtitle: 'Hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc.',
  cta: 'Mua ngay',
  ctaSale: 'Xem Flash Sale',
  image: '/images/hero-placeholder.jpg',
  trustItems: ['Giao hàng miễn phí', 'Đổi trả 30 ngày', 'Hàng chính hãng 100%'],
};

export const bestSellersData: HomeProductHighlight[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Sản phẩm bán chạy ${String(i + 1)}`,
  slug: `san-pham-ban-chay-${String(i + 1)}`,
  price: (i + 1) * 150_000 + 200_000,
  salePrice: i % 3 === 0 ? (i + 1) * 120_000 + 180_000 : null,
  images: ['/images/products/placeholder.jpg'],
  rating: 4 + (i % 2) * 0.5,
  reviewCount: 10 + i * 5,
  badges: i === 0 ? ['best-seller'] : i % 4 === 0 ? ['sale'] : [],
}));

export const newArrivalsData: HomeProductHighlight[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 100,
  name: `Hàng mới về ${String(i + 1)}`,
  slug: `hang-moi-ve-${String(i + 1)}`,
  price: (i + 1) * 200_000 + 300_000,
  salePrice: null,
  images: ['/images/products/placeholder.jpg'],
  rating: 4.2,
  reviewCount: (i + 1) * 2,
  badges: ['new'],
}));

export const homeTestimonialsData: HomeTestimonial[] = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    avatar: 'https://i.pravatar.cc/150?u=lan',
    rating: 5,
    quote: 'Sản phẩm chất lượng, giao hàng nhanh. Rất hài lòng!',
    meta: 'Mua áo thun nam',
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    avatar: 'https://i.pravatar.cc/150?u=minh',
    rating: 5,
    quote: 'Giá tốt, hàng đúng mô tả, sẽ mua lại lần sau.',
    meta: 'Mua giày sneaker',
  },
  {
    id: 3,
    name: 'Lê Thị Hoa',
    avatar: 'https://i.pravatar.cc/150?u=hoa',
    rating: 4,
    quote: 'Shop tư vấn nhiệt tình, đóng gói cẩn thận.',
    meta: 'Mua túi xách nữ',
  },
  {
    id: 4,
    name: 'Phạm Quốc Hùng',
    avatar: 'https://i.pravatar.cc/150?u=hung',
    rating: 5,
    quote: 'Đây là lần thứ 5 tôi mua, không bao giờ thất vọng.',
    meta: 'Khách hàng thân thiết',
  },
];
