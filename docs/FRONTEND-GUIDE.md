# Frontend Guide

> Tài liệu Frontend duy nhất cho `storefront`, `admin`, `cms` trong Turborepo.
> Mục tiêu: dev đọc nhanh, biết chạy project, đặt code ở đâu, dùng package nào, test gì và khi nào được coi là DONE.

---

## 1. Quick Start

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

Ba app:
- `storefront`: khách hàng, SEO, performance, i18n, commerce.
- `admin`: vận hành nội bộ, CRUD/table/filter/form.
- `cms`: content/marketing, authoring/preview/SEO metadata.

Core rules:
1. Turborepo + pnpm workspace + Next.js App Router + TypeScript strict.
2. Foundation trước, feature sau.
3. Mock-first + contract-first.
4. Mọi API call đi qua `@repo/api-sdk`.
5. Server state = TanStack Query; client/UI state = Zustand; URL state = search params.
6. Shared UI không chứa business logic.
7. Không barrel `index.ts`; export package bằng subpath.
8. Không import sâu `@repo/*/src/*`.
9. Không import private implementation xuyên feature.
10. Shared package chỉ tạo khi có reuse thật.

Dependency direction:

```text
app route/layout
    ↓
feature / app-local code
    ↓
ui / commerce / hooks / utils
    ↓
api-sdk
    ↓
schemas
```

---

## 2. Repository Structure

```text
FE/
├── apps/
│   ├── storefront/
│   ├── admin/
│   └── cms/
├── packages/
│   ├── tailwind-config/
│   ├── ui/
│   ├── commerce/
│   ├── schemas/
│   ├── api-sdk/
│   ├── hooks/
│   ├── utils/
│   ├── eslint-config/
│   └── ts-config/
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── pnpm-lock.yaml
├── .npmrc
├── .gitignore
├── .editorconfig
├── lint-staged.config.js
└── commitlint.config.js
```

Không tạo:

```text
packages/layouts/
packages/design-tokens/
```

`packages/design-tokens` là scaffold cũ đã bị supersede; theme/token canonical hiện nằm trong `packages/tailwind-config`.

`pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

Root scripts baseline:

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "clean": "turbo run clean"
  }
}
```

`.npmrc`:

```ini
save-exact=true
auto-install-peers=true
strict-peer-dependencies=false
```

---

## 3. Stack

| Nhóm | Công nghệ |
|---|---|
| Workspace | Turborepo, pnpm |
| App | Next.js App Router, React |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4, CSS variables |
| UI | Radix UI, cva, clsx, tailwind-merge, lucide-react |
| Contract | Zod |
| Mock API | MSW |
| Server state | TanStack Query |
| Client state | Zustand |
| Forms | react-hook-form + zodResolver |
| i18n | next-intl, storefront only |
| Unit/Integration | Vitest, jsdom, Testing Library |
| E2E | Playwright |
| Storefront PDP 3D | three, react-three-fiber, drei |
| Storefront PWA | @ducanh2912/next-pwa, production only |

Version policy:
- Pin exact version ở scaffold commit đầu tiên.
- Không dùng `latest` trôi nổi.
- `pnpm-lock.yaml` là source of truth thực tế sau scaffold.
- Upgrade theo batch: tooling / runtime / data-state / styling-ui / test.

---

## 4. Package Responsibilities

### `@repo/tailwind-config`
Source of truth cho theme/design tokens: colors, semantic colors, spacing, typography, radius, shadow, motion, breakpoints, Tailwind mapping.

**Rule:** không tạo token source khác song song.

### `@repo/ui`
UI thuần + layout primitives.

Ví dụ:
```text
Button Input Label Dialog Tabs Tooltip Spinner EmptyState
Container Grid Stack Section
```

Không chứa:
```text
ProductCard CartSummary OrderWorkflow CMS business logic
```

### `@repo/commerce`
Commerce component **đã có reuse thật**.

