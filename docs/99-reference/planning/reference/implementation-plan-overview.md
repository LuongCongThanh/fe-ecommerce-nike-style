# Implementation Plan Overview — Tài liệu tham khảo

> Bản tách này giữ những phần đáng đọc nhất của implementation plan cũ: cách dùng, drift notes, nguyên tắc triển khai, phạm vi tham khảo, và kiến trúc cấp cao.

## Cách đọc tài liệu này

- Dùng file này khi cần tham khảo phạm vi dài hạn, ý tưởng triển khai, hoặc checklist coverage.
- Không coi mọi công nghệ, timeline hay vai trò trong file là quyết định đã chốt.
- Khi có mâu thuẫn, ưu tiên `docs/architecture/frontend/`, `docs/product/` và `docs/planning/decision-log.md`.

## Lối vào nhanh

- Nếu bạn đang làm FE hiện tại: đọc `2. Nguyên tắc triển khai`, rồi đối chiếu với [`../../architecture/frontend/07-api-integration.md`](../../../01-delivery/architecture/frontend/07-api-integration.md), [`../../architecture/frontend/11-roadmap.md`](../../../01-delivery/architecture/frontend/11-roadmap.md), và [`../../traceability/test-traceability-matrix.md`](../../../01-delivery/traceability/test-traceability-matrix.md).
- Nếu bạn đang nghĩ về BE hoặc integration dài hạn: đọc `4. Kiến trúc tổng thể đề xuất`, rồi mở tiếp [`./implementation-plan-backend-release-reference.md`](implementation-plan-backend-release-reference.md).
- Nếu bạn chỉ cần dự án đang ship gì trước: bỏ qua bộ implementation-plan này và quay lại [`../../requirements/functional-requirements.md`](../../../00-core/requirements/functional-requirements.md) cùng [`../../product/release-slicing.md`](../../../01-delivery/product/release-slicing.md).

## Những điểm đã drift so với tài liệu hiện hành

- Scope MVP hiện phải lấy từ [`../../requirements/functional-requirements.md`](../../../00-core/requirements/functional-requirements.md), không lấy nguyên từ bộ file này.
- Release priority hiện phải lấy từ [`../../product/release-slicing.md`](../../../01-delivery/product/release-slicing.md).
- Search cơ bản đã thuộc Launch 1; phần search nâng cao mới để sau.
- Checkout MVP hiện là COD-only; mọi phần payment online trong bộ file này chỉ còn giá trị tham khảo dài hạn.
- RBAC và security baseline hiện đã có tài liệu riêng: [`../../architecture/backend/rbac-matrix.md`](../../../01-delivery/architecture/backend/rbac-matrix.md) và [`../../security/security-baseline.md`](../../../01-delivery/security/security-baseline.md).
- Timeline nhiều tuần trong implementation plan không phải cam kết kế hoạch thực tế.

## Phần nào còn đáng dùng nhất

- `2. Nguyên tắc triển khai`: hữu ích để giữ tư duy contract-first thay vì mock tùy ý.
- `4. Kiến trúc tổng thể đề xuất`: hữu ích ở mức hình dung boundary lớn, không phải để chốt stack cuối cùng.
- File FE reference: hữu ích như checklist tham khảo cho phase FE.
- File BE + release reference: hữu ích như checklist câu hỏi backend, integration, và hardening.

## 1. Mục tiêu dự án

Tài liệu này hình dung một nền tảng e-commerce theo hướng Brand Commerce: trải nghiệm, tốc độ, và khả năng mở rộng phải được nghĩ tới từ đầu, dù implementation thật có thể đi chậm hơn và chọn phạm vi hẹp hơn.

- Brand Commerce, không chỉ là website hiển thị sản phẩm.
- UI tối giản, typography lớn, hình ảnh và nội dung thương hiệu nổi bật.
- Mobile-first.
- SEO tốt.
- Core Web Vitals tốt.
- Có Design System riêng.
- Có khả năng mở rộng Storefront, Admin và CMS.
- Front-end và Back-end có ranh giới rõ ràng.
- Có kiểm thử tự động và CI/CD.

Ở mức rất cao, phạm vi được hình dung gồm ba ứng dụng:

```text
apps/
├── storefront
├── admin
└── cms
```

Các package dùng chung được giả định như sau:

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

## 2. Nguyên tắc triển khai

### 2.1 Front-end đi trước, nhưng không bỏ qua thiết kế Back-end

Ý chính của phần này rất đơn giản: FE có thể đi trước, nhưng không nên đi trước bằng dữ liệu và behavior tự bịa ra.

```text
Mock data
+
MSW
+
API schemas
+
OpenAPI draft
```

Trước khi phát triển từng feature, tối thiểu nên chốt:

- Request schema
- Response schema
- Error schema
- Pagination
- Filter
- Sort
- Authentication behavior
- Authorization behavior
- Loading, empty và error state

Nếu không làm vậy, rủi ro thường là:

- Sai cấu trúc dữ liệu
- Component phụ thuộc mock data
- Phải sửa lại state management
- Phải sửa lại form validation
- Phải sửa lại pagination và filter
- Khó tích hợp API thật

Luồng làm việc được khuyến nghị:

```text
User flow
→ Data requirement
→ API contract draft
→ Mock API
→ Front-end implementation
→ Back-end implementation
→ Real API integration
```

## 3. Phạm vi sản phẩm tham khảo

### 3.1 Storefront MVP

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

### 3.2 Admin MVP

```text
Dashboard
Product Management
Category Management
Inventory Management
Order Management
Promotion Management
Customer Management
```

### 3.3 CMS MVP

```text
Hero Banner
Homepage Sections
Collection Landing Page
Promotion Banner
SEO Metadata
Blog
Campaign
```

### 3.4 Chưa triển khai trong MVP

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

## 4. Kiến trúc tổng thể đề xuất

Phần này hữu ích để nhìn boundary lớn giữa storefront, backend, search, cache và storage. Không nên đọc nó như một quyết định stack cuối cùng.

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

Ở giai đoạn đầu, hướng **Modular Monolith** thực tế hơn nhiều so với việc nhảy ngay vào Microservices.

Các module backend vẫn có thể tách boundary rõ dù cùng chạy trong một ứng dụng:

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

Chỉ nên tách thành Microservices khi đã có vấn đề thực tế về:

- Quy mô đội ngũ
- Tải hệ thống
- Deployment độc lập
- Ownership
- Failure isolation
- Khác biệt về công nghệ hoặc dữ liệu

## 5. Công nghệ đề xuất

### Front-end

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

### Back-end

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

### Infrastructure

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

## 6. Timeline tổng quát

Phần này chỉ nên xem như cảnh báo về độ lớn của bài toán, không phải lịch cam kết.

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

Điểm chính ở đây: không nên đọc bộ file này rồi tự ngầm hiểu rằng toàn bộ Storefront, Admin, CMS, Search, Payment, Testing và Enterprise Infrastructure có thể hoàn tất rất nhanh với nguồn lực nhỏ.
