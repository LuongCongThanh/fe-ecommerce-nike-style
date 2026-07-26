# Implementation Plan — Enterprise E-commerce Platform

## 1. Mục tiêu dự án

Xây dựng một nền tảng E-commerce có trải nghiệm tương tự Nike theo hướng:

* Brand Commerce, không chỉ là website hiển thị sản phẩm.
* UI tối giản, typography lớn, hình ảnh và nội dung thương hiệu nổi bật.
* Mobile-first.
* SEO tốt.
* Core Web Vitals tốt.
* Có Design System riêng.
* Có khả năng mở rộng Storefront, Admin và CMS.
* Front-end và Back-end có ranh giới rõ ràng.
* Có kiểm thử tự động và CI/CD.

Sản phẩm cuối cùng gồm ba ứng dụng:

```text
apps/
├── storefront
├── admin
└── cms
```

Các package dùng chung:

```text
packages/
├── ui
├── commerce
├── design-tokens
├── api-sdk
├── schemas
├── hooks
├── utilities
├── eslint-config
└── typescript-config
```

---

# 2. Nguyên tắc triển khai

## 2.1. Front-end đi trước, nhưng không bỏ qua thiết kế Back-end

Front-end sẽ được triển khai trước bằng:

```text
Mock data
+
MSW
+
API schemas
+
OpenAPI draft
```

Tuy nhiên, trước khi phát triển từng feature, phải xác định tối thiểu:

* Request schema.
* Response schema.
* Error schema.
* Pagination.
* Filter.
* Sort.
* Authentication behavior.
* Authorization behavior.
* Loading, empty và error state.

Không nên viết toàn bộ Front-end dựa trên dữ liệu tùy ý rồi mới thiết kế Back-end. Cách làm này kéo theo:

* Sai cấu trúc dữ liệu.
* Component phụ thuộc mock data.
* Phải sửa lại state management.
* Phải sửa lại form validation.
* Phải sửa lại pagination và filter.
* Khó tích hợp API thật.

Luồng phù hợp:

```text
User flow
→ Data requirement
→ API contract draft
→ Mock API
→ Front-end implementation
→ Back-end implementation
→ Real API integration
```

---

# 3. Phạm vi sản phẩm

## 3.1. Storefront MVP

```text
Home
Category
Product Listing
Product Detail
Search
Wishlist
Cart
Checkout
Order Success
Authentication
Profile
Order History
```

## 3.2. Admin MVP

```text
Dashboard
Product Management
Category Management
Inventory Management
Order Management
Promotion Management
Customer Management
```

## 3.3. CMS MVP

```text
Hero Banner
Homepage Sections
Collection Landing Page
Promotion Banner
SEO Metadata
Blog
Campaign
```

## 3.4. Chưa triển khai trong MVP

Những phần sau chỉ nên làm sau khi luồng bán hàng cốt lõi đã ổn định:

```text
AI Search
Recommendation Engine
Microservices
Kafka
Kubernetes
Multi-warehouse optimization
Advanced loyalty
Gift card
Advanced analytics
Page Builder hoàn chỉnh
Multi-region deployment
```

---

# 4. Kiến trúc tổng thể đề xuất

```text
                         Users
                           |
                    CDN / Edge Layer
                           |
                    Next.js Storefront
                           |
                      API Gateway
                           |
             Modular Monolith Back-end
                           |
    ------------------------------------------------
    |          |          |         |              |
 Product     Order      Customer   Payment       Content
    |          |          |         |              |
    ------------------------------------------------
                           |
                       PostgreSQL
                           |
       -----------------------------------------
       |                   |                   |
     Redis               Search              Storage
                       Meilisearch              S3
```

Trong giai đoạn đầu, Back-end nên là **Modular Monolith**, không nên bắt đầu bằng Microservices.

Module Back-end có ranh giới riêng nhưng vẫn chạy trong một ứng dụng NestJS:

```text
Auth
Customer
Catalog
Product
Category
Inventory
Cart
Wishlist
Checkout
Order
Payment
Promotion
Shipping
Review
Content
Search
Notification
```

Chỉ tách thành Microservices khi có vấn đề thực tế về:

* Quy mô đội ngũ.
* Tải hệ thống.
* Deployment độc lập.
* Ownership.
* Failure isolation.
* Khác biệt về công nghệ hoặc dữ liệu.

---

# 5. Công nghệ đề xuất

## Front-end

```text
Next.js 16
React 19
TypeScript
Tailwind CSS v4
shadcn/ui hoặc Radix primitives
TanStack Query
Zustand
React Hook Form
Zod
Motion
Storybook
MSW
Vitest
React Testing Library
Playwright
Chromatic hoặc công cụ visual regression tương đương
Sentry
PostHog
```

## Back-end

```text
NestJS
TypeScript
PostgreSQL
Prisma hoặc TypeORM
Redis
Meilisearch ở giai đoạn đầu
S3-compatible storage
BullMQ
Stripe hoặc payment gateway phù hợp
OpenAPI
Jest
Supertest
Testcontainers
```

