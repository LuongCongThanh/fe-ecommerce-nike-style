# Roadmap

## Nguyên tắc [Đã chốt — Decision #9 + #10]

- **Không có mốc thời gian cụ thể** (Decision #9 — solo dev, ưu tiên chất lượng). Roadmap dưới đây chia theo **phase với exit criteria kiểm chứng được**, không phải tuần/tháng. Đây là điểm khác biệt rõ so với timeline 43-tuần chi tiết của `FE-first.md` — file đó chỉ là tham khảo (Decision #11), không phải cam kết.
- **Foundation-first** (Decision #10): design token + core UI component + core function xong trước, feature module sau.
- Mỗi phase có "exit criteria" thay vì deadline — nhất quán cách làm việc goal-driven: chuyển mỗi phase thành mục tiêu kiểm chứng được, không chuyển sang phase sau khi chưa xác minh xong phase hiện tại.

## Phase 0 — Engineering Foundation

**Mục tiêu**: Turborepo chạy được, package skeleton đúng cấu trúc [`module-architecture.md`](./module-architecture.md), quality gate cơ bản.

**Exit criteria**:
- `storefront`, `admin`, `cms` build độc lập, không lỗi.
- Package dùng chung import được đúng theo quy tắc phụ thuộc đã định nghĩa, không có circular dependency.
- ESLint dependency-boundary rule (`import/no-restricted-paths`/`eslint-plugin-boundaries`, xem [`module-architecture.md`](./module-architecture.md#quy-tắc-phụ-thuộc)) đã cấu hình và chạy pass trong `pnpm lint` — quy tắc phụ thuộc không chỉ dựa vào tự giác.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` chạy sạch trên cả monorepo.

## Phase 1 — Design Tokens & Primitive UI Components

**Mục tiêu**: `packages/design-tokens` đủ 3 tầng cho các giá trị đã chốt ở [`design-system.md`](./design-system.md); tập component nền tảng đầu tiên trong `packages/ui` (Button, Input, Card, Modal, Drawer, Tabs, Badge, Skeleton).

**Exit criteria**:
- Không có hex/spacing hard-code trong bất kỳ component nào.
- Mỗi component có đủ story theo hợp đồng Storybook (Default/Variants/Disabled/Loading/Error/Responsive/Keyboard/A11y).
- Font hệ thống đã kiểm tra đủ glyph tiếng Việt (ràng buộc ADR 0003) trước khi khoá token typography.
- Đã đo CLS thực tế với cả `font-display: optional` và `swap` (xem [`performance-seo.md`](./performance-seo.md#font-loading-đã-chốt--decision-26-hệ-quả-trực-tiếp-của-adr-0003)) để chốt giá trị dùng cho `storefront`.

## Phase 2 — Layout Primitives & Application Shell

**Mục tiêu**: `Container`/`Grid`/`Stack`/`Section` trong `packages/ui`; Header/Footer riêng từng app; routing skeleton (`[locale]` cho storefront theo Decision #18, không `[locale]` cho admin/cms theo Decision #17).

**Exit criteria**:
- Header hoạt động desktop/tablet/mobile, không gây CLS đáng kể.
- Chuyển đổi locale trên storefront không gây layout shift (xác nhận trực tiếp ADR 0003).
- `admin`/`cms` xác nhận không có UI dịch đa ngôn ngữ (đúng ADR 0002).

## Phase 3 — Contract Foundation (schemas + api-sdk + MSW)

**Mục tiêu**: `packages/schemas` có schema cho các entity cốt lõi (Product, Category, Cart, Order, error envelope, pagination — xem [`api-integration.md`](./api-integration.md)); `packages/api-sdk` có handler MSW tương ứng.

**Exit criteria**:
- Mọi entity cốt lõi có schema trước khi bất kỳ component nào tiêu thụ dữ liệu của nó.
- MSW handler tính lại giá/tồn kho thay vì để component tự tính (nguyên tắc ở [`state-management.md`](./state-management.md)).

## Phase 4 — Commerce Components

**Mục tiêu**: `packages/commerce` — ProductCard, ProductGallery, MiniCart, SizeSelector, ColorSelector, CouponInput, OrderTimeline, CheckoutStepper — build và test bằng dữ liệu mock từ Phase 3.

**Exit criteria**: mỗi component có đủ trạng thái (empty/loading/error) đúng hợp đồng Storybook, không phụ thuộc dữ liệu tuỳ ý ngoài schema.

## Phase 5 — Storefront Features

**Mục tiêu**: Home, PLP, PDP, Search, Cart, Checkout (COD-only — Decision #7), Authentication (sign in/up), Account (profile/orders/wishlist), Order success — theo route groups ở [`routing.md`](./routing.md). Auth nằm trong scope phase này (Decision #20).

**Điểm quyết định còn lại trước khi implement chi tiết Auth**: RBAC/role cụ thể cho `admin`/`cms` vẫn là câu hỏi mở — xem [`authentication-authorization.md`](./authentication-authorization.md). Không chặn phần auth của `storefront` (Customer chỉ có 1 vai trò).

**Trước khi build `use-auth` thật**: spike xác nhận cơ chế cookie mock (MSW service worker ↔ Next.js middleware) theo rủi ro chưa validate đã nêu ở [`authentication-authorization.md`](./authentication-authorization.md#chiến-lược-mock-cho-giai-đoạn-chưa-có-backend-thật) — nếu không hoạt động như kỳ vọng, chuyển MSW sang chế độ Node.js server (`setupServer`) riêng cho luồng auth.

**Exit criteria**:
- Critical path E2E (Browse → PDP → Add to cart → Checkout COD → Order success) chạy xanh trên Playwright.
- Luồng Sign in/up + Account có E2E riêng.
- Lighthouse đạt mục tiêu ở [`performance-seo.md`](./performance-seo.md) cho route Home/PLP/PDP.
- Spike cookie mock (ở trên) đã chạy và có kết luận (pass hoặc phương án dự phòng đã áp dụng).
- Chiến lược error boundary phía client + công cụ logging/monitoring lỗi runtime (xem mục Observability [Mở] ở [`frontend-overview.md`](./frontend-overview.md#observability--error-handling-mở)) đã chốt.

## Phase 6 — Admin MVP

**Mục tiêu**: CRUD sản phẩm + quản lý trạng thái đơn hàng (đúng Assumption #4 — không mở rộng thêm).

**Exit criteria**:
- CRUD sản phẩm (tạo/sửa/xoá/list) hoạt động đúng schema `packages/schemas`, qua `packages/api-sdk`.
- Cập nhật trạng thái đơn hàng có E2E riêng.
- Route guard authorization áp dụng đúng nguyên tắc đã chốt ở [`authentication-authorization.md`](./authentication-authorization.md); nếu RBAC/role matrix đã được quyết định trước phase này thì guard áp theo role, nếu chưa thì guard tối thiểu theo "đã đăng nhập admin".

## Phase 7 — CMS

**Mục tiêu** [Đã chốt phạm vi — Decision #21]: toàn bộ CMS MVP như liệt kê tham khảo trong `FE-first.md` — Hero Banner, Homepage Sections, Collection Landing Page, Promotion Banner, SEO Metadata, Blog, Campaign. Không thu hẹp thành lát cắt nhỏ hơn.

**Hệ quả**: vì phạm vi rộng hơn một lát cắt tối thiểu, cân nhắc tách phase này thành các mốc kiểm chứng nhỏ hơn theo thứ tự giá trị kinh doanh — ví dụ Hero/Banner + SEO Metadata trước (tác động trực tiếp Homepage/PDP), Blog/Campaign sau (giá trị content-marketing, không chặn luồng mua hàng cốt lõi). Đây là gợi ý sắp xếp nội bộ trong phase, không phải thu hẹp phạm vi đã chốt.

**Exit criteria**: Content Editor publish được Hero/Banner/Collection/Blog/Campaign với draft → preview → publish flow; storefront chỉ đọc content đã publish (nhất quán state PUBLISHED trong mô hình content tham khảo).

## Phase 8 — Hardening

**Mục tiêu**: performance pass toàn diện, accessibility audit, visual regression cho toàn bộ component/page đã có, mở rộng E2E ngoài critical path (Search, Wishlist, Admin, CMS).

**Exit criteria**:
- Lighthouse ≥ 95 trên mọi route public chính của `storefront` (Home, PLP, PDP, Search, Cart, Checkout).
- Accessibility audit không còn lỗi mức critical/serious (theo công cụ đã thêm ở [`testing.md`](./testing.md#accessibility-tooling-đề-xuất)).
- Visual regression (Playwright screenshot) bao phủ toàn bộ component `packages/ui`/`packages/commerce` và các trang critical path.
- E2E mở rộng: Search, Wishlist, Admin, CMS mỗi flow có ít nhất một test xanh trên CI.

---

Roadmap này sẽ cần cập nhật khi các câu hỏi [Mở] còn lại được trả lời: catalog/SKU thật, ma trận RBAC/role cụ thể cho `admin`/`cms` (xem [`authentication-authorization.md`](./authentication-authorization.md)), backend framework thật cho giai đoạn tích hợp sau này.
