# FE

Đây là tài liệu chính để làm Frontend.

Mục tiêu của file này là đủ cụ thể để bắt đầu scaffold và build FE thật, không chỉ dừng ở mức định hướng.

Nếu cần xem riêng phần kiến trúc Frontend cho cả `storefront`, `admin`, `cms` và module chung, xem [`FE-ARCHITECTURE.md`](E:/my-pj/FE/docs/FE/FE-ARCHITECTURE.md).

Nếu cần xem riêng phần design system đã được siết lại cho execution, xem [`FE-ARCHITECTURE.md`](E:/my-pj/FE/docs/FE/FE-ARCHITECTURE.md).

Nếu cần xem riêng phần nền kỹ thuật phải hoàn thành trước mọi feature, xem [`FE-EXECUTION.md`](E:/my-pj/FE/docs/FE/FE-EXECUTION.md).

## 1. Trạng thái quyết định

- `Đã chốt`: đã được chấp nhận làm quyết định làm việc hiện hành cho FE
- `Mở`: còn phụ thuộc spike kỹ thuật, backend, hoặc quyết định business khác

## 1.1. Kết luận chốt FE ngày 29/07/2026

Phạm vi của file này đã được chốt ở mức **đủ để scaffold và build Frontend thật**.

Những quyết định chỉ ảnh hưởng FE foundation và không còn trade-off lớn đã được nâng lên `Đã chốt`.

Những thứ vẫn giữ `Mở` là:

- chi tiết RBAC cho `admin/cms`
- spike kỹ thuật `MSW + Set-Cookie + Next.js middleware`
- analytics implementation thật
- package manifest và lockfile thực tế sau khi scaffold

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

## 3.1. Chốt phạm vi FE foundation

Phần FE foundation của dự án này được coi là **bắt buộc hoàn thiện toàn bộ** trước khi đi sâu vào feature layer.

Foundation bắt buộc gồm:

1. Root workspace
2. Shared config
3. Design tokens
4. Tailwind preset
5. Schemas
6. API SDK + MSW
7. Shared UI
8. App shell cho `storefront`, `admin`, `cms`

Chi tiết và Definition of Done xem tại [`FE-EXECUTION.md`](E:/my-pj/FE/docs/FE/FE-EXECUTION.md).

## 4. Stack FE đã chốt

## 4.1. Runtime và workspace

- `Đã chốt` `Turborepo`
- `Đã chốt` `pnpm workspace`
- `Đã chốt` `Node.js LTS`
- `Đã chốt` `TypeScript strict`

Lý do:

- Turborepo đã được chốt ở Decision `#4`
- `pnpm workspace` phù hợp với monorepo nhiều package, cài nhanh và dedupe tốt
- `TypeScript strict` đã được chốt ở Decision `#46`

## 4.2. Framework app

- `Đã chốt` `Next.js App Router` cho cả `storefront`, `admin`, `cms`
- `Đã chốt` `React`

Lý do:

- docs hiện tại nhiều chỗ đã giả định routing theo kiểu `app/[locale]/...`
- auth ADR nói rõ về `Next.js middleware`
- i18n routing đang bám theo pattern đã kiểm chứng từ `ecommerce-next`

## 4.3. Styling và design system

- `Đã chốt` `Tailwind CSS v4`
- `Đã chốt` `CSS custom properties` sinh từ `packages/design-tokens`
- `Đã chốt` `class-variance-authority`
- `Đã chốt` `tailwind-merge`
- `Đã chốt` `clsx`
- `Đã chốt` `lucide-react`
- `Đã chốt` `Radix UI primitives`
- `Đã chốt` `shadcn/ui style approach` trên nền Radix + Tailwind

Lý do:

- Decision `#23`: Tailwind CSS v4 + CSS custom properties
- Decision `#33`: inline class trong JSX + `cva` cho variants
- `tailwind-merge` và `clsx` là bộ bổ trợ thực tế cho `cva`

## 4.4. Data, contract và state

- `Đã chốt` `Zod` cho schema contract trong `packages/schemas`
- `Đã chốt` `MSW` cho mock API
- `Đã chốt` `TanStack Query` cho server state
- `Đã chốt` `Zustand` cho client state dùng chung
- `Đã chốt` `next-intl` cho storefront locale routing

Lý do:

- Decision `#13`: `packages/schemas` dùng Zod
- Decision `#24`: Zustand
- Decision `#18`: routing pattern `app/[locale]/...` theo `next-intl`
- Decision `#31`: query key factory cho TanStack Query

## 4.5. Forms

- `Đã chốt` `react-hook-form`
- `Đã chốt` `@hookform/resolvers`
- `Đã chốt` dùng `zodResolver` với schema từ `packages/schemas` hoặc schema form riêng khi hợp lý

Lý do:

- docs hiện chưa chốt form library
- đây là lựa chọn thực dụng, hợp với Zod và quy mô form của auth/account/admin/cms

## 4.6. Testing

