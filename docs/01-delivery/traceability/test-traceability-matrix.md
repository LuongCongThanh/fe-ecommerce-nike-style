# Test Traceability Matrix

> File này nối requirement và security baseline sang các test case làm việc. Nó không thay thế [`../FE/FE.md`](../FE/FE.md) §4.6; nó chỉ biến chiến lược test thành danh sách coverage có thể theo dõi.

## Mục đích

- Cho biết mỗi requirement quan trọng cần được chứng minh bằng loại test nào.
- Làm rõ đâu là test `P0` chặn launch, đâu là test có thể hoàn thiện sau.
- Giảm khoảng trống giữa `requirements`, `security baseline`, `RBAC`, và `testing strategy`.

## Quy ước

- `Test ID`
  - `FE-UNIT-*`: unit test
  - `FE-INT-*`: integration test qua MSW / mock contract
  - `FE-E2E-*`: E2E UI flow
  - `BE-INT-*`: backend integration test
  - `SEC-*`: security test
- `Priority`
  - `P0`: chặn Launch 1 hoặc chặn phase
  - `P1`: nên có trước soft launch hoặc trước integration thật
  - `P2`: có giá trị nhưng có thể đi sau
- `Status`
  - `Required`: phải có
  - `Planned`: đã biết cần nhưng chưa tới phase gần nhất

## Storefront Coverage

| Test ID     | Covers reqs                       | Test type   | Scenario                                                                                   | Priority | Evidence expected                                     | Status   |
| ----------- | --------------------------------- | ----------- | ------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------- | -------- |
| FE-UNIT-001 | SF-02                             | Unit        | Serialize / parse filter, sort, pagination từ URL và ngược lại                             | P0       | Hàm pure pass với case normal + malformed query       | Required |
| FE-UNIT-002 | SF-03                             | Unit        | Chọn đúng SKU từ Color/Size; không trả SKU khi chọn chưa đủ                                | P0       | Assertion trên variant selection logic                | Required |
| FE-UNIT-003 | SF-10                             | Unit        | Fallback `Localized Text` về `vi` khi thiếu bản dịch                                       | P1       | Assertion trên fallback helper                        | Required |
| FE-INT-001  | SF-01, SF-02                      | Integration | PLP đọc URL, gọi contract đúng shape, render list / empty / error                          | P0       | Test xanh với MSW handler cho success + empty + error | Required |
| FE-INT-002  | SF-03                             | Integration | PDP hiển thị giá/tồn kho theo SKU, chặn add-to-cart khi chưa chọn đủ                       | P0       | Test component/page với MSW data thật                 | Required |
| FE-INT-003  | SF-05                             | Integration | Cart optimistic update, rollback khi `OUT_OF_STOCK` hoặc `PRICE_CHANGED`                   | P0       | Assertion UI state trước/sau rollback                 | Required |
| FE-INT-004  | SF-06                             | Integration | Wishlist toggle thành công / thất bại, merge guest -> authenticated đúng rule              | P0       | Test với state guest và signed-in                     | Required |
| FE-INT-005  | SF-08, SF-09                      | Integration | Sign in/up, account guard, load profile/address/order history                              | P0       | Auth contract mock pass, unauthorized bị chặn đúng    | Required |
| FE-INT-006  | SF-04                             | Integration | Search cơ bản trả kết quả ổn định, empty state, error state, debounce request cũ bị bỏ qua | P0       | Test query/state/update theo input search             | Required |
| FE-E2E-001  | SF-01, SF-02, SF-03, SF-05, SF-07 | E2E         | Browse -> PLP -> PDP -> add to cart -> checkout COD -> order success                       | P0       | Playwright run xanh toàn critical path                | Required |
| FE-E2E-002  | SF-08, SF-09                      | E2E         | Sign up/sign in -> account core -> route guard hoạt động đúng                              | P0       | Unauthorized redirect + authorized access pass        | Required |
| FE-E2E-003  | SF-06                             | E2E         | Guest wishlist -> sign in -> merge -> wishlist account hiển thị đúng                       | P0       | Merge không mất dữ liệu, không duplicate sai          | Required |
| FE-E2E-004  | SF-04                             | E2E         | Search cơ bản từ storefront public                                                         | P1       | Search result/empty/error flow pass                   | Required |
| FE-E2E-005  | SF-10                             | E2E         | Đổi locale, giữ layout ổn định, fallback text không vỡ trang                               | P1       | Route + content + no obvious layout break             | Planned  |

## Admin Coverage