Ví dụ:
```text
ProductPrice SizeSelector ColorSelector QuantitySelector OrderTimeline
```

Rule: mới có một consumer → giữ local.

### `@repo/schemas`
Zod schemas cho contract/runtime validation.

```text
common/
auth/
catalog/
cart/
wishlist/
account/
checkout/
admin/
cms/
errors/
```

Dùng cho API contract và form validation khi phù hợp. Sau API v1 handshake, transport schema phải bám versioned OpenAPI artifact từ backend.

### `@repo/api-sdk`
Network entrypoint duy nhất.

```text
src/
├── client/       # private HTTP infrastructure
├── auth/
├── catalog/
├── cart/
├── wishlist/
├── account/
├── checkout/
├── admin/
├── cms/
├── mocks/
└── config/
```

Public import:
```ts
import { getProducts } from '@repo/api-sdk/catalog';
```

Không:
```ts
fetch('/api/products');
import x from '@repo/api-sdk/src/client/x';
```

### `@repo/hooks`
Chỉ hook cross-app/cross-feature thật sự: query key factory, pagination, session, currency, media query...

### `@repo/utils`
Pure helpers: formatter, parser, guard, string/object helper. Không React hook, UI hay network call.

Storefront i18n helper:
```text
packages/utils/src/i18n/
  locales.ts
  localized-text.ts
  fallback.ts
```

### `@repo/eslint-config`
Shared lint baseline: TypeScript, React/Next, import order, a11y, `import type`, hạn chế `any`.

Folder boundary riêng của từng app được cấu hình trong `eslint.config.mjs` của app.

### `@repo/ts-config`

```text
base.json
nextjs.json
react-library.json
```

Baseline:
```text
strict=true
noImplicitAny=true
verbatimModuleSyntax=true
moduleResolution=Bundler
noEmit=true
```

---

## 5. App Structure

### Storefront
Storefront được phép giữ route-group convention hiện hữu:

```text
src/app/[locale]/(group)/_lib/**
```

Không ép refactor sang `features/{feature}/pages` chỉ để giống app khác. Boundary tương đương phải được enforce bằng ESLint.

### Admin / CMS
Baseline:

```text
src/features/{feature}/
├── pages/       # public entry cho app routes
├── components/  # private
├── hooks/       # private
├── stores/      # private
└── utils/       # private
```

Chỉ tạo folder khi thật sự cần.

---

## 6. Import & Boundary Rules

Allowed:
```text
app → feature
app → shared package
feature → shared package
commerce → ui
api-sdk → schemas
```

Forbidden:
```text
package → app
feature A → private implementation của feature B
feature → direct backend fetch
schemas → api-sdk
app → @repo/package/src/*
```

Alias:
```text
@/*
@/features/*
@repo/*
```

Không dùng `../../../...`; relative import cùng cấp/con như `./foo` được phép.

Không barrel `index.ts`; package export subpath bằng `package.json#exports`.

---

## 7. Naming

- Interface: `IProduct`.
- Component/file: `ProductCard.tsx`.
- Hook/file: `useProduct.ts`.
- Route folder: `kebab-case`.
- Store: `cart.store.ts`.
- Utility/config: `camelCase`.
- Constant: `SCREAMING_SNAKE_CASE`.
- Type alias: `PascalCase`, không prefix.
- Boolean: `is*`, `has*`, `should*`.
- Event prop: `on*`; internal handler: `handle*`.
- Không TypeScript `enum`; dùng string union hoặc `as const`.

---

## 8. State Ownership

| Loại state | Công cụ |
|---|---|
| filter/sort/pagination | URL/search params |
| server/API data | TanStack Query |
| shared client/UI state | Zustand |
| local interaction | React state |

Không copy API response từ TanStack Query sang Zustand để làm cache phụ.

Zustand devtools chỉ bật ở development.

---

## 9. API Workflow

```text
Requirement
  ↓
Zod schema
  ↓
@repo/api-sdk
  ↓
MSW fixture + handler
  ↓
TanStack Query / mutation
  ↓
Feature UI
  ↓
Tests
  ↓
Real API
```

