# Brainstorm Session — Nền tảng E-commerce mới (FE)

> Bản nháp đang review, chưa phải tài liệu kiến trúc chính thức.

## 1. Tóm tắt hiểu biết (Understanding Summary)

- **Là gì**: Turborepo monorepo e-commerce mới, độc lập, tại `E:\my-pj\FE` — 3 app (`storefront`, `admin`, `cms`) cùng `packages/` dùng chung. Tách biệt hoàn toàn với `Front-end/ecommerce-next` đã có sẵn.
- **Vì sao**: Xây nền tảng e-commerce thời trang/giày thể thao thật, hướng kinh doanh (kiểu Nike), nhắm chất lượng UI/UX, IA và performance ngang tầm Nike/Apple. `vision-sketch.md` là bản thiết kế kiến trúc; `nike-ui-ux-analysis.md` là tài liệu tham chiếu design system.
- **Ai làm**: Một mình (solo dev), không deadline cố định → ưu tiên nhịp độ bền vững và chất lượng hơn tốc độ.
- **Ràng buộc chính**:
  - Chưa có backend → mock-first (MSW + localStorage cho thao tác ghi).
  - Quy mô người dùng chưa rõ → kiến trúc không được cản trở mở rộng sau này, nhưng không xây dư thừa.
  - CMS tự xây, không dùng headless CMS bên thứ ba — trade-off khối lượng công việc cho solo dev đã được cân nhắc.
- **Non-goals ở giai đoạn này**: cổng thanh toán online (Stripe/VNPay/MoMo — MVP chỉ COD); dashboard BI nâng cao; chốt framework backend thật.
- **Đa ngôn ngữ**: Tiếng Việt + Tiếng Anh ngay từ đầu.

## 2. Giả định (Assumptions)

1. Mục tiêu hiệu năng theo `vision-sketch.md`: LCP < 2.5s, CLS < 0.1, INP < 200ms, Lighthouse > 95.
2. Giai đoạn mock-first chưa có PII/thanh toán thật, nhưng form vẫn xây theo chuẩn OWASP-safe từ đầu.
3. Chưa cần SLA production; best-effort trong giai đoạn build.
4. Admin MVP tối thiểu: CRUD sản phẩm + quản lý trạng thái đơn hàng.
5. CI/CD & hosting chưa quyết định, để giai đoạn sau.

## 3. Câu hỏi còn để ngỏ (Open Questions)

### 1. Chọn framework backend thật

