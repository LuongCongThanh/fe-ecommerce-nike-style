# DEVOPS

Đây là tài liệu chính để làm DevOps.

## 1. Trạng thái hiện tại

Phần DevOps hiện chưa được chốt sâu trong bộ tài liệu gốc.

Vì vậy file này chỉ giữ:

- những gì đã biết chắc
- những gì tối thiểu phải có
- những gì còn là câu hỏi mở

Không tự bịa thêm pipeline hay hạ tầng cụ thể khi source docs chưa chốt.

## 2. Những gì đã biết

- FE là monorepo hướng tới `storefront`, `admin`, `cms`; Backend nằm ở repository/deployment riêng
- Mỗi FE app có registrable domain độc lập và expose same-origin `/api/*` proxy tới Backend
- Hiện chưa có backend thật
- Hiện chưa có infra production thật
- Hiện chưa chốt CI/CD stack
- Hiện chưa chốt hosting/platform cuối cùng

## 3. Mục tiêu DevOps tối thiểu

Khi dự án bước sang giai đoạn code thật, DevOps tối thiểu phải giải quyết:

- môi trường local rõ ràng
- build lặp lại được
- môi trường cho FE và BE
- secret management
- deploy quy củ
- rollback cơ bản
- logging/monitoring cơ bản

## 4. Yêu cầu tối thiểu nên có

### 4.1. Environment Management

- Tách biến môi trường rõ cho:
  - local
  - test/staging nếu có
  - production
- Có flag rõ cho mock API và real API
- Local Backend: NestJS chạy trên host; Docker Compose chạy PostgreSQL + Mailpit
- Dependency image phải pin version, có health check; PostgreSQL dùng named volume
- Integration test dùng database container riêng, không dùng development database
- Background jobs V1 dùng PostgreSQL transactional outbox/job table; chưa thêm Redis/BullMQ vì workload hiện tại chưa cần queue service riêng
- Chưa triển khai Elasticsearch/OpenSearch/Meilisearch; PostgreSQL extensions `unaccent` và `pg_trgm` phải được migration/bootstrap nhất quán giữa local, test và production
- CI Backend chạy Jest + Supertest; Testcontainers cung cấp PostgreSQL thật cho integration test
- Contract job kiểm versioned OpenAPI compatibility trước khi phát hành artifact

### 4.2. Build & CI

- Monorepo build phải chạy nhất quán
- Lint và test tối thiểu phải chạy được trong CI
- Không cho production build phụ thuộc mock handlers

### 4.3. Secrets

- Không hard-code secret
- Secret phải tách khỏi repo
- Session/auth secret phải rotate được về sau

### 4.4. Deploy

- Storefront/Admin/CMS cần chiến lược deploy rõ
- Backend deploy độc lập; mỗi FE hosting/CDN phải có reverse proxy/rewrite `/api/*` tới Backend, giữ nguyên business path `/api/v1/*`
- Production không dùng local disk cho Product/CMS media; cấu hình S3-compatible bucket và CDN nằm ngoài source, quyền upload/read tuân theo least privilege
- Giới hạn request/body timeout phải phù hợp streaming upload V1; metric bandwidth/size/error dùng làm bằng chứng trước khi chuyển sang presigned direct upload
- Cần rollback path tối thiểu

### 4.5. Observability

- Pino structured JSON logging; pretty output chỉ ở development
- Request/correlation ID xuyên proxy → Backend → response/log
- Redaction bắt buộc cho credential, token và PII không cần thiết
- PostgreSQL audit trail riêng cho action nhạy cảm
- Version-neutral liveness/readiness endpoints tại `/health/live` và `/health/ready`
- Monitoring/tracing vendor chốt trước staging, không chặn Phase 0
- Readiness phải phản ánh khả năng truy cập job table; metric tối thiểu gồm pending/oldest-job age, retry/dead-letter count và processing duration

## 5. Liên hệ với Security

DevOps phải hỗ trợ tối thiểu:

- HTTPS ở môi trường phù hợp
- cookie `Secure` khi có HTTPS
- first-party host-only refresh cookie qua same-origin API proxy; không phụ thuộc third-party cookie
- logging không lộ PII hoặc secret
- audit trail persistence

## 6. Liên hệ với Testing

DevOps phải hỗ trợ:

- chạy lint
- chạy unit/integration/E2E khi code đã có
- chạy contract tests khi backend thật bắt đầu

## 7. Open Questions

- Hosting/platform cho frontend
- Hosting/platform cho backend
- CI/CD tool nào
- Monitoring/tracing vendor nào trước staging
- Có staging environment hay không
- Chiến lược rollout/rollback cụ thể

## 8. Kết luận thực tế

Hiện tại, DevOps chưa phải vùng đã chốt xong.

Cách dùng file này:

- coi đây là checklist tối thiểu
- khi project bắt đầu có code thật, update file này trước khi chọn tool cụ thể

## 9. Nguồn gốc nội dung

File này rút gọn từ:

- `01-delivery/product/open-decisions.md`
- `01-delivery/security/security-baseline.md`
- `01-delivery/specification/technical-design.md`