## Infrastructure

```text
Docker
GitHub Actions
AWS
CloudFront
S3
ECS/Fargate hoặc App Runner
RDS PostgreSQL
ElastiCache Redis
Secrets Manager
CloudWatch
Sentry
```

---

# 6. Timeline tổng quát

## Quy mô tham khảo

Với một developer làm toàn thời gian:

```text
Front-end MVP: 12–16 tuần
Back-end MVP: 12–16 tuần
Integration và hardening: 4–6 tuần

Tổng cộng: khoảng 28–38 tuần
```

Với team gồm:

```text
2 Front-end
2 Back-end
1 Designer
1 QA
```

Có thể hoàn thành MVP tốt trong khoảng:

```text
16–22 tuần
```

Không nên cam kết toàn bộ Storefront, Admin, CMS, Search, Payment, Testing và Enterprise Infrastructure trong 12 tuần nếu nguồn lực chỉ có một hoặc hai developer.

---

# PHẦN I — FRONT-END IMPLEMENTATION PLAN

# 7. Front-end Phase 0 — Discovery và Architecture

## Thời gian

```text
Tuần 1
```

## Công việc

### Luồng nghiệp vụ

Xác định các luồng quan trọng:

```text
Browse product
Search product
Filter product
View product
Select variant
Add to cart
Update cart
Checkout
Payment
Track order
Manage wishlist
Manage account
```

### Người dùng

```text
Guest
Customer
Member
Admin
Content Editor
Order Operator
```

### Tài liệu cần tạo

```text
docs/architecture/frontend/
├── frontend-overview.md
├── module-architecture.md
├── routing.md
├── state-management.md
├── api-integration.md
├── authentication.md
├── authorization.md
├── design-system.md
├── performance.md
└── testing.md
```

### Quyết định kiến trúc

* Server Component và Client Component ownership.
* State ownership.
* Route groups.
* Error boundary.
* API client.
* Authentication strategy.
* Design System boundaries.
* Image strategy.
* Localization strategy.
* SEO strategy.

## Deliverables

* Sitemap.
* User-flow diagrams.
* Initial C4 Container.
* Front-end architecture document.
* API contract draft.
* Initial ADRs.

## Acceptance criteria

* Mỗi trang đã có route rõ ràng.
* Mỗi dữ liệu đã có owner.
* Mỗi feature đã xác định server state hoặc client state.
* Không có feature nào bắt đầu mà chưa biết dữ liệu cần thiết.

---

# 8. Front-end Phase 1 — Monorepo và Engineering Foundation

## Thời gian

```text
Tuần 2
```

## Cấu trúc

```text
apps/
├── storefront
├── admin
└── cms

packages/
├── ui
├── commerce
├── design-tokens
├── api-sdk
├── schemas
├── utilities
├── eslint-config
└── typescript-config
```

## Setup

* Turborepo.
* Next.js.
* TypeScript strict mode.
* Tailwind CSS.
* ESLint.
* Prettier.
* Husky hoặc Lefthook.
* Commitlint.
* Storybook.
* Vitest.
* Playwright.
* MSW.
* Environment validation.
* Import boundaries.
* Path aliases.

## Quality gates

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Acceptance criteria

* Storefront, Admin và CMS chạy độc lập.
* Package dùng chung có thể import đúng.
* Không có circular dependency.
* CI chạy được lint, typecheck, unit test và build.

---

# 9. Front-end Phase 2 — Design System Foundation

## Thời gian

```text
Tuần 3–4
```

## Token layers

```text
Primitive Tokens
      ↓
Semantic Tokens
      ↓
Component Tokens
```

### Primitive tokens

```text
Black
White
Gray
Red
Green
Spacing scale
Font sizes
Radius
Shadow
Duration
Easing
Breakpoints
```

### Semantic tokens

```text
background-primary
background-secondary
foreground-primary
foreground-muted
border-default
action-primary
action-hover
status-success
status-error
```

### Component tokens

```text
button-primary-background
input-border-default
card-background
drawer-overlay
product-card-gap
```

## Foundation

```text
Color
Typography
Spacing
Grid
Radius
Shadow
Motion
Iconography
Breakpoint
Elevation
```

## Primitive components

```text
Button
IconButton
Input
Textarea
Checkbox
Radio
Switch
Select
Badge
Tag
Card
Tabs
Accordion
Tooltip
Dialog
Drawer
Toast
Skeleton
Pagination
Breadcrumb
Carousel
```

## Layout components

```text
Container
Grid
Stack
Inline
Section
AspectRatio
PageShell
StickyPanel
ResponsiveDrawer
```

## Storybook requirements

Mỗi component phải có:

* Default.
* Variants.
* Disabled.
* Loading.
* Error.
* Responsive.
* Keyboard interaction.
* Accessibility notes.

## Acceptance criteria

