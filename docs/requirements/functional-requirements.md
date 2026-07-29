# Functional Requirements — Nguồn sự thật cao nhất

> Tài liệu này định nghĩa **hệ thống phải làm gì** cho MVP thật của dự án. Đây là nguồn sự thật đứng **trên** `glossary.md`, `adr/`, `decision-log.md` và `architecture/` — mọi tài liệu khác không được mâu thuẫn với nội dung dưới đây; nếu phát hiện mâu thuẫn, sửa tài liệu kia, không sửa tài liệu này trừ khi có quyết định mới (ghi lại ở `planning/decision-log.md`).
>
> Kế thừa từ `planning/decision-log.md` (Decision #1–33) và `planning/brainstorm-session.md` (Understanding Summary, §1). **Không** kế thừa nguyên trạng phạm vi của `planning/reference/implementation-plan.md` — tài liệu đó chỉ là tham khảo (Decision #11) và mô tả một quy mô team/timeline khác với dự án thật (solo dev, không deadline — Decision #9).

## 1. Bối cảnh dự án

- Nền tảng e-commerce thời trang/giày thể thao thật, hướng kinh doanh (kiểu Nike), không phải portfolio/học tập (Decision #2).
- Solo dev, không có deadline cố định — ưu tiên chất lượng và nhịp độ bền vững hơn tốc độ (Decision #9).
- Mock-first: chưa có backend thật, chưa chọn framework backend (Decision #3). Toàn bộ Front-end build trên MSW + `packages/schemas` (Contract-first ở tầng schema — Decision #13).
- Ba ứng dụng trong một monorepo: `storefront`, `admin`, `cms` (Decision #4, #5).

## 2. Non-goals của MVP (loại trừ tường minh)

Các mục sau **không** thuộc MVP, dù `implementation-plan.md` có đề cập tới:

- Payment gateway online (Stripe/VNPay/MoMo...) — MVP chỉ **COD** (Decision #7).
- Headless CMS bên thứ ba — CMS tự xây (Decision #6).
- Chọn/chốt framework backend thật, database thật, hạ tầng deploy thật — để giai đoạn sau, sau khi FE ổn định (Decision #3, brainstorm-session §3.1).
- Timeline cam kết theo tuần/tháng — roadmap chỉ có phase + exit criteria, không có mốc thời gian (Decision #9).
- RBAC nhiều vai trò phức tạp (Super Admin/Catalog Manager/Order Operator/Content Editor/Marketing Manager/Read-only Analyst) — đây là danh sách tham khảo từ `implementation-plan.md`, **chưa** được xác nhận là quyết định; số vai trò thật và quyền hạn cụ thể còn là open question (brainstorm-session §3.3).
- Recommendation engine, AI Search, multi-warehouse, loyalty nâng cao, gift card, multi-currency, microservices — ngoài phạm vi MVP và giai đoạn kế tiếp gần.

## 3. Phạm vi chức năng theo ứng dụng

### 3.1 Storefront (khách hàng)

Bắt buộc có trong MVP:

- Duyệt sản phẩm theo Category (Shoes/Apparel/Accessories, có cây con) và filter theo Gender (men/women/kids/unisex) — xem `glossary.md` (Category, Gender).
- Product Listing Page: filter, sort, pagination, trạng thái URL-as-state (Decision liên quan ở `architecture/frontend/routing.md`).
- Product Detail Page: chọn Variant (Color/Size) tới đúng một SKU, hiển thị giá/tồn kho theo SKU (xem `glossary.md` — Product/Variant/SKU).
- Tìm kiếm sản phẩm cơ bản.
- Giỏ hàng: thêm/sửa/xoá, giỏ khách (guest) và merge sau khi đăng nhập.
- Wishlist: guest + authenticated, merge sau đăng nhập.
- Checkout: COD only (không tích hợp cổng thanh toán online — Decision #7).
- Authentication: đăng ký, đăng nhập, quên/đặt lại mật khẩu — **có trong MVP** (Decision #20, không phải guest-only).
- Tài khoản: profile, địa chỉ, lịch sử đơn hàng.
- Đa ngôn ngữ VN + EN cho toàn bộ UI chrome và nội dung Product/CMS qua Localized Text, fallback về locale mặc định `vi` khi thiếu bản dịch (Decision #8, #14–#17; xem `glossary.md`).

### 3.2 Admin (vận hành nội bộ)

Bắt buộc có trong MVP (tối thiểu — brainstorm-session §2.4):

- CRUD sản phẩm (Product/Variant/SKU).
- Quản lý category.
- Quản lý tồn kho ở mức cơ bản.
- Quản lý trạng thái đơn hàng.
- Chỉ tiếng Việt, không có UI đa ngôn ngữ (Decision #17).
- Authorization tồn tại (guard cơ bản) nhưng **số vai trò cụ thể và ma trận quyền chi tiết là open question**, chưa chốt — xem `planning/brainstorm-session.md` §3.3. Không được coi danh sách 6 role của `implementation-plan.md` là đã chốt.

### 3.3 CMS (biên tập nội dung)

Phạm vi CMS Phase 1 = toàn bộ danh sách sau, đã chốt là **toàn bộ**, không phải lát cắt mỏng (Decision #21):

- Hero Banner
- Homepage Sections
- Collection Landing Page
- Promotion Banner
- SEO Metadata
- Blog
- Campaign

Chỉ tiếng Việt cho UI CMS, nhưng Content Editor vẫn nhập được Localized Text đa ngôn ngữ cho nội dung Product/CMS hiển thị trên storefront (Decision #17).

## 4. Domain model (tham chiếu)

Domain model chính thức nằm ở [`../glossary.md`](../glossary.md) — hiện đã định nghĩa: `Locale`, `Locale mặc định`, `Localized Text`, `Market`, `Product`, `Variant`, `SKU`, `Category`, `Gender`. Domain model cho `Cart`, `Order`, `Customer`, `Inventory`, `Promotion` **chưa** được chốt chính thức trong `glossary.md` — khi cần, phải chạy một phiên `grilling` + `domain-modeling` riêng (tương tự phiên đã làm cho Locale), không được coi mô tả tham khảo trong `implementation-plan.md` (Order status machine, Inventory on_hand/reserved/available...) là đã chốt cho tới khi được xác nhận và ghi vào `glossary.md`.

## 5. Ràng buộc phi chức năng (tóm tắt)

Chi tiết đầy đủ nằm ở `architecture/frontend/performance-seo.md` và `architecture/frontend/testing.md`. Tóm tắt:

- `storefront`: LCP < 2.5s, CLS < 0.1, INP < 200ms, Lighthouse > 95 (Decision liên quan #26, brainstorm-session §2.1).
- `admin`/`cms`: LCP < 4s, INP < 500ms, không áp Lighthouse budget nghiêm ngặt — app nội bộ, không traffic công khai (Decision #27).
- Form xây theo chuẩn OWASP-safe ngay từ giai đoạn mock-first, dù chưa có PII/thanh toán thật (brainstorm-session §2.2).
- Chưa cần SLA production; best-effort trong giai đoạn build (brainstorm-session §2.3).

## 6. Quan hệ với các tài liệu khác

- Tài liệu này **không thay thế** `glossary.md`/`adr/`/`decision-log.md` — nó là điều kiện tiên quyết mà các tài liệu đó phải thoả mãn. Khi có mâu thuẫn giữa yêu cầu ở đây và một quyết định cụ thể, cần rà soát lại quyết định đó.
- `architecture/frontend/roadmap.md` là kế hoạch triển khai (theo phase, không theo tuần) cho phần Front-end của phạm vi này.
- `architecture/backend/roadmap.md` là kế hoạch triển khai tương ứng cho phần Back-end, khi bắt đầu triển khai thật.
- `planning/reference/implementation-plan.md` chỉ được dùng để tham khảo domain model/API contract nháp — **không** được dùng để suy ra phạm vi MVP hay timeline (xem §2).
