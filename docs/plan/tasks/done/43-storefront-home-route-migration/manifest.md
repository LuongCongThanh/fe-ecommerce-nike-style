# Manifest phạm vi — Home và phần triển khai còn lại trong route

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/app/[locale]/(auth)/forgot-password/page.tsx`
- `src/app/[locale]/(auth)/layout.tsx`
- `src/app/[locale]/(auth)/login/page.tsx`
- `src/app/[locale]/(auth)/register/page.tsx`
- `src/app/[locale]/(auth)/reset-password/[token]/page.tsx`
- `src/app/[locale]/(shop)/account/addresses/page.tsx`
- `src/app/[locale]/(shop)/account/layout.tsx`
- `src/app/[locale]/(shop)/account/orders/[id]/page.tsx`
- `src/app/[locale]/(shop)/account/orders/page.tsx`
- `src/app/[locale]/(shop)/account/profile/page.tsx`
- `src/app/[locale]/(shop)/cart/page.tsx`
- `src/app/[locale]/(shop)/categories/[slug]/page.tsx`
- `src/app/[locale]/(shop)/checkout/layout.tsx`
- `src/app/[locale]/(shop)/checkout/page.tsx`
- `src/app/[locale]/(shop)/checkout/success/page.tsx`
- `src/app/[locale]/(shop)/home/page.tsx`
- `src/app/[locale]/(shop)/layout.tsx`
- `src/app/[locale]/(shop)/page.tsx`
- `src/app/[locale]/(shop)/products/[slug]/page.tsx`
- `src/app/[locale]/(shop)/products/page.tsx`
- `src/app/[locale]/(shop)/search/page.tsx`
- `src/app/[locale]/(shop)/wishlist/page.tsx`
- `src/app/[locale]/error.tsx`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/loading.tsx`
- `src/app/_composition/AppProviders.test.tsx`
- `src/app/_composition/AppProviders.tsx`
- `src/app/favicon.ico`
- `src/app/layout.test.tsx`
- `src/app/layout.tsx`
- `src/app/not-found.tsx`
- `src/app/opengraph-image.tsx`
- `src/app/page.tsx`
- `src/app/~offline/page.tsx`
- `src/features/home/components/CountdownTimer.test.tsx`
- `src/features/home/components/CountdownTimer.tsx`
- `src/features/home/components/FlashSaleBanner.tsx`
- `src/features/home/components/HeroBanner.tsx`
- `src/features/home/components/HeroCarousel.tsx`
- `src/features/home/components/NewsletterForm.test.tsx`
- `src/features/home/components/NewsletterForm.tsx`
- `src/features/home/components/SectionEditorialCollection.tsx`
- `src/features/home/components/SectionFeaturedCategories.tsx`
- `src/features/home/components/SectionHero.tsx`
- `src/features/home/components/SectionNewArrivals.tsx`
- `src/features/home/components/SectionNewsletter.tsx`
- `src/features/home/components/SectionTestimonials.tsx`
- `src/features/home/components/SectionWhyChooseUs.tsx`
- `src/features/home/components/TestimonialCard.tsx`
- `src/features/home/components/TrustBadgeList.tsx`
- `src/features/home/components/hero3d/HeroSlides3D.tsx`
- `src/features/home/components/hero3d/cssColor.ts`
- `src/features/home/components/hero3d/dissolveShader.ts`
- `src/features/home/components/motion.ts`
- `src/features/home/home-content.ts`
- `src/features/home/hooks/useHomeFlashSaleCountdown.ts`
- `src/features/home/hooks/useNewsletterForm.ts`
- `src/features/home/types/home.ts`
- `src/shared/hooks/useCanRender3D.test.ts`
- `src/shared/hooks/useCanRender3D.ts`

## Consumer trực tiếp hiện tại ngoài owner

- Không thấy consumer ngoài owner bằng quét literal alias; vẫn phải rà config/dynamic import ở plan.

## Config/docs cần đối chiếu

- `eslint.config.mjs`
- `docs/architecture/README.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/app/_composition/AppProviders.test.tsx`
- `src/app/layout.test.tsx`
- `src/features/home/components/CountdownTimer.test.tsx`
- `src/features/home/components/NewsletterForm.test.tsx`
- `src/shared/hooks/useCanRender3D.test.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
