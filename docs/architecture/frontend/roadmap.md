# Roadmap

## Nguyên tắc [Đã chốt — Decision #9 + #10]

- **Không có mốc thời gian cụ thể** (Decision #9 — solo dev, ưu tiên chất lượng). Roadmap dưới đây chia theo **phase với exit criteria kiểm chứng được**, không phải tuần/tháng. Đây là điểm khác biệt rõ so với timeline 43-tuần chi tiết của `implementation-plan.md` — file đó chỉ là tham khảo (Decision #11), không phải cam kết.
- **Foundation-first** (Decision #10): design token + core UI component + core function xong trước, feature module sau.
- Mỗi phase có "exit criteria" thay vì deadline — nhất quán cách làm việc goal-driven: chuyển mỗi phase thành mục tiêu kiểm chứng được, không chuyển sang phase sau khi chưa xác minh xong phase hiện tại.
- Các phase được sắp theo đúng thứ tự phụ thuộc: không bắt đầu phase sau khi phase trước chưa đạt exit criteria — vi phạm nguyên tắc Foundation-first sẽ kéo theo sửa lại ngược dòng (component build trên token chưa ổn định, feature build trên contract chưa có schema...).

## Ký hiệu ưu tiên trong mỗi phase [Quy ước áp dụng cho mọi checklist bên dưới]

- **P0 — Chặn phase**: bắt buộc xong mới được coi phase hoàn thành và chuyển sang phase sau. Nếu một mục P0 chưa xong, exit criteria của phase đó coi như chưa đạt dù các mục khác đã xong.
- **P1 — Nên làm trong phase, không chặn**: nên hoàn thành trong phase này vì làm cùng lúc rẻ hơn (cùng ngữ cảnh, cùng component đang mở), nhưng có thể dời sang phase kế tiếp mà không phá vỡ exit criteria nếu thời gian hạn chế.
- **P2 — Có thể dời sang Hardening (Phase 8) hoặc sau MVP**: giá trị thấp hơn ở giai đoạn này, hoặc phụ thuộc một open question chưa trả lời — làm sau không ảnh hưởng luồng chính.

Thứ tự liệt kê bên trong mỗi mức ưu tiên (P0 trước, rồi P1, rồi P2) cũng là thứ tự nên làm trước/sau trong thực tế, không chỉ là gắn nhãn.

---

## Phase 0 — Engineering Foundation

**Mục tiêu**: Turborepo chạy được, package skeleton đúng cấu trúc [`module-architecture.md`](./module-architecture.md), quality gate cơ bản.

**Checklist**:

- P0 — Khởi tạo Turborepo, scaffold `apps/{storefront,admin,cms}` (Next.js) + `packages/{ui,commerce,design-tokens,api-sdk,schemas,hooks,utils,eslint-config,ts-config,tailwind-config}` rỗng, đúng tên như [`module-architecture.md`](./module-architecture.md#cấu-trúc-monorepo-đã-chốt--brainstorm-sessionmd-6).
- P0 — Cấu hình `packages/ts-config` gốc (`strict: true`, cấm `any` — [`module-architecture.md`](./module-architecture.md#quy-ước-typescript-đề-xuất)), mọi app/package extend từ đây, không tắt lẻ flag.
- P0 — Cấu hình `packages/eslint-config`: rule dependency-boundary (`import/no-restricted-paths` hoặc `eslint-plugin-boundaries`) enforce đúng bảng phụ thuộc ở [`module-architecture.md`](./module-architecture.md#quy-tắc-phụ-thuộc-đề-xuất) (apps không import lẫn nhau; `ui` không import `commerce`/domain e-commerce; `schemas` chỉ phụ thuộc Zod).
- P0 — Alias import theo bảng ở [`module-architecture.md`](./module-architecture.md#alias-import-đề-xuất) (`@/*`, `@/features/{feature}`, `@repo/*`) cấu hình cho cả 3 app.
- P0 — CI chạy được `pnpm lint`, `pnpm typecheck`, `pnpm build` sạch trên cả monorepo.
- P1 — Husky/Lefthook + commitlint (pre-commit chạy lint/typecheck nhanh, không chạy full test suite).
- P1 — Storybook, Vitest, Playwright, MSW cài đặt khung sườn (chưa cần story/test thật — chỉ đảm bảo chạy được `pnpm storybook`, `pnpm test`, `pnpm test:e2e` không lỗi cấu hình).
- P2 — Environment validation (`@t3-oss/env-nextjs` hay tự viết bằng Zod) — chưa cần vì mock-first thuần chưa có biến môi trường bắt buộc (xem [`api-integration.md`](./api-integration.md#environmentconfig-management-mở)); chỉ cần trước khi có biến môi trường thật đầu tiên (base URL API thật ở Phase 9 — Integration của [`../backend/roadmap.md`](../backend/roadmap.md#phase-9--integration-với-front-end), roadmap FE này không có Phase 9 riêng).

**Exit criteria**:
- `storefront`, `admin` và `cms` build độc lập, không lỗi.
- Package dùng chung import được đúng theo quy tắc phụ thuộc đã định nghĩa, không có circular dependency.
- ESLint dependency-boundary rule đã cấu hình và chạy pass trong `pnpm lint` — quy tắc phụ thuộc không chỉ dựa vào tự giác.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` chạy sạch trên cả monorepo.

## Phase 1 — Design Tokens & Primitive UI Components

**Mục tiêu**: `packages/design-tokens` đủ 3 tầng cho các giá trị đã chốt ở [`design-system.md`](./design-system.md); tập component nền tảng đầu tiên trong `packages/ui`.

**Checklist**:

- P0 — Primitive tokens (`packages/design-tokens/{colors,spacing,typography,radius,shadow,motion,breakpoints}.ts`) đúng giá trị đã chốt: color (`black #111111`, `white`, `gray100–400`, `red`, `green`), spacing (`0,4,8,12,16,20,24,32,40,48,64,80,120`), typography size (`72,64,48,32,24,20,18,16,14,12`), radius (`none,xs,sm,md,lg,xl`), motion (`200/300/400ms`), breakpoints (`375,768,1024,1280,1440`).
- P0 — Semantic tokens: `background-primary`, `background-secondary`, `foreground-primary`, `foreground-muted`, `border-default`, `action-primary`, `action-hover`, `status-success`, `status-error`.
- P0 — Script build sinh CSS custom properties (`--color-*`, `--spacing-*`...) từ token TypeScript, đóng gói vào preset `packages/tailwind-config` (Decision #34) — mỗi `apps/*` import preset này vào Tailwind v4 `@theme`, không tự lặp lại cấu hình (Decision #23) — token TypeScript là nguồn sự thật duy nhất.
- P0 — Chọn font, kiểm tra **đủ glyph tiếng Việt** (`Ầ Ộ Ẫ Ự`...) trước khi khoá token typography — ràng buộc ADR 0003, chặn cứng vì đổi font sau khi component đã dùng token typography sẽ phải rà soát lại toàn bộ.
- P0 — Component nền tảng đầu tiên trong `packages/ui`, mỗi component đủ story theo hợp đồng Storybook (Default/Variants/Disabled/Loading/Error/Responsive/Keyboard/A11y — [`design-system.md`](./design-system.md#hợp-đồng-storybook-mỗi-component)): `Button`, `Input`, `Card`, `Modal`, `Drawer`, `Tabs`, `Badge`, `Skeleton`.
- P0 — Đo CLS thực tế với cả `font-display: optional` và `swap` ở size Heading/Display (48–72px) trước khi chốt giá trị dùng cho `storefront` ([`performance-seo.md`](./performance-seo.md#font-loading-đã-chốt--decision-26-hệ-quả-trực-tiếp-của-adr-0003)) — quyết định này ảnh hưởng mọi component dùng typography token sau đó, nên chặn phase.
- P1 — Component nền tảng còn lại: `Toast`, `Pagination`, `Tooltip`, `Checkbox`, `Radio`, `Switch`, `Select`, `Tag`, `Accordion`, `Breadcrumb`, `Carousel` (không chặn Phase 2 vì Application Shell chưa cần hết — thăng cấp dần theo rule-of-three, không dựng trước cho component chưa có consumer).
- P1 — Storybook a11y addon (`@storybook/addon-a11y`) bật ngay từ component đầu tiên, không đợi Phase 8 mới thêm ([`testing.md`](./testing.md#accessibility-tooling-đề-xuất)) — rẻ hơn nhiều khi bật sớm so với retrofit hàng loạt component sau.
- P2 — Component token khai báo tập trung trước cho 30+ component chưa tồn tại — **không làm**, đúng YAGNI đã chốt (Decision #10); mỗi component tự khai báo token riêng khi được build.

**Exit criteria**:
- Không có hex/spacing hard-code trong bất kỳ component nào.
- Mỗi component có đủ story theo hợp đồng Storybook.
- Font hệ thống đã kiểm tra đủ glyph tiếng Việt trước khi khoá token typography.
- Đã đo CLS thực tế với cả hai giá trị `font-display` để chốt giá trị dùng cho `storefront`.

## Phase 2 — Layout Primitives & Application Shell

**Mục tiêu**: `Container`/`Grid`/`Stack`/`Section` trong `packages/ui`; Header/Footer riêng từng app; routing skeleton (`[locale]` cho storefront theo Decision #18, không `[locale]` cho admin/cms theo Decision #17).

**Checklist**:

- P0 — Layout primitives (`Container`, `Grid`, `Stack`, `Section`) trong `packages/ui`, không tách package `layouts` riêng (Decision #12).
- P0 — Routing skeleton `apps/storefront/src/app/[locale]/{(marketing),(shop),(checkout),(account)}` theo [`routing.md`](./routing.md) — route file là lớp mỏng ngay từ đầu (Decision #29), không đặt logic trực tiếp trong `page.tsx`.
- P0 — Routing skeleton `apps/admin/src/app/{(dashboard),products,orders}` và `apps/cms/src/app/...` — không có segment `[locale]` (Decision #17).
- P0 — `SUPPORTED_LOCALES` trong `packages/utils` là nguồn sự thật duy nhất (ADR 0001), dùng lại pattern `next-intl` đã kiểm chứng ở `ecommerce-next`, không tự thiết kế middleware locale detection mới.
- P0 — Header/Footer riêng từng app (mega menu + locale switcher cho `storefront`; sidebar nav cho `admin`/`cms`) — không ép chung thành component dùng chung (Decision #12).
- P1 — Header hoạt động đủ desktop/tablet/mobile, mega menu hỗ trợ keyboard — có thể hoàn thiện dần trong Phase 4 (Commerce Components) khi có dữ liệu category thật, nhưng khung tương tác/keyboard nên có sẵn từ phase này.
- P2 — Cookie banner, announcement bar — không chặn Application Shell cốt lõi, có thể thêm bất kỳ lúc nào trước Phase 5.

**Exit criteria**:
- Header hoạt động trên desktop, tablet và mobile, không vượt ngưỡng CLS đã chốt.
- Chuyển đổi locale trên storefront không gây layout shift (xác nhận trực tiếp ADR 0003).
- `admin`/`cms` xác nhận không có UI dịch đa ngôn ngữ (đúng ADR 0002).

## Phase 3 — Contract Foundation (schemas + api-sdk + MSW)

**Mục tiêu**: `packages/schemas` có schema cho các entity cốt lõi; `packages/api-sdk` có handler MSW tương ứng — không component nào được build trước schema của dữ liệu nó tiêu thụ (Decision #13).

**Checklist**:

- P0 — Error envelope chung (`apiErrorSchema`: `code`, `message`, `details?`, `traceId?`) trong `packages/schemas` — dùng bởi mọi handler MSW sau này ([`api-integration.md`](./api-integration.md#error-envelope-đề-xuất--adopted-from-implementation-planmd-không-mâu-thuẫn-quyết-định-nào)). Danh sách code khởi điểm: `VALIDATION_ERROR`, `OUT_OF_STOCK`, `PRICE_CHANGED`, `COUPON_INVALID` — **không** thêm code payment gateway (MVP chỉ COD, Decision #7).
- P0 — `paginatedQuerySchema`/`paginatedResponseSchema` chung cho mọi list endpoint (`page`, `pageSize`, `sort`, `filter` — khớp URL-as-state ở [`routing.md`](./routing.md)).
- P0 — Schema cho `Product`/`Variant`/`SKU`/`Category` đúng domain model đã chốt trong `glossary.md` (Price/tồn kho gắn ở SKU, không phải Product).
- P0 — Schema cho `Cart` (item tham chiếu SKU, không phải Product) — theo domain model tham khảo ở `docs/architecture/backend/domain-model.md`, xác nhận lại trước khi khoá schema nếu cần.
- P0 — Query key factory phân cấp cho TanStack Query (`productKeys`, `cartKeys`...) trong `packages/hooks` (Decision #31).
- P0 — MSW handler tính lại giá/tồn kho thay vì để component tự tính ([`state-management.md`](./state-management.md#nguyên-tắc-giá-hiển-thị-trên-client-chỉ-mang-tính-thông-tin-đề-xuất--áp-dụng-ngay-cả-ở-giai-đoạn-mock-first)) — thói quen phải có từ handler mock đầu tiên, không phải thứ thêm sau.
- P1 — Schema cho `Order` — có thể làm ngay sau Cart nếu domain model Order đã đủ rõ, hoặc dời sang đầu Phase 5 nếu cần thêm thời gian xác nhận state machine COD-only (xem `backend/domain-model.md`).
- P1 — Schema cho `Wishlist` (item tham chiếu Product theo `glossary.md`, không phải SKU — wishlist không cần chọn variant) — cần xong **trước khi** bắt đầu task Wishlist ở Phase 5 (P0 của Phase 5), làm ở đây hoặc chậm nhất đầu Phase 4, không được để trôi tới giữa Phase 5 mới định nghĩa.
- P1 — Cơ chế chuyển mock ↔ API thật (`NEXT_PUBLIC_API_MOCKING`, Decision #28) — nên dựng khung ngay ở phase này dù chưa có API thật để dùng, tránh phải sửa lại chữ ký hàm fetch sau khi nhiều component đã tiêu thụ.
- P1 — Pure helper trong `packages/utils` cần cho Commerce Components/Storefront Features: price formatting, filter serialization (PLP query string ↔ object), Localized Text fallback helper (đọc `glossary.md` — fallback về locale mặc định `vi` khi thiếu bản dịch, [`testing.md`](./testing.md#test-pyramid) yêu cầu các hàm này có unit test riêng, nên tách khỏi component ngay từ đầu thay vì viết inline).
- P2 — Schema cho Promotion/Coupon — dời sang Phase 4/5 nếu chưa cần ngay cho Commerce Components cơ bản (khác Wishlist — Promotion/Coupon không nằm trong danh sách bắt buộc MVP ở `requirements/functional-requirements.md` §3.1, nên không cần chặn bất kỳ phase nào).

**Exit criteria**:
- Mọi entity cốt lõi (Product, Category, Cart, Order, error envelope, pagination) có schema trước khi bất kỳ component nào tiêu thụ dữ liệu của nó.
- MSW handler tính lại giá/tồn kho thay vì để component tự tính.

## Phase 4 — Commerce Components

**Mục tiêu**: `packages/commerce` build và test bằng dữ liệu mock từ Phase 3, mỗi component đủ trạng thái loading/empty/error.

**Checklist**:

- P0 — `ProductCard`, `ProductGallery`, `SizeSelector`, `ColorSelector` — nền tảng cho PLP/PDP ở Phase 5, chặn phase vì Phase 5 build trực tiếp trên các component này.
- P0 — `MiniCart`, `CheckoutStepper` — nền tảng cho Cart/Checkout ở Phase 5.
- P0 — `WishlistButton` (optimistic toggle, cần rollback khi mock lỗi — [`state-management.md`](./state-management.md#ma-trận-sở-hữu-state)) — Wishlist là chức năng bắt buộc MVP (`requirements/functional-requirements.md` §3.1), không phải phụ; component này nền tảng cho task Wishlist ở Phase 5.
- P0 — Mỗi component dùng `useQuery` (không `useSuspenseQuery` — [`state-management.md`](./state-management.md#pattern-data-fetching-cho-server-state-đã-chốt)), tự xử lý `isLoading`/`error`, có story Storybook riêng cho hai trạng thái này.
- P1 — `CouponInput`, `OrderTimeline` — cần cho Checkout/Account nhưng có thể hoàn thiện song song đầu Phase 5 nếu Coupon/Order schema (Phase 3, P1) chưa xong kịp.
- P1 — Áp dụng chống re-render thừa (`useCallback` cho handler truyền xuống list item, `React.memo` cho `ProductCard`/`ProductGallery`) — chỉ khi đã thấy list đủ dài để đo được vấn đề, không áp máy móc từ đầu ([`state-management.md`](./state-management.md#nguyên-tắc-chống-re-render-thừa-áp-dụng-rộng-hơn-zustand-đề-xuất)).
- P2 — Optimization sâu hơn (virtualization cho list dài) — chỉ khi Phase 8 đo thấy cần, không làm trước khi có dữ liệu thật đủ lớn để biện minh.

**Exit criteria**: mỗi component có đủ trạng thái (empty/loading/error) đúng hợp đồng Storybook, không phụ thuộc dữ liệu tuỳ ý ngoài schema.

## Phase 5 — Storefront Features

**Mục tiêu**: Home, PLP, PDP, Search, Cart, Checkout (COD-only — Decision #7), Authentication (sign in/up), Account (profile/orders/wishlist), Order success — theo route groups ở [`routing.md`](./routing.md). Auth nằm trong scope phase này (Decision #20).

**Checklist**:

- P0 — Spike xác nhận cơ chế cookie mock (MSW service worker ↔ Next.js middleware — [`authentication-authorization.md`](./authentication-authorization.md#chiến-lược-mock-cho-giai-đoạn-chưa-có-backend-thật)) **trước khi** build `use-auth` thật. Nếu không hoạt động như kỳ vọng, chuyển MSW sang chế độ Node.js server (`setupServer`) riêng cho luồng auth. Chặn cứng vì mọi route `(account)` phụ thuộc kết quả spike này.
- P0 — Chốt chiến lược error boundary phía client + công cụ logging/monitoring lỗi runtime ([`frontend-overview.md`](./frontend-overview.md#observability--error-handling-mở)) — khoảng trống chưa từng được quyết định, phải trả lời trước khi có feature thật chạy trong production-like build; chặn vì ảnh hưởng cách mọi feature trong phase này xử lý lỗi.
- P0 — PLP: filter/sort/pagination đồng bộ URL (`/[locale]/men/shoes?color=black&size=42&sort=price-asc&page=2`), back/forward hoạt động đúng.
- P0 — PDP: chọn Variant (Color/Size) tới đúng một SKU, không cho add-to-cart khi chưa xác định SKU hợp lệ.
- P0 — Cart: optimistic update + rollback khi mock trả lỗi (vượt tồn kho), trạng thái "recalculating" khi tổng tiền đổi.
- P0 — Checkout: luồng COD hoàn chỉnh (Contact → Address → Shipping → Review → Place Order → Order Success), double-submit bị ngăn chặn (idempotency ở tầng mock).
- P0 — Authentication: sign in/up, session cookie httpOnly mock (ADR 0004), route `(account)` có authorization guard ở tầng route (không chỉ ẩn UI — nguyên tắc bảo mật đã chốt ở [`authentication-authorization.md`](./authentication-authorization.md#nguyên-tắc-bảo-mật-đã-chốt-đã-chốt--assumption-2-form-owasp-safe-từ-đầu)).
- P0 — `use-auth` trong `packages/hooks`, build ngay ở phase này, không dựng trước ở Phase 0–4 (YAGNI, chưa có feature nào tiêu thụ trước đó).
- P0 — Wishlist: guest wishlist + authenticated wishlist, merge sau khi đăng nhập (bắt buộc MVP — `requirements/functional-requirements.md` §3.1, **không phải** một mục phụ nằm trong Account) — dùng `WishlistButton` đã build ở Phase 4, optimistic add/remove có rollback nếu mock lỗi.
- P1 — Home: hero + section content từ mock CMS response, loading skeleton, fallback khi media lỗi.
- P1 — Search: predictive search có debounce, request cũ bị cancel/bỏ qua.
- P1 — Account: profile, order history — có thể hoàn thiện sau khi luồng mua hàng cốt lõi (P0) đã chạy được, vì giá trị kinh doanh trực tiếp thấp hơn checkout (khác Wishlist ở trên — Wishlist là P0 riêng, không gộp vào Account).
- P2 — Recently viewed, related products — giá trị gia tăng, không chặn critical path.

**Exit criteria**:
- Critical path E2E (Browse → PDP → Add to cart → Checkout COD → Order success) chạy xanh trên Playwright.
- Luồng Sign in/up + Account có E2E riêng.
- Luồng Wishlist (guest + authenticated + merge sau đăng nhập) có E2E riêng — không gộp chung với Account.
- Lighthouse đạt mục tiêu ở [`performance-seo.md`](./performance-seo.md) cho route Home/PLP/PDP.
- Spike cookie mock đã chạy và có kết luận (pass hoặc phương án dự phòng đã áp dụng).
- Chiến lược error boundary + logging/monitoring đã chốt.

## Phase 6 — Admin MVP

**Mục tiêu**: CRUD sản phẩm + quản lý trạng thái đơn hàng (đúng Assumption #4 — không mở rộng thêm).

**Checklist**:

- P0 — CRUD sản phẩm (tạo/sửa/xoá/list) đúng schema `packages/schemas`, qua `packages/api-sdk`.
- P0 — Cập nhật trạng thái đơn hàng, có E2E riêng.
- P0 — Route guard authorization: nếu RBAC/role matrix chưa được quyết định trước phase này (vẫn là open question — [`authentication-authorization.md`](./authentication-authorization.md#phạm-vi-auth-trong-mvp-đã-chốt--decision-20)), áp guard tối thiểu theo "đã đăng nhập admin"; không chặn phase vì chờ RBAC chi tiết.
- P1 — Quản lý category, quản lý tồn kho cơ bản (theo scope §3.2 `requirements/functional-requirements.md`).
- P2 — Dashboard số liệu tổng quan — không thuộc scope MVP admin đã chốt (Assumption #4), chỉ làm nếu còn dư thời gian sau P0/P1.

**Exit criteria**:
- CRUD sản phẩm hoạt động đúng schema.
- Cập nhật trạng thái đơn hàng có E2E riêng.
- Route guard authorization áp dụng đúng nguyên tắc đã chốt; theo role nếu RBAC đã quyết định, theo "đã đăng nhập admin" nếu chưa.

## Phase 7 — CMS

**Mục tiêu** [Đã chốt phạm vi — Decision #21]: toàn bộ CMS MVP — Hero Banner, Homepage Sections, Collection Landing Page, Promotion Banner, SEO Metadata, Blog, Campaign. Không thu hẹp thành lát cắt nhỏ hơn.

**Checklist** (thứ tự theo giá trị kinh doanh — tác động trực tiếp luồng mua hàng trước, content-marketing sau; đây là gợi ý sắp xếp nội bộ trong phase, không phải thu hẹp phạm vi Decision #21 đã chốt ở trên):

- P0 — Hero Banner + Homepage Sections — tác động trực tiếp Home đã build khung ở Phase 5.
- P0 — SEO Metadata — tác động trực tiếp mọi route public (PDP/PLP/Home) đã có sẵn.
- P0 — Draft → Preview → Publish flow chung cho mọi content type — dựng một lần, tái dùng cho toàn bộ danh sách bên dưới, không lặp lại logic riêng từng loại content.
- P1 — Collection Landing Page, Promotion Banner.
- P1 — Blog.
- P2 — Campaign — giá trị content-marketing, không chặn luồng mua hàng cốt lõi, có thể hoàn thiện cuối cùng trong phase.

**Exit criteria**: Content Editor publish được Hero/Banner/Collection/Blog/Campaign với draft → preview → publish flow; storefront chỉ đọc content đã publish.

## Phase 8 — Hardening

**Mục tiêu**: performance pass đầy đủ, accessibility audit, visual regression cho toàn bộ component/page đã có, mở rộng E2E ngoài critical path.

**Checklist**:

- P0 — Lighthouse ≥ 95 trên mọi route public chính của `storefront` (Home, PLP, PDP, Search, Cart, Checkout).
- P0 — Accessibility audit (`axe-core` qua Playwright + Storybook a11y addon) không còn lỗi mức critical/serious.
- P0 — Visual regression (Playwright `toHaveScreenshot()`) bao phủ toàn bộ component `packages/ui`/`packages/commerce` và trang critical path.
- P1 — E2E mở rộng: Search, Wishlist, Admin, CMS — mỗi flow ít nhất một test xanh trên CI.
- P1 — Bundle analyzer (`@next/bundle-analyzer`) rà soát dependency bất thường, áp lazy-load cho component nặng đã xác định vượt ngưỡng (rich text editor CMS, data table Admin, hiệu ứng thị giác trang marketing — [`performance-seo.md`](./performance-seo.md#lazy-load-component-nặng-trong-cùng-route-đề-xuất)).
- P2 — Virtualization cho list dài, nếu đo được vấn đề thật ở bước trên (không làm trước khi có bằng chứng).

**Exit criteria**:
- Lighthouse ≥ 95 trên mọi route public chính của `storefront`.
- Accessibility audit không còn lỗi mức critical/serious.
- Visual regression bao phủ toàn bộ component và trang critical path.
- E2E mở rộng: Search, Wishlist, Admin, CMS mỗi flow có ít nhất một test xanh trên CI.

---

## Tổng quan thứ tự ưu tiên giữa các phase

```
Phase 0 (Foundation) → Phase 1 (Token/UI) → Phase 2 (Shell)
   → Phase 3 (Contract) → Phase 4 (Commerce Components)
   → Phase 5 (Storefront Features — critical path P0 trước, Account/Search P1 sau)
   → Phase 6 (Admin) ⇄ Phase 7 (CMS) — không phụ thuộc lẫn nhau, có thể xen kẽ theo nhu cầu thật,
     nhưng cả hai đều PHẢI sau Phase 5 vì dùng chung schema/component đã ổn định ở đó
   → Phase 8 (Hardening)
```

Roadmap này sẽ cần cập nhật khi các câu hỏi [Mở] còn lại được trả lời: catalog/SKU thật, ma trận RBAC/role cụ thể cho `admin`/`cms` (xem [`authentication-authorization.md`](./authentication-authorization.md)), backend framework thật cho giai đoạn tích hợp sau này (xem [`../backend/backend-overview.md`](../backend/backend-overview.md)).
