# FE

Đây là tài liệu chính để làm Frontend.

Mục tiêu của file này là đủ cụ thể để bắt đầu scaffold và build FE thật, không chỉ dừng ở mức định hướng.

## 1. Trạng thái quyết định

- `Đã chốt`: đã có trong `00-core/decision-log.md` hoặc ADR
- `Đề xuất`: hợp lý để scaffold ngay, nhưng chưa thấy được chốt bằng decision riêng
- `Mở`: còn phụ thuộc quyết định khác, không nên tự khẳng định là final

## 2. Hiện trạng

Tính đến Thứ Tư, ngày 29 tháng 7 năm 2026:

- Repo hiện chủ yếu là tài liệu
- Chưa có scaffold code thật cho `apps/*` và `packages/*`
- Hướng FE đã khá rõ, nhưng codebase chưa bắt đầu

## 3. Mục tiêu FE

Frontend phải phục vụ 3 ứng dụng:

- `storefront`
- `admin`
- `cms`

và phải thỏa đồng thời các mục tiêu sau:

- build theo `foundation-first`
- phát triển theo `mock-first`
- dùng `contract-first`
- không rewrite component khi đổi từ mock API sang real API
- giữ ranh giới rõ giữa shared package và feature-specific code

## 4. Stack FE đề xuất

## 4.1. Runtime và workspace

- `Đã chốt` `Turborepo`
- `Đề xuất` `pnpm workspace`
- `Đề xuất` `Node.js LTS`
- `Đề xuất` `TypeScript strict`

Lý do:

- Turborepo đã được chốt ở Decision `#4`
- `pnpm workspace` phù hợp với monorepo nhiều package, cài nhanh và dedupe tốt
- `TypeScript strict` đã được chốt ở Decision `#46`

## 4.2. Framework app

- `Đề xuất` `Next.js App Router` cho cả `storefront`, `admin`, `cms`
- `Đề xuất` `React`

Lý do:

- docs hiện tại nhiều chỗ đã giả định routing theo kiểu `app/[locale]/...`
- auth ADR nói rõ về `Next.js middleware`
- i18n routing đang bám theo pattern đã kiểm chứng từ `ecommerce-next`

## 4.3. Styling và design system

- `Đã chốt` `Tailwind CSS v4`
- `Đã chốt` `CSS custom properties` sinh từ `packages/design-tokens`
- `Đã chốt` `class-variance-authority`
- `Đề xuất` `tailwind-merge`
- `Đề xuất` `clsx`
- `Đã chốt` `Radix UI primitives`
- `Đề xuất` `shadcn/ui style approach` trên nền Radix + Tailwind

Lý do:

- Decision `#23`: Tailwind CSS v4 + CSS custom properties
- Decision `#33`: inline class trong JSX + `cva` cho variants
- `tailwind-merge` và `clsx` là bộ bổ trợ thực tế cho `cva`

## 4.4. Data, contract và state

- `Đã chốt` `Zod` cho schema contract trong `packages/schemas`
- `Đã chốt` `MSW` cho mock API
- `Đề xuất` `TanStack Query` cho server state
- `Đã chốt` `Zustand` cho client state dùng chung
- `Đã chốt` `next-intl` cho storefront locale routing

Lý do:

- Decision `#13`: `packages/schemas` dùng Zod
- Decision `#24`: Zustand
- Decision `#18`: routing pattern `app/[locale]/...` theo `next-intl`
- Decision `#31`: query key factory cho TanStack Query

## 4.5. Forms

- `Đề xuất` `react-hook-form`
- `Đề xuất` `@hookform/resolvers`
- `Đề xuất` dùng `zodResolver` với schema từ `packages/schemas` hoặc schema form riêng khi hợp lý

Lý do:

- docs hiện chưa chốt form library
- đây là lựa chọn thực dụng, hợp với Zod và quy mô form của auth/account/admin/cms

## 4.6. Testing

