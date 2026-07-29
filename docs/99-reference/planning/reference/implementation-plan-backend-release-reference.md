# Implementation Plan — Backend, Integration, and Release Reference

> Bản tách này giữ phần Back-end, integration, release readiness, và backlog của implementation plan cũ ở mức tham khảo.

## Cách dùng

- Dùng file này khi cần checklist câu hỏi cho backend, integration thật, hoặc hardening trước release.
- Không coi đây là quyết định backend hiện hành. Nếu cần quyết định đã chốt, quay lại [`../decision-log.md`](../../../00-core/decision-log.md) và `docs/architecture/backend/`.

## Các phase BE trong implementation plan cũ

### 20. Back-end Phase 0 — Domain và API Contract Review

- Chuẩn hóa lại: domain model, API contracts, error contracts, pagination, filtering, sorting, authentication, authorization, idempotency, events, transaction boundaries.
- Deliverables tham khảo: backend overview, domain boundaries, module boundaries, api contracts, authentication, authorization, events, transactions, caching, resilience, testing.
- Acceptance criteria: API contract không phụ thuộc UI component; module có boundary rõ; aggregate/transaction boundary rõ; phân biệt strong consistency và eventual consistency.

### 21. Back-end Phase 1 — Project Foundation

- Setup tham khảo: NestJS, PostgreSQL, Prisma hoặc TypeORM, Redis, Docker Compose, environment validation, structured logging, OpenAPI, migration, seed data, Jest, Supertest, Testcontainers.
- Cross-cutting concerns: global validation, error normalization, correlation ID, request logging, rate limiting, authentication guard, authorization guard, health check, metrics.
- Acceptance criteria: local env chạy bằng một command, migration có policy rõ, health endpoint kiểm tra DB và Redis, error format thống nhất, log có trace ID.

### 22. Back-end Phase 2 — Identity và Customer

