# FE Architecture

Đây là tài liệu chốt riêng cho **kiến trúc Frontend** của website bán hàng này.

Mục tiêu của file này là:

- chốt kiến trúc chuẩn cho `storefront`, `admin`, `cms`
- chốt kiến trúc module chung để dev không tự chia mỗi app theo một kiểu
- làm rõ boundary giữa `app layer`, `feature layer`, và shared packages
- chốt chuẩn design system (token, component, a11y) dùng chung cho cả 3 app

File này đi cùng:

- [`FE.md`](./FE.md): tài liệu FE tổng thể
- [`FE-EXECUTION.md`](./FE-EXECUTION.md): foundation checklist, bootstrap steps, version matrix

## 1. Kết luận hiện tại

Sau file này, phần kiến trúc FE được coi là **đủ chuẩn để execution** cho cả 3 app ở mức scaffold, foundation, và feature implementation.

Những phần vẫn còn mở sau file này không còn là câu hỏi kiến trúc lớn, mà chủ yếu là:

- chi tiết RBAC thật cho `admin/cms`
- auth spike cho refresh/retry concurrency và protected-route bootstrapping
- package manifest thật sau khi scaffold code

## 2. Nguyên tắc kiến trúc đã chốt

| ID      | Nguyên tắc                                       | Trạng thái | Ghi chú                                                                                                                      |
| ------- | ------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ARC-001 | Monorepo 3 app, shared packages dùng chung       | Đã chốt    | `storefront`, `admin`, `cms` (xem Decision `#4`/`#5`, tái xác nhận ở Decision `#81` sau khi thử multi-repo ở Decision `#80`) |
| ARC-002 | App Router cho cả 3 app                          | Đã chốt    | Không trộn Pages Router                                                                                                      |
| ARC-003 | Feature-first trong từng app                     | Đã chốt    | Không tổ chức theo technical folders toàn cục                                                                                |
| ARC-004 | API access chỉ đi qua `packages/api-sdk`         | Đã chốt    | Không `fetch` trực tiếp từ feature                                                                                           |
| ARC-005 | Shared UI giữ thuần UI                           | Đã chốt    | Nghiệp vụ chỉ vào `packages/commerce` khi thật sự share                                                                      |
| ARC-006 | Server state, client state, URL state tách riêng | Đã chốt    | Không dùng Zustand làm server cache                                                                                          |
| ARC-007 | Route guard ở FE chỉ là UX layer                 | Đã chốt    | Authz thật do backend enforce                                                                                                |
| ARC-008 | Mỗi feature phải có public API rõ                | Đã chốt    | Không dùng barrel `index.ts` (Decision `#57`) — chỉ `pages/` là public, còn lại private theo path                            |

## 3. Kiến trúc tổng thể

```text
apps/*
  -> app layer
  -> feature layer
  -> providers
  -> app-specific config

packages/*
  -> shared platform layer
  -> shared UI layer
  -> shared commerce layer
  -> shared schemas/contracts
  -> shared API access
```

Luồng phụ thuộc chuẩn:

```text
app routes/layouts
  -> feature modules
  -> shared hooks/utils/ui/commerce
  -> api-sdk + schemas
```

Không được đi ngược:

- `packages/ui` import từ app
- feature này import sâu vào file private của feature khác
- app gọi API bỏ qua `packages/api-sdk`

## 4. Vai trò từng app

### 4.1. `storefront`

Mục tiêu:

- phục vụ người mua hàng cuối
- tối ưu UX, performance, SEO, locale routing
- chứa các flow catalog, PDP, search, cart, wishlist, auth/account, checkout

Trách nhiệm kiến trúc:

- route public và account/checkout
- i18n UI
- commerce experience chính
- chịu trách nhiệm SEO-facing pages

Không nên chứa:

- logic quản trị nội bộ
- CMS authoring workflows

#### 4.1.1. PDP 3D product viewer

`storefront` PDP (Decision `#59`) có 3D product viewer (xoay 360°) dùng `@react-three/fiber` + `@react-three/drei` (React renderer cho `three.js`, không viết imperative three.js thuần). Đây là **vị trí duy nhất** dùng Three.js trong toàn bộ FE — không dùng ở Hero Banner/Homepage/Collection landing (rủi ro trực tiếp tới Lighthouse > 95 đã chốt) và không dùng ở `admin`/`cms`.

Đồng bộ với Variant selection: model 3D **phải đổi màu/material theo Color đang chọn** ở SKU selector (không phải viewer trang trí tách biệt) — đọc state từ cùng nguồn Variant/SKU selection đã chốt ở domain model (`glossary.md`), không tự quản lý state màu riêng.

Ràng buộc bắt buộc: component 3D viewer **phải lazy-load** qua `next/dynamic` với `{ ssr: false }`, chỉ tải khi user thực sự vào route PDP — không import `three`/`@react-three/*` ở bất kỳ route/layout cấp cao hơn PDP, để không ảnh hưởng LCP/Lighthouse của catalog/PLP.

#### 4.1.2. PWA (production only)

