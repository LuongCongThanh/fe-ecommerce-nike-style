# Phác thảo kiến trúc: Enterprise E-commerce Platform

> Bản phác thảo này giữ góc nhìn định hướng ban đầu và nguồn cảm hứng kiến trúc. Nó không phải tài liệu quyết định hiện hành. Khi có mâu thuẫn, ưu tiên `requirements/`, `decision-log.md`, ADR, và `architecture/`.

Mục tiêu của bản nháp này là trả lời một câu hỏi rất sớm: nếu muốn đi theo hướng Brand Commerce quy mô lớn kiểu Nike, Apple hoặc Adidas, hệ thống nên được hình dung ra sao ở mức cao.

Các nền tảng kiểu này thường hội tụ bốn đặc điểm:

1. Tốc độ tải cực nhanh (Core Web Vitals tốt).
2. UI/UX và animation tinh xảo.
3. SEO mạnh.
4. Khả năng mở rộng ổn định trong nhiều năm.

## Nên đọc phần nào

- Đọc `1. Kiến trúc tổng thể`, `2. Công nghệ đề xuất`, `3. Các module chính` nếu bạn chỉ cần nắm tinh thần ban đầu.
- Tra cứu theo chủ đề ở các phần sau nếu đang nghĩ về sitemap, design system, module, hoặc performance.
- Không dùng file này để chốt scope MVP, RBAC, auth, release slicing, hay test coverage hiện hành.

---

## 1. Kiến trúc tổng thể

```txt
                    E-Commerce Platform
                             |
    ------------------------------------------------
    |                 |               |            |
Storefront          Admin          CMS         Analytics
(Next.js)          (Next.js)      (Next.js)   (PostHog)
```

Monorepo:

```txt
apps/
    storefront
    admin
    cms

packages/
    ui
    design-tokens
    api-sdk
    eslint-config
    ts-config
    utils
    hooks
    constants

docs/
```

---

## 2. Công nghệ đề xuất

| Layer        | Technology            |
| ------------ | --------------------- |
| Framework    | Next.js 16            |
| Language     | TypeScript             |
| Styling      | Tailwind v4           |
| Components   | shadcn/ui             |
| State        | Zustand               |
| Server State | TanStack Query        |
| Form         | React Hook Form + Zod |
| Animation    | Framer Motion + Rombo |
| Testing      | Vitest + Playwright   |
| UI Review    | Hallmark              |
| Monitoring   | Sentry                |
| Analytics    | PostHog               |
| Deployment   | Vercel                |
| Monorepo     | Turborepo             |

---

## 3. Các module chính

### Storefront

```txt
Home
Category
PLP (Product Listing)
PDP (Product Detail)
Search
Wishlist
Cart
Checkout
Order
Profile
```

### Admin

```txt
Dashboard
Product Management
Category Management
Coupon
Promotion
Banner
Order
User
Report
```

### CMS

```txt
Landing Page Builder
Blog
SEO
Content Block
Campaign
```

---

## 4. Sitemap

```txt
/
├── men
├── women
├── kids
├── collections
├── sale
├── search
├── product/[slug]
├── cart
├── checkout
├── account
│   ├── profile
│   ├── orders
│   └── wishlist
└── blog
```

---

## 5. Design System

```txt
Color
Typography
Spacing
Radius
Shadow
Motion
Icon
Elevation
```

Ví dụ:

```ts
export const colors = {
    primary: "#111111",
    secondary: "#757575",
    success: "#00A651",
};
```

---

## 6. Thư viện Component

### Component nền tảng

```txt
Button
Input
Modal
Drawer
Toast
Card
Tabs
Carousel
Accordion
Skeleton
Pagination
```

### Component E-commerce

```txt
ProductCard
ProductGrid
ImageGallery
SizeSelector
ColorSelector
PriceTag
CartItem
OrderTimeline
CouponInput
CheckoutStepper
```

---

## 7. Kiến trúc theo Feature

```txt
src/
    features/
        auth/
        product/
        category/
        search/
        cart/
        checkout/
        wishlist/
        order/
        profile/
```

Ví dụ:

```txt
product/
    api
    components
    hooks
    services
    types
    tests
```

---

## 8. Cơ sở dữ liệu (Back-end)

```txt
users
products
product_images
categories
brands
carts
cart_items
orders
order_items
payments
addresses
reviews
wishlists
coupons
```

Khi mở rộng:

```txt
inventory
warehouse
shipment
returns
refund
gift_card
promotion
```

---

## 9. Tìm kiếm

Nike và Adidas đều đầu tư mạnh vào tìm kiếm:

```txt
Search
    |
Autocomplete
    |
Suggestions
    |
Popular Search
    |
Filter
    |
Sort
```

Công cụ:

* Elasticsearch.
* Algolia.
* Meilisearch.

---

## 10. Hiệu năng

Mục tiêu:

| Metric     | Target |
| ---------- | ------ |
| LCP        | <2.5s  |
| CLS        | <0.1   |
| INP        | <200ms |
| Lighthouse | >95    |

Kỹ thuật tối ưu:

```txt
Image Optimization
Code Splitting
ISR
Prefetch
Caching
CDN
```

---

## 11. Kiểm thử

```txt
Unit Test
Integration Test
E2E Test
Visual Test
Accessibility Test
```

Công cụ:

```txt
Vitest
Playwright
Chromatic
Hallmark
```

---

## 12. CI/CD

```txt
Push
 ↓
PR
 ↓
Lint
 ↓
Type Check
 ↓
Test
 ↓
Build
 ↓
Deploy
```

---

## 13. Giám sát

```txt
Sentry
PostHog
Google Analytics
```

---

## 14. Công cụ & quy trình UI/UX

```txt
Figma
Storybook
Rombo
Hallmark
```

---

## 15. Kiến trúc Front-end tổng hợp

```txt
apps/
    storefront
    admin
    cms

packages/
    ui
    design-token
    api-sdk
    hooks
    constants
    utils

services/
    auth
    product
    cart
    order
    payment
```

---

## 16. Roadmap triển khai

### Phase 1 (Tuần 1-2)

* Setup Turborepo.
* Setup Next.js 16.
* Setup Design System.
* Setup Storybook.

### Phase 2 (Tuần 3-4)

* Authentication.
* Home.
* Category.
* Product Detail.

### Phase 3 (Tuần 5-6)

* Cart.
* Wishlist.
* Checkout.

### Phase 4 (Tuần 7-8)

* Orders.
* Profile.
* Search.

### Phase 5 (Tuần 9-10)

* Admin Dashboard.
* CMS.

### Phase 6 (Tuần 11-12)

* Playwright.
* Hallmark.
* Sentry.
* Lighthouse.
* Performance Optimization.

---

## 17. Kết luận: ngăn xếp công nghệ đề xuất

Để xây dựng lại Nike bằng Next.js ở thời điểm hiện tại, ngăn xếp công nghệ được chọn là:

```txt
Next.js 16
React 19
TypeScript
Tailwind v4
shadcn/ui
TanStack Query
Zustand
Storybook
Playwright
Hallmark
Rombo
Sentry
PostHog
Turborepo
```

Ngăn xếp này tạo ra một nền tảng E-commerce hiện đại, dễ mở rộng theo quy mô người dùng tăng dần mà không cần thay đổi kiến trúc front-end trong nhiều năm.