Mục tiêu: chuyển mock → real API mà không rewrite component.

Env baseline:

```env
NEXT_PUBLIC_API_MOCKING=true
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Storefront:

```env
NEXT_PUBLIC_DEFAULT_LOCALE=vi
NEXT_PUBLIC_SUPPORTED_LOCALES=vi,en
```

---

## 10. i18n

Storefront:
- locales: `vi`, `en`.
- default: `vi`.
- thiếu translation → fallback `vi`.
- typography dùng chung mọi locale.
- `SUPPORTED_LOCALES` là source of truth.

Admin/CMS UI chrome: tiếng Việt.

---

## 11. Auth & Authorization

Current architecture:
- access JWT ngắn hạn giữ trong memory.
- gửi access token bằng Bearer header.
- opaque refresh token nằm trong `HttpOnly`/`Secure`/`SameSite` cookie.
- không lưu access/refresh token trong `localStorage`/`sessionStorage`.
- app gọi same-origin `/api/*`; reverse proxy chuyển tiếp backend.
- middleware/protected layout chỉ là UX gate.
- backend enforce permission thật.

Admin/CMS permission-based roles được tài liệu ghi nhận:
```text
SUPER_ADMIN
ADMIN_STAFF
CMS_EDITOR
```

Cần spike trước khi build auth sâu:
- refresh/retry concurrency.
- protected-route bootstrapping.
- permission → route visibility.

Một số wording auth trong docs cũ khác kiến trúc trên; khi implement phải theo ADR/architecture mới nhất + kết quả spike.

---

## 12. Providers

Mỗi app:
```text
src/providers/
├── app-providers.tsx
└── query-provider.tsx
```

Storefront thêm:
```text
intl-provider.tsx
```

Một app chỉ có một QueryClient baseline; không để mỗi feature tự tạo client.

---

## 13. Loading / Empty / Error

Mỗi feature phải có:
```text
loading
empty
error
success
```

Route-level dùng `loading.tsx`, `error.tsx`, `not-found.tsx` khi phù hợp.

Rules:
- loading không gây layout shift lớn.
- empty có hướng dẫn/CTA khi phù hợp.
- error có retry hoặc next action khi có thể.

---

## 14. UI Contract

### Design language
- Storefront: retail editorial/sport, photographic, product-led.
- Admin/CMS: workbench/utilitarian.

### Typography
Duy nhất: **Be Vietnam Pro** cho body và display; không đổi font theo locale.

### Colors
Canonical trong `packages/tailwind-config`.
- `brand`: price/sale/promotion.
- primary CTA: `primary` / `primary-foreground`, không dùng `brand` mặc định.
- `accent`: highlight UI phi thương mại.
- surface dùng semantic warm-neutral tokens; không hard-code `bg-white` cho shared surface.

### CTA
- Động từ ngắn, rõ hành động: `Mua ngay`, `Xem sản phẩm`, `Xem bộ sưu tập`.
- Không dùng CTA mơ hồ nếu có wording cụ thể hơn.
- CTA/clickable label không wrap ở breakpoint bắt buộc.

### Honest UI
Không hiển thị như production evidence nếu không có nguồn thật:
- testimonial.
- rating/review count.
- customer count.
- metric/claim marketing.

Mock data được phép trong dev/test nhưng không được giả làm proof production.

---

## 15. Storefront Homepage

Tránh template lặp:
```text
hero → equal grids → equal benefit cards → testimonial cards → SaaS footer
```

Preferred structure:
1. Retail masthead/category-led header.
2. Photographic hero, bias trái.
3. Featured categories: rail/asymmetric layout.
4. Flash Sale: treatment riêng.
5. Best Sellers: product grid chính.
6. New Arrivals: editorial strip/spotlight.
7. Service benefits: typographic strip.
8. Testimonials: chỉ khi có dữ liệu thật.
9. Newsletter-first/brand-statement footer.

Không:
- căn giữa nhiều section liên tiếp.
- `hover:scale-105` cho mọi card.
- `transition-all` trong shared Button.

Dùng `tabular-nums` cho price/rating/quantity/date/metric dạng bảng khi phù hợp.

Brand name duy nhất: `ANTIGRAVITY.STORE`.

---

## 16. Accessibility & Responsive

Breakpoint kiểm tra bắt buộc:
```text
320 / 375 / 414 / 768 / 1440 px
```

Manual checks:
- keyboard-only navigation.
- focus order/visibility.
- reduced motion.
- contrast.
- không horizontal overflow.
- clickable label không wrap sai.

Interactive component nên có:
```text
default / hover / focus / active / disabled / loading nếu applicable
```

---

## 17. Performance

Storefront target:
```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
Lighthouse > 95
```

Admin/CMS:
```text
LCP < 4s
INP < 500ms
```

Rules:
- tránh over-fetching.
- shared primitives gọn.
- typography support Vietnamese glyphs.
- Three.js chỉ ở PDP và lazy-load qua `next/dynamic({ ssr: false })`.
- PWA chỉ production; MSW service worker dùng dev/mock mode.

---

## 18. Testing

Unit/Integration:
- Vitest.
- jsdom.
- Testing Library + user-event.

Ưu tiên test:
- schemas.
- pure utils.
- API adapters/mappers.
- business rules.
- component behavior quan trọng.

E2E: Playwright.

Smoke baseline:
- homepage.
- navigation.
- primary CTA.
- core commerce route.
- auth/protected shell khi sẵn sàng.

Visual checks tại:
```text
320 / 375 / 414 / 768 / 1440
```

---

## 19. Git Quality Gates

Dùng Husky + lint-staged + commitlint + Conventional Commits.

Pre-commit:
```bash
pnpm lint-staged
```

Commit examples:
```text
feat: add product filters
fix: handle empty cart
refactor: simplify query keys
test: cover checkout validation
docs: update frontend guide
```

Không bắt buộc full test suite ở pre-commit; full checks chạy riêng/CI.

---

## 20. Foundation Checklist

Chỉ bắt đầu feature nghiệp vụ lớn sau khi foundation pass.

- [ ] Root Turborepo workspace.
- [ ] Shared TS config.
- [ ] Shared ESLint/format setup.
- [ ] `tailwind-config` + canonical theme/tokens.
- [ ] `schemas`.
- [ ] `api-sdk` + mock adapter + MSW.
- [ ] `ui` primitives/layout.
- [ ] `utils` baseline.
- [ ] `hooks` boundary.
- [ ] `commerce` boundary.
- [ ] storefront shell + locale routing.
- [ ] admin protected shell.
- [ ] cms protected shell.
- [ ] Vitest boot.
- [ ] Playwright boot.

Verification:

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

Foundation DONE khi:
- 3 app boot local.
- storefront `/vi` và `/en` chạy.
- app import được schema.
- app render được shared UI.
- mock endpoint chạy qua api-sdk.
- không direct backend fetch ngoài api-sdk.
- không dùng Zustand làm server cache.
- package boundary không leak internals.

---

## 21. Delivery Order

Sau Foundation:

```text
1. Catalog browse
2. PDP
3. Search
4. Cart / Wishlist
5. Auth / Account
6. Checkout
7. Admin features
8. CMS features
9. Hardening
```

---

## 22. Feature PR Checklist

Architecture:
- [ ] Code đặt đúng app/package.
- [ ] Không private cross-feature import.
- [ ] Không direct fetch.
- [ ] Không duplicate server cache trong Zustand.
- [ ] Không premature shared abstraction.

States:
- [ ] loading.
- [ ] empty.
- [ ] error.
- [ ] success.

Quality:
- [ ] lint.
- [ ] typecheck.
- [ ] relevant tests.
- [ ] responsive check.
- [ ] keyboard/focus check nếu có interaction.

API:
- [ ] schema rõ.
- [ ] endpoint typed.
- [ ] MSW handler nếu cần mock mode.
- [ ] error handling có retry/next action khi phù hợp.

---

## 23. Red Flags

Dừng và xem lại architecture nếu thấy:

```text
feature gọi fetch trực tiếp
API response copy sang Zustand
feature A import private file feature B
packages/ui chứa business logic
component được đẩy lên commerce khi chưa reuse
services/ chỉ để wrap api-sdk
constants/ folder xuất hiện hàng loạt
barrel index.ts
app import @repo/package/src/*
Admin/CMS feature sâu trước foundation
auth orchestration sâu trước auth spike
```

---

## 24. Decision Matrix: Đặt Code Ở Đâu?

| Code | Nơi đặt |
|---|---|
| UI primitive | `packages/ui` |
| Commerce component đã reuse | `packages/commerce` |
| API call typed | `packages/api-sdk` |
| Contract/validation | `packages/schemas` |
| Pure helper đa app | `packages/utils` |
| Hook đa app/cross-feature | `packages/hooks` |
| Business/page logic một domain | app-local feature/route lib |
| Route/layout/provider | app tương ứng |
| Theme/token/Tailwind | `packages/tailwind-config` |
| TS baseline | `packages/ts-config` |
| Shared lint baseline | `packages/eslint-config` |

Rule cuối:

```text
Chỉ thuộc một nơi? → giữ local.
UI thuần? → ui.
Commerce và đã reuse? → commerce.
Gọi backend? → api-sdk.
Validate contract? → schemas.
Pure helper đa nơi? → utils.
Hook đa nơi? → hooks.
```

**Ưu tiên local trước, shared sau khi có bằng chứng reuse.**

---

## 25. Current vs Historical Decisions

Các docs cũ có một số phần đã bị supersede. File này chuẩn hóa theo trạng thái mới hơn:

1. `packages/design-tokens` **không dựng lại**; `tailwind-config` là canonical theme/token source.
2. Folder-specific ESLint boundaries nằm ở từng app, shared ESLint chỉ giữ baseline reusable.
3. Storefront được giữ route-group `_lib/**` structure, không bắt buộc `features/{feature}/pages`.
4. Auth implementation theo architecture/ADR mới nhất + auth spike; không copy nguyên wording auth cũ.
5. Lockfile/package manifests là source of truth thực tế cho version sau scaffold.

---

## 26. Definition of Done Toàn Foundation

Workspace:
- [ ] `pnpm install`.
- [ ] `pnpm build`.
- [ ] `pnpm lint`.
- [ ] `pnpm typecheck`.
- [ ] `pnpm test`.

Apps:
- [ ] storefront boot.
- [ ] admin boot.
- [ ] cms boot.
- [ ] storefront locale routing boot.

Packages:
- [ ] theme/tokens shared hoạt động.
- [ ] schemas import được.
- [ ] api-sdk mock mode chạy.
- [ ] UI primitive render được.
- [ ] exports không leak private internals.

Architecture:
- [ ] không raw backend fetch ngoài api-sdk.
- [ ] không server cache trong Zustand.
- [ ] không reverse dependency package → app.
- [ ] ESLint boundaries hoạt động.

Test harness:
- [ ] Vitest boot.
- [ ] Playwright boot.

Nếu thiếu bất kỳ mục nào: trạng thái là **Foundation đang triển khai**, chưa phải DONE.

---

## 27. Source Notes

Tài liệu này được hệ thống lại từ:
- `README.md`
- `FE.md`
- `FE-ARCHITECTURE.md`
- `FE-EXECUTION.md`
- `FE-UI-DESIGN-CONTRACT.md`
- `FE-UI-IMPROVEMENT-PLAN.md`

ADR/decision log vẫn là nơi tra cứu lịch sử và lý do khi cần; developer bình thường dùng file này làm entry point chính.