- `Đề xuất` `Vitest` cho unit/integration test frontend
- `Đề xuất` `@testing-library/react`
- `Đề xuất` `@testing-library/user-event`
- `Đã chốt` `Playwright`
- `Đã chốt` `Playwright toHaveScreenshot()` cho visual regression
- `Đề xuất` `jsdom` cho test DOM-level

Lý do:

- Playwright đã chốt ở Decision `#25`
- unit/integration runner cụ thể chưa chốt, nhưng Vitest hợp với Vite ecosystem và React test hiện nay

## 5. Danh sách thư viện FE nên dùng

## 5.1. Root workspace

```text
turbo
typescript
eslint
prettier
pnpm
```

## 5.2. Shared FE core

```text
next
react
react-dom
zod
msw
@tanstack/react-query
zustand
next-intl
tailwindcss
class-variance-authority
clsx
tailwind-merge
```

## 5.3. UI primitives

```text
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-popover
@radix-ui/react-select
@radix-ui/react-tabs
@radix-ui/react-tooltip
@radix-ui/react-slot
@radix-ui/react-label
```

Chỉ cài những primitive thật sự dùng tới, không cần cài cả họ ngay từ ngày đầu.

## 5.4. Forms

```text
react-hook-form
@hookform/resolvers
```

## 5.5. Testing

```text
vitest
jsdom
@testing-library/react
@testing-library/user-event
@playwright/test
```

## 5.6. Optional nhưng hữu ích

```text
lint-staged
husky
dotenv
cross-env
```

`Optional` ở đây nghĩa là hữu ích cho local workflow, không phải requirement business.

## 6. Kiến trúc monorepo mục tiêu

```text
FE/
├── apps/
│   ├── storefront/
│   ├── admin/
│   └── cms/
├── packages/
│   ├── design-tokens/
│   ├── tailwind-config/
│   ├── ui/
│   ├── commerce/
│   ├── schemas/
│   ├── api-sdk/
│   ├── hooks/
│   ├── utils/
│   ├── eslint-config/
│   └── ts-config/
└── docs/
```

Lưu ý:

- `packages/tailwind-config` đã được chốt ở Decision `#34`
- `packages/layouts` không tồn tại riêng, theo Decision `#12`

## 7. Trách nhiệm từng package

## 7.1. `packages/design-tokens`

Chứa:

- color tokens
- spacing tokens
- typography tokens
- radius
- shadow
- motion
- breakpoints

Không chứa:

- business logic
- component implementation

## 7.2. `packages/tailwind-config`

Chứa:

- preset Tailwind dùng chung
- shared theme mapping
- plugin config dùng chung nếu có

## 7.3. `packages/ui`

Chứa:

- primitive UI components
- layout primitives như `Container`, `Grid`, `Stack`, `Section`
- component thuần UI, không gắn domain commerce

Ví dụ:

- `Button`
- `Input`
- `Modal`
- `Tabs`
- `Tooltip`

## 7.4. `packages/commerce`

Chứa:

- component nghiệp vụ có thể share giữa app khi hợp lý

Ví dụ:

- `ProductCard`
- `ProductGallery`
- `SizeSelector`
- `ColorSelector`
- `OrderTimeline`

Không nhét mọi thứ của storefront vào đây chỉ vì “có thể share sau”.

## 7.5. `packages/schemas`

Chứa:

- request schemas
- response schemas
- error envelope schemas
- domain DTO schemas

Đây là nguồn contract-first quan trọng nhất của FE.

## 7.6. `packages/api-sdk`

Chứa:

- typed fetch layer
- mock adapter
- MSW handlers
- environment-aware API entrypoint

Mọi network call đi qua đây theo Decision `#49`.

## 7.7. `packages/hooks`

Chứa:

- shared hooks đa app
- query key factories
- auth/cart/search hook dùng chung khi thực sự dùng chung

## 7.8. `packages/utils`