* Không sử dụng màu hex trực tiếp trong feature.
* Không sử dụng spacing tùy ý ngoài token.
* Component đạt keyboard accessibility cơ bản.
* Storybook có visual states quan trọng.
* Có responsive examples.

---

# 10. Front-end Phase 3 — Application Shell

## Thời gian

```text
Tuần 5
```

## Components

```text
AnnouncementBar
UtilityNavigation
MainHeader
DesktopNavigation
MegaMenu
MobileNavigation
PredictiveSearch
AccountMenu
WishlistButton
CartButton
MiniCart
Footer
CookieBanner
```

## Routing

```text
app/
├── (marketing)/
├── (shop)/
├── (checkout)/
├── (account)/
└── api/
```

## Trạng thái cần xử lý

```text
Guest user
Authenticated user
Empty cart
Cart with products
Search open
Menu open
Mobile drawer
Network error
```

## Acceptance criteria

* Header hoạt động trên desktop, tablet và mobile.
* Mega menu hỗ trợ keyboard.
* Search và cart drawer không xung đột focus.
* Layout không gây CLS đáng kể.
* Navigation hoạt động khi JavaScript tải chậm.

---

# 11. Front-end Phase 4 — Homepage và Brand Commerce

## Thời gian

```text
Tuần 6–7
```

## Homepage sections

```text
HeroStory
CampaignBanner
FeaturedCollection
TrendingProducts
ProductCarousel
ShopBySport
EditorialStory
MembershipBanner
RecommendationSection
Newsletter
```

## Component content model

Section không được hard-code nội dung trực tiếp.

Ví dụ:

```ts
type HeroSection = {
  id: string;
  title: string;
  description?: string;
  desktopMedia: Media;
  mobileMedia: Media;
  primaryAction: Action;
  secondaryAction?: Action;
  theme: "light" | "dark";
};
```

## Mục tiêu

* Dễ tích hợp CMS.
* Hỗ trợ image và video.
* Hỗ trợ mobile content riêng.
* Hỗ trợ tracking CTA.
* Không phụ thuộc nội dung Nike thật.

## Acceptance criteria

* Homepage render hoàn toàn từ mock CMS response.
* Có loading skeleton.
* Có fallback khi media lỗi.
* Hero không làm giảm nghiêm trọng LCP.
* CTA có analytics event.

---

# 12. Front-end Phase 5 — Catalog và PLP

## Thời gian

```text
Tuần 8–9
```

## Features

```text
Category navigation
Product grid
Product card
Product badge
Color swatches
Price display
Promotion display
Filter
Sort
Pagination
Infinite loading tùy quyết định
Mobile filter drawer
Empty results
```

## URL phải chứa trạng thái tìm kiếm

Ví dụ:

```text
/men/shoes?color=black&size=42&sort=price-asc&page=2
```

Không nên lưu toàn bộ filter chỉ trong Zustand. Cách làm này kéo theo:

* Không chia sẻ URL được.
* Back button hoạt động không chính xác.
* SEO và analytics khó theo dõi.
* Reload mất trạng thái.

## State ownership

```text
Search params      → URL
Product results    → TanStack Query hoặc server fetch
Filter drawer open → Local state
Wishlist status    → Server state + optimistic update
Grid preference    → Client preference
```

## Acceptance criteria

* Filter đồng bộ URL.
* Back/forward browser hoạt động đúng.
* Có responsive grid.
* Có empty state.
* Product card không gây layout shift.
* Pagination hoặc infinite scroll có accessibility hợp lý.

---

# 13. Front-end Phase 6 — Product Detail Page

## Thời gian

```text
Tuần 10–11
```

## Components

```text
ProductGallery
ProductVideo
ProductInformation
PriceBlock
PromotionBlock
ColorSelector
SizeSelector
SizeGuide
StockStatus
AddToCart
WishlistToggle
DeliveryEstimate
ProductAccordion
ReviewSummary
RelatedProducts
RecentlyViewed
```

## Variant logic

Front-end phải xử lý rõ:

```text
Product
→ Variant
→ Color
→ Size
→ SKU
→ Price
→ Inventory
```

Không được lưu size và color độc lập nếu chưa xác định SKU cuối cùng.

## Trạng thái

```text
No color selected
No size selected
Variant unavailable
Low stock
Out of stock
Promotion active
Member exclusive
Add-to-cart pending
Add-to-cart failed
```

## Acceptance criteria

* Không thể thêm sản phẩm khi chưa chọn variant hợp lệ.
* Chọn color cập nhật gallery.
* Chọn size cập nhật inventory.
* URL hoặc canonical strategy cho variant được xác định.
* Structured data Product được render.
* PDP hỗ trợ sharing metadata.

---

# 14. Front-end Phase 7 — Search và Wishlist

## Thời gian

```text
Tuần 12
```

## Search

```text
Predictive search
Recent searches
Popular searches
Suggested products
Suggested categories
Search result page
No result suggestions
```

## Wishlist

