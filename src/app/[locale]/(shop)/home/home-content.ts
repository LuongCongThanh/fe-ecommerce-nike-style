import type { HomeBenefit, HomeHero, HomeTestimonial } from '@/app/[locale]/(shop)/home/types/home';

/**
 * Deterministic, visually distinct placeholder image per seed — replaces the single shared
 * placeholder photo every homepage product/category/hero used to point at, which made every
 * card on the page look like the same product (homepage-improvement-plan.md P0-2/P1-3).
 * Swap for real photography when available — `placehold.co` is already an allowed
 * `next.config.ts` image remote pattern.
 */
const PLACEHOLDER_PALETTE = ['92400e', '1e3a8a', '166534', '9d174d', '581c87', '134e4a', '7c2d12', '1e293b'] as const;

export function placeholderImage(seed: string, size: string, label: string): string {
  const hash = seed.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const bg = PLACEHOLDER_PALETTE[hash % PLACEHOLDER_PALETTE.length] ?? PLACEHOLDER_PALETTE[0];
  // Explicit /png format: placehold.co defaults to image/svg+xml, and next/image's Image
  // Optimization API rejects SVG sources unless `dangerouslyAllowSVG` is set in next.config.ts
  // (not set here) — every homepage image would 400 without this segment.
  return `https://placehold.co/${size}/${bg}/ffffff/png?text=${encodeURIComponent(label)}`;
}

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

export const homeHeroData: HomeHero = {
  badge: 'Mới nhất 2026',
  title: 'Mua sắm thông minh,\ntiết kiệm hơn',
  subtitle: 'Hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc.',
  cta: 'Mua ngay',
  ctaSale: 'Xem Flash Sale',
  image: '/images/hero-placeholder.jpg',
  trustItems: ['Giao hàng miễn phí', 'Đổi trả 30 ngày', 'Hàng chính hãng 100%'],
};

/**
 * Placeholder copy, not real customer submissions — no verified testimonial source exists yet.
 * `home/page.tsx` only renders `SectionTestimonials` outside production; do not wire this into a
 * production surface until it is backed by real reviews or explicitly labelled as demo content.
 */
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
