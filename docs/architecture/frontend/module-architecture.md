# Module Architecture

## Cấu trúc monorepo [Đã chốt — brainstorm-session.md §6]

```
FE/
├── apps/
│   ├── storefront/      # Next.js — khách hàng mua sắm, đa Locale
│   ├── admin/           # Next.js — vận hành nội bộ, chỉ tiếng Việt
│   └── cms/             # Next.js — biên tập nội dung (tự xây), chỉ tiếng Việt
│
├── packages/
│   ├── design-tokens/   # colors, typography, spacing, radius, shadow, motion, breakpoints
│   ├── ui/              # Component nền tảng thuần UI + primitive bố cục (Container, Grid, Stack, Section)
│   ├── commerce/        # Component nghiệp vụ mua sắm (product, cart, checkout), dùng bởi storefront; cms dùng để preview
│   ├── api-sdk/         # Typed API client + MSW mock handlers (mock-first)
│   ├── schemas/         # Zod schemas — request/response/error contract (Contract-first)
│   ├── hooks/           # use-cart, use-auth, use-search... (logic dùng chung nhiều app)
│   ├── utils/           # Pure helper functions + SUPPORTED_LOCALES (xem i18n-locale.md)
│   ├── eslint-config/
│   ├── ts-config/
│   └── tailwind-config/ # Preset Tailwind v4 dùng chung — import CSS custom properties từ design-tokens
│
├── docs/
└── turbo.json, package.json (root)
```

