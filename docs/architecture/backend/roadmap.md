# Roadmap — Backend

## Nguyên tắc

Cùng nguyên tắc với [`../frontend/roadmap.md`](../frontend/roadmap.md): **không có mốc thời gian cụ thể** (Decision #9 — solo dev, ưu tiên chất lượng). Chia theo phase với exit criteria kiểm chứng được, không theo tuần/tháng — khác với timeline 43-tuần của `implementation-plan.md` (chỉ tham khảo, Decision #11).

Backend chỉ bắt đầu triển khai thật sau khi Front-end đủ ổn định để biết chắc contract cần gì (xem `planning/brainstorm-session.md` §3.1 — chưa cần trả lời framework backend cho tới giai đoạn này).

## Phase 0 — Quyết định nền tảng

**Mục tiêu**: trả lời các open question ở [`backend-overview.md`](./backend-overview.md) bằng quyết định tường minh, ghi vào `planning/decision-log.md`.

**Exit criteria**:
- Đã chọn framework/ngôn ngữ, database, kiến trúc tổng thể (modular monolith hay khác) — mỗi lựa chọn có lý do chọn, phương án khác đã cân nhắc.
- Đã đối chiếu `packages/schemas` thật với domain model nháp ở `domain-model.md`, chạy phiên grilling cho Cart/Order/Inventory nếu chưa có trong `glossary.md`.

## Phase 1 — Project Foundation

**Mục tiêu**: dự án backend chạy local được, có migration, error format thống nhất, health check.

**Exit criteria**:
- Local environment khởi động bằng một lệnh.
- API trả error envelope đúng shape đã chốt ở [`api-contracts.md`](./api-contracts.md).
- Có OpenAPI spec khớp `packages/schemas`.

## Phase 2 — Identity & Customer

**Mục tiêu**: auth (register/login/logout/refresh, forgot/reset password), profile, address book — khớp `authentication-authorization.md` phía Front-end.

**Exit criteria**:
- Password hash an toàn; session/refresh strategy nhất quán với cơ chế cookie `httpOnly` đã chốt phía FE (Decision #22, ADR 0004).
- Authorization guard enforce ở server, không chỉ ẩn UI.

## Phase 3 — Catalog

**Mục tiêu**: Product/Variant/SKU/Category CRUD khớp domain model đã chốt trong `glossary.md`.

**Exit criteria**:
- Slug và SKU unique.
- Không hard-delete Product đã xuất hiện trong Order.
- API hỗ trợ filter/sort/pagination đúng contract đã chốt.

## Phase 4 — Inventory

**Mục tiêu**: tách `on_hand`/`reserved`/`available`, xác nhận quy tắc reserve theo domain model đã grill ở Phase 0.

**Exit criteria**:
- Không oversell trong transaction cạnh tranh (test cụ thể, không chỉ code review).
- Stock movement có audit trail.

## Phase 5 — Cart & Wishlist

**Mục tiêu**: khớp API contract ở `api-contracts.md`, cart merge sau đăng nhập.

**Exit criteria**:
- Guest cart có token riêng, merge không tạo duplicate bất hợp lý.
- Server luôn tính lại giá — Front-end không phải nguồn sự thật (nhất quán `../frontend/api-integration.md`).

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

## Phase 8 — Testing, Security, Observability

**Mục tiêu**: unit test cho domain rule (pricing, inventory, order state transition), integration test cho API chính, security review cơ bản (OWASP), logging có trace ID.

**Exit criteria**:
- Domain rule quan trọng có unit test.
- API chính có integration test dùng database thật (container).
- Có log/metric tối thiểu cho các luồng critical (checkout, order).

## Phase 9 — Integration với Front-end

**Mục tiêu**: thay MSW mock bằng API thật, theo thứ tự Auth → Categories → Product Listing → Product Detail → Cart → Checkout → Order → Admin → CMS (đối chiếu `../frontend/api-integration.md`).

**Exit criteria**:
- Mock và response thật cùng schema — Front-end không cần sửa component, chỉ đổi flag `NEXT_PUBLIC_API_MOCKING` (Decision #28).
- Không còn mock handler nào chạy trong production build.