```text
Guest wishlist
Authenticated wishlist
Merge guest wishlist after login
Optimistic add/remove
Wishlist page
Move to cart
```

## Acceptance criteria

* Search input có debounce.
* Request cũ được cancel hoặc bỏ qua.
* Keyboard navigation hoạt động.
* Recent search lưu an toàn phía client.
* Wishlist có rollback nếu API lỗi.

---

# 15. Front-end Phase 8 — Cart

## Thời gian

```text
Tuần 13
```

## Features

```text
Mini cart
Cart page
Quantity update
Remove item
Variant edit
Promotion display
Coupon input
Order summary
Shipping estimate
Guest cart persistence
Cart merge after login
```

## Cart rules

Giá hiển thị trên Front-end chỉ mang tính thông tin.

Back-end sau này phải tính lại:

```text
Product price
Promotion
Coupon
Tax
Shipping
Inventory
Order total
```

Front-end không được coi giá trong Zustand là nguồn sự thật cuối cùng.

## Acceptance criteria

* Update quantity có optimistic UI.
* API failure có rollback.
* Không cho quantity vượt inventory.
* Tổng tiền có trạng thái recalculating.
* Cart persistence không chứa dữ liệu nhạy cảm.

---

# 16. Front-end Phase 9 — Checkout

## Thời gian

```text
Tuần 14–15
```

## Flow

```text
Contact
→ Address
→ Shipping
→ Payment
→ Review
→ Place Order
→ Order Success
```

## Components

```text
CheckoutStepper
ContactForm
AddressForm
AddressSelector
ShippingMethod
CouponSection
PaymentMethod
OrderReview
OrderSummary
TermsAgreement
OrderSuccess
```

## Form architecture

```text
React Hook Form
+
Zod schema
+
Server error mapping
```

## Error model cần hỗ trợ

```text
VALIDATION_ERROR
OUT_OF_STOCK
PRICE_CHANGED
COUPON_INVALID
PAYMENT_DECLINED
PAYMENT_REQUIRES_ACTION
ADDRESS_UNSUPPORTED
SHIPPING_UNAVAILABLE
ORDER_ALREADY_CREATED
```

## Acceptance criteria

* Form giữ dữ liệu khi chuyển bước.
* Server error map đúng vào field.
* Double submit bị ngăn chặn.
* Payment không lưu card data trong ứng dụng.
* Reload không tạo hai order.
* Có payment retry flow.

---

# 17. Front-end Phase 10 — Authentication và Account

## Thời gian

```text
Tuần 16
```

## Features

```text
Sign in
Sign up
Email verification
Forgot password
Reset password
Profile
Address book
Order history
Order detail
Wishlist
Logout
```

## Security principles

* Không lưu access token dài hạn trong localStorage.
* Ưu tiên secure HTTP-only cookie.
* Không render dữ liệu account từ client cache trước khi xác thực.
* Route account phải có authorization guard.
* Dữ liệu nhạy cảm không gửi vào analytics.

## Acceptance criteria

* Session expiry được xử lý.
* Unauthorized redirect đúng.
* Form auth có rate-limit error UI.
* Account pages không bị cache công khai.
* Logout xóa session và client cache liên quan.

---

# 18. Front-end Phase 11 — Admin và CMS UI

## Thời gian

```text
Tuần 17–19
```

## Admin

```text
Dashboard
Product list
Product create/edit
Category management
Variant management
Inventory management
Order list
Order detail
Promotion management
Customer list
```

## CMS

```text
Homepage section management
Hero management
Collection page
Campaign page
Blog
SEO metadata
Preview
Publish state
Scheduling
```

## Quyền người dùng

```text
Super Admin
Catalog Manager
Order Operator
Content Editor
Marketing Manager
Read-only Analyst
```

## Acceptance criteria

* Menu thay đổi theo permission.
* Ẩn button trên UI là chưa đủ: API sau này vẫn phải enforce quyền.
* Form lớn có draft behavior.
* Có unsaved changes warning.
* Có preview trước publish.
* Có audit metadata hiển thị.

---

# 19. Front-end Phase 12 — Testing và Performance

## Thời gian

```text
Tuần 20–21
```

## Unit tests

Tập trung vào:

```text
Price formatting
Variant selection
Cart calculation presentation
Filter serialization
Validation schema
Permission helpers
API error mapping
```

## Component tests

```text
ProductCard
SizeSelector
CartItem
CouponInput
Checkout forms
Search suggestions
```

## Integration tests với MSW

```text
PLP loading/filter/error
PDP variant/add-to-cart
Cart update/rollback
Checkout validation
Authentication states
Wishlist optimistic update
```

## E2E tests

Critical path:

```text
Browse
→ PDP
→ Add to cart
→ Checkout
→ Payment simulation
→ Order success
```

Các flow khác:

```text
Search product
Apply filter
Sign in
Wishlist product
View order
Admin updates product
CMS publishes banner
```

## Visual regression

```text
Header
Mega menu
Hero
Product card
PLP
PDP
Cart drawer
Checkout
Admin forms
```