**Đã chốt** (Decision #12): không tách `layouts` thành package riêng. `Header`/`Footer` cụ thể (khác nhau nhiều giữa 3 app) nằm trong từng `apps/*`; chỉ primitive bố cục thuần (`Container`, `Grid`, `Stack`, `Section`) nằm trong `packages/ui`.

**Đã chốt** (Decision #34, hệ quả của Decision #23 — Tailwind v4): tách `packages/tailwind-config` làm preset Tailwind v4 dùng chung cho cả 3 `apps/*`, nhất quán với cách `eslint-config`/`ts-config` đã tách — mọi shared config đều là một package riêng, không có ngoại lệ "chỉ 1 dòng import thì không cần tách". Package này chứa file `@theme` preset import CSS custom properties sinh từ `packages/design-tokens`; mỗi `apps/*` chỉ cần import preset này thay vì tự lặp lại cấu hình.

Về nội dung UI string đa ngôn ngữ (message catalog cho `next-intl`, vd `vi.json`/`en.json`): **không** tách package riêng — đặt trực tiếp trong `apps/storefront` (vd `apps/storefront/messages/{locale}.json`), vì chỉ `storefront` có đa Locale UI (ADR 0002); `admin`/`cms` không cần. Tách package dùng chung cho một app duy nhất tiêu thụ là abstraction thừa (YAGNI, nhất quán Decision #10) — chỉ tách khi có consumer thứ hai thật sự xuất hiện (vd `cms` cần preview theo locale).

## Trách nhiệm từng package

| Package | Chứa gì | Không chứa gì |
|---|---|---|
| `design-tokens` | Giá trị token 3 tầng (primitive/semantic) — xem [`design-system.md`](./design-system.md) | Component, JSX |
| `ui` | Button, Input, Card, Modal, Drawer, Tabs, Badge, Skeleton, Toast, Pagination, Tooltip, Container, Grid, Stack, Section | Bất cứ thứ gì biết về "Product", "Order", "Cart" |
| `commerce` | ProductCard, ProductGallery, MiniCart, CheckoutStepper, CouponInput, OrderTimeline, SizeSelector, ColorSelector | Header/Footer cụ thể của từng app, route/page |
| `schemas` | Zod schema cho request/response/error/pagination/filter/sort của từng domain entity | Logic fetch, React |
| `api-sdk` | Hàm fetch có kiểu (dùng schema từ `schemas` để validate), MSW handlers dùng chung schema để mock | UI component |
| `hooks` | React hook dùng chung nhiều app (`use-cart`, `use-auth`, `use-search`) — build trên `api-sdk` + TanStack Query | Component JSX |
| `utils` | Pure function, `SUPPORTED_LOCALES` (nguồn sự thật duy nhất — ADR 0001) | Side-effect, React |
| `tailwind-config` | Preset Tailwind v4 (`@theme`) import CSS custom properties từ `design-tokens` | Giá trị token thô (đã ở `design-tokens`), component |

## Quy tắc phụ thuộc [Đề xuất]

Chưa có quyết định chính thức nào trong brainstorm về hướng import giữa các package — đây là đề xuất mới, cần xác nhận. Đề xuất theo hướng **một chiều, không vòng lặp**:

```
design-tokens ← ui ← commerce ← apps/*
schemas ← api-sdk ← hooks ← commerce, apps/*
utils ← (mọi package, mọi app)
eslint-config, ts-config ← (config-only, mọi package/app dùng nhưng không import runtime)
```

Quy tắc cụ thể:

- `apps/*` không được import lẫn nhau (storefront không import từ admin, v.v.).
- `packages/ui` không được import `packages/commerce`, `packages/api-sdk`, hay bất kỳ thứ gì biết về domain e-commerce.
- `packages/schemas` không phụ thuộc React hay bất kỳ package nào khác trong repo — chỉ Zod.
- `packages/commerce` được phép import types từ `packages/schemas` (để component nhận đúng shape dữ liệu) nhưng không tự gọi fetch — việc fetch là trách nhiệm của `hooks`/`apps`.

**Cách enforce** [Đề xuất]: dùng ESLint `import/no-restricted-paths` hoặc `eslint-plugin-boundaries` cấu hình trong `packages/eslint-config`, chạy như một quality gate (`pnpm lint`) — chi tiết cấu hình để lúc scaffold code, không thuộc phạm vi tài liệu kiến trúc này.

## Cấu trúc nội bộ trong từng `apps/*` [Đã chốt — Decision #29, đào sâu theo mô hình feature-module]

Mỗi feature bên trong một app là một **module độc lập** (`features/{feature}/`), sở hữu toàn bộ page, component, hook, state riêng của nó, chỉ lộ ra ngoài qua đúng một barrel (`index.ts`). Route trong `app/` (Next.js App Router — xem [`routing.md`](./routing.md)) là **lớp mỏng**: chỉ import page component từ barrel của feature rồi render, không chứa logic.

```
apps/storefront/src/
├── app/[locale]/...           # Route file MỎNG — import page component từ feature barrel
│                              # (route group cụ thể — xem routing.md)
└── features/
    └── {feature}/             # vd: product-list, product-detail, cart, checkout
        ├── index.ts           # BARREL công khai — nơi duy nhất được import từ bên ngoài feature này
        ├── pages/
        │   └── {page}/
        │       ├── {page}.tsx         # Component trang
        │       ├── index.ts           # re-export component trang
        │       ├── components/        # Component CHỈ trang này dùng
        │       └── hooks/             # Hook CHỈ trang này dùng
        ├── components/        # Component dùng bởi ≥2 trang TRONG CÙNG feature
        ├── hooks/              # Hook (bọc packages/hooks hoặc riêng feature nếu chưa cần dùng chung app khác)
        ├── stores/             # Zustand store UI-state riêng feature, nếu feature cần (xem state-management.md)
        └── types/              # View-model type riêng feature — KHÔNG phải request/response (đã ở packages/schemas)
```

Quy tắc import xuyên feature: chỉ qua barrel (`@/features/{feature}`), không import sâu vào file nội bộ của feature khác — dùng chung cơ chế enforce ESLint (`import/no-restricted-paths`/`eslint-plugin-boundaries`) đã đề xuất ở "Quy tắc phụ thuộc" bên trên, áp dụng thêm một tầng cho `features/*`.

**Bậc thăng cấp component/hook** [Đã chốt — Decision #10, hình thức hoá cụ thể theo rule-of-three]:

| Dùng bởi | Đặt ở | Import qua |
|---|---|---|
| Chỉ 1 trang | `pages/{page}/components/` hoặc `hooks/` | relative path trong trang |
| ≥2 trang cùng 1 feature | `features/{feature}/components/` hoặc `hooks/` | barrel `@/features/{feature}` |
| ≥2 feature cùng 1 app, hoặc ≥2 app | `packages/commerce`, `packages/hooks`, `packages/ui` (tuỳ loại) | `@/packages/...` |

Không đặt trước component/hook ở tầng cao hơn "vì có thể dùng chung sau này" — đúng nguyên tắc đã cảnh báo ở Decision #10. Một component/hook chỉ thăng cấp khi consumer thứ hai thật sự xuất hiện, không phải đoán trước.

## Quy ước đặt tên [Đã chốt — Decision #30]

Áp dụng cho `packages/*` và `features/*` bên trong mỗi `apps/*`, để cấu trúc tự mô tả được mà không cần hỏi:

- **Interface** tiền tố `I` — `IProductListParams`, `IFeatureUiState`. Type alias (union, mapped type, primitive) **không** tiền tố — `type SortDirection = 'asc' | 'desc'`.
- **Component**: `PascalCase` cho file lẫn export — `ProductCard.tsx`, `SizeSelector.tsx`.
- **Thư mục trang** (`pages/{page}/`): `kebab-case`, file component cùng tên — `pages/product-list/product-list.tsx`.
- **Hook**: tiền tố `use` — `useProductList`, `useCartStore`.
- **Store** (Zustand): `{feature}.store.ts`, hook export dạng `use{Feature}{Purpose}Store` — vd `useCartUiStore`.
- **Barrel**: luôn là `index.ts`.

Quy ước này không mâu thuẫn quyết định nào đã có (Zustand — Decision #24; `packages/schemas`, `packages/hooks` — Decision #13); chỉ hình thức hoá cách đặt tên nhất quán khi scaffold code thật ở Phase 0–1.

## Quy ước TypeScript [Đề xuất]

Áp dụng cho toàn bộ `packages/*` và `apps/*`, cấu hình gốc trong `packages/ts-config`:

- `strict: true` bật ở tsconfig gốc, mọi `apps/*`/`packages/*` extend từ đó, không tắt lẻ từng flag ở tsconfig riêng.
- Cấm `any` tường minh và ngầm định (`noImplicitAny`) — dùng `unknown` + type guard khi kiểu chưa xác định, không dùng `any` để "cho qua".
- `import type { Foo } from '...'` bắt buộc khi chỉ import type — tách rõ import runtime khỏi import type.
- Function/hook public (export khỏi barrel `index.ts` của package hoặc feature) khai báo return type tường minh; function nội bộ (không export) để TypeScript tự suy luận.

Enforce bằng ESLint (`@typescript-eslint/no-explicit-any`, `@typescript-eslint/consistent-type-imports`, `@typescript-eslint/explicit-module-boundary-types` cho hàm export) trong `packages/eslint-config`, cùng cơ chế enforce đã đề xuất cho quy tắc phụ thuộc ở trên — chi tiết cấu hình để lúc scaffold code thật (Phase 0).

## Alias import [Đề xuất]

Áp dụng thống nhất cho cả 3 `apps/*` (mỗi app cấu hình `tsconfig.json`/`paths` riêng vì mỗi app có `src/features` riêng, nhưng cùng quy ước tên):

| Alias | Trỏ tới | Dùng cho |
|---|---|---|
| `@/*` | `apps/{app}/src/*` | Import nội bộ app (route, lib riêng app) |
| `@/features/{feature}` | `apps/{app}/src/features/{feature}` | Barrel duy nhất để import xuyên feature — xem "Quy tắc import xuyên feature" ở trên |
| `@repo/ui` | `packages/ui` | Component nền tảng |
| `@repo/commerce` | `packages/commerce` | Component nghiệp vụ mua sắm |
| `@repo/schemas` | `packages/schemas` | Zod schema |
| `@repo/api-sdk` | `packages/api-sdk` | Typed fetch + MSW handlers |
| `@repo/hooks` | `packages/hooks` | React hook dùng chung |
| `@repo/utils` | `packages/utils` | Pure helper + `SUPPORTED_LOCALES` |

Import package dùng chung luôn qua alias `@repo/*`, không dùng relative path xuyên package; import nội bộ app xuyên quá 1 cấp thư mục đi qua `@/` thay vì `../../../`.
