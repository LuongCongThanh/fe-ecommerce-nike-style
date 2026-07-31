# Roadmap — Backend

## Nguyên tắc

Cùng nguyên tắc với [`../frontend/11-roadmap.md`](../frontend/11-roadmap.md): **không có mốc thời gian cụ thể** (Decision #9 — solo dev, ưu tiên chất lượng). Chia theo phase với exit criteria kiểm chứng được, không theo tuần/tháng — khác với timeline 43-tuần của `implementation-plan.md` (chỉ tham khảo, Decision #11).

Backend là NestJS modular monolith trong repository riêng, độc lập với FE Turborepo về source, lifecycle và deployment (Decision #60, #63). Hai repository tích hợp qua versioned OpenAPI artifact do BE phát hành sau API v1 handshake; Backend không import trực tiếp source từ `packages/schemas` (Decision #64).

## Phase 0 — Quyết định nền tảng

**Mục tiêu**: trả lời các open question ở [`backend-overview.md`](./backend-overview.md) bằng quyết định tường minh, ghi vào `planning/decision-log.md`.

**Exit criteria**:

- Đã chọn framework/ngôn ngữ, database, kiến trúc tổng thể (modular monolith hay khác) — mỗi lựa chọn có lý do chọn, phương án khác đã cân nhắc.
- Đã đối chiếu `packages/schemas` baseline với domain model, thống nhất OpenAPI v1 và chạy phiên grilling cho Cart/Order/Inventory nếu chưa có trong `glossary.md`.

## Phase 1 — Project Foundation

**Mục tiêu**: dự án backend chạy local được, có migration, error format thống nhất, health check.

**Exit criteria**:

- Local environment khởi động bằng một lệnh.
- `docker compose up -d` khởi động PostgreSQL + Mailpit có health check; NestJS chạy host bằng `pnpm start:dev`.
- Application bootstrap dùng `@nestjs/platform-express`; smoke test chứng minh HTTP adapter, global pipes, exception filter và logging hoạt động cùng nhau (Decision #74).
- API trả error envelope đúng shape đã chốt ở [`api-contracts.md`](./api-contracts.md).
- Có versioned OpenAPI artifact khớp baseline v1; CI kiểm tra compatibility và FE có thể generate client/Zod adapters từ artifact đã pin.
- Global `ValidationPipe` dùng DTO + `class-validator`/`class-transformer`, từ chối unknown fields; request và response đều được mô tả trong `@nestjs/swagger`.
- NestJS URI versioning phục vụ business routes dưới `/api/v1`; health routes `/health/live` và `/health/ready` là version-neutral (Decision #73).
- OpenAPI artifact dùng SemVer độc lập; compatible change không tạo URI major mới, breaking change mới mở `/api/v2`.
- Native Express request/response không đi vào application/domain layer; chỉ HTTP/infrastructure edge được phép phụ thuộc platform API khi Nest abstraction không đủ.
- PostgreSQL transactional outbox/job table có migration, poller, retry/backoff, dead-letter và health/metrics baseline; worker V1 chạy cùng application nhưng không gắn business handler vào HTTP controller (Decision #77).

## Phase 2 — Identity & Customer

**Mục tiêu**: auth (register/login/logout/refresh, forgot/reset password), profile, address book — khớp `08-authentication-authorization.md` phía Front-end.

**Exit criteria**:

- Password hash dùng Argon2id đúng baseline Decision #72, có verify/rehash-on-login; JWT access + rotating opaque refresh strategy nhất quán Decision #65 và ADR 0010, bao gồm revoke/reuse detection.
- Authorization guard enforce ở server, không chỉ ẩn UI.
- Password policy, reset token TTL, rate limiting, session timeout và auth error wording đạt baseline ở [`../../security/security-baseline.md`](../../security/security-baseline.md).
- Forgot/reset và notification email được enqueue atomically qua outbox; API không chờ mail provider và không mất job nếu process dừng sau commit.

## Phase 3 — Catalog

**Mục tiêu**: Product/Variant/SKU/Category CRUD khớp domain model đã chốt trong `glossary.md`.

**Exit criteria**:

- Slug và SKU unique.
- Không hard-delete Product đã xuất hiện trong Order.
- API hỗ trợ filter/sort/pagination đúng contract đã chốt.
- Search catalog dùng PostgreSQL FTS + `unaccent` + `pg_trgm`, có index và relevance ordering; không cần external search service ở MVP (Decision #75).
- Integration test cover accent-insensitive query, typo nhẹ, partial match, empty query/result và deterministic pagination; query plan kiểm chứng index trên dataset đại diện.

## Phase 4 — Inventory

**Mục tiêu**: tách `on_hand`/`reserved`/`available`, xác nhận quy tắc reserve theo domain model đã grill ở Phase 0.

**Exit criteria**:

- Không oversell trong transaction cạnh tranh (test cụ thể, không chỉ code review).
- Stock movement có audit trail.
- Reservation expiry sweep idempotent, claim job an toàn khi nhiều application instance cùng chạy.

## Phase 5 — Cart & Wishlist

**Mục tiêu**: khớp API contract ở `api-contracts.md`, cart merge sau đăng nhập.

**Exit criteria**:

- Guest cart có token riêng, merge không tạo duplicate bất hợp lý.
- Server luôn tính lại giá — Front-end không phải nguồn sự thật (nhất quán `../frontend/07-api-integration.md`).

## Phase 6 — Checkout & Order (COD only)

**Mục tiêu**: luồng đặt hàng COD, không có bước payment gateway.

**Exit criteria**:

- Order item snapshot dữ liệu tại thời điểm mua (không tham chiếu Product hiện tại).
- Idempotency cho place order — reload không tạo duplicate order.
- State machine order chỉ gồm các trạng thái cần cho COD (xem `domain-model.md`), không thêm trạng thái payment gateway chưa cần.

## Phase 7 — Admin & CMS API

**Mục tiêu**: API phục vụ Admin (CRUD product/category/inventory/order status) và CMS (theo danh sách ở `requirements/functional-requirements.md` §3.3).

**Exit criteria**:

- API enforce authorization ở server (không dựa vào việc ẩn UI).
- CMS có draft/published state, storefront chỉ đọc content đã publish.
- Product/CMS upload qua Backend và stream tới `ObjectStorage`; persistence chỉ giữ `Asset` metadata. Draft/preview object private, public CDN delivery chỉ sau publish (Decision #76).
- Permission mapping khớp [`rbac-matrix.md`](./rbac-matrix.md), không còn endpoint mutation nào dùng quy tắc "bất kỳ admin nào cũng được".

## Phase 8 — Testing, Security, Observability

**Mục tiêu**: unit test cho domain rule (pricing, inventory, order state transition), integration test cho API chính, security review cơ bản (OWASP), logging có trace ID.

**Exit criteria**:

- Domain rule quan trọng có unit test.
- Unit/module test dùng Jest; HTTP integration/e2e dùng Supertest.
- API chính có integration test dùng Testcontainers PostgreSQL, không mock database.
- Có Pino structured logs, redaction và request/correlation ID cho các luồng critical (checkout, order).
- Sensitive mutation tạo PostgreSQL audit record riêng; liveness/readiness health endpoints hoạt động.
- Security baseline trong [`../../security/security-baseline.md`](../../security/security-baseline.md) đã có bằng chứng kiểm tra cho auth, CMS publish/preview, và audit trail.

## Phase 9 — Integration với Front-end

**Mục tiêu**: thay MSW mock bằng API thật, theo thứ tự Auth → Categories → Product Listing → Product Detail → Cart → Checkout → Order → Admin → CMS (đối chiếu `../frontend/07-api-integration.md`).

**Exit criteria**:

- Mock và response thật cùng schema — Front-end không cần sửa component, chỉ đổi flag `NEXT_PUBLIC_API_MOCKING` (Decision #28).
- Không còn mock handler nào chạy trong production build.