- `Đã chốt` `Vitest` cho unit/integration test frontend
- `Đã chốt` `@testing-library/react`
- `Đã chốt` `@testing-library/user-event`
- `Đã chốt` `Playwright`
- `Đã chốt` `Playwright toHaveScreenshot()` cho visual regression
- `Đã chốt` `jsdom` cho test DOM-level

Lý do:

- Playwright đã chốt ở Decision `#25`
- unit/integration runner cụ thể chưa chốt, nhưng Vitest hợp với Vite ecosystem và React test hiện nay

## 5. Danh sách thư viện FE đã chốt

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
lucide-react
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

## 5.7. Version đã chốt để pin ngay từ đầu

Dependency/version matrix đầy đủ nằm ở [`FE-EXECUTION.md`](E:/my-pj/FE/docs/FE/FE-EXECUTION.md), không lặp lại ở đây.

### Chính sách version đã chốt

- pin exact version ở commit scaffold đầu tiên
- không dùng `latest` trôi nổi trong docs hay command
- sau này nếu upgrade, nâng có chủ đích theo batch:
  - tooling
  - app runtime
  - state/data
  - test
- dependency/version matrix đầy đủ nằm ở [`FE-EXECUTION.md`](E:/my-pj/FE/docs/FE/FE-EXECUTION.md)
- nếu scaffold thực tế gặp xung đột peer dependency, lockfile thật được quyền override file này và phải cập nhật ngược lại docs

## 5.6. Optional nhưng hữu ích

```text
lint-staged
husky
dotenv
cross-env
```

`Optional` ở đây nghĩa là hữu ích cho local workflow, không phải requirement business.

## 6. Kiến trúc monorepo đã chốt

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

### 11.1. Vị trí đã chốt cho Phase 0

```text
packages/utils/src/i18n/
  locales.ts
  localized-text.ts
  fallback.ts
```

Không tách package i18n riêng ở Phase 0. Nếu sau này đủ lớn mới tách.

## 12. Auth ở FE

- FE chỉ nên phụ thuộc vào `httpOnly` session-cookie contract
- Không lưu token dài hạn trong `localStorage`
- Route guard ở FE chỉ là UX layer
- Permission thật phải được backend enforce

### 12.1. Điều vẫn còn mở và cần spike sớm

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

## 14. Hướng dẫn cài đặt và scaffold đã chốt

## 14.1. Bước 1: tạo root workspace

`Đã chốt cho scaffold Phase 0`

```bash
pnpm init
pnpm add -D turbo typescript eslint prettier
```

Tạo:

- `pnpm-workspace.yaml`
- `turbo.json`
- root `package.json`

### Root `pnpm-workspace.yaml` đã chốt

```yaml
packages:
  - apps/*
  - packages/*
```

### Root `package.json` đã chốt làm baseline

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
  }
}
```

Ghi chú:

- `turbo`, `typescript`, `eslint`, `prettier` là package từ npm, không dùng `"workspace:*"` trong root `devDependencies`
- chỉ dùng `"workspace:*"` khi tham chiếu package nội bộ như `@repo/ui`, `@repo/schemas`, `@repo/api-sdk`

### Root `.npmrc` đã chốt

```ini
save-exact=true
auto-install-peers=true
strict-peer-dependencies=false
```

### Root `turbo.json` đã chốt làm baseline

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

Lệnh PowerShell bootstrap:

```powershell
New-Item -ItemType Directory -Force apps\storefront, apps\admin, apps\cms, packages\design-tokens, packages\tailwind-config, packages\ui, packages\commerce, packages\schemas, packages\api-sdk, packages\hooks, packages\utils, packages\eslint-config, packages\ts-config
```

## 14.3. Bước 3: cài core deps cho app

Lệnh cài app runtime core:

```bash
pnpm add next@16.2.12 react@19.2.8 react-dom@19.2.8 next-intl@4.13.4 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
```

Dev dependencies:

```bash
pnpm add -D typescript@7.0.2 vitest@4.1.10 jsdom@30.0.1 @testing-library/react @testing-library/user-event @playwright/test@1.62.0
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
pnpm --filter ./apps/storefront add next@16.2.12 react@19.2.8 react-dom@19.2.8 next-intl@4.13.4 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./apps/admin add next@16.2.12 react@19.2.8 react-dom@19.2.8 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./apps/cms add next@16.2.12 react@19.2.8 react-dom@19.2.8 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./packages/schemas add zod@4.4.3
pnpm --filter ./packages/api-sdk add zod@4.4.3 msw@2.15.0
pnpm --filter ./packages/ui add class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.6.0
pnpm --filter ./packages/hooks add @tanstack/react-query@5.101.4 zustand@5.0.14
pnpm add -D vitest@4.1.10 jsdom@30.0.1 @testing-library/react @testing-library/user-event @playwright/test@1.62.0
```

## 14.4. Bước 4: cài Radix theo nhu cầu

Ví dụ:

```bash
pnpm --filter ./packages/ui add @radix-ui/react-dialog@1.1.23 @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-tabs@1.1.21 @radix-ui/react-tooltip@1.2.16 @radix-ui/react-slot @radix-ui/react-label
```

Không cần cài full tất cả package Radix từ đầu.

## 14.4.1. Cấu hình `tailwindcss-motion` nếu dùng Rombo

Nếu quyết định dùng Rombo/Tailwind Motion cho `storefront`, cài ở `packages/tailwind-config`:

```bash
pnpm --filter ./packages/tailwind-config add -D tailwindcss-motion@1.1.1
```

Ví dụ preset config:

```ts
import motion from "tailwindcss-motion";