## Performance budgets

```text
LCP: < 2.5s
CLS: < 0.1
INP: < 200ms
JavaScript initial budget: được xác định theo route
Image size budget: được xác định theo component
```

## Acceptance criteria

* Critical flow E2E chạy trên CI.
* Không có lỗi accessibility nghiêm trọng.
* Lighthouse route chính đạt mục tiêu thống nhất.
* Bundle analyzer không có dependency bất thường.
* Không có hydration error.

---

# PHẦN II — BACK-END IMPLEMENTATION PLAN

# 20. Back-end Phase 0 — Domain và API Contract Review

## Thời gian

```text
Tuần 22
```

## Công việc

Đối chiếu mock API của Front-end và chuẩn hóa:

* Domain model.
* API contracts.
* Error contracts.
* Pagination.
* Filtering.
* Sorting.
* Authentication.
* Authorization.
* Idempotency.
* Events.
* Transaction boundaries.

## Deliverables

```text
docs/architecture/backend/
├── backend-overview.md
├── domain-boundaries.md
├── module-boundaries.md
├── api-contracts.md
├── authentication.md
├── authorization.md
├── events.md
├── transactions.md
├── caching.md
├── resilience.md
└── testing.md
```

## Acceptance criteria

* API contract không phụ thuộc UI component.
* Các module có boundary rõ ràng.
* Xác định aggregate và transaction boundary.
* Xác định dữ liệu nào cần strong consistency.
* Xác định dữ liệu nào có thể eventual consistency.

---

# 21. Back-end Phase 1 — Project Foundation

## Thời gian

```text
Tuần 23
```

## Setup

```text
NestJS
PostgreSQL
Prisma hoặc TypeORM
Redis
Docker Compose
Environment validation
Structured logging
OpenAPI
Migration
Seed data
Jest
Supertest
Testcontainers
```

## Cross-cutting concerns

```text
Global validation
Error normalization
Correlation ID
Request logging
Rate limiting
Authentication guard
Authorization guard
Health check
Metrics
```

## Error response

```json
{
  "code": "PRODUCT_OUT_OF_STOCK",
  "message": "The selected product variant is out of stock.",
  "details": {
    "variantId": "variant-id"
  },
  "traceId": "trace-id"
}
```

## Acceptance criteria

* Local environment chạy bằng một command.
* Migration có thể apply và rollback theo chính sách.
* Health endpoint kiểm tra database và Redis.
* API trả error format thống nhất.
* Log có trace ID.

---

# 22. Back-end Phase 2 — Identity và Customer

## Thời gian

```text
Tuần 24
```

## Modules

```text
Auth
User
Customer
Profile
Address
Role
Permission
```

## APIs

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/verify-email
POST /auth/forgot-password
POST /auth/reset-password