| Test ID    | Covers reqs         | Test type   | Scenario                                                               | Priority | Evidence expected                         | Status   |
| ---------- | ------------------- | ----------- | ---------------------------------------------------------------------- | -------- | ----------------------------------------- | -------- |
| FE-INT-101 | AD-01               | Integration | Admin list/create/edit product theo schema                             | P0       | CRUD action pass với mock contract        | Required |
| FE-INT-102 | AD-04               | Integration | Admin cập nhật trạng thái đơn hàng theo state hợp lệ                   | P0       | Chỉ transition hợp lệ được chấp nhận      | Required |
| FE-INT-103 | AD-02               | Integration | Category management cơ bản                                             | P1       | Create/edit/list category pass            | Planned  |
| FE-INT-104 | AD-03               | Integration | Inventory update cơ bản + audit metadata hiển thị nếu có               | P1       | Update flow pass, invalid input fail đúng | Planned  |
| FE-E2E-101 | AD-01, AD-04, AD-06 | E2E         | `catalog_operator` vào Admin, CRUD product và update order status được | P0       | Menu/action đúng quyền + flow xanh        | Required |
| FE-E2E-102 | AD-06               | E2E         | `content_editor` không vào được Admin flow catalog/order               | P0       | Route/action bị chặn đúng                 | Required |

## CMS Coverage

| Test ID    | Covers reqs            | Test type   | Scenario                                                          | Priority | Evidence expected                              | Status   |
| ---------- | ---------------------- | ----------- | ----------------------------------------------------------------- | -------- | ---------------------------------------------- | -------- |
| FE-INT-201 | CMS-01..CMS-07         | Integration | CRUD draft cho content type P0                                    | P0       | Draft save/load pass                           | Required |
| FE-INT-202 | CMS-X1                 | Integration | Preview -> publish -> storefront chỉ đọc published content        | P0       | Draft không rò ra public, publish mới hiển thị | Required |
| FE-INT-203 | CMS-08                 | Integration | Content editor nhập bản dịch thiếu, storefront fallback đúng `vi` | P1       | Missing translation không làm render rỗng      | Planned  |
| FE-E2E-201 | CMS-01..CMS-07, CMS-X1 | E2E         | `content_editor` tạo draft, preview, publish Hero/Banner/Blog     | P0       | Flow publish xanh, storefront đổi đúng         | Required |
| FE-E2E-202 | CMS-X1                 | E2E         | User không có quyền publish bị chặn                               | P1       | Action/route bị từ chối đúng                   | Planned  |

## Security Coverage

| Test ID | Covers reqs    | Test type                           | Scenario                                                                                                                    | Priority | Evidence expected                                                         | Status  |
| ------- | -------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- | ------- |
| SEC-001 | SEC-01, SF-08  | Backend integration / security      | Login brute-force vượt ngưỡng rate limit bị throttle                                                                        | P0       | Nhận lỗi throttle, không leak account existence                           | Planned |
| SEC-002 | SEC-01, SF-08  | Backend integration / security      | Reset token dùng lại lần 2 bị từ chối                                                                                       | P0       | Token one-time only được enforce                                          | Planned |
| SEC-003 | SEC-01         | Backend integration / security      | Refresh cookie có `HttpOnly`, `Secure`, `SameSite` đúng môi trường; access token không nằm trong browser storage            | P0       | Header/cookie attribute và storage assertion đúng                         | Planned |
| SEC-004 | SEC-01         | Backend integration / security      | Refresh endpoint có CSRF guard theo strategy đã chọn; token rotation/reuse detection hoạt động                              | P1       | Request thiếu bảo vệ hoặc reuse token bị từ chối                          | Planned |
| SEC-009 | SEC-01         | Backend integration / security      | Access, idle và absolute TTL đúng profile `storefront` so với `admin`/`cms`                                                 | P0       | Token/family hết hạn đúng boundary và bắt đăng nhập lại                   | Planned |
| SEC-010 | SEC-01         | Backend integration / security      | Password mới được lưu dưới dạng Argon2id PHC string đúng baseline; hash dùng parameters cũ được rehash sau login thành công | P0       | Không có plaintext/reversible password; verify và lazy migration đều pass | Planned |
| SEC-005 | SEC-02         | Unit / contract review              | Analytics payload không chứa email, phone, address, token                                                                   | P0       | Event schema hoặc runtime assertion pass                                  | Planned |
| SEC-006 | CMS-X1, SEC-01 | Integration / security              | CMS content nguy hiểm bị sanitize trước khi render public                                                                   | P0       | Payload chứa script/html nguy hiểm không execute/render raw               | Planned |
| SEC-007 | AD-06, CMS-X1  | Backend integration / authorization | Permission check server-side theo RBAC matrix                                                                               | P0       | `403` cho role sai, success cho role đúng                                 | Planned |
| SEC-008 | SEC-01         | Backend integration / audit         | Inventory update, order status update, publish tạo audit trail đủ fields                                                    | P1       | Audit record có actor/action/target/timestamp/change summary              | Planned |

## Backend Contract Coverage

