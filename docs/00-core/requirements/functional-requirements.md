# Functional Requirements — Nguồn sự thật cao nhất

> Tài liệu này định nghĩa **hệ thống phải làm gì** cho MVP thật của dự án. Đây là nguồn sự thật đứng **trên** `glossary.md`, `adr/`, `decision-log.md` và `architecture/` — mọi tài liệu khác không được mâu thuẫn với nội dung dưới đây; nếu phát hiện mâu thuẫn, sửa tài liệu kia, không sửa tài liệu này trừ khi có quyết định mới (ghi lại ở `planning/decision-log.md`).
>
> Kế thừa từ `planning/decision-log.md` (Decision #1–33) và `planning/brainstorm-session.md` (Understanding Summary, §1). **Không** kế thừa nguyên trạng phạm vi của `planning/reference/implementation-plan.md` — tài liệu đó chỉ là tham khảo (Decision #11) và mô tả một quy mô team/timeline khác với dự án thật (solo dev, không deadline — Decision #9).

## Cách dùng tài liệu này

- Mở file này khi cần biết MVP thật sự phải có gì.
- Nếu một tài liệu khác nói khác file này, ưu tiên file này trước.
- Nếu cần định nghĩa chính xác của thuật ngữ domain, quay sang [`../glossary.md`](../glossary.md).
- Nếu cần lý do vì sao phạm vi được chốt như vậy, xem [`../planning/decision-log.md`](../decision-log.md).

## Quy ước ID

- `SF-*`: Storefront functional requirement
- `AD-*`: Admin functional requirement
- `CMS-*`: CMS functional requirement
- `NFR-*`: Non-functional requirement
- `SEC-*`: Security/control requirement

ID trong file này là ID gốc. Các matrix traceability phải tham chiếu ngược về đây, không tự phát sinh bộ ID khác.

## 1. Bối cảnh dự án

- Nền tảng e-commerce thời trang/giày thể thao thật, hướng kinh doanh (kiểu Nike), không phải portfolio/học tập (Decision #2).
- Solo dev, không có deadline cố định — ưu tiên chất lượng và nhịp độ bền vững hơn tốc độ (Decision #9).
- Mock-first: chưa có backend thật, chưa chọn framework backend (Decision #3). Toàn bộ Front-end build trên MSW + `packages/schemas` (Contract-first ở tầng schema — Decision #13).
- Ba ứng dụng trong một monorepo: `storefront`, `admin`, `cms` (Decision #4, #5).

## 2. Non-goals của MVP

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

- `SF-01` — Duyệt sản phẩm theo Category (Shoes/Apparel/Accessories, có cây con) và filter theo Gender (men/women/kids/unisex) — xem `glossary.md` (Category, Gender).
- `SF-02` — Product Listing Page: filter, sort, pagination, trạng thái URL-as-state (Decision liên quan ở `architecture/frontend/03-routing.md`).
- `SF-03` — Product Detail Page: chọn Variant (Color/Size) tới đúng một SKU, hiển thị giá/tồn kho theo SKU (xem `glossary.md` — Product/Variant/SKU).
- `SF-04` — Tìm kiếm sản phẩm cơ bản.
- `SF-05` — Giỏ hàng: thêm/sửa/xoá, giỏ khách (guest) và merge sau khi đăng nhập.
- `SF-06` — Wishlist: guest + authenticated, merge sau đăng nhập.
- `SF-07` — Checkout: COD only (không tích hợp cổng thanh toán online — Decision #7).
- `SF-08` — Authentication: đăng ký, đăng nhập, quên/đặt lại mật khẩu — **có trong MVP** (Decision #20, không phải guest-only).
- `SF-09` — Tài khoản: profile, địa chỉ, lịch sử đơn hàng.
- `SF-10` — Đa ngôn ngữ VN + EN cho toàn bộ UI chrome và nội dung Product/CMS qua Localized Text, fallback về locale mặc định `vi` khi thiếu bản dịch (Decision #8, #14–#17; xem `glossary.md`).

### 3.2 Admin (vận hành nội bộ)

Bắt buộc có trong MVP (tối thiểu — brainstorm-session §2.4):

- `AD-01` — CRUD sản phẩm (Product/Variant/SKU).
- `AD-02` — Quản lý category.
- `AD-03` — Quản lý tồn kho ở mức cơ bản.
- `AD-04` — Quản lý trạng thái đơn hàng.
- `AD-05` — Chỉ tiếng Việt, không có UI đa ngôn ngữ (Decision #17).
- `AD-06` — Authorization tồn tại và tối thiểu phải đạt baseline RBAC hiện hành; mở rộng role/capability sau này phải cập nhật thêm. Không được coi danh sách 6 role của `implementation-plan.md` là đã chốt.

### 3.3 CMS (biên tập nội dung)

Phạm vi CMS Phase 1 = toàn bộ danh sách sau, đã chốt là **toàn bộ**, không phải lát cắt mỏng (Decision #21):

- `CMS-01` — Hero Banner
- `CMS-02` — Homepage Sections
- `CMS-03` — Collection Landing Page
- `CMS-04` — Promotion Banner
- `CMS-05` — SEO Metadata
- `CMS-06` — Blog
- `CMS-07` — Campaign

- `CMS-08` — Chỉ tiếng Việt cho UI CMS, nhưng Content Editor vẫn nhập được Localized Text đa ngôn ngữ cho nội dung Product/CMS hiển thị trên storefront (Decision #17).

## 4. Domain model (tham chiếu)

Domain model chính thức nằm ở [`../glossary.md`](../glossary.md). Hiện glossary đã chốt các nhóm khái niệm sau:

- i18n và ngữ nghĩa hiển thị: `Locale`, `Locale mặc định`, `Localized Text`, `Market`
- Catalog: `Product`, `Variant`, `SKU`, `Category`, `Gender`
- Commerce flow cốt lõi: `CartItem`, `Merge Cart`, `Reservation`, `Order`, `OrderItem`
- Wishlist: `WishlistItem`, `Merge Wishlist`, `Move to cart`
- Return / refund cho MVP COD-only

Các khái niệm **chưa chốt hoàn toàn** ở thời điểm hiện tại chủ yếu còn:

- `Customer` ở mức domain model đầy đủ ngoài phạm vi account/address tối thiểu
- `Promotion` nếu quyết định đưa vào scope thật

Không được coi mô tả tham khảo trong `implementation-plan.md` là đã chốt nếu glossary chưa xác nhận.

## 5. Ràng buộc phi chức năng (tóm tắt)

Chi tiết đầy đủ nằm ở `architecture/frontend/10-performance-seo.md` và `architecture/frontend/09-testing.md`. Tóm tắt:

- `NFR-01` — `storefront`: LCP < 2.5s, CLS < 0.1, INP < 200ms, Lighthouse > 95 (Decision liên quan #26, brainstorm-session §2.1).
- `NFR-02` — `admin`/`cms`: LCP < 4s, INP < 500ms, không áp Lighthouse budget nghiêm ngặt — app nội bộ, không traffic công khai (Decision #27).
- `SEC-01` — Form và các luồng nhạy cảm phải đạt security baseline ngay từ giai đoạn mock-first, dù chưa có PII/thanh toán thật. Chi tiết ở [`../security/security-baseline.md`](../../01-delivery/security/security-baseline.md).
- `NFR-03` — Chưa cần SLA production; best-effort trong giai đoạn build (brainstorm-session §2.3).

## 6. Quan hệ với các tài liệu khác

- Tài liệu này không thay thế `glossary.md`/`adr/`/`decision-log.md`. Nó giữ vai trò chốt phạm vi chức năng mà các tài liệu đó phải tôn trọng.
- `architecture/frontend/11-roadmap.md` là kế hoạch triển khai (theo phase, không theo tuần) cho phần Front-end của phạm vi này.
- `architecture/backend/roadmap.md` là kế hoạch triển khai tương ứng cho phần Back-end, khi bắt đầu triển khai thật.
- `planning/reference/implementation-plan.md` chỉ được dùng để tham khảo domain model/API contract nháp — **không** được dùng để suy ra phạm vi MVP hay timeline (xem §2).
