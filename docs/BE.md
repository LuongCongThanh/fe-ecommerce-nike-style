# BE

Đây là tài liệu chính để làm Backend.

## 1. Hiện trạng

Backend chưa được implement. Runtime/framework đã chốt ở Decision `#60` và ADR `0005`; PostgreSQL đã chốt là primary database ở Decision `#61` và ADR `0006`; Prisma đã chốt là data-access mặc định ở Decision `#62` và ADR `0007`. Hạ tầng vẫn đang được phân tích.

Những gì đã biết:

- FE đang đi theo `mock-first`
- Backend dùng Node.js LTS + TypeScript strict + NestJS modular monolith
- NestJS chạy trên Express adapter (`@nestjs/platform-express`) trong phiên bản đầu
- PostgreSQL là primary database
- Prisma là ORM/data-access mặc định; raw SQL là escape hatch có kiểm soát
- Backend nằm trong repository riêng, có lifecycle và deployment độc lập với FE Turborepo
- Backend sẽ được gắn vào sau
- Backend phải tôn trọng contract mà FE đã chốt

## 2. Mục tiêu Backend

Backend phải phục vụ:

- auth/account
- catalog
- inventory
- cart
- wishlist
- checkout COD
- order
- Admin APIs
- CMS APIs

## 3. Nguyên tắc Backend

- `contract-first`
- Ưu tiên modular, dễ mở rộng
- Authorization phải enforce ở server
- Security baseline phải là built-in concern
- Không làm backend lệch shape so với mock API

## 4. API Principles

- Response shape phải ổn định
- Error envelope phải thống nhất
- Filter/sort/pagination contract phải rõ
- Mock API và real API phải cùng shape
- FE đổi từ mock sang real API không được đòi hỏi rewrite component
- Hai repository không import source trực tiếp; contract phải được version và kiểm tra compatibility
- Sau API v1 handshake, versioned OpenAPI artifact do BE phát hành là canonical transport contract
- `packages/schemas` hiện tại là baseline chuyển tiếp; FE pin contract version và generate client/Zod adapters
- BE dùng Nest DTO classes + `class-validator`/`class-transformer` + global `ValidationPipe` + `@nestjs/swagger`.
- Global validation whitelist và từ chối unknown/non-whitelisted fields; conversion quan trọng phải khai báo tường minh.
- Không duy trì Zod transport schemas thủ công trong BE; validation errors map về stable error envelope.
- API nghiệp vụ dùng NestJS URI versioning tại `/api/v1`; backward-compatible change giữ trong v1, chỉ mở `/api/v2` khi có breaking change.
- `/health/live` và `/health/ready` không mang API version; SemVer của OpenAPI artifact được quản lý độc lập với URI version.
- Ưu tiên decorator/abstraction của Nest; không truyền native Express `Request`/`Response` xuống application/domain service. Platform-specific handling chỉ nằm ở HTTP/infrastructure edge khi thật sự cần.

## 5. Domain cốt lõi

Các khái niệm backend bắt buộc phải tôn trọng:

- `Product`
- `Variant`
- `SKU`
- `Category`
- `Gender`
- `CartItem`
- `Reservation`
- `Order`
- `OrderItem`
- `WishlistItem`

## 6. Luồng nghiệp vụ quan trọng

### Catalog

- Product có thể có hoặc không có variant
- Giá và stock gắn với SKU
- Search cơ bản dùng PostgreSQL Full-Text Search với weighted `tsvector`/GIN index, kết hợp `unaccent` cho accent-insensitive matching và `pg_trgm` cho fuzzy/partial matching.
- SKU/slug và các lookup chính xác tiếp tục dùng B-tree index; không thay equality lookup bằng trigram.
- Prisma giữ CRUD/data-access mặc định; extension, index và truy vấn search đặc thù dùng migration/raw SQL có tham số theo Decision #62 và #75.
- Chưa thêm Elasticsearch/OpenSearch/Meilisearch; chỉ đánh giá lại dựa trên load test hoặc yêu cầu search nâng cao có bằng chứng.
- Product/CMS media lưu trong S3-compatible object storage qua interface `ObjectStorage`; PostgreSQL chỉ lưu `Asset` metadata, không lưu binary.
- V1 nhận multipart upload tại Backend, authorize/validate rồi stream sang storage; không buffer toàn bộ file trong memory và không ghi local disk production.
- Public asset được phục vụ qua CDN sau publish; draft/preview giữ private. Presigned direct upload và vendor storage/CDN cụ thể được chốt riêng khi có nhu cầu triển khai.

### Cart

- `CartItem` tham chiếu trực tiếp `skuId`
- Merge cart là cộng quantity rồi clamp theo `available`

### Wishlist

- `WishlistItem` tham chiếu `Product`
- Merge wishlist là union theo Product

### Checkout/Order

- Chỉ `COD`
- Reservation bắt đầu khi checkout start
- Order item phải snapshot dữ liệu tại thời điểm mua
- Place order cần xử lý `idempotency`

### Return