Cố tình chưa chọn (Decision #3: mock-first, backend chưa cần chốt ngay) giữa Django REST (có sẵn ở dự án khác), NestJS (`be-nest-ecom` có sẵn), hoặc framework khác. `implementation-plan.md` đề xuất NestJS + Modular Monolith, nhưng đó chỉ là tham khảo (Decision #11), không phải quyết định.

- **Đang chặn gì**: không gì ở giai đoạn hiện tại — non-goal có chủ đích (§1).
- **Cần trả lời khi nào**: khi bắt đầu tích hợp API thật, sau Phase 8 — Hardening trong `docs/architecture/frontend/roadmap.md`. Không cần trả lời bây giờ.

### 2. Catalog sản phẩm thật / bộ nhận diện thương hiệu / số lượng SKU ban đầu

Kiến trúc hiện tại dựa trên dữ liệu mock trừu tượng (Product, Variant, SKU...). Chưa biết: bán thương hiệu/sản phẩm gì thật (tự thiết kế? nhập hàng? phối phong cách Nike nhưng bán gì?); có bao nhiêu category/SKU ban đầu (vài sản phẩm demo hay catalog thật vài trăm SKU?); có bộ nhận diện thương hiệu riêng (tên, logo, màu) hay dùng placeholder.

- **Đang chặn gì**: không chặn kiến trúc hiện tại (mock-first không cần biết trước), nhưng sẽ chặn khi viết MSW mock data thật (Phase 3–4) và thiết kế nội dung Homepage/CMS (Phase 7).
- **Cần trả lời khi nào**: trước khi bắt đầu Phase 3 (Contract Foundation) trong roadmap, để mock data phản ánh đúng sản phẩm thật thay vì dữ liệu giả tuỳ ý.

### 3. RBAC / role chi tiết cho `admin` và `cms`

Phát sinh sau Decision #20 (xác nhận có authentication). Mới biết "có auth", chưa biết: có bao nhiêu vai trò thật (`implementation-plan.md` liệt kê tham khảo: Super Admin, Catalog Manager, Order Operator, Content Editor, Marketing Manager, Read-only Analyst — chỉ tham khảo, chưa phải quyết định); ai được làm gì (ví dụ: Content Editor có được sửa giá sản phẩm không? Order Operator có được xoá sản phẩm không?).

- **Đang chặn gì**: thiết kế authorization guard chi tiết ở Phase 6 (Admin MVP) và Phase 7 (CMS) trong roadmap — không chặn Phase 0–5.
- **Cần trả lời khi nào**: trước khi implement authorization guard chi tiết cho Admin/CMS (Phase 6–7).
- Xem thêm: `docs/architecture/frontend/authentication-authorization.md`.

### Đã giải quyết

- ~~Phạm vi "tự xây CMS" ở Phase 1 là toàn bộ hay một lát cắt nhỏ hơn ban đầu?~~ Đã chốt — xem Decision #21.
- ~~Layouts tách package riêng?~~ Đã chốt — xem Decision #12.
- ~~Quan hệ với implementation-plan.md?~~ Đã chốt — xem Decision #11.

## 4. Nhật ký quyết định (Decision Log)

| # | Quyết định | Phương án khác đã cân nhắc | Lý do chọn |
|---|---|---|---|
| 1 | Dự án FE mới, độc lập với `ecommerce-next` | Cải tiến kiến trúc `ecommerce-next` hiện có; chỉ làm nơi lưu tài liệu | Muốn một sản phẩm/dự án riêng |
| 2 | Sản phẩm thật, định hướng kinh doanh | Học tập/portfolio | Mục tiêu là kinh doanh thật |
| 3 | Mock-first (MSW + localStorage), backend chưa chọn | Dùng lại Django có sẵn; dùng NestJS (`be-nest-ecom`) | Backend thật chưa cần chốt ngay |
| 4 | Turborepo monorepo ngay từ Phase 1 | Single Next.js app trước, tách monorepo sau | Chấp nhận overhead ban đầu để dễ mở rộng dài hạn |
| 5 | MVP scaffold cả 3 app: storefront + admin + cms | Chỉ storefront; storefront + admin | Muốn đủ 3 mảng ngay từ đầu |
| 6 | CMS **tự xây** | Headless CMS bên thứ 3 (Sanity/Strapi) | Đã cân nhắc trade-off, vẫn chọn tự xây để kiểm soát hoàn toàn |
| 7 | Thanh toán MVP: chỉ COD | Mock luôn cả cổng thanh toán online | Đơn giản hoá giai đoạn mock-first |
| 8 | Đa ngôn ngữ VN + EN từ đầu | Chỉ tiếng Việt | Không muốn retrofit i18n sau |
| 9 | Không áp lực deadline cụ thể | 1–2 tháng / 3–6 tháng | Solo dev, ưu tiên chất lượng |
| 10 | Chọn **Hướng B — Foundation-first**: xây core components, core functions, design system đầy đủ trước feature | Hướng A (scaffold nhẹ, đào sâu từng module trước, tách package theo rule-of-three) | Muốn nền tảng component/design-system vững trước, chấp nhận rủi ro over-engineering đã cảnh báo |
| 11 | `implementation-plan.md` là tài liệu **tham khảo thêm** (giống `vision-sketch.md`, `nike-ui-ux-analysis.md`), không thay thế thiết kế đang làm | Dùng implementation-plan.md làm tài liệu gốc thay cho thiết kế hiện tại | Tiếp tục thiết kế từng phần như đang làm, đối chiếu để không mâu thuẫn |
| 12 | Không tách `layouts` thành package riêng — primitive bố cục (`Container`, `Grid`, `Stack`, `Section`) nằm trong `packages/ui`; `Header`/`Footer` cụ thể nằm trong từng `apps/*` | Tách `packages/layouts` riêng | Header/Footer khác nhau nhiều giữa storefront/admin/cms; `implementation-plan.md` cũng không tách package `layouts` riêng — nhất quán |
| 13 | Thêm `packages/schemas` (Zod schemas — request/response/error contract) vào cấu trúc monorepo | Không có package riêng, để schema rải rác trong `api-sdk` | Theo nguyên tắc Contract-first của `implementation-plan.md`: schema phải định nghĩa trước khi build UI/mock — cần một nơi tập trung, dùng chung giữa `api-sdk`, `commerce`, và form validation |
| 14 | Tách `Locale` (ngôn ngữ hiển thị) và `Market` (vùng kinh doanh: tiền tệ/catalog/thuế) thành 2 khái niệm domain riêng biệt — hiện chỉ dùng `Locale`, chưa cần `Market` | Gộp chung "đa ngôn ngữ" = đổi cả tiền tệ/catalog | Tránh nhầm lẫn domain; xem `glossary.md` |
| 15 | Danh sách Locale đóng, một nguồn sự thật duy nhất trong code (`SUPPORTED_LOCALES`); thêm locale = sửa code + deploy | Danh sách locale runtime/CMS-managed (Admin bật/tắt không cần deploy) | Tránh lặp lỗi hard-code rải rác đã thấy ở `ecommerce-next` (`middleware.ts`); chưa có nhu cầu quản lý locale động — xem **ADR 0001** |
| 16 | Locale áp dụng cho cả UI chrome lẫn nội dung Product/CMS (`Localized Text`); thiếu bản dịch thì fallback về Locale mặc định (`vi`), không chặn publish, không hiển thị trống | Bắt buộc dịch đủ mới publish; hiển thị trống khi thiếu bản dịch | Không có đội dịch thuật riêng, không nên khoá vận hành vì thiếu bản dịch — xem `glossary.md` (`Locale mặc định`, `Localized Text`) |
| 17 | Đa Locale (UI) chỉ áp dụng cho `storefront`; `admin`/`cms` chỉ tiếng Việt (Content Editor vẫn nhập Localized Text đa ngôn ngữ cho Product/CMS content) | Đa Locale cho cả 3 app | Người vận hành nội bộ, giả định biết tiếng Việt; dịch UI Admin/CMS không phục vụ khách hàng cuối — xem **ADR 0002** |
| 18 | Routing dùng lại pattern `app/[locale]/...` (`next-intl`) cho `storefront`, như `ecommerce-next` đã kiểm chứng; `admin`/`cms` không có segment `[locale]` | Tự thiết kế routing pattern khác | Pattern đã chạy production-like, nhất quán với Decision #17 |
| 19 | Typography token: **một bộ duy nhất** dùng chung mọi Locale, line-height tính dư khoảng trống cho dấu tiếng Việt; không override riêng theo locale | Typography token override riêng theo locale (`en` chặt theo Nike gốc, `vi` nới hơn) | `storefront` đổi locale ngay trong phiên → override riêng gây layout shift khi đổi ngôn ngữ — xem **ADR 0003**. Ràng buộc kèm theo: font phải có đầy đủ glyph tiếng Việt |
| 20 | Authentication **có** trong MVP storefront (sign in/up, account, order history, wishlist gắn user) | Guest-only cho MVP, auth để P1 | Xác nhận trực tiếp khi được hỏi trong phiên thiết kế solution — xem `docs/architecture/frontend/authentication-authorization.md`. `admin`/`cms` vốn đã cần auth nội bộ bất kể lựa chọn này |
| 21 | Phạm vi "tự xây CMS" Phase 1 = **toàn bộ CMS MVP** như `implementation-plan.md` liệt kê (Hero Banner, Homepage Sections, Collection Landing Page, Promotion Banner, SEO Metadata, Blog, Campaign) | Lát cắt mỏng — chỉ Hero/Banner trước | Xác nhận trực tiếp khi được hỏi trong phiên thiết kế solution |
| 22 | Cơ chế authentication: session cookie `httpOnly` tự quản lý, không dùng NextAuth/Auth.js hay provider hosted (Clerk...) | NextAuth/Auth.js; hosted provider (Clerk, Supabase Auth) | Chưa có backend thật; thư viện auth có sẵn giả định trước provider/backend — tích hợp sớm là trừu tượng hoá thứ chưa tồn tại (YAGNI). Xem **ADR 0004** — kèm rủi ro kỹ thuật cần spike xác nhận (MSW browser-mode vs Next.js middleware) trước khi build `use-auth` thật ở Phase 5 |
| 23 | Cơ chế hiện thực hoá design token: **Tailwind CSS v4 (`@theme`)** + CSS custom properties sinh từ `packages/design-tokens` | CSS-in-JS (vanilla-extract, styled-components) | Khớp với `packages/ui` (dùng Radix + shadcn-style component, vốn build trên Tailwind); tránh runtime CSS-in-JS overhead ảnh hưởng mục tiêu Lighthouse > 95 — xem `design-system.md` |
| 24 | State client dùng chung (không phải server state/URL state): **Zustand** | Redux Toolkit; React Context + `useReducer`; Jotai | Ít boilerplate nhất cho phạm vi còn lại sau khi tách URL-state và TanStack Query; selector tránh re-render thừa mà Context không có mặc định — xem bảng so sánh ở `state-management.md` |
| 25 | Visual regression testing: **Playwright screenshot comparison** (`toHaveScreenshot()`) | Chromatic; Percy | Đã có sẵn Playwright cho E2E, không thêm công cụ/chi phí mới; chưa cần dashboard review cộng tác cho solo dev — xem `testing.md` |
| 26 | Font-loading cho `storefront`: self-host, subset theo bộ ký tự Latin + dấu tiếng Việt, preload weight above-the-fold | Load runtime từ Google Fonts | Tránh round-trip domain thứ ba, kiểm soát cache-control — xem `performance-seo.md`. Còn mở: `font-display: swap` vs `optional` — cần đo CLS thực tế ở size Heading/Display (48–72px) trước khi chốt giá trị cuối |
| 27 | Performance budget cho `admin`/`cms`: LCP < 4s, INP < 500ms, không có mục tiêu Lighthouse tổng thể | Áp cùng budget nghiêm ngặt như `storefront` (LCP < 2.5s, Lighthouse > 95) | App nội bộ, không traffic công khai/SEO — budget nghiêm ngặt là over-engineering không tương xứng; xem `performance-seo.md` |
| 28 | Cơ chế chuyển `packages/api-sdk` từ MSW mock sang API thật: biến môi trường (`NEXT_PUBLIC_API_MOCKING`) đọc ở entrypoint khởi tạo, hàm fetch giữ nguyên chữ ký ở cả hai chế độ | Tách riêng 2 implementation không qua flag; branch theo `NODE_ENV` | Đơn giản, không cần rewrite component khi chuyển — xem `api-integration.md`. Chi tiết cụ thể (tên biến, nơi đọc) có thể tinh chỉnh khi thật sự cần ở Phase 3 |
| 29 | Cấu trúc bên trong mỗi `apps/*`: mô hình feature-module — `features/{feature}/pages/{page}/` dạng thư mục (page + component/hook riêng trang), barrel `index.ts` là điểm import duy nhất, route Next.js chỉ mount page component (áp dụng skill `frontend-architecture`, portable module-based) | Feature folder phẳng không phân trang/module rõ ràng; đặt page trực tiếp trong `app/` không tách logic | Cấu trúc tự mô tả được ("code này ở đâu, ai được import gì" trả lời được không cần hỏi), tương thích ESLint boundaries đã có — xem `module-architecture.md` |
| 30 | Quy ước đặt tên: interface tiền tố `I`, PascalCase component, kebab-case thư mục trang, `use`-prefix hook, store `{feature}.store.ts` | Không có quy ước thống nhất, để tự do theo từng người viết | Nhất quán khi scaffold code thật, tránh mỗi package/feature một kiểu — xem `module-architecture.md` |
| 31 | Query key factory phân cấp cho TanStack Query, đặt trong `packages/hooks` (hoặc `features/{feature}/hooks` nếu riêng 1 feature) | String key rời rạc, tự nhớ thủ công từng key khi invalidate | Invalidate cache nhất quán theo entity (list/detail) — xem `api-integration.md` |
| 32 | Zustand: 1 store unit/feature (`features/{feature}/stores/{feature}.store.ts`), interface tiền tố `I`, luôn có `reset()`; nguyên tắc chung: không copy server state (TanStack Query) vào Zustand | Nhiều store rời rạc không theo feature; copy response server vào Zustand để "cache lại" | Nhất quán với Decision #24 và quy ước đặt tên #30; tránh 2 nguồn sự thật cho cùng dữ liệu — xem `state-management.md` |
| 33 | Tổ chức class Tailwind trong component: **inline trong JSX + `cva` cho variant** làm mặc định; chỉ tách `{component}.styles.ts` khi component đủ phức tạp (rule-of-three) | Luôn co-locate mọi class ra file `{component}.styles.ts` riêng (mặc định của skill `frontend-architecture`) | Giữ lợi ích cốt lõi của Tailwind (markup + style cùng chỗ); nhất quán YAGNI/Foundation-first đã chọn (Decision #10) thay vì áp quy ước tách file cho toàn bộ design system ngay từ đầu — xem `design-system.md` |

## 5. So sánh hướng thiết kế (Design Approaches Comparison)

Ba hướng đã so sánh trên complexity, extensibility, risk, và maintenance:

- **Hướng A — Scaffold nhẹ, đào sâu theo chiều dọc** (khuyến nghị ban đầu, không được chọn): scaffold Turborepo tối thiểu, làm từng module hoàn chỉnh trên storefront trước, tách package theo rule-of-three.
- **Hướng B — Foundation-first** (đã chọn): xây design system + core component + core function đầy đủ trước, theo `vision-sketch.md` + `nike-ui-ux-analysis.md`.
- **Hướng C — Song song 3 app, mỗi app một slice mỏng**: không chọn — rủi ro solo dev phải context-switch liên tục.

## 6. Thiết kế phần 1/6 — Kiến trúc tổng thể & cấu trúc thư mục monorepo (Design Part 1/6 — Overall Architecture & Monorepo Structure)

```
FE/
├── apps/
│   ├── storefront/      # Next.js — khách hàng mua sắm
│   ├── admin/           # Next.js — vận hành nội bộ
│   └── cms/             # Next.js — biên tập nội dung (tự xây)
│
├── packages/
│   ├── design-tokens/   # colors, typography, spacing, radius, shadow, motion, breakpoints
│   ├── ui/              # Component nền tảng thuần UI: Button, Input, Card, Modal,
│   │                    # Drawer, Tabs, Badge, Skeleton, Toast, Pagination, Tooltip...
│   ├── commerce/        # Component nghiệp vụ e-commerce dùng chung storefront/admin:
│   │                    # ProductCard, ProductGallery, MiniCart, CheckoutStepper,
│   │                    # CouponInput, OrderTimeline, SizeSelector, ColorSelector...
│   ├── api-sdk/         # Typed API client + MSW mock handlers (mock-first)
│   ├── schemas/         # Zod schemas — request/response/error contract (Contract-first)
│   ├── hooks/           # use-cart, use-auth, use-search... (logic dùng chung nhiều app)
│   ├── utils/           # Pure helper functions
│   ├── eslint-config/
│   └── ts-config/
│
├── docs/
└── turbo.json, package.json (root)
```

**Đã chốt** (Decision #12): `layouts` không tách thành package riêng — primitive bố cục thuần (`Container`, `Grid`, `Stack`, `Section`) nằm trong `packages/ui`; `Header`/`Footer` cụ thể nằm trong từng `apps/*`.

---

## 7. Phát hiện mới — đối chiếu `implementation-plan.md` (New Finding — Cross-Referencing implementation-plan.md)

Một file mới xuất hiện trong lúc brainstorming: `implementation-plan.md`, một **Implementation Plan** chi tiết (41 mục, ~43 tuần, cả Front-end, Back-end, và Integration). File này tự chốt nhiều quyết định kiến trúc lớn, bao gồm một số điều đang bàn ở đây:

- Chọn **"Design System trước feature"** — khớp Hướng B đã chọn ở §4/#10.
- Thêm nguyên tắc **Contract-first**: xác định request/response/error schema, pagination, filter, sort, auth behavior... trước khi viết bất kỳ component nào — chặt hơn "mock-first" thuần tuý đã thống nhất ở Decision #3.
- Chọn **Modular Monolith (NestJS)** cho backend, không phải Microservices ngay — trả lời một phần Open Question về backend framework.
- Cấu trúc package gần giống §6, thêm `schemas` — khớp nguyên tắc Contract-first.
- Timeline 43 tuần chi tiết theo tuần, ngược với Decision #9 ("không áp lực deadline cụ thể") — cần làm rõ đây là *timeline tham khảo* hay *cam kết thật*.

Câu hỏi đặt ra: tài liệu này là **kế hoạch chuẩn** để tiếp tục thiết kế, hay chỉ là tài liệu tham khảo thêm giống hai file kia?

→ **Đã trả lời**: tham khảo thêm, không thay thế thiết kế đang làm (Decision #11).

---

## 8. Thiết kế phần 2/6 — Hệ thống Design Token ba tầng (Design Part 2/6 — Three-Tier Design Token System)

Kết hợp phân tầng token từ `implementation-plan.md` (Primitive → Semantic → Component) với các giá trị cụ thể từ `nike-ui-ux-analysis.md`:

**Tầng 1 — Primitive tokens** (giá trị thô, không mang ý nghĩa ngữ cảnh): `packages/design-tokens/{colors,spacing,typography,radius,shadow,motion,breakpoints}.ts`

- Color: `black #111111`, `white #FFFFFF`, `gray100–400`, `red`, `green`
- Spacing: `0,4,8,12,16,20,24,32,40,48,64,80,120` (Nike thiên về spacing lớn — 48/64/80/120, ít dùng 16/24)
- Typography size: `72,64,48,32,24,20,18,16,14,12`
- Radius: `none,xs(4),sm(8),md(12),lg(16),xl(24)`
- Motion duration: `200ms` (hover/image scale), `300ms` (fade), `400ms` (drawer)
- Breakpoints: `375,768,1024,1280,1440`

**Tầng 2 — Semantic tokens** (map primitive → ý nghĩa, cho phép đổi theme mà không sửa component): `background-primary`, `foreground-primary`, `foreground-muted`, `border-default`, `action-primary`, `action-hover`, `status-success`, `status-error`. Button dùng `action-primary`, không hard-code `black`.

**Tầng 3 — Component tokens**: không khai báo tập trung trước cho toàn bộ 30+ component. Mỗi component tự khai báo token riêng (`button-primary-background`, `card-background`...) ngay trong file của nó khi được build, tham chiếu tới semantic token — tránh đoán trước nhu cầu cho component chưa tồn tại (YAGNI).

**Acceptance criteria** (giữ từ `implementation-plan.md`): không dùng hex trực tiếp trong feature code; không dùng spacing tùy ý ngoài token.

> **Cập nhật sau phiên Grilling (§9)**: Typography token (line-height, letter-spacing) dùng một bộ duy nhất cho mọi Locale, đã tính dư khoảng trống an toàn cho dấu tiếng Việt — không override riêng theo locale. Font phải có đầy đủ glyph tiếng Việt. Xem ADR 0003.

## 9. Kết quả phiên Grilling — Domain Model Locale (Grilling Session Results — Locale Domain Model)

Phiên grilling riêng (skill `grilling` + `domain-modeling`) đào sâu domain model cho i18n/Locale, khởi đầu từ câu hỏi "đa ngôn ngữ, không giới hạn chỉ tiếng Việt". Đối chiếu với code thật (`ecommerce-next/middleware.ts` — locale hard-code rải rác ở 3 chỗ không đồng bộ) và giải quyết 6 câu hỏi liên tiếp (Decision #14–#19, §4).

**Khái niệm domain mới** (ghi vào [`glossary.md`](../glossary.md)): `Locale`, `Locale mặc định`, `Localized Text`, `Market` (chưa dùng, đặt tên trước).

**ADR mới** (trong [`docs/adr/`](./docs/adr/)):
- `0001-closed-locale-list.md` — danh sách Locale đóng, quản lý trong code
- `0002-locale-scope-storefront-only.md` — đa Locale UI chỉ áp dụng `storefront`
- `0003-single-typography-token-set-across-locales.md` — một bộ typography token cho mọi Locale