Chứa:

- pure helpers
- formatter
- parser
- guard helpers

Không chứa:

- React hooks
- network call
- UI render logic

## 8. Cấu trúc app chi tiết

Decision `#29` đã chốt mô hình feature-module theo dạng:

`features/{feature}/pages/{page}/`

### 8.1. Cây thư mục đề xuất cho `apps/storefront`

```text
apps/storefront/
├── app/
│   ├── [locale]/
│   │   ├── (public)/
│   │   ├── account/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── wishlist/
│   ├── api/
│   └── globals.css
├── src/
│   ├── features/
│   │   ├── catalog/
│   │   │   ├── pages/
│   │   │   │   ├── product-list/
│   │   │   │   └── product-detail/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── search/
│   │   ├── cart/
│   │   ├── wishlist/
│   │   ├── auth/
│   │   ├── account/
│   │   └── checkout/
│   ├── providers/
│   ├── lib/
│   ├── config/
│   └── middleware/
└── package.json
```

### 8.2. Cây thư mục đề xuất cho `apps/admin`

```text
apps/admin/
├── app/
│   ├── (protected)/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── inventory/
│   │   └── orders/
│   └── globals.css
├── src/
│   ├── features/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── inventory/
│   │   └── orders/
│   ├── providers/
│   ├── lib/
│   └── config/
└── package.json
```

### 8.3. Cây thư mục đề xuất cho `apps/cms`

```text
apps/cms/
├── app/
│   ├── (protected)/
│   │   ├── hero-banner/
│   │   ├── homepage-sections/
│   │   ├── collection-landing/
│   │   ├── promotion-banner/
│   │   ├── seo-metadata/
│   │   ├── blog/
│   │   └── campaign/
│   └── globals.css
├── src/
│   ├── features/
│   │   ├── hero-banner/
│   │   ├── homepage-sections/
│   │   ├── collection-landing/
│   │   ├── promotion-banner/
│   │   ├── seo-metadata/
│   │   ├── blog/
│   │   └── campaign/
│   ├── providers/
│   ├── lib/
│   └── config/
└── package.json
```

## 9. Quy ước code đã chốt

- Interface có tiền tố `I`
- Component dùng `PascalCase`
- Thư mục page dùng `kebab-case`
- Hook có tiền tố `use`
- Store dùng tên `{feature}.store.ts`
- `index.ts` là barrel import chính của feature
- Không tạo `services/` riêng trong feature; API đi qua `packages/api-sdk`
- Không tạo `constants/` folder mặc định; chỉ tách `constants.ts` khi đủ nhu cầu

## 10. FE state ownership

Phải tách rõ:

- `URL state`
- `server state`
- `client state`

### 10.1. URL state

Dùng cho:

- filter
- sort
- pagination
- search params công khai

### 10.2. Server state

Dùng cho:

- product list/detail
- cart data từ API
- wishlist data từ API
- account data
- CMS/Admin query data

`TanStack Query` là lựa chọn đề xuất để quản lý lớp này.

### 10.3. Client state

Dùng cho:

- UI-only state
- temporary interaction state
- shared client concerns không phải server cache

`Zustand` đã được chốt cho lớp này.

Nguyên tắc cứng:

- không copy server response vào Zustand chỉ để “cache lại”

## 11. i18n

- Chỉ storefront là đa locale UI
- Locale hiện tại là `vi` và `en`
- Default locale là `vi`
- Thiếu translation thì fallback về `vi`
- Typography token dùng chung cho mọi locale
- `SUPPORTED_LOCALES` là nguồn sự thật duy nhất trong code

### 11.1. Vị trí đề xuất

```text
packages/utils/src/i18n/
  locales.ts
  localized-text.ts
  fallback.ts
```

hoặc một package riêng cho i18n nếu sau này đủ lớn. Hiện tại nên giữ gọn.

## 12. Auth ở FE