- Return window là `7 ngày`
- Return cần approval thủ công
- Refund COD là tracked-manually

## 7. Auth và Authorization

- JWT access token ngắn hạn, giữ trong memory phía browser và gửi bằng Bearer header
- Opaque refresh token trong cookie `HttpOnly`/`Secure`/`SameSite`, rotate mỗi lần dùng
- Chỉ lưu hash + token-family metadata trong PostgreSQL; hỗ trợ revoke và reuse detection
- Không lưu token trong `localStorage`/`sessionStorage`; không dùng JWT làm refresh token
- Backend phải support refresh-family invalidation khi logout, reset password hoặc khóa tài khoản
- TTL `storefront`: access 10 phút, refresh idle 7 ngày, absolute 30 ngày
- TTL `admin`/`cms`: access 5 phút, refresh idle 8 giờ, absolute 24 giờ
- Mỗi FE app có domain độc lập nhưng browser chỉ gọi same-origin `/api/*`; reverse proxy chuyển tiếp tới Backend
- Refresh cookie first-party, host-only theo từng app; không dựa vào third-party cookie/credentialed cross-site refresh
- Backend phải enforce route/action permission
- Admin/CMS RBAC chi tiết vẫn là open question

## 8. Security Minimum

Backend phải có tối thiểu:

- password policy; Argon2id baseline `m=19456 KiB`, `t=2`, `p=1`, production benchmark và rehash-on-login theo Decision #72
- reset token TTL
- one-time-use reset token
- rate limiting cho auth endpoints
- CSRF strategy nếu dùng cookie auth
- sanitize CMS public content
- audit trail cho các action nhạy cảm
- không leak PII/raw secret vào log

## 9. Observability Minimum

Baseline đã chốt:

- Pino/`nestjs-pino`: structured JSON production, pretty output development, log level theo environment.
- Request/correlation ID được nhận hợp lệ từ proxy hoặc tự sinh, propagate vào log và response header.
- Redact password, cookie, Authorization header, access/refresh/reset token và PII không cần thiết.
- PostgreSQL audit trail riêng cho inventory, order status, Admin mutation và CMS publish; không trộn audit record vào application log.
- Liveness/readiness health endpoints.
- Monitoring/tracing vendor được chốt trước staging; chưa thêm OpenTelemetry/Sentry/Datadog ở Phase 0.

### Background jobs V1

- Dùng PostgreSQL transactional outbox/durable job table cho email, reservation expiry và cleanup asset upload dở; không dual-write trực tiếp business transaction rồi mới enqueue ở hệ thống khác.
- Worker claim job bằng `FOR UPDATE SKIP LOCKED`; delivery là at-least-once nên mọi handler phải idempotent.
- Job có `availableAt`, attempt count, retry với exponential backoff, terminal/dead-letter state và correlation ID; payload không chứa raw secret nếu có thể tham chiếu bằng ID.
- `@nestjs/schedule` chỉ kích hoạt poll/sweep, PostgreSQL mới là nguồn sự thật durable. V1 worker chạy cùng Nest application nhưng module/entry boundary phải cho phép tách process sau.
- Chưa thêm Redis/BullMQ; đánh giá lại bằng throughput, queue latency, số worker và nhu cầu priority/delay workflow thực tế.

## 10. Delivery Order

Thứ tự hợp lý cho Backend:

1. Chốt phần còn lại của tech stack: contract bridge và local infrastructure
2. Scaffold backend foundation
3. Auth/account
4. Catalog
5. Inventory
6. Cart/wishlist
7. Checkout/order
8. Admin/CMS APIs
9. Security/observability hardening
10. Real integration với FE

### Local development baseline

- NestJS chạy trực tiếp trên host bằng `pnpm start:dev`.
- Docker Compose chạy PostgreSQL + Mailpit, pin image version và có health check.
- PostgreSQL dùng named volume; migration chạy bằng command Prisma tường minh.
- Integration test dùng database container riêng, không dùng development database.
- Chưa thêm Redis/BullMQ; PostgreSQL outbox/job queue theo Decision #77. Production Dockerfile được chốt cùng deployment stack.

### Backend testing baseline

- Jest cho unit/module test; Supertest cho HTTP integration/e2e.
- Testcontainers khởi tạo PostgreSQL riêng cho integration test; không mock database.
- Prisma migration/seed chạy trên test container trước suite.
- Critical coverage: inventory concurrency, transaction rollback, order idempotency, refresh rotation/reuse, RBAC và API error envelope.
- Contract suite kiểm versioned OpenAPI compatibility; FE Playwright kiểm journey xuyên FE → API.

## 11. Open Questions

- Infra nào
- S3-compatible storage/CDN vendor và local-development adapter nào
- RBAC chi tiết cho Admin/CMS
- Monitoring/tracing vendor trước staging

## 12. Nguồn gốc nội dung

File này rút gọn từ:

- `01-delivery/architecture/backend`
- `01-delivery/specification/technical-design.md`
- `00-core/glossary.md`
- `00-core/decision-log.md`
