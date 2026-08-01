# Kế hoạch thực thi Front-end — Giai đoạn tiếp theo

## Bối cảnh

`ecommerce-next` không phải dự án mới — Storefront (Home, PLP/PDP, Cart, Checkout, Orders, Profile, Search cơ bản) và Auth đã hoàn thiện; Admin mới chỉ có vỏ (`AdminGuard` + `AdminSidebar` + `AdminNavbar`), chưa có trang quản trị thật nào. Backend Django (`apps/catalog`, `apps/orders`, `apps/accounts`) chỉ có API đọc cho Category/Product, API tự-quản-lý đơn hàng của khách, và auth cơ bản — chưa có API ghi cho Category/Product, chưa có API admin xem tất cả đơn hàng, và hoàn toàn chưa có Wishlist, Coupon, Promotion, Banner, Reports, Admin Users, CMS.

Dự án ở dạng portfolio cá nhân, không có deadline kinh doanh thật. Chiến lược đã chốt: **rộng trước, sâu sau** — đưa toàn hệ thống lên mức "dùng được" trước, rồi mới quay lại làm cứng performance/testing.

## Nguyên tắc chỉ đạo (đã chốt, xem thêm ADR)

- **Mock-first cho mọi phần thiếu backend** — kể cả Admin write API cho Category/Product (backend hiện là `ReadOnlyModelViewSet`) và Admin Orders list. Dùng MSW (đã có sẵn cho test) mở rộng sang dev mode, ghi thao tác CRUD vào `localStorage`. Xem [ADR 0003](../adr/0003-mock-first-cho-module-chua-co-backend.md) và thuật ngữ **Mock-first module** trong `CONTEXT.md`.
- **Không tách monorepo** (ADR 0001), **không tự xây CMS** (ADR 0002) — vẫn giữ nguyên.
- Thứ tự các giai đoạn dưới đây xếp theo mức độ cốt lõi cho một "hệ thống bán hàng" và phụ thuộc kỹ thuật, không theo áp lực doanh thu.

## Giai đoạn A — Rộng (đưa toàn hệ thống lên mức dùng được)

### A0. Nền tảng Admin DataTable (chặn tất cả các bước sau trong Admin)

`@tanstack/react-table` đã là dependency nhưng chưa dùng ở đâu. Categories/Orders/Users/Coupons đều cần bảng có sort/filter/pagination — dựng component `DataTable` dùng chung một lần, tránh lặp code ở từng module admin.

**Điểm cần chốt trước khi code:** style bảng dựa trên Radix hiện có hay thêm thư viện; có cần server-side pagination ngay từ đầu hay client-side đủ dùng với data mock.

### A1. Admin cốt lõi — Categories, Orders, Users

**Mục tiêu:** Admin dùng được cho 3 nghiệp vụ vận hành cơ bản nhất.

- Categories: CRUD + quan hệ cha/con (backend `Category.parent` đã hỗ trợ hierarchy) — mock-first cho write.
- Orders: danh sách tất cả đơn (mock-first cho list/filter), nhưng các action confirm/ship/deliver/cancel gọi **API thật** (`admin_urls.py` đã có).
- Users: danh sách + đổi role cơ bản — mock-first toàn bộ (backend chưa có role field lẫn API).

**Điểm cần chốt trước khi code:** Category dạng cây (tree view, kéo-thả) hay dạng phẳng có chọn cha qua dropdown; Order admin có cần bulk action không; Users có cần phân quyền chi tiết (RBAC) hay chỉ toggle is_staff.

### A2. Wishlist

**Mục tiêu:** Hoàn thiện tính năng storefront còn thiếu duy nhất, tái dùng pattern đã có ở Cart (persisted store, versioned schema).

**Điểm cần chốt trước khi code:** Wishlist gắn theo user (cần login) hay cho phép guest như Cart; có giới hạn số lượng sản phẩm không.

### A3. Search nâng cao

**Mục tiêu:** Nâng `SearchClient` hiện tại (chỉ query-driven) lên có autocomplete, gợi ý, popular search, filter — như `ideal.md` mô tả.

**Điểm cần chốt trước khi code:** dùng search engine thật (Algolia/Meilisearch) hay mock suggestions từ chính API Product hiện có; đây là quyết định đáng cân nhắc ADR nếu chọn engine thật (thêm lock-in bên thứ ba).

### A4. Admin phụ trợ — Coupon, Promotion, Banner

**Mục tiêu:** Hoàn thiện các công cụ marketing trong Admin — toàn bộ mock-first vì backend chưa có khái niệm này.

**Điểm cần chốt trước khi code:** Coupon áp dụng theo % hay số tiền cố định, có giới hạn theo sản phẩm/danh mục không; Promotion và Banner có cần lịch hiệu lực (start/end date) ngay từ đầu.

### A5. Reports / Analytics

**Mục tiêu:** Dashboard thống kê cơ bản trong Admin (doanh thu, đơn hàng, sản phẩm bán chạy) — mock-first, dữ liệu giả nhưng biểu đồ thật.

**Điểm cần chốt trước khi code:** chọn thư viện chart; phạm vi báo cáo (chỉ vài chỉ số cơ bản hay có filter theo khoảng thời gian).

### A6. CMS Integration

**Mục tiêu:** Tích hợp headless CMS thật (theo ADR 0002) cho Blog/Landing Page — đây là hạng mục duy nhất **không** đi theo mock-first vì bản chất là tích hợp dịch vụ thật, không phải chờ nội bộ backend.

**Điểm cần chốt trước khi code:** chọn provider cụ thể (Sanity/Strapi/Contentful) — cần một phiên grilling riêng để so sánh chi phí/độ phức tạp/khả năng self-host.

## Giai đoạn B — Sâu (hardening, làm sau khi Giai đoạn A xong)

Quay lại toàn bộ hệ thống (bao gồm cả phần Storefront đã có từ trước) để đạt chuẩn production thật sự:

- Performance: đạt mục tiêu Core Web Vitals trong `ideal.md` (LCP <2.5s, CLS <0.1, INP <200ms, Lighthouse >95).
- Testing: nâng coverage Vitest/Playwright cho toàn bộ module mới; visual/accessibility testing.
- Rà soát lại các phần mock-first: xác nhận contract, chuẩn bị migration sang API thật khi backend sẵn sàng.

## Việc tiếp theo

Trước khi bắt đầu code A0/A1, cần một phiên grilling ngắn để chốt các "Điểm cần chốt trước khi code" của riêng giai đoạn đó (không cần chốt trước cho toàn bộ 6 giai đoạn).