export default {
  plugins: [motion]
};
```

Chỉ nên rollout animation mạnh ở `storefront`, không ưu tiên cho `admin/cms`.

## 14.5. Bước 5: dựng shared packages trước

Ưu tiên theo thứ tự:

1. `packages/ts-config`
2. `packages/eslint-config`
3. `packages/design-tokens`
4. `packages/tailwind-config`
5. `packages/schemas`
6. `packages/api-sdk`
7. `packages/ui`

### `packages/ts-config` phải có gì

- `base.json`
- `nextjs.json`
- `react-library.json`

Tối thiểu:

- `strict: true`
- `noImplicitAny: true`
- `verbatimModuleSyntax: true`
- `moduleResolution` phù hợp với Next.js hiện đại

### `packages/ts-config/base.json` đã chốt

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noImplicitAny": true,
    "verbatimModuleSyntax": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "allowJs": false,
    "declaration": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

### `packages/ts-config/nextjs.json` đã chốt

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "incremental": true
  }
}
```

### `packages/eslint-config` phải có gì

- base config
- next config
- react config
- import/order rules
- boundaries rules
- cấm import ngược chiều package

### `packages/eslint-config/base.js` đã chốt làm baseline

```js
module.exports = [
  {
    ignores: ["dist/**", ".next/**", "coverage/**", "test-results/**"]
  }
];
```

### Rule tối thiểu đã chốt

- cấm `any` không giải thích
- bắt buộc `import type` khi phù hợp
- import order ổn định
- không import xuyên feature bừa bãi
- app không bypass `@repo/api-sdk` để gọi API trực tiếp

### `packages/design-tokens` phải có gì

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

### `packages/design-tokens/src/typography.ts` cần lưu ý

- phải support glyph tiếng Việt
- line-height đủ an toàn cho uppercase tiếng Việt
- không override theo locale

### `packages/schemas` phải có gì

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

### `packages/api-sdk` phải có gì

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

### `packages/api-sdk/src/env/index.ts` đã chốt làm baseline

```ts
export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === "true";
```

### `packages/api-sdk/src/client/fetcher.ts` đã chốt làm baseline

```ts
export async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
```

### `packages/ui` phải có gì

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

### `apps/storefront/package.json` baseline

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

### Providers tối thiểu đã chốt cho mỗi app

- `QueryClientProvider`
- global UI provider nếu cần
- i18n provider cho `storefront`
- auth/session bootstrap layer nếu có

### `src/providers/` đã chốt làm baseline

```text
src/providers/
  app-providers.tsx
  query-provider.tsx
  intl-provider.tsx
```

`intl-provider.tsx` chỉ cần ở `storefront`.

### `src/providers/query-provider.tsx` đã chốt làm baseline

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

## 14.8. Alias import đã chốt

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
NEXT_PUBLIC_API_MOCKING=true
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Storefront

```text
NEXT_PUBLIC_DEFAULT_LOCALE=vi
NEXT_PUBLIC_SUPPORTED_LOCALES=vi,en
```

### Ghi chú

- `NEXT_PUBLIC_API_MOCKING` đã có lineage từ Decision `#28`
- env naming trong file này được chốt làm baseline scaffold

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
pnpm add -D turbo@2.10.7 typescript@7.0.2 eslint@10.8.0 prettier@3.9.6 tailwindcss@4.3.3 vitest@4.1.10 jsdom@30.0.1 @testing-library/react @testing-library/user-event @playwright/test@1.62.0
pnpm --filter ./apps/storefront add next@16.2.12 react@19.2.8 react-dom@19.2.8 next-intl@4.13.4 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./apps/admin add next@16.2.12 react@19.2.8 react-dom@19.2.8 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./apps/cms add next@16.2.12 react@19.2.8 react-dom@19.2.8 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./packages/schemas add zod@4.4.3
pnpm --filter ./packages/api-sdk add zod@4.4.3 msw@2.15.0
pnpm --filter ./packages/ui add class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.6.0 @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog@1.1.23 @radix-ui/react-tabs@1.1.21 @radix-ui/react-tooltip@1.2.16
pnpm --filter ./packages/hooks add @tanstack/react-query@5.101.4 zustand@5.0.14
pnpm --filter ./packages/tailwind-config add -D tailwindcss-motion@1.1.1
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
- Exact version đã được chốt cho baseline scaffold, nhưng chưa được chứng minh bằng package manifest và lockfile thật
- Chưa chốt Storybook có dùng ngay từ Phase 0 hay để sau
- Chưa có package manifest thật để xác nhận dependency graph
- Chưa có xác nhận thực thi từ repo code thật

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