- Modules: auth, user, customer, profile, address, role, permission.
- APIs tham khảo: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/me`, `/me/addresses`.
- Acceptance criteria: password hash an toàn, session/refresh strategy rõ, rate limit auth, email verification có expiry, permission được enforce ở server.

### 23. Back-end Phase 3 — Catalog và Product

- Domain model tham khảo: brand, category, collection, product, product variant, product option, product image/video, product attribute, product badge, product status.
- APIs tham khảo: `/products`, `/products/:slug`, `/categories`, `/categories/:slug/products`, `/collections/:slug`, và các endpoint admin product/variant/media.
- Acceptance criteria: slug unique, SKU unique, status rõ, không hard-delete product đã vào order, có index cho PLP query, API hỗ trợ filter/sort theo contract.

### 24. Back-end Phase 4 — Inventory

- Modules: inventory, warehouse, stock movement, reservation.
- Ý chính còn đáng giữ: không nên chỉ có một field `quantity`; nên tách `on_hand`, `reserved`, `available`.
- Quy tắc tham khảo: add-to-cart chưa chắc cần reserve; checkout có thể tạo reservation ngắn hạn; order thành công chuyển reservation thành committed stock.

### 25. Back-end Phase 5 — Cart và Wishlist

- Cart APIs tham khảo: `/cart`, `/cart/items`, `/cart/merge`, `/cart/coupon`.
- Wishlist APIs tham khảo: `/wishlist`, `/wishlist/items`.
- Ý chính còn đáng giữ: backend phải tính lại giá, promotion, coupon, availability, quantity limits, shipping estimate nếu có.

### 26. Back-end Phase 6 — Promotion và Pricing

- Modules: price, promotion, coupon, campaign.
- Promotion types tham khảo: percentage discount, fixed discount, product/category/collection discount, buy X get Y, free shipping, member-only price.
- Drift note: phần này hiện vượt quá MVP chính thức, chỉ còn giá trị tham khảo dài hạn.

### 27. Back-end Phase 7 — Checkout và Order

- Trọng tâm tham khảo: checkout flow, order status, order snapshot data, idempotency khi place order.
- Drift note: MVP hiện COD-only; mọi logic payment gateway trong phase này phải được đọc như hướng tương lai.

### 28. Back-end Phase 8 — Payment

- File này giữ phase này chỉ để tham khảo dài hạn.
- Drift note: payment online hiện ngoài phạm vi MVP.

### 29. Back-end Phase 9 — Shipping và Fulfillment

- Trọng tâm tham khảo: shipping modules, fulfillment steps, shipping APIs.
- Giá trị chính hiện tại: giúp nghĩ trước boundary và contract, không phải để implement ngay.

### 30. Back-end Phase 10 — Search

- Giai đoạn đầu: search cơ bản, index đủ dùng, không cần engine quá phức tạp.
- Search features tham khảo: keyword search, relevance cơ bản, filter/sort hỗ trợ cho public catalog.
- Đồng bộ dữ liệu: cần cơ chế rõ khi catalog thay đổi.
- Drift note: search cơ bản hiện đã thuộc Launch 1; mọi phần search nâng cao chỉ nên xem là hậu MVP.

### 31. Back-end Phase 11 — CMS

- Content model tham khảo: hero, homepage sections, collection landing page, promotion banner, SEO metadata, blog, campaign.
- States tham khảo: draft, preview, publish.
- Giá trị còn đáng giữ: đừng lặp lại workflow publish riêng từng content type nếu có thể dùng một model chung.

### 32. Back-end Phase 12 — Notification và Background Jobs

- Jobs tham khảo: email, scheduled publish/unpublish, sync/index jobs, cleanup jobs.
- Giá trị còn đáng giữ: chỉ đưa background jobs vào khi có lý do rõ về async boundary.

### 33. Back-end Phase 13 — Testing, Security và Observability

- Lớp tham khảo: unit tests, integration tests, contract tests, security, observability.
- Giá trị còn đáng giữ: backend cần test contract, security controls, trace ID, và logging ngay từ sớm thay vì thêm muộn.

## Integration và release tham khảo

### 34. Integration Phase 1 — Thay Mock API bằng Real API

- Ý chính còn đáng giữ: thay mock bằng API thật theo từng vertical slice, không đổi chữ ký fetch function nếu contract đã giữ đúng.

### 35. Integration Phase 2 — Production Readiness

- Checklist tham khảo: performance, security, reliability, SEO, analytics.
- Giá trị chính: dùng như pre-release checklist, không phải cam kết sẽ làm hết ngay từ đầu.

### 36. Chiến lược Release

- Release theo vertical slice, không đợi mọi app hoàn hảo rồi mới ship.
- Drift note: framing release hiện hành phải xem ở [`../../product/release-slicing.md`](../../../01-delivery/product/release-slicing.md).

### 37. Backlog ưu tiên

- P0: phần bắt buộc cho MVP.
- P1: sau MVP.
- P2: scale-up.

### 38. Definition of Done cho mỗi feature

- Giá trị còn đáng giữ: coi DoD như checklist coverage tối thiểu, không phải ritual giấy tờ.

### 39. Cấu trúc tài liệu kiến trúc

- Giá trị còn đáng giữ: nhắc rằng tài liệu kiến trúc nên chia rõ theo chủ đề, không dồn vào một file quá lớn.

### 40. Kế hoạch bắt đầu thực tế trong 4 tuần đầu

- Giá trị hiện tại chủ yếu là tham khảo về nhịp khởi động, không phải kế hoạch thực thi đang được cam kết.

### 41. Kết luận kiến trúc

- Kết luận cũ vẫn hữu ích ở một ý: nên tách rõ storefront, admin, cms, shared packages, và contract layer từ sớm nếu muốn tránh sửa ngược lớn về sau.

## Đọc tiếp

- Search backend đang được tham chiếu ở traceability: dùng file này thay cho anchor cũ của file gốc.
- Roadmap backend hiện hành: [`../../architecture/backend/roadmap.md`](../../../01-delivery/architecture/backend/roadmap.md)
- API contracts hiện hành: [`../../architecture/backend/api-contracts.md`](../../../01-delivery/architecture/backend/api-contracts.md)