`storefront` dùng `@ducanh2912/next-pwa` (Decision `#58`) để installable + offline-capable. **Chỉ bật service worker PWA ở production build** (`disable: process.env.NODE_ENV === "development"` trong config) — vì MSW (Decision #28) đã đăng ký service worker riêng cho browser-mode mock ở dev, hai service worker không thể cùng kiểm soát 1 scope. Không dùng cho `admin`/`cms`.

### 4.2. `admin`

Mục tiêu:

- phục vụ vận hành nội bộ
- quản trị dữ liệu kinh doanh như product, category, inventory, orders

Trách nhiệm kiến trúc:

- protected routes
- data-heavy backoffice screens
- table/filter/form CRUD flows
- audit-friendly interaction patterns

Không nên chứa:

- public storefront concerns
- SEO editing flows thuần content nếu đã thuộc `cms`

### 4.3. `cms`

Mục tiêu:

- phục vụ quản trị nội dung marketing/content
- chỉnh sửa hero, section trang chủ, landing page, blog, campaign, SEO metadata

Trách nhiệm kiến trúc:

- protected routes
- content editing flows
- preview-oriented UX nếu sau này cần

Không nên chứa:

- inventory/order backoffice
- storefront public routing logic

## 5. So sánh kiến trúc 3 app

| Chủ đề               | `storefront`              | `admin`         | `cms`                  |
| -------------------- | ------------------------- | --------------- | ---------------------- |
| Audience             | khách mua hàng            | vận hành nội bộ | content/marketing team |
| Route type           | public + account/checkout | protected       | protected              |
| i18n UI              | có                        | chưa bắt buộc   | chưa bắt buộc          |
| SEO pressure         | rất cao                   | thấp            | thấp                   |
| Performance pressure | cao nhất                  | trung bình      | trung bình             |
| Commerce UI          | chính                     | phụ             | hầu như không          |
| CMS editing          | không                     | không           | chính                  |

## 6. Shared package architecture

| Package                    | Vai trò kiến trúc                                                                            | Ai được dùng                                    |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `packages/tailwind-config` | theme/preset chung (source of truth cho token, thay `packages/design-tokens` — Decision #93) | cả 3 app                                        |
| `packages/ui`              | primitive UI + layout helpers                                                                | cả 3 app                                        |
| `packages/commerce`        | reusable commerce components                                                                 | chủ yếu `storefront`, có thể `admin` khi hợp lý |
| `packages/schemas`         | typed contract và validation schemas                                                         | cả app và `api-sdk`                             |
| `packages/api-sdk`         | network entrypoint duy nhất                                                                  | cả 3 app                                        |
| `packages/hooks`           | hook thật sự cross-app hoặc cross-feature                                                    | cả 3 app khi hợp lý                             |
| `packages/utils`           | helper thuần, không phụ thuộc app                                                            | cả 3 app                                        |

### 6.1. `packages/design-tokens` (đã gỡ — Decision #93)

> Scaffold đề xuất ban đầu dưới đây chưa từng được `packages/tailwind-config` import thật — token sống trực tiếp trong `theme.css`/`preset.css`, đồng bộ tay qua comment. Package bị xoá sau khi xác nhận zero import và một bug drift thật đã xảy ra do đồng bộ tay. Giữ lại mục này làm ghi chú lịch sử; không dựng lại package này trừ khi có nhu cầu generate CSS từ TS thật.

Chứa: color tokens, spacing tokens, typography tokens, radius, shadow, motion, breakpoints.

Không chứa: business logic, component implementation.

Cây thư mục đề xuất:

```text
packages/design-tokens/
├── package.json
├── src/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── radius.ts
│   ├── shadow.ts
│   ├── motion.ts
│   ├── breakpoints.ts
│   └── semantic.ts
└── tsconfig.json
```

Public subpath nên export:

- `@repo/design-tokens/colors`
- `@repo/design-tokens/spacing`
- `@repo/design-tokens/typography`
- `@repo/design-tokens/radius`
- `@repo/design-tokens/shadow`
- `@repo/design-tokens/motion`
- `@repo/design-tokens/breakpoints`
- `@repo/design-tokens/semantic`

Internal-only:

- không cần thư mục `internal/`; mọi file trong package này về bản chất đều có thể public vì đây là package token source-of-truth
- nếu sau này có script generate token, đặt ở `scripts/` và không export qua subpath package

### 6.2. `packages/tailwind-config`

Chứa: preset Tailwind dùng chung, shared theme mapping, plugin config dùng chung nếu có.

Cây thư mục đề xuất:

```text
packages/tailwind-config/
├── package.json
├── src/
│   ├── preset.ts
│   ├── theme.ts
│   ├── plugins.ts
│   └── content.ts
└── tsconfig.json
```

Public subpath nên export:

- `@repo/tailwind-config/preset`
- `@repo/tailwind-config/theme`
- `@repo/tailwind-config/plugins`
- `@repo/tailwind-config/content`

Internal-only:

- nếu có helper build theme phục vụ riêng package, giữ trong `src/internal/*` và không export
- app chỉ consume preset/theme/plugin đã chốt, không import sâu vào helper private của package

### 6.3. `packages/ui`

Chứa: primitive UI components, layout primitives như `Container`, `Grid`, `Stack`, `Section`, component thuần UI không gắn domain commerce.

Ví dụ: `Button`, `Input`, `Dialog`, `Tabs`, `Tooltip`.

Cây thư mục đề xuất:

```text
packages/ui/
├── package.json
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Dialog.tsx
│   │   ├── Tabs.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Spinner.tsx
│   │   └── EmptyState.tsx
│   ├── layout/
│   │   ├── Container.tsx
│   │   ├── Section.tsx
│   │   ├── Stack.tsx
│   │   ├── Inline.tsx
│   │   ├── Grid.tsx
│   │   └── Cluster.tsx
│   ├── hooks/
│   │   └── useLockBodyScroll.ts
│   ├── lib/
│   │   ├── cn.ts
│   │   └── focusRing.ts
│   └── styles/
│       └── globals.css
└── tsconfig.json
```

Public subpath nên export:

- `@repo/ui/button`
- `@repo/ui/input`
- `@repo/ui/dialog`
- `@repo/ui/tabs`
- `@repo/ui/tooltip`
- `@repo/ui/spinner`
- `@repo/ui/empty-state`
- `@repo/ui/container`
- `@repo/ui/section`
- `@repo/ui/stack`
- `@repo/ui/inline`
- `@repo/ui/grid`
- `@repo/ui/cluster`

Internal-only:

- `src/hooks/*` như `useLockBodyScroll.ts` là implementation detail của UI internals, không export trừ khi có nhu cầu reuse thật giữa nhiều component/app
- `src/lib/*` như `cn.ts`, `focusRing.ts` giữ private; app không import trực tiếp helper styling nội bộ của `packages/ui`
- `src/styles/globals.css` chỉ được import tại điểm bootstrap đã chốt, không dùng như một API tiện tay cho feature

Mẫu `package.json` scaffold-ready cho `packages/ui`:

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": ["./src/styles/globals.css"],
  "exports": {
    "./button": "./src/components/Button.tsx",
    "./input": "./src/components/Input.tsx",
    "./dialog": "./src/components/Dialog.tsx",
    "./tabs": "./src/components/Tabs.tsx",
    "./tooltip": "./src/components/Tooltip.tsx",
    "./spinner": "./src/components/Spinner.tsx",
    "./empty-state": "./src/components/EmptyState.tsx",
    "./container": "./src/layout/Container.tsx",
    "./section": "./src/layout/Section.tsx",
    "./stack": "./src/layout/Stack.tsx",
    "./inline": "./src/layout/Inline.tsx",
    "./grid": "./src/layout/Grid.tsx",
    "./cluster": "./src/layout/Cluster.tsx",
    "./styles.css": "./src/styles/globals.css"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

Ghi chú:

- không export `./index`
- không export `src/lib/*` và `src/hooks/*` ngay từ đầu
- nếu sau này cần public thêm một primitive mới, thêm đúng 1 subpath mới thay vì mở rộng barrel tổng

### 6.4. `packages/commerce`

Chứa: component nghiệp vụ có thể share giữa app khi hợp lý.

Ví dụ: `ProductCard`, `ProductGallery`, `SizeSelector`, `ColorSelector`, `OrderTimeline`.

Không nhét mọi thứ của storefront vào đây chỉ vì "có thể share sau".

Cây thư mục đề xuất:

```text
packages/commerce/
├── package.json
├── src/
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ProductPrice.tsx
│   │   ├── SizeSelector.tsx
│   │   └── ColorSelector.tsx
│   ├── cart/
│   │   └── QuantitySelector.tsx
│   ├── order/
│   │   └── OrderTimeline.tsx
│   └── lib/
│       └── price.ts
└── tsconfig.json
```

Public subpath nên export:

- `@repo/commerce/product-card`
- `@repo/commerce/product-gallery`
- `@repo/commerce/product-price`
- `@repo/commerce/size-selector`
- `@repo/commerce/color-selector`
- `@repo/commerce/quantity-selector`
- `@repo/commerce/order-timeline`

Internal-only:

- `src/lib/price.ts` mặc định private; chỉ export nếu có reuse thật ngoài chính các component commerce
- không export component chỉ hợp lệ trong một flow hẹp của `storefront`; nếu chưa có reuse thật thì giữ ở feature local thay vì đẩy vào package

### 6.5. `packages/schemas`

Chứa: request schemas, response schemas, error envelope schemas, domain DTO schemas; trước API v1 handshake đây là baseline chuyển tiếp, sau đó các transport schema phải được generate hoặc đối chiếu từ OpenAPI version đã pin.

Đây là runtime validation/form schema boundary của FE. Sau API v1 handshake, canonical transport contract nằm ở versioned OpenAPI artifact do BE phát hành (Decision `#64`); không duy trì transport DTO thủ công song song với OpenAPI.

Cây thư mục đề xuất:

```text
packages/schemas/
├── package.json
├── src/
│   ├── auth/
│   │   ├── signIn.schema.ts
│   │   └── session.schema.ts
│   ├── catalog/
│   │   ├── product.schema.ts
│   │   ├── productList.schema.ts
│   │   └── variant.schema.ts
│   ├── cart/
│   │   ├── cart.schema.ts
│   │   └── addToCart.schema.ts
│   ├── common/
│   │   ├── pagination.schema.ts
│   │   └── errorEnvelope.schema.ts
│   └── cms/
│       ├── heroBanner.schema.ts
│       └── seoMetadata.schema.ts
└── tsconfig.json
```

Public subpath nên export:

- `@repo/schemas/auth/sign-in`
- `@repo/schemas/auth/session`
- `@repo/schemas/catalog/product`
- `@repo/schemas/catalog/product-list`
- `@repo/schemas/catalog/variant`
- `@repo/schemas/cart/cart`
- `@repo/schemas/cart/add-to-cart`
- `@repo/schemas/common/pagination`
- `@repo/schemas/common/error-envelope`
- `@repo/schemas/cms/hero-banner`
- `@repo/schemas/cms/seo-metadata`

Internal-only:

- không tạo barrel domain-level; import đúng schema file cần dùng
- nếu có fixture/test-only schema helper thì giữ ở `src/testing/*` hoặc `tests/*`, không export cho runtime app

### 6.6. `packages/api-sdk`

Chứa: typed fetch layer, mock adapter, MSW handlers, environment-aware API entrypoint.

Mọi network call đi qua đây theo Decision `#49`.

Cây thư mục đề xuất:

```text
packages/api-sdk/
├── package.json
├── src/
│   ├── client/
│   │   ├── httpClient.ts
│   │   ├── serverClient.ts
│   │   └── browserClient.ts
│   ├── auth/
│   │   ├── auth.api.ts
│   │   └── auth.mapper.ts
│   ├── catalog/
│   │   ├── catalog.api.ts
│   │   └── catalog.mapper.ts
│   ├── cart/
│   │   ├── cart.api.ts
│   │   └── cart.mapper.ts
│   ├── cms/
│   │   ├── cms.api.ts
│   │   └── cms.mapper.ts
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── server.ts
│   │   └── handlers/
│   │       ├── auth.handlers.ts
│   │       ├── catalog.handlers.ts
│   │       ├── cart.handlers.ts
│   │       └── cms.handlers.ts
│   └── config/
│       ├── env.ts
│       └── endpoints.ts
└── tsconfig.json
```

Public subpath nên export:

- `@repo/api-sdk/auth`
- `@repo/api-sdk/catalog`
- `@repo/api-sdk/cart`
- `@repo/api-sdk/cms`

Internal-only:

- `src/client/*` là hạ tầng HTTP private; app/feature không import trực tiếp `httpClient.ts`, `serverClient.ts`, `browserClient.ts`
- `src/config/*` là private package config; endpoint/env mapping không bị feature layer consume trực tiếp
- `src/*.mapper.ts` là private nếu chỉ phục vụ API module tương ứng
- `src/mocks/*` chỉ export ở subpath riêng khi thật sự cần cho test/dev bootstrap, ví dụ `@repo/api-sdk/testing/msw-browser`; không để app production import nhầm

Mẫu `package.json` scaffold-ready cho `packages/api-sdk`:

```json
{
  "name": "@repo/api-sdk",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./auth": "./src/auth/auth.api.ts",
    "./catalog": "./src/catalog/catalog.api.ts",
    "./cart": "./src/cart/cart.api.ts",
    "./cms": "./src/cms/cms.api.ts",
    "./testing/msw-browser": "./src/mocks/browser.ts",
    "./testing/msw-server": "./src/mocks/server.ts"
  },
  "peerDependencies": {
    "zod": "^4.0.0"
  }
}
```

Ghi chú:

- app chỉ import module API mức domain như `@repo/api-sdk/catalog`
- không export `client`, `config`, `mapper` như public contract mặc định
- subpath `testing/*` tách riêng để tránh app runtime import nhầm mock bootstrap

### 6.7. `packages/hooks`

Chứa: shared hooks đa app, query key factories, auth/cart/search hook dùng chung khi thực sự dùng chung.

Cây thư mục đề xuất:

```text
packages/hooks/
├── package.json
├── src/
│   ├── query/
│   │   ├── queryKeys.ts
│   │   └── usePagination.ts
│   ├── auth/
│   │   └── useSession.ts
│   ├── commerce/
│   │   ├── useCurrency.ts
│   │   └── usePriceFormatter.ts
│   └── browser/
│       └── useMediaQuery.ts
└── tsconfig.json
```

Public subpath nên export:

- `@repo/hooks/query/query-keys`
- `@repo/hooks/query/use-pagination`
- `@repo/hooks/auth/use-session`
- `@repo/hooks/commerce/use-currency`
- `@repo/hooks/commerce/use-price-formatter`
- `@repo/hooks/browser/use-media-query`

Internal-only:

- nếu hook chỉ là helper cho một hook public khác, giữ ở `src/internal/*` hoặc colocate cạnh hook public nhưng không export
- không đưa hook lên package này chỉ vì “có thể dùng lại”; chỉ public hook đã có reuse thật giữa app/feature

### 6.8. `packages/utils`

Chứa: pure helpers, formatter, parser, guard helpers.

Không chứa: React hooks, network call, UI render logic.

Cây thư mục đề xuất:

```text
packages/utils/
├── package.json
├── src/
│   ├── format/
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── number.ts
│   ├── guards/
│   │   ├── isDefined.ts
│   │   └── invariant.ts
│   ├── object/
│   │   ├── omit.ts
│   │   └── pick.ts
│   └── string/
│       ├── slugify.ts
│       └── normalizeWhitespace.ts
└── tsconfig.json
```

Public subpath nên export:

- `@repo/utils/format/currency`
- `@repo/utils/format/date`
- `@repo/utils/format/number`
- `@repo/utils/guards/is-defined`
- `@repo/utils/guards/invariant`
- `@repo/utils/object/omit`
- `@repo/utils/object/pick`
- `@repo/utils/string/slugify`
- `@repo/utils/string/normalize-whitespace`

Internal-only:

- không export helper tạm phục vụ migration/one-off script
- không đặt React-aware helper vào package này; nếu helper bắt đầu phụ thuộc React hoặc app runtime, đó là dấu hiệu package placement đang sai

### 6.9. Export package: subpath, không barrel `index.ts`

Theo Decision `#57`, không package nào có `src/index.ts` làm barrel tổng. `package.json` mỗi package dùng `"exports"` map để khai từng subpath — ví dụ:

```json
{
  "name": "@repo/ui",
  "exports": {
    "./button": "./src/components/button.tsx",
    "./container": "./src/layout/container.tsx"
  }
}
```

App import trực tiếp đúng file: `import { Button } from "@repo/ui/button"`, không `import { Button } from "@repo/ui"`. Lý do: tránh chi phí barrel file re-export lớn (Next.js/bundler dev-mode chậm khi barrel gom quá nhiều export), và mỗi import đã tự nhiên là một "alias" rõ nghĩa, khớp quy tắc "mọi import phải dùng alias" ở [§7.4](#74-quy-ước-code-đã-chốt).

Nguyên tắc scaffold-ready cho shared packages:

- mỗi package chỉ public những subpath thật sự là contract ổn định
- file nào chỉ phục vụ implementation nội bộ thì giữ private, kể cả khi technically có thể export
- app/feature không import sâu vào `src/*` của package; chỉ import qua subpath đã khai báo trong `package.json`
- test fixture, mock bootstrap, codegen helper, build helper không được lẫn vào runtime public API mặc định

## 7. Kiến trúc module chung

## 7.1. Mẫu module chuẩn

Decision hiện tại đã chốt theo pattern:

`features/{feature}/pages/{page}/`

Mẫu tối thiểu:

```text
src/features/{feature}/
  pages/
  components/
  hooks/
  stores/
  utils/
```

Không phải feature nào cũng bắt buộc có đủ mọi thư mục. Chỉ tạo khi cần thật. **Không có `index.ts`** (Decision `#57`, thay thế phần barrel của Decision `#29`) — import trực tiếp vào đúng file bằng alias, không qua barrel.

## 7.2. Ý nghĩa từng phần trong feature

| Thư mục       | Dùng cho                                                                                                 | Không dùng cho                     |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `pages/`      | page-level composition của feature; điểm duy nhất mà bên ngoài feature (route trong `app/*`) được import | reusable shared UI                 |
| `components/` | component riêng của feature, **private** — chỉ file trong cùng feature được import                       | primitive dùng chung toàn app      |
| `hooks/`      | hook nghiệp vụ hoặc orchestration của feature, **private**                                               | fetch trực tiếp bỏ qua `api-sdk`   |
| `stores/`     | client state ngắn hạn, UI state có ý nghĩa trong feature, **private**                                    | server cache                       |
| `utils/`      | helper thuần của feature, **private**                                                                    | business logic bị chia vụn bừa bãi |

## 7.3. Public API của feature (không dùng barrel)

Không có `index.ts` để khai báo public API. Thay vào đó, ranh giới public/private được định nghĩa **theo đường dẫn thư mục**, enforce bằng `eslint-plugin-boundaries` (Decision `#51`):

- **Public** (import được từ ngoài feature): chỉ `features/{feature}/pages/**` — vì đây là nơi route trong `app/*` mount vào.
- **Private** (chỉ file trong cùng feature import được): `features/{feature}/components/**`, `hooks/**`, `stores/**`, `utils/**`.

`apps/storefront` thật (tái dùng từ `ecommerce-next`, Decision `#80`/`#81`) không theo đúng convention `features/{feature}/pages` này — nó dùng route-group convention riêng (`src/app/[locale]/(group)/_lib/**`) và đã tự định nghĩa boundaries model tương đương trực tiếp trong `eslint.config.mjs` của nó. Theo Decision `#83`, `packages/eslint-config` không còn hard-code settings `feature-public`/`feature-private` ở trên nữa — enforce boundaries là trách nhiệm của từng app. Convention `features/{feature}/pages` ở mục này chỉ còn là gợi ý cho `admin`/`cms` nếu team chọn theo khi scaffold.

Nếu feature B thật sự cần dùng lại component/hook/logic đang nằm trong `components/`/`hooks/`/`utils/` của feature A, đó là dấu hiệu logic đó nên chuyển lên `packages/*` (theo [decision matrix §8.3](#83-decision-matrix-đặt-code-ở-đâu)), không phải import chéo feature vào file private.

## 7.4. Quy ước code đã chốt

- Interface có tiền tố `I`
- Component dùng `PascalCase`
- File React component dùng `PascalCase` (ví dụ `ProductViewer3D.tsx`, `SignInPage.tsx`)
- Thư mục route/page dùng `kebab-case`
- Hook có tiền tố `use`
- File hook dùng `camelCase` theo tên hook (ví dụ `useProductDetail.ts`)
- Store dùng tên `{feature}.store.ts`
- **Không dùng barrel `index.ts`** — ở cả cấp feature và cấp package (Decision `#57`); package export qua `package.json` `"exports"` subpath (xem [§6](#6-shared-package-architecture))
- **Mọi import phải dùng alias** (`@/*`, `@/features/{feature}`, `@repo/*`) — cấm import tương đối leo cấp cha (`../`); import cùng cấp/con trong 1 file (`./foo`) vẫn cho phép vì không có alias hợp lý để thay
- Không tạo `services/` riêng trong feature; API đi qua `packages/api-sdk`
- Không tạo `constants/` folder mặc định; chỉ tách `constants.ts` khi đủ nhu cầu
- File utility/helper/config/middleware dùng `camelCase`
- Biến, hàm dùng `camelCase`
- Constant module-level (immutable/config, VD `SUPPORTED_LOCALES`) dùng `SCREAMING_SNAKE_CASE`
- `type` alias dùng `PascalCase`, không tiền tố — dùng `interface` cho object shape có thể extend, dùng `type` cho union/intersection/primitive alias
- Boolean (biến, prop) có tiền tố `is`/`has`/`should` (`isLoading`, `hasError`, `shouldRedirect`)
- Event handler prop có tiền tố `on` (`onSubmit`); handler nội bộ gọi nó có tiền tố `handle` (`handleSubmit`)
- Không dùng TypeScript `enum` — dùng union string literal type hoặc object `as const`

## 8. Import boundary đã chốt

## 8.1. Luật import

| Từ đâu          | Được import gì                                          |
| --------------- | ------------------------------------------------------- |
| `app/*`         | `src/features/*`, `src/providers/*`, shared packages    |
| feature A       | shared packages, file private trong chính feature A     |
| feature A       | public API của feature B nếu có nhu cầu thật            |
| shared packages | shared packages khác nếu hợp lý và không vòng phụ thuộc |

## 8.2. Cấm

- import xuyên vào file private của feature khác (`components/`, `hooks/`, `stores/`, `utils/` — chỉ `pages/` là public, xem §7.3)
- import tương đối leo cấp cha (`../`) — bắt buộc dùng alias (`@/*`, `@repo/*`)
- `packages/ui` import `packages/commerce`
- feature import trực tiếp từ backend endpoint URL constants bên ngoài `api-sdk`

## 8.3. Decision matrix đặt code ở đâu

| Nếu code là...                       | Đặt ở đâu                |
| ------------------------------------ | ------------------------ |
| primitive thuần UI                   | `packages/ui`            |
| component commerce có reuse thật     | `packages/commerce`      |
| logic gọi API typed                  | `packages/api-sdk`       |
| schema contract                      | `packages/schemas`       |
| helper thuần đa app                  | `packages/utils`         |
| hook thật sự dùng đa app             | `packages/hooks`         |
| page/business logic riêng một domain | `src/features/{feature}` |
| route/layout/provider riêng app      | app tương ứng            |

## 9. Routing và layout architecture

## 9.1. `storefront`

Route baseline:

```text
app/[locale]/
  (public)/
  account/
  cart/
  checkout/
  wishlist/
```

Layout baseline:

- root layout toàn app
- locale layout cho `next-intl`
- account/checkout có thể có nested layout riêng khi cần

Cây thư mục đầy đủ đề xuất:

```text
apps/storefront/
├── app/
│   ├── layout.tsx
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── category/
│   │   │   │       └── [slug]/
│   │   │   │           └── page.tsx
│   │   │   ├── collections/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   └── brands/
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   ├── account/
│   │   │   ├── layout.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [orderId]/
│   │   │   │       └── page.tsx
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx
│   │   │   └── wishlist/
│   │   │       └── page.tsx
│   │   ├── auth/
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── shipping/
│   │   │   │   └── page.tsx
│   │   │   ├── payment/
│   │   │   │   └── page.tsx
│   │   │   ├── review/
│   │   │   │   └── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   └── wishlist/
│   │       └── page.tsx
│   ├── api/
│   │   └── revalidate/
│   │       └── route.ts
│   ├── not-found.tsx
│   └── error.tsx
│   └── globals.css
├── src/
│   ├── features/
│   │   ├── home/
│   │   │   ├── pages/
│   │   │   │   └── home/
│   │   │   │       └── HomePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── HeroBanner.tsx
│   │   │   │   ├── FeaturedCollection.tsx
│   │   │   │   └── PromotionStrip.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useHomeContent.ts
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── catalog/
│   │   │   ├── pages/
│   │   │   │   ├── product-list/
│   │   │   │   │   └── ProductListPage.tsx
│   │   │   │   ├── category-list/
│   │   │   │   │   └── CategoryListPage.tsx
│   │   │   │   ├── collection-list/
│   │   │   │   │   └── CollectionListPage.tsx
│   │   │   │   └── product-detail/
│   │   │   │       └── ProductDetailPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProductCardGrid.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   ├── ProductSort.tsx
│   │   │   │   ├── ProductMediaGallery.tsx
│   │   │   │   ├── ProductVariantPicker.tsx
│   │   │   │   ├── ProductStickyBuyBar.tsx
│   │   │   │   └── ProductViewer3D.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProductList.ts
│   │   │   │   ├── useProductFilters.ts
│   │   │   │   └── useProductDetail.ts
│   │   │   ├── stores/
│   │   │   │   └── catalog.store.ts
│   │   │   └── utils/
│   │   │       ├── catalogFilters.ts
│   │   │       └── productAvailability.ts
│   │   ├── search/
│   │   │   ├── pages/
│   │   │   │   └── search-results/
│   │   │   │       └── SearchResultsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── SearchFilters.tsx
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── SearchResultsSummary.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useRecentSearches.ts
│   │   │   │   └── useSearch.ts
│   │   │   ├── stores/
│   │   │   │   └── search.store.ts
│   │   │   └── utils/
│   │   │       └── searchParams.ts
│   │   ├── cart/
│   │   │   ├── pages/
│   │   │   │   └── cart/
│   │   │   │       └── CartPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── CartItemList.tsx
│   │   │   │   ├── CartOrderSummary.tsx
│   │   │   │   └── CartPromoCodeForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCart.ts
│   │   │   ├── stores/
│   │   │   │   └── cart.store.ts
│   │   │   └── utils/
│   │   │       └── cartTotals.ts
│   │   ├── wishlist/
│   │   │   ├── pages/
│   │   │   │   └── wishlist/
│   │   │   │       └── WishlistPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── WishlistGrid.tsx
│   │   │   │   └── WishlistMoveToCartButton.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWishlist.ts
│   │   │   ├── stores/
│   │   │   │   └── wishlist.store.ts
│   │   │   └── utils/
│   │   │       └── wishlistAnalytics.ts
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── sign-in/
│   │   │   │   │   └── SignInPage.tsx
│   │   │   │   ├── sign-up/
│   │   │   │   │   └── SignUpPage.tsx
│   │   │   │   └── forgot-password/
│   │   │   │       └── ForgotPasswordPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── AuthFormShell.tsx
│   │   │   │   ├── PasswordField.tsx
│   │   │   │   └── SocialSignInButtons.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── stores/
│   │   │   │   └── auth.store.ts
│   │   │   └── utils/
│   │   │       └── authRedirect.ts
│   │   ├── account/
│   │   │   ├── pages/
│   │   │   │   ├── profile/
│   │   │   │   │   └── ProfilePage.tsx
│   │   │   │   ├── order-history/
│   │   │   │   │   └── OrderHistoryPage.tsx
│   │   │   │   ├── order-detail/
│   │   │   │   │   └── OrderDetailPage.tsx
│   │   │   │   └── addresses/
│   │   │   │       └── AddressesPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── AccountNav.tsx
│   │   │   │   ├── AddressForm.tsx
│   │   │   │   └── OrderHistoryTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAddresses.ts
│   │   │   │   └── useOrders.ts
│   │   │   ├── stores/
│   │   │   │   └── account.store.ts
│   │   │   └── utils/
│   │   │       └── accountTabs.ts
│   │   └── checkout/
│   │       ├── pages/
│   │       │   ├── checkout/
│   │       │   │   └── CheckoutPage.tsx
│   │       │   ├── shipping-step/
│   │       │   │   └── ShippingStepPage.tsx
│   │       │   ├── payment-step/
│   │       │   │   └── PaymentStepPage.tsx
│   │       │   ├── review-step/
│   │       │   │   └── ReviewStepPage.tsx
│   │       │   └── success/
│   │       │       └── CheckoutSuccessPage.tsx
│   │       ├── components/
│   │       │   ├── CheckoutStepper.tsx
│   │       │   ├── ShippingAddressForm.tsx
│   │       │   ├── PaymentMethodForm.tsx
│   │       │   └── OrderReview.tsx
│   │       ├── hooks/
│   │       │   ├── useCheckout.ts
│   │       │   └── useCheckoutSteps.ts
│   │       ├── stores/
│   │       │   └── checkout.store.ts
│   │       └── utils/
│   │           ├── checkoutGuards.ts
│   │           └── paymentMethods.ts
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   └── IntlProvider.tsx
│   ├── lib/
│   │   ├── seo.ts
│   │   ├── analytics.ts
│   │   └── currency.ts
│   ├── config/
│   │   ├── navConfig.ts
│   │   └── storefrontConfig.ts
│   └── middleware/
│       └── authGuard.ts
└── package.json
```

Mọi `pages/{page}/` chỉ chứa 1 file component `PascalCase` (ví dụ `ProductListPage.tsx`) — route Next.js dưới `app/` chỉ mount component này (Decision `#29`), không chứa logic riêng. Với `storefront`, có thể nghĩ theo cụm flow chính: `home`, `catalog`, `search`, `cart`, `wishlist`, `auth`, `account`, `checkout`; mỗi cụm chỉ tách thêm `components/`, `hooks/`, `stores/`, `utils/` khi thực sự có logic riêng cần giữ private.

## 9.2. `admin`

Route baseline:

```text
app/(protected)/
  products/
  categories/
  inventory/
  orders/
```

Layout baseline:

- root layout
- protected layout
- shell layout cho sidebar/header/backoffice actions

Cây thư mục đầy đủ đề xuất:

```text
apps/admin/
├── app/
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [productId]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [categoryId]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   ├── adjustments/
│   │   │   │   └── page.tsx
│   │   │   └── [sku]/
│   │   │       └── page.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       └── [orderId]/
│   │           └── page.tsx
│   ├── layout.tsx
│   └── not-found.tsx
│   └── globals.css
├── src/
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   └── dashboard/
│   │   │   │       └── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── products/
│   │   │   ├── pages/
│   │   │   │   ├── product-list/
│   │   │   │   │   └── ProductListPage.tsx
│   │   │   │   ├── product-create/
│   │   │   │   │   └── ProductCreatePage.tsx
│   │   │   │   ├── product-detail/
│   │   │   │   │   └── ProductDetailPage.tsx
│   │   │   │   └── product-edit/
│   │   │   │       └── ProductEditPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   └── ProductTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProductFilters.ts
│   │   │   │   └── useProductMutations.ts
│   │   │   ├── stores/
│   │   │   │   └── products.store.ts
│   │   │   └── utils/
│   │   │       └── productForm.ts
│   │   ├── categories/
│   │   │   ├── pages/
│   │   │   │   ├── category-list/
│   │   │   │   │   └── CategoryListPage.tsx
│   │   │   │   ├── category-create/
│   │   │   │   │   └── CategoryCreatePage.tsx
│   │   │   │   └── category-edit/
│   │   │   │       └── CategoryEditPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── inventory/
│   │   │   ├── pages/
│   │   │   │   ├── inventory-list/
│   │   │   │   │   └── InventoryListPage.tsx
│   │   │   │   ├── inventory-detail/
│   │   │   │   │   └── InventoryDetailPage.tsx
│   │   │   │   └── inventory-adjustment/
│   │   │   │       └── InventoryAdjustmentPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   └── orders/
│   │       ├── pages/
│   │       │   ├── order-list/
│   │       │   │   └── OrderListPage.tsx
│   │       │   └── order-detail/
│   │       │       └── OrderDetailPage.tsx
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── stores/
│   │       └── utils/
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   └── AdminShellProvider.tsx
│   ├── lib/
│   │   ├── rbac.ts
│   │   └── table.ts
│   ├── config/
│   │   └── navConfig.ts
│   └── middleware/
│       └── authGuard.ts
└── package.json
```

Route trong `app/(protected)/*` chỉ làm nhiệm vụ mount page component từ `src/features/*/pages/**`, không nhét business logic vào route file.

## 9.3. `cms`

Route baseline:

```text
app/(protected)/
  hero-banner/
  homepage-sections/
  collection-landing/
  promotion-banner/
  seo-metadata/
  blog/
  campaign/
```

Layout baseline:

- root layout
- protected layout
- content editing shell layout

Cây thư mục đầy đủ đề xuất:

```text
apps/cms/
├── app/
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── hero-banner/
│   │   │   ├── page.tsx
│   │   │   └── [bannerId]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── homepage-sections/
│   │   │   ├── page.tsx
│   │   │   └── [sectionId]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── collection-landing/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── promotion-banner/
│   │   │   ├── page.tsx
│   │   │   └── [bannerId]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── seo-metadata/
│   │   │   ├── page.tsx
│   │   │   └── [pageKey]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [postId]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── campaign/
│   │       ├── page.tsx
│   │       ├── create/
│   │       │   └── page.tsx
│   │       └── [campaignId]/
│   │           └── edit/
│   │               └── page.tsx
│   ├── layout.tsx
│   └── not-found.tsx
│   └── globals.css
├── src/
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   └── dashboard/
│   │   │   │       └── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── hero-banner/
│   │   │   ├── pages/
│   │   │   │   ├── hero-banner-list/
│   │   │   │   │   └── HeroBannerListPage.tsx
│   │   │   │   └── hero-banner-edit/
│   │   │   │       └── HeroBannerEditPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── HeroBannerForm.tsx
│   │   │   │   └── HeroBannerPreview.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useHeroBannerMutations.ts
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── homepage-sections/
│   │   │   ├── pages/
│   │   │   │   ├── homepage-sections-list/
│   │   │   │   │   └── HomepageSectionsListPage.tsx
│   │   │   │   └── homepage-section-edit/
│   │   │   │       └── HomepageSectionEditPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── collection-landing/
│   │   │   ├── pages/
│   │   │   │   ├── collection-landing-list/
│   │   │   │   │   └── CollectionLandingListPage.tsx
│   │   │   │   └── collection-landing-edit/
│   │   │   │       └── CollectionLandingEditPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── promotion-banner/
│   │   │   ├── pages/
│   │   │   │   ├── promotion-banner-list/
│   │   │   │   │   └── PromotionBannerListPage.tsx
│   │   │   │   └── promotion-banner-edit/
│   │   │   │       └── PromotionBannerEditPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── seo-metadata/
│   │   │   ├── pages/
│   │   │   │   ├── seo-metadata-list/
│   │   │   │   │   └── SeoMetadataListPage.tsx
│   │   │   │   └── seo-metadata-edit/
│   │   │   │       └── SeoMetadataEditPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── blog/
│   │   │   ├── pages/
│   │   │   │   ├── blog-post-list/
│   │   │   │   │   └── BlogPostListPage.tsx
│   │   │   │   ├── blog-post-create/
│   │   │   │   │   └── BlogPostCreatePage.tsx
│   │   │   │   └── blog-post-edit/
│   │   │   │       └── BlogPostEditPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   └── campaign/
│   │       ├── pages/
│   │       │   ├── campaign-list/
│   │       │   │   └── CampaignListPage.tsx
│   │       │   ├── campaign-create/
│   │       │   │   └── CampaignCreatePage.tsx
│   │       │   └── campaign-edit/
│   │       │       └── CampaignEditPage.tsx
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── stores/
│   │       └── utils/
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   └── CmsEditorProvider.tsx
│   ├── lib/
│   │   ├── preview.ts
│   │   └── richText.ts
│   ├── config/
│   │   └── navConfig.ts
│   └── middleware/
│       └── authGuard.ts
└── package.json
```

Với `cms`, page component nên thiên về composition + editor shell; phần preview/editor-specific widget vẫn giữ private trong feature tương ứng, chỉ đẩy lên `packages/ui` nếu nó thực sự là primitive thuần UI.

## 10. Provider architecture

Mỗi app tối thiểu có:

- `app-providers.tsx`
- `query-provider.tsx`

`storefront` có thêm:

- `intl-provider.tsx`

Nguyên tắc:

- provider chung của app đặt tại `src/providers/`
- không nhét provider logic vào từng feature nếu nó là concern cấp app
- query client config được chuẩn hóa, không mỗi feature tự tạo client mới

## 11. Auth và authorization architecture

## 11.1. Auth baseline

- FE giữ JWT access token ngắn hạn trong memory và gửi bằng Bearer header
- opaque refresh token nằm trong cookie `HttpOnly`/`Secure`/`SameSite`; FE không đọc trực tiếp
- không lưu access/refresh token trong `localStorage`/`sessionStorage`
- `storefront`: access 10 phút; refresh idle 7 ngày; absolute 30 ngày
- `admin`/`cms`: access 5 phút; refresh idle 8 giờ; absolute 24 giờ
- mỗi app có registrable domain độc lập nhưng chỉ gọi same-origin `/api/*`; hosting/reverse proxy chuyển tiếp tới Backend
- refresh cookie là first-party, host-only theo app; không gọi trực tiếp cross-site Backend bằng cookie
- middleware và protected layout là UX gate
- backend là nơi enforce permission thật

## 11.2. App-specific auth

| App          | Baseline auth                                  |
| ------------ | ---------------------------------------------- |
| `storefront` | JWT access + refresh flow cho account/checkout |
| `admin`      | protected shell bắt buộc                       |
| `cms`        | protected shell bắt buộc                       |

## 11.3. Điều còn mở

- ~~RBAC thật cho `admin/cms`~~ — đã chốt: permission-based guard, 3 role MVP (`SUPER_ADMIN`/`ADMIN_STAFF`/`CMS_EDITOR`) — xem [`ADR 0013`](../00-core/adr/0013-permission-based-authorization-admin-cms.md) và `01-delivery/architecture/backend/rbac-matrix.md` (Decision `#78`).
- mapping role -> route visibility (FE đọc permission đã resolve qua endpoint kiểu `/staff/me`, chỉ dùng cho UX-layer show/hide — chưa map cụ thể route nào cần permission nào)
- spike xác nhận refresh/retry concurrency và protected-route bootstrapping

Vì vậy phần auth architecture hiện đã đủ khung, nhưng chưa được coi là fully closed ở mức permission detail.

## 12. Error, loading, empty architecture

## 12.1. Route-level

Mỗi app nên có baseline cho:

- loading state theo route segment
- error boundary theo route segment
- not-found handling khi hợp lý

## 12.2. Feature-level

Mỗi feature phải coi các state sau là bắt buộc:

- loading
- empty
- error
- success

Quy tắc:

- loading không làm nhảy layout quá mạnh
- empty phải có hướng dẫn hoặc CTA nếu phù hợp
- error phải có retry hoặc next action nếu có thể

## 12.3. App-specific emphasis

| App          | Ưu tiên                                |
| ------------ | -------------------------------------- |
| `storefront` | skeleton và optimistic UX hợp lý       |
| `admin`      | table empty/error states rõ ràng       |
| `cms`        | form save/error/preview states rõ ràng |

## 13. State ownership architecture

| Loại state            | Công cụ chính       | Ví dụ                                  |
| --------------------- | ------------------- | -------------------------------------- |
| URL state             | route/search params | filter, sort, pagination               |
| Server state          | TanStack Query      | product list, orders, CMS data         |
| Client state          | Zustand             | modal state, step state, UI-only flows |
| Local component state | React state         | input interaction ngắn hạn             |

Nguyên tắc cứng:

- không copy response API vào Zustand để làm cache phụ
- data fetch phải đi qua `api-sdk`
- query key phải có cấu trúc ổn định

### 13.1. Zustand devtools

Mỗi store `{feature}.store.ts` (Decision `#32`) bọc bằng middleware `devtools` có sẵn trong package `zustand` (`import { devtools } from "zustand/middleware"`), không cần cài package riêng — chỉ bật ở `development`:

```ts
export const useCartStore = create<ICartState>()(
  devtools((set) => ({ ... }), { enabled: process.env.NODE_ENV === "development", name: "cart" })
);
```

Dùng cùng Redux DevTools browser extension để xem lịch sử thay đổi state lúc dev. Không bật ở production build (tránh leak state qua devtools).

## 14. Module implementation checklist

Một feature được coi là đúng kiến trúc khi:

- có boundary rõ giữa page composition và reusable feature parts
- không gọi API trực tiếp bỏ qua `api-sdk`
- chỉ expose public API cần thiết
- không kéo shared UI vào feature rồi fork vô tội vạ
- loading/empty/error states được xử lý
- state ownership đúng lớp

## 15. Definition of Done cho FE architecture

Kiến trúc FE chỉ được coi là đủ chuẩn khi:

- 3 app có vai trò rõ và không chồng trách nhiệm
- module structure dùng thống nhất giữa các app
- import boundary rõ
- routing/layout/provider architecture rõ
- auth architecture rõ ở mức shell
- error/loading/empty architecture được coi là contract
- decision matrix đặt code ở đâu đã rõ

## 16. Design System

Đây là phần chốt riêng cho **design system** của Frontend website bán hàng.

Phạm vi design system trong dự án này bao gồm: design tokens, theme mapping, layout rules, component inventory, component state rules, accessibility baseline, icon/media rules, usage rules giữa `packages/ui`, `packages/commerce`, và app layer.

Không bao gồm: business flow chi tiết của catalog/cart/checkout, copywriting, CMS content model, backend contract.

### 16.1. Nguyên tắc chốt

| ID     | Nguyên tắc                                                                   | Trạng thái | Ghi chú                                                       |
| ------ | ---------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| DS-001 | Token là nguồn sự thật duy nhất cho style dùng chung                         | Đã chốt    | Không hard-code design value trong shared layer               |
| DS-002 | Shared UI chỉ chứa component thuần UI                                        | Đã chốt    | Nghiệp vụ commerce để ở `packages/commerce` khi thật sự share |
| DS-003 | Component variants đi qua `cva`                                              | Đã chốt    | Không tạo nhiều class rời rạc khó kiểm soát                   |
| DS-004 | Styling theo Tailwind v4 + CSS vars                                          | Đã chốt    | Mapping từ token qua `packages/tailwind-config`               |
| DS-005 | A11y là baseline, không phải optional                                        | Đã chốt    | Keyboard, focus, contrast, aria                               |
| DS-006 | Design system ưu tiên phục vụ `storefront`, nhưng không phá `admin` và `cms` | Đã chốt    | Layout và primitives dùng chung cho 3 app                     |
| DS-007 | `lucide-react` là icon library mặc định cho shared UI                        | Đã chốt    | Không trộn nhiều icon set ở Phase 0                           |

### 16.2. Token matrix

#### 16.2.1. Cấu trúc token bắt buộc

| Nhóm token  | Bắt buộc | Dùng cho                                         | Ghi chú                               |
| ----------- | -------- | ------------------------------------------------ | ------------------------------------- |
| Color       | Có       | text, surface, border, action, feedback          | Tách base và semantic                 |
| Spacing     | Có       | margin, padding, gap, section spacing            | Dùng scale thống nhất                 |
| Typography  | Có       | font family, size, line-height, weight, tracking | Phải support tiếng Việt               |
| Radius      | Có       | button, input, card, modal                       | Không hard-code theo component        |
| Shadow      | Có       | card, popover, modal, dropdown                   | Dùng theo elevation level             |
| Motion      | Có       | transition duration, easing, enter/exit          | Nhẹ, ưu tiên storefront               |
| Breakpoints | Có       | responsive layout                                | Dùng chung cho 3 app                  |
| Opacity     | Nên có   | disabled, overlay, skeleton                      | Có thể để cùng color/motion phase đầu |
| Z-index     | Nên có   | sticky, dropdown, modal, toast                   | Tránh z-index tự phát                 |

##### Breakpoint scale đã chốt

| Token | Min width | Ghi chú                                     |
| ----- | --------- | ------------------------------------------- |
| `sm`  | `640px`   | mobile lớn (Tailwind v4 default)            |
| `md`  | `768px`   | tablet dọc / small laptop bắt đầu rõ layout |
| `lg`  | `1024px`  | desktop cơ bản                              |
| `xl`  | `1280px`  | desktop rộng                                |
| `2xl` | `1536px`  | desktop lớn (Tailwind v4 default)           |

Quy tắc: không tạo breakpoint riêng cho từng app ở Phase 0; mọi responsive rule trong `storefront`, `admin`, `cms` phải bám cùng một scale này; utility có thể khác nhau giữa app, nhưng token breakpoint không đổi. Không override `--breakpoint-*` của Tailwind — xem Decision `#82`.

#### 16.2.2. Cấu trúc color token

| Tầng            | Ví dụ                                                                   | Mục đích                        |
| --------------- | ----------------------------------------------------------------------- | ------------------------------- |
| Base token      | `gray-100`, `gray-900`, `blue-600`                                      | Giá trị nền                     |
| Semantic token  | `surface-default`, `text-primary`, `border-subtle`, `action-primary-bg` | Ánh xạ để component dùng        |
| Component alias | `button-primary-bg`, `input-border-focus`                               | Chỉ tạo khi semantic chưa đủ rõ |

Quy tắc: component ưu tiên dùng `semantic token`; chỉ tạo `component alias` khi nhiều component cần cùng một nghĩa đặc thù; không cho feature layer gọi trực tiếp base token nếu đang ở shared layer.

#### 16.2.3. Semantic token tối thiểu

| Nhóm     | Token tối thiểu cần có                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| Surface  | `surface-default`, `surface-subtle`, `surface-inverse`, `surface-overlay`                                         |
| Text     | `text-primary`, `text-secondary`, `text-muted`, `text-inverse`, `text-disabled`                                   |
| Border   | `border-default`, `border-subtle`, `border-strong`, `border-focus`, `border-error`                                |
| Action   | `action-primary-bg`, `action-primary-fg`, `action-primary-bg-hover`, `action-secondary-bg`, `action-secondary-fg` |
| Feedback | `success`, `warning`, `danger`, `info` cùng foreground/background/border tương ứng                                |

### 16.3. Typography rules

| Hạng mục       | Quy định                                                  |
| -------------- | --------------------------------------------------------- |
| Font family    | `Be Vietnam Pro` cho body và heading mặc định             |
| Font scale     | Dùng scale cố định cho `xs` đến `5xl`                     |
| Line height    | Phải an toàn cho tiếng Việt, nhất là uppercase            |
| Letter spacing | Chỉ dùng có chủ đích cho heading hoặc badge               |
| Font weight    | Chuẩn hóa các mốc `regular`, `medium`, `semibold`, `bold` |
| Locale         | Không tạo typography token riêng theo locale ở Phase 0    |

#### Typography baseline đã chốt

| Token        | Font size | Line height | Weight mặc định |
| ------------ | --------- | ----------- | --------------- |
| `body-sm`    | `14px`    | `20px`      | `400`           |
| `body-md`    | `16px`    | `24px`      | `400`           |
| `body-lg`    | `18px`    | `28px`      | `400`           |
| `label-sm`   | `12px`    | `16px`      | `500`           |
| `label-md`   | `14px`    | `20px`      | `500`           |
| `title-sm`   | `20px`    | `28px`      | `600`           |
| `title-md`   | `24px`    | `32px`      | `600`           |
| `title-lg`   | `30px`    | `38px`      | `700`           |
| `display-sm` | `36px`    | `44px`      | `700`           |

### 16.4. Layout và responsive rules

#### 16.4.1. Layout primitives bắt buộc

| Primitive   | Mục đích                             | Thuộc package |
| ----------- | ------------------------------------ | ------------- |
| `Container` | khống chế max-width và padding ngang | `packages/ui` |
| `Section`   | nhịp dọc cho page sections           | `packages/ui` |
| `Stack`     | xếp dọc có gap thống nhất            | `packages/ui` |
| `Inline`    | xếp ngang đơn giản                   | `packages/ui` |
| `Grid`      | layout lưới responsive               | `packages/ui` |
| `Cluster`   | nhóm tag, badge, action nhỏ          | `packages/ui` |

#### 16.4.2. Responsive baseline

| Hạng mục           | Quy định chốt                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Breakpoint source  | Tailwind default (không override trong `theme.css`) — `packages/design-tokens` đã gỡ, Decision #93 |
| Container behavior | `storefront` dùng container rõ theo viewport, `admin/cms` ưu tiên fluid layout                     |
| Grid usage         | Product grid, collection grid, dashboard cards phải dùng primitive hoặc utility chuẩn              |
| Spacing scale      | Tăng theo viewport nhưng không tạo scale riêng cho từng app                                        |
| Mobile-first       | Bắt buộc                                                                                           |

#### 16.4.3. Container width đã chốt

| Breakpoint | Max width container | Horizontal padding |
| ---------- | ------------------- | ------------------ |
| `xs`       | `100%`              | `16px`             |
| `sm`       | `100%`              | `20px`             |
| `md`       | `720px`             | `24px`             |
| `lg`       | `960px`             | `24px`             |
| `xl`       | `1200px`            | `32px`             |
| `2xl`      | `1280px`            | `32px`             |

Quy tắc: `storefront` dùng `Container` với bảng trên làm baseline; `admin`/`cms` có thể fluid, nhưng spacing ngang vẫn đi theo token tương ứng; không tạo container width ngẫu hứng ở từng page.

#### 16.4.4. Grid baseline cho storefront

| Use case               | Mobile  | Tablet  | Desktop        |
| ---------------------- | ------- | ------- | -------------- |
| Product list grid      | `2 cột` | `3 cột` | `4 cột`        |
| Collection hero blocks | `1 cột` | `2 cột` | `2 hoặc 3 cột` |
| CMS content cards      | `1 cột` | `2 cột` | `3 cột`        |
| Admin summary cards    | `1 cột` | `2 cột` | `4 cột`        |

### 16.5. Component inventory

#### 16.5.1. Primitive UI tối thiểu phải có

| Nhóm            | Component tối thiểu                                                        |
| --------------- | -------------------------------------------------------------------------- |
| Actions         | `Button`, `IconButton`                                                     |
| Form foundation | `Label`, `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `Select` |
| Overlay         | `Dialog`, `Drawer` hoặc `Sheet`, `Popover`, `Tooltip`                      |
| Feedback        | `Alert`, `InlineError`, `Spinner`, `Skeleton`, `EmptyState`                |
| Navigation      | `Tabs`, `Breadcrumb`, `Pagination`                                         |
| Surfaces        | `Card`, `Divider`, `Badge`                                                 |
| Layout helpers  | `Container`, `Section`, `Stack`, `Grid`                                    |

#### 16.5.2. Commerce-shared component nên có sau primitive

| Component          | Thuộc package       | Ghi chú                        |
| ------------------ | ------------------- | ------------------------------ |
| `ProductCard`      | `packages/commerce` | dùng ở storefront là chính     |
| `ProductPrice`     | `packages/commerce` | format price thống nhất        |
| `ProductGallery`   | `packages/commerce` | chỉ share nếu thật sự tái dùng |
| `QuantitySelector` | `packages/commerce` | tránh duplicate ở cart/PDP     |
| `RatingDisplay`    | `packages/commerce` | nếu business có review/rating  |

#### 16.5.3. Không nên đưa vào shared quá sớm

- page section đặc thù campaign
- hero banner đặc thù từng landing page
- widget chỉ xuất hiện ở một flow duy nhất
- checkout step business-heavy

### 16.6. Component state matrix

| State           | Bắt buộc cho                     | Ghi chú                                 |
| --------------- | -------------------------------- | --------------------------------------- |
| `default`       | tất cả component                 | trạng thái nền                          |
| `hover`         | desktop interactive components   | không dùng như nguồn thông tin duy nhất |
| `active`        | button, tabs, item selectable    | phản hồi khi tương tác                  |
| `focus-visible` | tất cả interactive components    | bắt buộc cho keyboard                   |
| `disabled`      | input, button, select            | phải có cả visual và semantic           |
| `loading`       | button, async blocks, list/table | không làm layout nhảy quá mạnh          |
| `error`         | form controls, async blocks      | gắn với message rõ ràng                 |
| `selected`      | tabs, radio, selectable cards    | tách với hover                          |
| `empty`         | list/table/result areas          | có guidance phù hợp                     |

Quy tắc: `focus-visible` phải có token riêng hoặc semantic token đủ rõ; `disabled` không chỉ giảm opacity mù quáng nếu làm giảm contrast quá mức; `loading`, `empty`, `error` phải được coi là một phần của component contract.

### 16.7. Accessibility baseline

| Chủ đề             | Chuẩn tối thiểu                                   |
| ------------------ | ------------------------------------------------- |
| Keyboard           | mọi interactive component dùng được bằng bàn phím |
| Focus              | có `focus-visible` rõ ràng, không bị cắt          |
| Contrast           | text và control states phải đạt contrast phù hợp  |
| Aria               | dùng aria khi native semantic chưa đủ             |
| Labeling           | input/select/checkbox/radio phải có label rõ      |
| Error announcement | form error nên có liên kết với field              |
| Modal behavior     | trap focus, close bằng keyboard, restore focus    |
| Tooltip/popover    | không che mất luồng keyboard chính                |

#### Focus ring baseline đã chốt

| Hạng mục        | Giá trị chốt                                               |
| --------------- | ---------------------------------------------------------- |
| Kích thước ring | `2px`                                                      |
| Offset          | `2px` trên surface sáng, `1px` nếu control quá nhỏ         |
| Màu             | semantic token `border-focus` hoặc `focus-ring`            |
| Trigger         | dùng `:focus-visible`, không style mọi `:focus` giống nhau |
| Cấm             | không bỏ focus ring mà không có thay thế tương đương       |

#### Contrast baseline đã chốt

| Loại                     | Chuẩn làm việc                                         |
| ------------------------ | ------------------------------------------------------ |
| Body text                | tối thiểu theo mức AA thông thường                     |
| Interactive control text | phải đọc rõ ở mọi state quan trọng                     |
| Disabled state           | không dùng opacity quá thấp làm mất khả năng nhận biết |
| Focus state              | phải nhìn ra ngay trên cả nền sáng và nền ảnh          |

### 16.8. Icon và media rules

| Hạng mục            | Quy định                                                            |
| ------------------- | ------------------------------------------------------------------- |
| Icon library        | `lucide-react` là nguồn icon mặc định cho `packages/ui` và `apps/*` |
| Icon size           | Dùng 3 mốc chuẩn `16`, `20`, `24`                                   |
| Icon usage          | Icon không thay thế hoàn toàn label nếu hành động không hiển nhiên  |
| Product image ratio | Chốt ratio chuẩn theo card/PDP để tránh layout shift                |
| Placeholder         | Có placeholder thống nhất cho image loading/error                   |
| Empty illustration  | Chỉ dùng khi thực sự giúp hiểu trạng thái, không lạm dụng           |

#### Quy tắc icon đã chốt

| Hạng mục      | Giá trị chốt                                            |
| ------------- | ------------------------------------------------------- |
| Package       | `lucide-react`                                          |
| Stroke width  | giữ mặc định của lib, không custom bừa ở từng component |
| Size `sm`     | `16px`                                                  |
| Size `md`     | `20px`                                                  |
| Size `lg`     | `24px`                                                  |
| Color source  | lấy từ semantic token của text hoặc action              |
| Nơi wrap icon | nếu cần wrapper chung thì đặt ở `packages/ui`           |

#### Image ratio baseline đã chốt

| Use case                | Ratio  | Ghi chú                                       |
| ----------------------- | ------ | --------------------------------------------- |
| Product card image      | `4:5`  | ưu tiên ecommerce fashion/general merchandise |
| PDP main gallery image  | `4:5`  | thống nhất với card để giảm lệch ảnh          |
| PDP thumbnail           | `1:1`  | dễ sắp thumbnail strip                        |
| Collection/banner image | `16:9` | cho hero và promo section                     |
| Category tile           | `1:1`  | ổn định grid nhỏ                              |

Quy tắc: dùng ratio box hoặc `next/image` container ổn định để tránh layout shift; nếu business sau này là điện máy hoặc furniture và ratio khác rõ rệt, update ở một quyết định riêng thay vì tự sửa từng màn.

#### Placeholder và empty media baseline

| Hạng mục           | Quy định chốt                                     |
| ------------------ | ------------------------------------------------- |
| Image loading      | dùng skeleton theo ratio thật của vùng ảnh        |
| Image error        | fallback nền trung tính + icon ảnh + label ngắn   |
| Empty illustration | chỉ dùng cho trạng thái cấp trang hoặc module lớn |
| Inline empty       | ưu tiên icon + heading + body text ngắn           |

#### Z-index scale đã chốt

| Token        | Giá trị |
| ------------ | ------- |
| `z.base`     | `0`     |
| `z.sticky`   | `10`    |
| `z.dropdown` | `20`    |
| `z.popover`  | `20`    |
| `z.overlay`  | `30`    |
| `z.drawer`   | `40`    |
| `z.modal`    | `40`    |
| `z.toast`    | `50`    |
| `z.debug`    | `60`    |

Quy tắc: không set `z-[9999]` tùy tiện trong app layer; dropdown/popover không được vượt modal; toast được phép nổi trên modal overlay nhưng không che nút đóng modal.

### 16.9. Usage rules theo layer

| Layer                      | Được phép                                  | Không được phép                     |
| -------------------------- | ------------------------------------------ | ----------------------------------- |
| `packages/design-tokens`   | token definitions                          | component, business logic           |
| `packages/tailwind-config` | theme mapping, plugin config               | business styling đặc thù            |
| `packages/ui`              | primitives, layout, UI-only patterns       | commerce flow logic                 |
| `packages/commerce`        | reusable commerce components               | API call trực tiếp, page logic nặng |
| `apps/*`                   | page composition, feature-specific styling | bypass shared contract bừa bãi      |

### 16.10. Tài liệu prove component

Trạng thái hiện tại: Storybook chưa được chốt dùng ngay ở Phase 0; baseline prove component hiện tại vẫn là doc trong repo, example usage trong app shell, và test bằng Vitest/Playwright.

Quy tắc chốt: chưa bắt buộc tạo Storybook trước khi scaffold; nếu số lượng component shared tăng nhanh, Storybook nên được mở như một task riêng.

### 16.11. Definition of Done cho design system

Design system chỉ được coi là **đủ dùng cho execution** khi:

- token matrix đã định nghĩa rõ base và semantic layers
- typography rules đủ để render tiếng Việt ổn định
- layout primitives đã được chốt
- primitive inventory tối thiểu đã được chốt
- state matrix cho component interactive đã rõ
- loading, empty, error states được xem là contract bắt buộc
- accessibility baseline được ghi thành rule, không chỉ nói chung chung
- rule phân tầng giữa `ui`, `commerce`, và app layer đã rõ

### 16.12. Gap còn lại

- quyết định có mở Storybook sớm hay không
- viết code scaffold thật cho token, primitives và examples
- tinh chỉnh nhỏ nếu UI mock thực tế cho thấy cần đổi spacing hoặc grid density

### 16.13. Khuyến nghị thực thi

Thứ tự làm phù hợp nhất: dựng `packages/design-tokens` → dựng `packages/tailwind-config` → dựng `packages/ui` với primitives và layout helpers → prove trong `apps/storefront` → chỉ khi có reuse thật mới đẩy component sang `packages/commerce`.

## 17. Kết luận thực thi

Sau file này:

- `FE.md` giữ vai trò master doc tổng quan — mục tiêu, quyết định, stack, delivery order
- `FE-ARCHITECTURE.md` (file này) chốt kiến trúc chạy thật cho 3 app, module chung, package responsibilities, và design system
- `FE-EXECUTION.md` chốt foundation checklist, bootstrap steps, version matrix, và Definition of Done

Như vậy bộ FE docs hiện có đủ 3 lớp tài liệu chính để bắt đầu scaffold và build Frontend theo cùng một kiến trúc, thay vì để mỗi app tự phát triển theo một kiểu khác nhau.