GET /me
PATCH /me
GET /me/addresses
POST /me/addresses
PATCH /me/addresses/:id
DELETE /me/addresses/:id
```

## Acceptance criteria

* Password được hash an toàn.
* Refresh token rotation hoặc session strategy rõ ràng.
* Rate limit cho auth.
* Email verification có expiry.
* Permission được enforce ở server.

---

# 23. Back-end Phase 3 — Catalog và Product

## Thời gian

```text
Tuần 25–27
```

## Domain model

```text
Brand
Category
Collection
Product
ProductVariant
ProductOption
ProductImage
ProductVideo
ProductAttribute
ProductBadge
ProductStatus
```

## Product relationships

```text
Product
├── Variants
│   ├── SKU
│   ├── Size
│   ├── Color
│   ├── Price
│   └── Inventory
├── Media
├── Categories
├── Collections
└── Attributes
```

## APIs

```text
GET /products
GET /products/:slug
GET /categories
GET /categories/:slug/products
GET /collections/:slug
```

Admin:

```text
POST /admin/products
PATCH /admin/products/:id
POST /admin/products/:id/variants
PATCH /admin/variants/:id
POST /admin/products/:id/media
```

## Acceptance criteria

* Slug unique.
* SKU unique.
* Product và variant status rõ ràng.
* Không hard-delete product đã xuất hiện trong order.
* Có index cho PLP query chính.
* API hỗ trợ filter và sort theo contract.

---

# 24. Back-end Phase 4 — Inventory

## Thời gian

```text
Tuần 28
```

## Modules

```text
Inventory
Warehouse
StockMovement
Reservation
```

## Inventory model

Không nên chỉ có một field:

```text
quantity
```

Nên phân biệt:

```text
on_hand
reserved
available
```

Công thức:

```text
available = on_hand - reserved
```

## Quy tắc

* Add to cart chưa chắc cần reserve.
* Bắt đầu checkout có thể tạo reservation ngắn hạn.
* Order thành công chuyển reservation thành committed stock.
* Payment thất bại hoặc timeout phải release reservation.

## Acceptance criteria

* Không oversell trong transaction cạnh tranh.
* Reservation có expiry.
* Stock movement có audit trail.
* Inventory update có idempotency.

---

# 25. Back-end Phase 5 — Cart và Wishlist

## Thời gian

```text
Tuần 29
```

## Cart APIs

```text
GET /cart
POST /cart/items
PATCH /cart/items/:id
DELETE /cart/items/:id
POST /cart/merge
POST /cart/coupon
DELETE /cart/coupon
```

## Wishlist APIs

```text
GET /wishlist
POST /wishlist/items
DELETE /wishlist/items/:productId
```

## Business rules

Back-end phải tính lại:

* Giá sản phẩm.
* Promotion.
* Coupon.
* Availability.
* Quantity limits.
* Shipping estimate nếu có.

## Acceptance criteria

* Guest cart có token riêng.
* Cart merge không tạo duplicate bất hợp lý.
* Cart item tham chiếu variant.
* Cart response trả pricing breakdown.
* Coupon validation có error code cụ thể.

---

# 26. Back-end Phase 6 — Promotion và Pricing

## Thời gian

```text
Tuần 30
```

## Modules

```text
Price
Promotion
Coupon
Campaign
```

## Promotion types

```text
Percentage discount
Fixed discount
Product discount
Category discount
Collection discount
Buy X get Y
Free shipping
Member-only price
```

## Rule engine

Bắt đầu với rule đơn giản trong code và database cấu hình.

Không cần xây một generic rule engine quá phức tạp ngay từ đầu.

## Acceptance criteria

* Pricing có breakdown.
* Promotion có start/end time.
* Coupon có usage limit.
* Coupon có per-user limit.
* Các promotion xung đột có priority hoặc stacking policy.
* Server là nguồn sự thật về giá.

---

# 27. Back-end Phase 7 — Checkout và Order

## Thời gian

```text
Tuần 31–32
```

## Modules

```text
Checkout
Order
OrderItem
OrderAddress
OrderStatus
OrderHistory
```

## Checkout flow

```text
Validate cart
→ Validate inventory
→ Recalculate price
→ Create reservation
→ Create pending order
→ Start payment
→ Confirm payment
→ Confirm order
→ Commit inventory
→ Send notification
```

## Order status

```text
PENDING_PAYMENT
PAID
PROCESSING
PACKED
SHIPPED
DELIVERED
CANCELLED
RETURN_REQUESTED
RETURNED
REFUNDED
```

## Snapshot dữ liệu đơn hàng

Order item phải snapshot dữ liệu tại thời điểm mua:

```text
Product name
SKU
Selected options
Unit price
Discount
Tax
Image
```

Order item không được chỉ tham chiếu product hiện tại: sản phẩm có thể thay đổi sau khi đơn được tạo.

## Acceptance criteria

* Place order hỗ trợ idempotency key.
* Không tạo duplicate order khi retry.
* Order lưu pricing snapshot.
* Inventory và order có transaction strategy.
* Có order status history.

---

# 28. Back-end Phase 8 — Payment

## Thời gian

```text
Tuần 33
```

## Modules

```text
Payment
PaymentAttempt
Webhook
Refund
```

## Flow

```text
Create payment intent
→ Customer confirms payment
→ Gateway processes
→ Webhook received
→ Verify webhook signature
→ Update payment
→ Update order
```

## Nguyên tắc

* Không tin redirect từ browser là payment success.
* Webhook đã verify mới là nguồn xác nhận.
* Webhook phải idempotent.
* Không lưu card details.

## Acceptance criteria

* Signature validation.
* Duplicate webhook không gây duplicate processing.
* Payment status có state machine.
* Reconciliation data được lưu.
* Refund có audit trail.

---

# 29. Back-end Phase 9 — Shipping và Fulfillment

## Thời gian

```text
Tuần 34
```

## Modules

```text
Shipping
Shipment
Tracking
Carrier
Fulfillment
```

## APIs

```text
GET /shipping/methods
POST /admin/orders/:id/shipments
PATCH /admin/shipments/:id
GET /orders/:id/tracking
```

## Acceptance criteria

* Shipping method phụ thuộc address và cart.
* Shipment có tracking number.
* Một order có thể có nhiều shipment.
* Order timeline được tạo từ events.

---

# 30. Back-end Phase 10 — Search

## Thời gian

```text
Tuần 35
```

## Giai đoạn đầu

Sử dụng:

```text
Meilisearch
```

thay vì triển khai Elasticsearch ngay nếu chưa có yêu cầu tải lớn.

## Index

```text
Product name
SKU
Category
Collection
Brand
Color
Sport
Gender
Description
Search keywords
```

## Search features

```text
Typo tolerance
Autocomplete
Filter
Sort
Synonym
Popular search
Recent search phía client
```

## Đồng bộ dữ liệu

```text
Product updated
→ Domain event
→ Search indexing job
```

## Acceptance criteria

* Search index có thể rebuild.
* Product unpublished bị xóa khỏi index.
* Index update retry được.
* Search API có fallback phù hợp.

---

# 31. Back-end Phase 11 — CMS

## Thời gian

```text
Tuần 36
```

## Content model

```text
Page
Section
Hero
Banner
CollectionReference
ProductReference
Media
SEO metadata
Publish state
Schedule
Revision
```

## States

```text
DRAFT
SCHEDULED
PUBLISHED
ARCHIVED
```

## Acceptance criteria

* Có draft và published version.
* Preview có token hoặc permission.
* Publishing có audit trail.
* Media lưu trên object storage.
* Storefront chỉ đọc content đã publish.

---

# 32. Back-end Phase 12 — Notification và Background Jobs

## Thời gian

```text
Tuần 37
```

## Jobs

```text
Send verification email
Send order confirmation
Send shipping notification
Release inventory reservation
Rebuild search index
Process image
Generate report
Retry integration
```

## Công nghệ

```text
BullMQ
+
Redis
```

## Acceptance criteria

* Job có retry policy.
* Job có dead-letter hoặc failed queue.
* Job handler idempotent.
* Có dashboard hoặc cách quan sát job.
* Không gửi email trực tiếp trong transaction chính.

---

# 33. Back-end Phase 13 — Testing, Security và Observability

## Thời gian

```text
Tuần 38–39
```

## Unit tests

```text
Pricing rules
Promotion eligibility
Inventory availability
Reservation expiry
Order state transition
Payment status transition
Permission rules
```

## Integration tests

Dùng database thật trong container cho:

```text
Product repository
Cart
Inventory reservation
Checkout
Order creation
Payment webhook
Search indexing
```

## Contract tests

* OpenAPI validation.
* Front-end schema compatibility.
* Error code compatibility.
* Pagination compatibility.

## Security

```text
OWASP review
Rate limiting
Secure headers
Input validation
File upload validation
Webhook signature
Secret rotation
Authorization tests
Audit logging
```

## Observability

```text
Logs
Metrics
Traces
Alerts
Business events
```

Các metric quan trọng:

```text
Checkout success rate
Payment failure rate
Order creation latency
Search latency
Add-to-cart failure rate
Inventory reservation failure
API error rate
Queue failure rate
```

## Acceptance criteria

* Critical domain rules có unit tests.
* Critical APIs có integration tests.
* Authorization có negative tests.
* Dashboard và alerts được cấu hình.
* Trace được nối qua API, queue và integration.

---

# PHẦN III — INTEGRATION VÀ RELEASE

# 34. Integration Phase 1 — Thay Mock API bằng Real API

## Thời gian

```text
Tuần 40–41
```

## Thứ tự tích hợp

```text
1. Authentication
2. Categories
3. Product Listing
4. Product Detail
5. Search
6. Wishlist
7. Cart
8. Checkout
9. Payment
10. Orders
11. Admin
12. CMS
```

Mỗi module thực hiện:

```text
Mock contract comparison
→ Real API adapter
→ Error mapping
→ Integration test
→ E2E test
→ Remove obsolete mock handlers
```

## Acceptance criteria

* Front-end không trực tiếp phụ thuộc ORM model.
* API SDK là boundary duy nhất.
* Mock và real response cùng schema.
* Error state hoạt động với API thật.
* Không có mock còn tồn tại trong production build.

---

# 35. Integration Phase 2 — Production Readiness

## Thời gian

```text
Tuần 42–43
```

## Checklist

### Performance

* CDN.
* Image optimization.
* Cache headers.
* ISR/revalidation.
* Database indexing.
* Redis caching.
* Search latency.
* Bundle optimization.

### Security

* CSP.
* CSRF strategy.
* Cookie configuration.
* Rate limit.
* Secret management.
* Dependency scan.
* Container scan.
* Permission audit.

### Reliability

* Backup.
* Restore test.
* Rollback.
* Health check.
* Readiness check.
* Queue recovery.
* Payment webhook replay.
* Disaster recovery runbook.

### SEO

* Metadata.
* Canonical.
* Sitemap.
* Robots.
* Structured data.
* Product availability.
* Breadcrumb schema.
* Open Graph.
* Redirect strategy.

### Analytics

* Product viewed.
* Search performed.
* Product selected.
* Add to cart.
* Remove from cart.
* Checkout started.
* Payment completed.
* Order completed.

Không gửi email, phone, address hoặc payment data vào analytics.

---

# 36. Chiến lược Release

## Môi trường

```text
Local
Development
Preview
Staging
Production
```

## Deployment flow

```text
Feature branch
→ Pull request
→ Lint
→ Type check
→ Unit test
→ Integration test
→ Build
→ Preview deployment
→ E2E smoke test
→ Review
→ Merge
→ Staging
→ Production approval
```

## Release theo vertical slice

Không nên đợi toàn bộ hệ thống hoàn thành mới release.

### Release 1

```text
Homepage
Category
PLP
PDP
Mock cart
```

### Release 2

```text
Authentication
Wishlist
Real cart
```

### Release 3

```text
Checkout
Payment sandbox
Order
```

### Release 4

```text
Admin catalog
Inventory
Order management
```

### Release 5

```text
CMS
Search
Promotion
Analytics
```

---

# 37. Backlog ưu tiên

## P0 — Bắt buộc cho MVP

```text
Design System
Homepage
PLP
PDP
Search cơ bản
Authentication
Cart
Checkout
Payment
Order
Admin Product
Admin Inventory
Admin Order
CMS Hero/Banner
Testing critical path
Monitoring
```

## P1 — Sau MVP

```text
Wishlist
Review
Promotion nâng cao
Order tracking
Return
Refund
Membership
Advanced CMS
Visual regression đầy đủ
Search synonym
```

## P2 — Scale-up

```text
Recommendation
Personalization
AI Search
Multi-warehouse
Gift card
Loyalty
Marketplace
Multi-country
Multi-currency
Microservices
Kafka
Kubernetes
```

---

# 38. Definition of Done cho mỗi feature

Một feature chỉ được xem là hoàn thành khi:

```text
Requirement rõ ràng
API contract rõ ràng
UI hoàn chỉnh
Responsive hoàn chỉnh
Loading state
Empty state
Error state
Accessibility
Analytics events
Unit test
Integration test
E2E nếu là critical flow
Documentation
Code review
Preview deployment
Acceptance criteria passed
```

---

# 39. Cấu trúc tài liệu kiến trúc

```text
docs/
└── architecture/
    ├── README.md
    ├── 01-executive-summary.md
    ├── 02-business-context.md
    ├── 03-scope-and-requirements.md
    ├── 04-non-functional-requirements.md
    ├── 05-system-context.md
    ├── 06-solution-overview.md
    │
    ├── frontend/
    ├── backend/
    ├── data/
    ├── infrastructure/
    ├── security/
    ├── diagrams/
    ├── decisions/
    └── roadmap/
