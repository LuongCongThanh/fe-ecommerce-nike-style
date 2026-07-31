# TEST

Đây là tài liệu chính để làm test.

## 1. Mục tiêu test

Chứng minh rằng:

- requirement trong `SRS.md` được cover
- flow mua hàng MVP chạy được
- Admin và CMS đủ dùng
- security baseline không chỉ nằm trên giấy
- việc chuyển mock API sang real API không phá frontend

## 2. Các lớp test

- `Unit test`
- `Frontend integration test`
- `E2E test`
- `Backend integration test`
- `Security test`
- `Contract parity test`

Backend baseline: Jest + Supertest + Testcontainers PostgreSQL. Backend integration test không dùng database mock; FE Playwright chịu trách nhiệm journey xuyên FE → API.

## 3. P0 Test Coverage

### Storefront

- Browse / PLP / PDP
- Variant -> SKU resolution
- Search cơ bản
- Cart add/update/delete
- Cart rollback khi lỗi stock hoặc price
- Wishlist merge
- Auth
- Account core
- Checkout COD

### Admin

- Product CRUD
- Order status update
- Baseline authorization

### CMS

- Draft
- Preview
- Publish
- Permission check cơ bản

## 4. Test IDs đang dùng

Các ID test hiện đã được thiết kế trong docs:

- `FE-UNIT-*`
- `FE-INT-*`
- `FE-E2E-*`
- `BE-INT-*`
- `SEC-*`

Ví dụ:

- `FE-UNIT-001`: URL state
- `FE-UNIT-002`: variant -> SKU
- `FE-UNIT-003`: locale fallback
- `FE-E2E-001`: browse -> PDP -> cart -> checkout COD
- `SEC-003`: cookie attributes
- `BE-INT-003`: place order idempotency

## 5. Acceptance Evidence

Một requirement chỉ nên coi là "done" khi có evidence tương ứng:

- unit/integration/E2E pass
- hoặc backend integration pass
- hoặc security validation pass
- hoặc contract parity pass

Không nên coi "đã viết code" là bằng chứng đủ.

## 6. Current Reality

Điểm cần nói thật:

- Repo hiện chưa có file test thật
- Nhiều test trong docs hiện là planned test, chưa phải executed test
- Traceability hiện là design-time traceability

## 7. Ưu tiên khi bắt đầu viết test

1. Unit test cho logic thuần:
   - URL state
   - variant -> SKU
   - locale fallback
2. FE integration test cho:
   - PLP
   - PDP
   - cart
   - wishlist
   - auth
   - search
3. E2E cho:
   - checkout COD
   - auth/account
   - Admin P0
   - CMS P0
4. Contract test và backend integration khi backend thật bắt đầu

## 8. Security Test Minimum

- Rate limiting auth
- Reset token one-time use
- Cookie attributes
- CSRF strategy
- CMS sanitize
- RBAC server-side
- Audit trail
- Analytics không chứa PII

## 9. Open Questions

- Chọn cách chạy contract parity suite
- Chưa có performance-test plan đủ sâu

## 10. Nguồn gốc nội dung

File này rút gọn từ:

- `01-delivery/traceability/test-traceability-matrix.md`
- `01-delivery/traceability/requirements-traceability-matrix.md`
- `01-delivery/security/security-baseline.md`