- FE chỉ nên phụ thuộc vào `httpOnly` session-cookie contract
- Không lưu token dài hạn trong `localStorage`
- Route guard ở FE chỉ là UX layer
- Permission thật phải được backend enforce

### 12.1. Điều cần spike sớm

Theo ADR `0004`, cần spike nhỏ để xác nhận:

- MSW mock auth
- `Set-Cookie`
- Next.js middleware

có hoạt động đúng với nhau hay không.

Không nên build toàn bộ `use-auth` trước khi spike này pass.

## 13. Performance

### 13.1. Storefront

- LCP `< 2.5s`
- CLS `< 0.1`
- INP `< 200ms`
- Lighthouse `> 95`

### 13.2. Admin/CMS

- LCP `< 4s`
- INP `< 500ms`

### 13.3. Cách hỗ trợ performance

- self-host font
- subset font Latin + Vietnamese glyph
- hạn chế runtime styling overhead
- giữ shared primitives gọn
- tránh over-fetching

## 14. Hướng dẫn cài đặt và scaffold

## 14.1. Bước 1: tạo root workspace

`Đề xuất`

```bash
pnpm init
pnpm add -D turbo typescript eslint prettier
```

Tạo:

- `pnpm-workspace.yaml`
- `turbo.json`
- root `package.json`

### Root `pnpm-workspace.yaml` đề xuất

```yaml
packages:
  - apps/*
  - packages/*
```

### Root `package.json` đề xuất

```json
{
  "name": "fe",
  "private": true,
  "packageManager": "pnpm",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "eslint": "workspace:*",
    "prettier": "workspace:*",
    "turbo": "workspace:*",
    "typescript": "workspace:*"
  }
}
```

### Root `turbo.json` đề xuất

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^test"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

## 14.2. Bước 2: tạo apps và packages

Tạo thư mục:

```text
apps/storefront
apps/admin
apps/cms
packages/design-tokens
packages/tailwind-config
packages/ui
packages/commerce
packages/schemas
packages/api-sdk
packages/hooks
packages/utils
packages/eslint-config
packages/ts-config
```

Lệnh PowerShell đề xuất:

```powershell
New-Item -ItemType Directory -Force apps\storefront, apps\admin, apps\cms, packages\design-tokens, packages\tailwind-config, packages\ui, packages\commerce, packages\schemas, packages\api-sdk, packages\hooks, packages\utils, packages\eslint-config, packages\ts-config
```

## 14.3. Bước 3: cài core deps cho app

Ví dụ cho từng app Next.js:

```bash
pnpm add next react react-dom next-intl @tanstack/react-query zustand zod msw tailwindcss class-variance-authority clsx tailwind-merge react-hook-form @hookform/resolvers
```

Dev dependencies:

```bash
pnpm add -D typescript vitest jsdom @testing-library/react @testing-library/user-event @playwright/test
```

### Phân bổ dependency theo nơi cài

#### Root devDependencies

```text
turbo
typescript
eslint
prettier
```

#### `apps/storefront`

```text
next
react
react-dom
next-intl
@tanstack/react-query
zustand
react-hook-form
@hookform/resolvers
```

#### `apps/admin`

```text
next
react
react-dom
@tanstack/react-query
zustand
react-hook-form
@hookform/resolvers
```

#### `apps/cms`

```text
next
react
react-dom
@tanstack/react-query
zustand
react-hook-form
@hookform/resolvers
```

#### `packages/schemas`

```text
zod
```

#### `packages/api-sdk`

```text
zod
msw
```

#### `packages/ui`

```text
class-variance-authority
clsx
tailwind-merge
@radix-ui/*
```

#### `packages/hooks`

```text
@tanstack/react-query
zustand
```

#### Test dependencies

```text
vitest
jsdom
@testing-library/react
@testing-library/user-event
@playwright/test
```

### Cách cài theo workspace cụ thể

Ví dụ:

```bash
pnpm --filter ./apps/storefront add next react react-dom next-intl @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./apps/admin add next react react-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./apps/cms add next react react-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./packages/schemas add zod
pnpm --filter ./packages/api-sdk add zod msw
pnpm --filter ./packages/ui add class-variance-authority clsx tailwind-merge
pnpm --filter ./packages/hooks add @tanstack/react-query zustand
pnpm add -D vitest jsdom @testing-library/react @testing-library/user-event @playwright/test
```

## 14.4. Bước 4: cài Radix theo nhu cầu

Ví dụ:

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-slot @radix-ui/react-label
```

Không cần cài full tất cả package Radix từ đầu.

## 14.5. Bước 5: dựng shared packages trước

Ưu tiên theo thứ tự:

1. `packages/ts-config`
2. `packages/eslint-config`
3. `packages/design-tokens`
4. `packages/tailwind-config`
5. `packages/schemas`
6. `packages/api-sdk`
7. `packages/ui`

### `packages/ts-config` nên có gì

- `base.json`
- `nextjs.json`
- `react-library.json`

Tối thiểu:

- `strict: true`
- `noImplicitAny: true`
- `verbatimModuleSyntax: true`
- `moduleResolution` phù hợp với Next.js hiện đại

### `packages/eslint-config` nên có gì

- base config
- next config
- react config
- import/order rules
- boundaries rules
- cấm import ngược chiều package

### `packages/design-tokens` nên có gì

```text
src/
  colors.ts
  spacing.ts
  typography.ts
  radius.ts
  shadow.ts
  motion.ts
  breakpoints.ts
  index.ts
```

### `packages/schemas` nên có gì

```text
src/
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
  index.ts
```

### `packages/api-sdk` nên có gì

```text
src/
  client/
  endpoints/
  mocks/
  adapters/
  env/
  index.ts
```

Trong đó:

- `client/`: fetch wrapper và error handling
- `endpoints/`: function gọi API typed
- `mocks/`: MSW handlers
- `adapters/`: chọn mock hoặc real
- `env/`: đọc env và bootstrap

### `packages/ui` nên có gì

```text
src/
  components/
  primitives/
  layout/
  lib/
  index.ts
```

## 14.6. Bước 6: dựng app `storefront` trước

Thứ tự feature:

1. catalog browse
2. PDP
3. search
4. cart
5. wishlist
6. auth
7. account
8. checkout

Sau đó mới mở rộng sang `admin` và `cms`.

## 14.7. Bootstrap từng app

### `apps/storefront/package.json` tối thiểu

```json
{
  "name": "@repo/storefront",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "clean": "powershell -Command \"Remove-Item -Recurse -Force .next,coverage,test-results -ErrorAction SilentlyContinue\""
  }
}
```

`apps/admin` và `apps/cms` có thể dùng bộ scripts tương tự.

### Providers tối thiểu nên có trong mỗi app

- `QueryClientProvider`
- global UI provider nếu cần
- i18n provider cho `storefront`
- auth/session bootstrap layer nếu có

### `src/providers/` đề xuất

```text
src/providers/
  app-providers.tsx
  query-provider.tsx
  intl-provider.tsx
```

`intl-provider.tsx` chỉ cần ở `storefront`.

## 14.8. Alias import đề xuất

Theo Decision `#46`, nên khóa sớm alias import:

```text
@/*
@/features/{feature}
@repo/*
```

Ví dụ:

- `@/features/catalog`
- `@repo/ui`
- `@repo/schemas`
- `@repo/api-sdk`

## 14.9. Environment variables FE tối thiểu

### Dùng chung

```text
NEXT_PUBLIC_API_MOCKING=
NEXT_PUBLIC_APP_ENV=
NEXT_PUBLIC_SITE_URL=
```

### Storefront

```text
NEXT_PUBLIC_DEFAULT_LOCALE=vi
NEXT_PUBLIC_SUPPORTED_LOCALES=vi,en
```