```

Các ADR quan trọng nên tạo:

```text
0001-use-modular-monolith.md
0002-use-nextjs-app-router.md
0003-use-design-tokens.md
0004-use-url-for-product-filters.md
0005-use-http-only-cookie-auth.md
0006-use-postgresql.md
0007-use-meilisearch-for-mvp.md
0008-use-redis-and-bullmq.md
0009-use-object-storage-for-media.md
0010-use-contract-first-api-development.md
0011-use-payment-webhook-as-source-of-truth.md
0012-use-inventory-reservation.md
```

---

# 40. Kế hoạch bắt đầu thực tế trong 4 tuần đầu

## Tuần 1

```text
Requirements
Sitemap
User flows
Module boundaries
Route design
State ownership
API contract draft
C4 Context
C4 Container
Architecture ADRs
```

## Tuần 2

```text
Turborepo
Next.js applications
Shared packages
Lint
Type check
Test
Storybook
MSW
CI
```

## Tuần 3

```text
Color tokens
Typography
Spacing
Grid
Motion
Button
Input
Badge
Card
Modal
Drawer
Skeleton
```

## Tuần 4

```text
Header
Mega menu
Mobile navigation
Search overlay
Mini cart
Footer
Application layout
Responsive testing
Accessibility testing
```

Sau bốn tuần đầu, dự án phải có một nền tảng chạy được, có Design System, Storybook, CI và Application Shell. Không nên bắt đầu Product Detail, Cart hoặc Checkout trước khi phần nền tảng này ổn định.

---

# 41. Kết luận kiến trúc

Thứ tự triển khai tối ưu:

```text
Requirements
→ Architecture
→ API contracts
→ Design System
→ Application Shell
→ Homepage
→ Catalog
→ PDP
→ Search
→ Cart
→ Checkout
→ Account
→ Admin
→ CMS
→ Back-end Foundation
→ Catalog Back-end
→ Inventory
→ Cart
→ Pricing
→ Checkout
→ Order
→ Payment
→ Search
→ CMS
→ Integration
→ Hardening
→ Production
```

Ba quyết định quan trọng nhất:

1. **FE-first nhưng Contract-first**, không làm Front-end với dữ liệu mock tùy ý.
2. **Modular Monolith trước Microservices**, tránh tăng độ phức tạp khi chưa có nhu cầu thực tế.
3. **Xây Design System trước feature**, vì trải nghiệm nhất quán là nền tảng của website theo phong cách Nike.

MVP không nhắm đến việc sao chép toàn bộ Nike. Mục tiêu là hoàn thành một vertical slice chất lượng cao:

```text
Khám phá sản phẩm
→ Tìm kiếm
→ Xem sản phẩm
→ Chọn variant
→ Thêm vào giỏ
→ Checkout
→ Thanh toán
→ Tạo đơn
→ Theo dõi đơn
```

Sau khi vertical slice này ổn định, hệ thống mới tiếp tục mở rộng Promotion, CMS nâng cao, Membership, Recommendation, Returns và khả năng scale lớn.