| Test ID     | Covers reqs           | Test type                           | Scenario                                                                                                                                   | Priority | Evidence expected                                                                                    | Status  |
| ----------- | --------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- | ------- |
| BE-INT-001  | NFR-03                | Backend integration                 | API response khớp schema đã chốt cho product list/detail                                                                                   | P0       | Schema validation pass                                                                               | Planned |
| BE-INT-002  | NFR-03, SF-05         | Backend integration                 | Cart API giữ đúng contract cho add/update/delete/merge                                                                                     | P0       | Same shape as FE expects                                                                             | Planned |
| BE-INT-003  | NFR-03, SF-07         | Backend integration                 | Place order idempotency: retry không tạo duplicate                                                                                         | P0       | Cùng idempotency key chỉ tạo 1 order                                                                 | Planned |
| BE-INT-004  | SF-08, SF-09          | Backend integration                 | Auth/account endpoint trả `401/403/validation` đúng envelope                                                                               | P0       | Error envelope + status code đúng                                                                    | Planned |
| BE-INT-005  | AD-06, CMS-X1         | Backend integration                 | Admin/CMS mutation trả `403` đúng khi role không đủ quyền                                                                                  | P0       | Permission contract đúng                                                                             | Planned |
| BE-INT-006  | NFR-03                | Backend contract / routing          | Business routes chỉ expose qua `/api/v1`; health routes version-neutral; OpenAPI artifact SemVer không tự tạo URI major mới                | P0       | Routing assertions và generated OpenAPI paths/version metadata pass                                  | Planned |
| BE-INT-007  | NFR-03                | Backend smoke / architecture        | Express adapter bootstrap cùng global validation, error filter và logging; application/domain service không phụ thuộc native Express types | P0       | Smoke test pass và architecture lint/import rule pass                                                | Planned |
| BE-INT-008  | SF-04, NFR-03         | Backend integration / database      | Search catalog khớp có dấu/không dấu, typo nhẹ và partial query; kết quả relevance/pagination ổn định                                      | P0       | PostgreSQL FTS/`unaccent`/`pg_trgm` assertions pass trên database thật                               | Planned |
| BE-PERF-001 | SF-04, NFR-01         | Backend performance / query plan    | Search trên dataset đại diện dùng index và đạt budget được lượng hóa trước staging                                                         | P1       | `EXPLAIN (ANALYZE, BUFFERS)` evidence; không regression sang full table scan ngoài case đã chấp nhận | Planned |
| BE-INT-009  | AD-01, CMS-X1, SEC-01 | Backend integration / storage       | Authorized multipart upload stream tới object storage và chỉ lưu `Asset` metadata; wrong type/size/content bị từ chối                      | P0       | Storage adapter + PostgreSQL assertions pass; process không buffer toàn file                         | Planned |
| SEC-011     | CMS-X1, SEC-01        | Backend integration / authorization | Draft/preview asset không public; publish cần đúng quyền, mở CDN delivery và tạo audit record                                              | P0       | Unauthorized/private read bị từ chối; authorized publish transition pass                             | Planned |
| BE-INT-010  | SF-08, SF-07          | Backend integration / jobs          | Domain mutation và outbox job cùng commit/rollback; process restart không làm mất pending job                                              | P0       | PostgreSQL transaction/restart assertions pass                                                       | Planned |
| BE-INT-011  | SF-07, NFR-03         | Backend concurrency / jobs          | Nhiều worker claim bằng `SKIP LOCKED`; retry/dead-letter đúng policy và duplicate delivery không nhân đôi side effect                      | P0       | Concurrent Testcontainers suite + idempotency evidence pass                                          | Planned |

## Coverage Gaps Còn Lại

| Gap ID | Problem                                                                                                                               | Required next step                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| TT-01  | Chưa có ID test case thực thi trong repo vì chưa tới giai đoạn code/test thật                                                         | Khi bắt đầu viết test, giữ nguyên `Test ID` này và map sang file test thật                                       |
| TT-02  | Security test hiện mới ở mức plan, chưa có runner/framework riêng mô tả chi tiết                                                      | Khi backend thật bắt đầu, bổ sung strategy cho security/integration runner                                       |
| TT-03  | Đã có query-plan case cho search nhưng chưa lượng hóa latency/dataset budget; checkout, admin/cms vẫn chưa có performance case cụ thể | Trước staging, chốt dataset/latency budget cho search và thêm performance coverage cho các critical flow còn lại |

## Quan hệ với các tài liệu khác

- Requirement coverage: [`./requirements-traceability-matrix.md`](requirements-traceability-matrix.md)
- Testing strategy tổng quát: [`../FE/FE.md`](../FE/FE.md) §4.6
- Security baseline: [`../security/security-baseline.md`](../security/security-baseline.md)
- RBAC baseline: [`../architecture/backend/rbac-matrix.md`](../architecture/backend/rbac-matrix.md)