### Ghi chú

- `NEXT_PUBLIC_API_MOCKING` đã có lineage từ Decision `#28`
- exact env naming có thể tinh chỉnh, nhưng nên chốt sớm và dùng nhất quán

## 14.10. Root file checklist

Tối thiểu nên có:

```text
package.json
pnpm-workspace.yaml
turbo.json
.gitignore
.editorconfig
```

Nếu muốn local workflow tốt hơn:

```text
.npmrc
.prettierrc
.prettierignore
eslint.config.js
```

## 14.11. Checklist bootstrap FE

Được coi là bootstrap FE xong khi:

- workspace cài được bằng 1 lệnh
- 3 app chạy local được
- shared packages resolve được
- Tailwind preset dùng chung được
- schemas import được từ app
- api-sdk mock mode chạy được
- storefront locale route chạy được
- test runner chạy được dù chưa có nhiều test
- Playwright boot được

## 14.12. Điều không nên làm ngay từ ngày đầu

- Không tạo Storybook nếu chưa cần prove component flow thật
- Không tách `services/` ở từng feature
- Không tạo package `layouts`
- Không tạo package nhỏ cho mọi thứ
- Không làm Admin/CMS trước khi có foundation và storefront core
- Không cài full cả hệ Radix nếu chưa dùng

## 14.13. Nếu muốn copy-paste lệnh theo thứ tự

```bash
pnpm init
pnpm add -D turbo typescript eslint prettier
pnpm --filter ./apps/storefront add next react react-dom next-intl @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./apps/admin add next react react-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./apps/cms add next react react-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./packages/schemas add zod
pnpm --filter ./packages/api-sdk add zod msw
pnpm --filter ./packages/ui add class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-tooltip
pnpm --filter ./packages/hooks add @tanstack/react-query zustand
pnpm add -D tailwindcss vitest jsdom @testing-library/react @testing-library/user-event @playwright/test
```

Lưu ý:

- các lệnh này là `Đề xuất scaffold`
- exact versions chưa được docs gốc chốt
- khi bắt đầu thật nên pin version trong lockfile ngay từ commit đầu tiên

## 15. FE delivery order

Thứ tự build FE nên là:

1. Monorepo scaffold
2. Shared config
3. `schemas` + `api-sdk` + mock layer
4. i18n foundation
5. storefront browse/search/PDP
6. cart/wishlist
7. auth/account
8. checkout
9. admin
10. cms
11. hardening

## 16. Current gaps

- Chưa có code scaffold
- Chưa có file architecture FE chi tiết đầy đủ trong checkout hiện tại
- Chưa có test file thật
- Chưa có analytics implementation
- Chưa chốt exact versions cho từng lib
- Chưa chốt Storybook có dùng ngay từ Phase 0 hay để sau
- Chưa có package manifest thật để xác nhận dependency graph
- Chưa chốt chính thức `pnpm` bằng decision riêng, dù rất hợp lý cho monorepo này

## 17. Kết luận thực thi

Nếu bắt đầu làm FE thật từ ngày mai, thứ tự đúng là:

1. dựng workspace
2. dựng shared config
3. dựng `schemas`
4. dựng `api-sdk` + `msw`
5. dựng token + Tailwind preset
6. dựng `ui`
7. dựng storefront
8. rồi mới sang admin/cms

Không nên làm:

- admin trước storefront
- CMS trước contract layer
- auth hoàn chỉnh trước khi spike cookie/middleware pass
- tách quá nhiều package nhỏ khi chưa có nhu cầu thật

## 18. Nguồn gốc nội dung

File này tổng hợp từ:

- `01-delivery/architecture/frontend`
- `01-delivery/specification/technical-design.md`
- `01-delivery/specification/implementation-plan.md`
- `00-core/decision-log.md`
- `00-core/adr/0004-authentication-mechanism.md`
- `01-delivery/security/security-baseline.md`
