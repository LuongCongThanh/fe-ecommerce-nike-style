# FE Execution

Đây là tài liệu chốt riêng cho phần **thực thi FE**: những gì phải làm-theo-bước để scaffold, bootstrap, và biết khi nào một phần đã "xong".

Mục tiêu của file này là:

- chốt phạm vi FE foundation và Definition of Done
- chốt runbook bootstrap/scaffold
- là nguồn duy nhất giữ dependency/version matrix
- là nguồn duy nhất giữ checklist nghiệm thu theo package/app shell

File này đi cùng:

- [`FE.md`](./FE.md): tài liệu FE tổng thể — mục tiêu, quyết định, stack, delivery order
- [`FE-ARCHITECTURE.md`](./FE-ARCHITECTURE.md): kiến trúc chuẩn cho 3 app, module contract, import boundary, design system

## 1. Foundation checklist

### 1.1. Định nghĩa FE foundation

`FE foundation` là toàn bộ lớp nền kỹ thuật phải tồn tại trước khi bắt đầu làm feature nghiệp vụ lớn như: catalog browse, PDP, search, cart, wishlist, auth/account, checkout, admin flows, cms flows.

Nói ngắn gọn:

- foundation không phải business feature
- foundation là hạ tầng FE để business feature có thể được build nhanh, nhất quán, và không phải đập đi làm lại

### 1.2. FE foundation gồm 8 khối

Phần foundation **bắt buộc phải hoàn thiện** gồm 8 khối sau:

1. Monorepo workspace foundation
2. Shared TypeScript + ESLint + formatting foundation
3. Design token foundation
4. Tailwind preset foundation
5. Contract foundation (`schemas`)
6. API foundation (`api-sdk` + mock adapter + MSW)
7. Shared UI foundation
8. App shell foundation cho `storefront`, `admin`, `cms`

### 1.3. Những gì không thuộc FE foundation

Các phần sau **không** được coi là foundation, mà là **feature layer** làm sau khi foundation pass: Product list thật, Product detail thật, Search thật, Cart thật, Wishlist thật, Auth flow hoàn chỉnh, Checkout flow hoàn chỉnh, Admin CRUD hoàn chỉnh, CMS content workflow hoàn chỉnh.

### 1.4. Đầu ra bắt buộc của từng khối foundation

#### 1.4.1. Monorepo workspace foundation

Phải có: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, thư mục `apps/*`, thư mục `packages/*`.

Pass khi: `pnpm install` chạy được; `turbo` nhận ra apps và packages.

#### 1.4.2. Shared config foundation

Phải có: `packages/ts-config`, `packages/eslint-config`, `.npmrc`, file format cơ bản.

Pass khi: `pnpm typecheck` chạy được; `pnpm lint` chạy được; app/package có thể extend config dùng chung.

#### 1.4.3. Design token foundation

Phải có: color tokens, spacing tokens, typography tokens, radius, shadow, motion, breakpoints.

Pass khi: token export được từ `packages/design-tokens`; typography token support tiếng Việt; không có hard-coded design value trong shared setup mẫu.

#### 1.4.4. Tailwind foundation

Phải có: `packages/tailwind-config`, preset dùng chung cho 3 app, mapping từ token sang Tailwind/CSS vars, plugin motion nếu dùng.

Pass khi: 3 app dùng chung preset được; class utility và token chạy thống nhất; không cần mỗi app tự định nghĩa theme riêng.

#### 1.4.5. Contract foundation

Phải có: `packages/schemas` với common/auth/catalog/cart/wishlist/account/checkout/admin/cms/errors schemas.

Pass khi: app import được schema; schema dùng lại được cho form validation và API contract.

#### 1.4.6. API foundation

Phải có: `packages/api-sdk`, fetch wrapper, env switch mock/real, MSW handlers, typed endpoint functions.

Pass khi: mock mode boot được; request path đi qua `api-sdk`; feature không gọi `fetch` trực tiếp ra ngoài hợp đồng chung.

#### 1.4.7. Shared UI foundation

Phải có: `packages/ui`, primitive UI components đầu tiên, layout primitives, helper class utilities, variant pattern qua `cva`.

Pass khi: app render được vài component nền; component dùng chung token và Tailwind preset; không rò business logic vào `packages/ui`.

#### 1.4.8. App shell foundation

Phải có cho cả `apps/storefront`, `apps/admin`, `apps/cms`: app directory chạy được, global styles, provider layer, base layout, script `dev/build/lint/typecheck/test`. Riêng `storefront` cần thêm locale routing foundation và `next-intl` bootstrap.

Pass khi: 3 app boot được local; `storefront` route locale chạy được; provider shell không vỡ.

### 1.5. Thứ tự hoàn thành foundation đã chốt

1. Root workspace
2. `packages/ts-config`
3. `packages/eslint-config`
4. `packages/design-tokens`
5. `packages/tailwind-config`
6. `packages/schemas`
7. `packages/api-sdk`
8. `packages/ui`
9. `apps/storefront` shell
10. `apps/admin` shell
11. `apps/cms` shell
12. Foundation verification

Không đảo ngược thứ tự này trừ khi có lý do rất rõ.

### 1.6. Checklist chi tiết theo package

Phần này dùng như checklist nghiệm thu thật cho từng package.

#### 1.6.1. `packages/ts-config`

- Bắt buộc: `base.json`, `nextjs.json`, `react-library.json`
- Rule bắt buộc: `strict: true`, `noImplicitAny: true`, `verbatimModuleSyntax: true`, `moduleResolution: Bundler`, `noEmit: true`
- Pass khi: app Next.js extend được config; package library extend được config; `pnpm typecheck` không fail vì config nền

#### 1.6.2. `packages/eslint-config`

- Bắt buộc: base config, ignore cho `.next`/`dist`/`coverage`/`test-results`, import/order rules (`eslint-plugin-import-x`), boundaries rules (`eslint-plugin-boundaries`), TypeScript rules (`typescript-eslint`), Next.js rules (`eslint-config-next`), React rules (`eslint-plugin-react` + `eslint-plugin-react-hooks`), a11y rules (`eslint-plugin-jsx-a11y`)
- Rule bắt buộc: không cho feature gọi API trực tiếp ngoài `@repo/api-sdk` (`boundaries`); không import xuyên feature bừa bãi (`boundaries`); ưu tiên `import type`; cấm `any` không có lý do (`typescript-eslint`)
- Pass khi: app/package dùng được config lint chung; `pnpm lint` chạy được ở toàn workspace

#### 1.6.3. `packages/design-tokens`

- Bắt buộc: `colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`, `shadow.ts`, `motion.ts`, `breakpoints.ts`, `index.ts`
- Rule bắt buộc: token export tập trung; typography support glyph tiếng Việt; line-height an toàn cho uppercase tiếng Việt; không có locale-specific typography override
- Pass khi: `packages/ui` import được token; app render được style từ token; không hard-code spacing/color trong shared setup mẫu

#### 1.6.4. `packages/tailwind-config`

- Bắt buộc: shared preset, mapping token → theme, plugin motion nếu dùng
- Rule bắt buộc: 3 app dùng chung một preset; không tạo theme tách rời cho từng app ở Phase 0; motion nếu dùng thì ưu tiên `storefront`
- Pass khi: `storefront`/`admin`/`cms` đều nhận được preset; utility class và CSS vars hoạt động thống nhất

#### 1.6.5. `packages/schemas`

- Bắt buộc: `common/`, `auth/`, `catalog/`, `cart/`, `wishlist/`, `account/`, `checkout/`, `admin/`, `cms/`, `errors/`, `index.ts`
- Rule bắt buộc: error envelope có schema chung; request/response schema tách rõ; schema dùng lại được cho form validation khi hợp lý
- Pass khi: app import được schema; `api-sdk` dùng được schema; mock handler bám theo schema

#### 1.6.6. `packages/api-sdk`

- Bắt buộc: `client/`, `endpoints/`, `mocks/`, `adapters/`, `env/`, `index.ts`
- Rule bắt buộc: fetch wrapper dùng `credentials: "include"`; có env switch mock/real; endpoint function typed; mock handlers nằm trong `api-sdk`; feature/app không gọi API trực tiếp bên ngoài package này
- Pass khi: mock mode boot được; query function gọi qua `api-sdk`; `NEXT_PUBLIC_API_MOCKING=true` cho mock mode

#### 1.6.7. `packages/ui`

- Bắt buộc: `components/`, `primitives/`, `layout/`, `lib/`, `index.ts`
- Primitive tối thiểu nên có: `Button`, `Input`, `Label`, `Dialog/Modal`, `Tabs`, `Tooltip`, `Container`, `Grid`, `Stack`, `Section`
- Rule bắt buộc: component dùng token chung; variant đi qua `cva`; class merge qua `clsx` + `tailwind-merge` khi cần; không nhét business logic vào `packages/ui`
- Pass khi: `storefront`/`admin`/`cms` đều render được primitive đầu tiên

#### 1.6.8. `packages/commerce`

- Bắt buộc: package tồn tại, `index.ts`
- Rule bắt buộc: chỉ đưa vào đây component nghiệp vụ có khả năng share thật; không chuyển toàn bộ storefront component vào package này từ đầu
- Pass khi: package resolve được; chưa cần nhiều component, nhưng boundary phải rõ

#### 1.6.9. `packages/hooks`

- Bắt buộc: query key factories, shared hooks thật sự cross-app hoặc cross-feature, `index.ts`
- Rule bắt buộc: không biến package này thành nơi nhét mọi hook; hook nào chỉ dùng 1 feature thì giữ ở feature trước
- Pass khi: app import được shared hook đầu tiên; query key pattern dùng được trong app

#### 1.6.10. `packages/utils`

- Bắt buộc: helper thuần, parser/formatter cơ bản, `index.ts`
- Rule bắt buộc: không chứa React hook; không chứa UI render logic; không chứa network call
- Pass khi: app import được helper đầu tiên; test unit được helper thuần đầu tiên

### 1.7. Checklist chi tiết theo app shell

#### 1.7.1. `apps/storefront`

- Bắt buộc: `app/[locale]/`, `globals.css`, `src/providers/`, `src/features/`, `package.json`
- Foundation bắt buộc: locale routing boot được; `QueryClientProvider` boot được; mock mode boot được; app render được shared UI primitive đầu tiên; app import được schema đầu tiên; app gọi được endpoint mock đầu tiên qua `api-sdk`
- Pass khi: `pnpm --filter ./apps/storefront dev`; route locale như `/vi` hoặc `/en` chạy được; app không vỡ khi dùng provider shell

#### 1.7.2. `apps/admin`

- Bắt buộc: `app/(protected)/`, `globals.css`, `src/providers/`, `src/features/`, `package.json`
- Foundation bắt buộc: provider shell boot được; app render được shared UI primitive đầu tiên; app import được schema đầu tiên; app gọi được endpoint mock đầu tiên qua `api-sdk`
- Pass khi: `pnpm --filter ./apps/admin dev`; protected shell boot được ở mức khung

#### 1.7.3. `apps/cms`

- Bắt buộc: `app/(protected)/`, `globals.css`, `src/providers/`, `src/features/`, `package.json`
- Foundation bắt buộc: provider shell boot được; app render được shared UI primitive đầu tiên; app import được schema đầu tiên; app gọi được endpoint mock đầu tiên qua `api-sdk`
- Pass khi: `pnpm --filter ./apps/cms dev`; protected shell boot được ở mức khung

### 1.8. Foundation completion gate

Chỉ được nói "FE foundation hoàn thiện toàn bộ" khi:

- mọi checklist package ở [§1.6](#16-checklist-chi-tiết-theo-package) đã pass
- mọi checklist app shell ở [§1.7](#17-checklist-chi-tiết-theo-app-shell) đã pass
- checklist verification ở [§4.2](#42-verification-checklist) đã pass

Nếu thiếu bất kỳ mục nào ở trên, trạng thái đúng là `Foundation đang triển khai` hoặc `Foundation mới hoàn thiện một phần`.

### 1.9. Mốc chuyển sang feature layer

Chỉ sau khi foundation pass mới bắt đầu: storefront catalog browse → storefront PDP → storefront search → cart/wishlist → auth/account → checkout → admin feature → cms feature.

## 2. Bootstrap steps

Runbook thực thi để scaffold FE từ đầu. Thứ tự hoàn thành foundation chốt tại [§1.5](#15-thứ-tự-hoàn-thành-foundation-đã-chốt); phần này chỉ tập trung vào **lệnh và baseline code** cho từng bước.

### 2.1. Mục tiêu bootstrap

Sau khi hoàn tất phần này, dự án FE cần đạt:

- monorepo chạy được
- 3 app tồn tại
- shared packages tồn tại
- mock-first foundation chạy được
- i18n foundation cho storefront có thể bắt đầu
- test runner boot được

### 2.2. Root workspace init

```bash
pnpm init
pnpm add -D turbo typescript eslint prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
```

Tạo:

- `pnpm-workspace.yaml`
- `turbo.json`
- root `package.json`

#### `pnpm-workspace.yaml` đã chốt

```yaml
packages:
  - apps/*
  - packages/*
```

#### Root `package.json` đã chốt làm baseline

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

#### Root `.npmrc` đã chốt

```ini
save-exact=true
auto-install-peers=true
strict-peer-dependencies=false
```

#### Root `turbo.json` đã chốt làm baseline

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

### 2.3. Tạo `apps/*` và `packages/*`

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

Cây thư mục tối thiểu sau bước này:

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

### 2.4. Cài dependency theo app/package

Lệnh cài app runtime core:

```bash
pnpm add next@16.2.12 react@19.2.8 react-dom@19.2.8 next-intl@4.13.4 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
```

Dev dependencies:

```bash
pnpm add -D typescript@7.0.2 vitest@4.1.10 jsdom@30.0.1 @testing-library/react @testing-library/user-event @playwright/test@1.62.0
```

#### Phân bổ dependency theo nơi cài

##### Root devDependencies

```text
turbo
typescript
eslint
prettier
```

##### `apps/storefront`

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

##### `apps/admin`

```text
next
react
react-dom
@tanstack/react-query
zustand
react-hook-form
@hookform/resolvers
```

##### `apps/cms`

```text
next
react
react-dom
@tanstack/react-query
zustand
react-hook-form
@hookform/resolvers
```

##### `packages/schemas`

```text
zod
```

##### `packages/api-sdk`

```text
zod
msw
```

##### `packages/ui`

```text
class-variance-authority
clsx
tailwind-merge
@radix-ui/*
```

##### `packages/hooks`

```text
@tanstack/react-query
zustand
```

##### Test dependencies

```text
vitest
jsdom
@testing-library/react
@testing-library/user-event
@playwright/test
```

#### Cách cài theo workspace cụ thể

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

### 2.5. Cài Radix theo nhu cầu

```bash
pnpm --filter ./packages/ui add @radix-ui/react-dialog@1.1.23 @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-tabs@1.1.21 @radix-ui/react-tooltip@1.2.16 @radix-ui/react-slot @radix-ui/react-label
```

Không cần cài full tất cả package Radix từ đầu.

### 2.6. Cấu hình `tailwindcss-motion` nếu dùng Rombo

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

### 2.7. Dựng shared packages trước — baseline

Thứ tự dựng theo [Foundation checklist §1.5](#15-thứ-tự-hoàn-thành-foundation-đã-chốt): `ts-config` → `eslint-config` → `design-tokens` → `tailwind-config` → `schemas` → `api-sdk` → `ui`.

#### `packages/ts-config` phải có gì

- `base.json`
- `nextjs.json`
- `react-library.json`

Tối thiểu:

- `strict: true`
- `noImplicitAny: true`
- `verbatimModuleSyntax: true`
- `moduleResolution` phù hợp với Next.js hiện đại

##### `packages/ts-config/base.json` đã chốt

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

##### `packages/ts-config/nextjs.json` đã chốt

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "incremental": true
  }
}
```

#### `packages/eslint-config` phải có gì

- base config
- next config
- react config
- import/order rules
- boundaries rules
- cấm import ngược chiều package

##### `packages/eslint-config/base.js` đã chốt làm baseline

```js
const tseslint = require("typescript-eslint");
const importX = require("eslint-plugin-import-x");
const boundaries = require("eslint-plugin-boundaries");

module.exports = tseslint.config(
  {
    ignores: ["dist/**", ".next/**", "coverage/**", "test-results/**"]
  },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname
      }
    },
    plugins: { "import-x": importX, boundaries },
    rules: {
      "import-x/order": "warn",
      "boundaries/no-unknown": "error"
    }
  }
);
```

Dùng `strictTypeChecked` + `stylisticTypeChecked` (type-aware, cần `parserOptions.project`) thay vì `recommended` thường — khớp mức "TypeScript strict" đã chốt (Decision `#46`), bắt thêm lỗi như floating promise, unnecessary type assertion. Đánh đổi: lint chạy chậm hơn (cần type-check), chấp nhận được ở quy mô monorepo hiện tại.

`packages/eslint-config/next.js` và `packages/eslint-config/react.js` extend từ `base.js`, thêm `eslint-config-next`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` — chỉ dùng ở `apps/*`, không cần ở package thuần TypeScript (`packages/schemas`, `packages/utils`).

Rule tối thiểu đã chốt:

- cấm `any` không giải thích
- bắt buộc `import type` khi phù hợp
- import order ổn định
- không import xuyên feature bừa bãi
- app không bypass `@repo/api-sdk` để gọi API trực tiếp

#### `packages/design-tokens` phải có gì

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

`packages/design-tokens/src/typography.ts` cần lưu ý:

- phải support glyph tiếng Việt
- line-height đủ an toàn cho uppercase tiếng Việt
- không override theo locale

#### `packages/schemas` phải có gì

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

#### `packages/api-sdk` phải có gì

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

##### `packages/api-sdk/src/env/index.ts` đã chốt làm baseline

```ts
export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === "true";
```

##### `packages/api-sdk/src/client/fetcher.ts` đã chốt làm baseline

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

#### `packages/ui` phải có gì

```text
src/
  components/
  primitives/
  layout/
  lib/
  index.ts
```

### 2.8. Dựng app `storefront` trước

Thứ tự bootstrap `storefront`:

1. App shell
2. Locale routing foundation
3. Query provider
4. Mock API bootstrap
5. Catalog browse
6. PDP
7. Search
8. Cart
9. Wishlist
10. Auth/account
11. Checkout

Sau đó mới mở rộng sang `admin` và `cms`.

### 2.9. Bootstrap từng app

#### `apps/storefront/package.json` baseline

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

#### Providers tối thiểu đã chốt cho mỗi app

- `QueryClientProvider`
- global UI provider nếu cần
- i18n provider cho `storefront`
- auth/session bootstrap layer nếu có

##### `src/providers/` đã chốt làm baseline

```text
src/providers/
  app-providers.tsx
  query-provider.tsx
  intl-provider.tsx
```

`intl-provider.tsx` chỉ cần ở `storefront`.

##### `src/providers/query-provider.tsx` đã chốt làm baseline

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

### 2.10. Alias import đã chốt

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

### 2.11. Environment variables FE tối thiểu

Dùng chung:

```text
NEXT_PUBLIC_API_MOCKING=true
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Storefront:

```text
NEXT_PUBLIC_DEFAULT_LOCALE=vi
NEXT_PUBLIC_SUPPORTED_LOCALES=vi,en
```

Ghi chú:

- `NEXT_PUBLIC_API_MOCKING` đã có lineage từ Decision `#28`
- env naming trong file này được chốt làm baseline scaffold

### 2.12. Root file checklist

Tối thiểu nên có:

```text
package.json
pnpm-workspace.yaml
turbo.json
.gitignore
.editorconfig
.husky/
lint-staged.config.js
commitlint.config.js
```

Nếu muốn local workflow tốt hơn:

```text
.npmrc
.prettierrc
.prettierignore
eslint.config.js
```

### 2.13. Bootstrap pass criteria

Được coi là bootstrap FE xong khi:

- `pnpm install` chạy thành công
- workspace resolve được app và packages
- 3 app chạy local được
- shared packages resolve được
- Tailwind preset dùng chung được
- schemas import được từ app
- api-sdk mock mode chạy được
- storefront locale route chạy được
- `pnpm build`, `pnpm lint`, `pnpm typecheck` chạy được
- test runner chạy được dù chưa có nhiều test
- Playwright boot được
- commit thử với message sai Conventional Commits bị `commitlint` chặn; commit với file `.ts` lỗi format bị `lint-staged` tự fix hoặc chặn

### 2.14. Chưa cần làm ngay / red flags

Chưa cần làm ngay:

- Storybook (chỉ mở khi có nhu cầu prove component flow thật)
- analytics thật
- visual regression đầy đủ
- tối ưu performance sâu
- tách `services/` riêng trong feature
- tạo package `layouts`
- tạo package nhỏ cho mọi thứ
- làm Admin/CMS trước khi có foundation và storefront core
- cài full cả hệ Radix nếu chưa dùng

Dừng và chỉnh lại nếu thấy các dấu hiệu (red flags) sau:

- feature gọi API trực tiếp không qua `packages/api-sdk`
- server state bị copy sang Zustand để cache
- tạo `services/` riêng trong feature
- tạo `constants/` folder trống khắp nơi
- làm Admin/CMS trước foundation
- auth build sâu trước khi spike cookie/middleware pass

### 2.15. Copy-paste lệnh theo thứ tự

```bash
pnpm init
pnpm add -D turbo@2.10.7 typescript@7.0.2 eslint@10.8.0 prettier@3.9.6 husky@9.1.7 lint-staged@16.1.2 @commitlint/cli@20.0.0 @commitlint/config-conventional@20.0.0 tailwindcss@4.3.3 vitest@4.1.10 jsdom@30.0.1 @testing-library/react @testing-library/user-event @playwright/test@1.62.0
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

### 2.16. Git hooks + commit lint setup

```bash
pnpm husky init
```

`.husky/pre-commit` đã chốt làm baseline:

```bash
pnpm lint-staged
```

`.husky/commit-msg` đã chốt làm baseline:

```bash
pnpm commitlint --edit "$1"
```

Root `lint-staged.config.js` đã chốt làm baseline:

```js
module.exports = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{md,json,yaml,yml}": ["prettier --write"]
};
```

Root `commitlint.config.js` đã chốt làm baseline:

```js
module.exports = { extends: ["@commitlint/config-conventional"] };
```

Quy tắc: commit message theo Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`...); `pre-commit` chỉ lint/format file staged, không chạy full test suite (giữ commit nhanh, test đầy đủ chạy ở `turbo run test` riêng hoặc CI sau này).

### 2.17. Bundle analyzer

Chỉ cần ở `apps/*`, không cần root:

```bash
pnpm --filter ./apps/storefront add -D @next/bundle-analyzer
```

`next.config.js` đã chốt làm baseline (áp dụng tương tự cho `admin`/`cms`):

```js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

module.exports = withBundleAnalyzer({});
```

Chạy `ANALYZE=true pnpm --filter ./apps/storefront build` khi cần soi bundle size, không chạy mặc định mỗi lần build.

## 3. Version matrix

Nguồn kiểm tra version: npm registry tại **Thứ Tư, ngày 29 tháng 7 năm 2026**.

Các version dưới đây đã được **chốt làm baseline scaffold FE**.

### 3.1. Dependency matrix

| Nhóm | Package | Version đã chốt | Cài ở đâu |
|---|---|---|---|
| Root tooling | `turbo` | `2.10.7` | root |
| Root tooling | `typescript` | `7.0.2` | root |
| Root tooling | `eslint` | `10.8.0` | root |
| Root tooling | `prettier` | `3.9.6` | root |
| Root tooling | `husky` | `9.1.7` | root |
| Root tooling | `lint-staged` | `16.1.2` | root |
| Root tooling | `@commitlint/cli` | `20.0.0` | root |
| Root tooling | `@commitlint/config-conventional` | `20.0.0` | root |
| Lint config | `typescript-eslint` | `9.4.0` | `packages/eslint-config` |
| Lint config | `eslint-plugin-import-x` | `5.2.0` | `packages/eslint-config` |
| Lint config | `eslint-plugin-boundaries` | `5.0.3` | `packages/eslint-config` |
| Lint config | `eslint-config-next` | `16.2.12` | `packages/eslint-config` |
| Lint config | `eslint-plugin-react` | `7.38.0` | `packages/eslint-config` |
| Lint config | `eslint-plugin-react-hooks` | `6.1.0` | `packages/eslint-config` |
| Lint config | `eslint-plugin-jsx-a11y` | `6.10.2` | `packages/eslint-config` |
| App framework | `@next/bundle-analyzer` | `16.2.12` | `apps/*` |
| App framework | `next` | `16.2.12` | `apps/*` |
| App framework | `react` | `19.2.8` | `apps/*` |
| App framework | `react-dom` | `19.2.8` | `apps/*` |
| App framework | `next-intl` | `4.13.4` | `apps/storefront` |
| Data/state/contract | `@tanstack/react-query` | `5.101.4` | `apps/*`, `packages/hooks` |
| Data/state/contract | `zustand` | `5.0.14` | `apps/*`, `packages/hooks` |
| Data/state/contract | `zod` | `4.4.3` | `packages/schemas`, `packages/api-sdk` |
| Data/state/contract | `msw` | `2.15.0` | `packages/api-sdk` |
| Styling/UI | `tailwindcss` | `4.3.3` | root hoặc `packages/tailwind-config` |
| Styling/UI | `class-variance-authority` | `0.7.1` | `packages/ui` |
| Styling/UI | `clsx` | `2.1.1` | `packages/ui` |
| Styling/UI | `tailwind-merge` | `3.6.0` | `packages/ui` |
| Styling/UI | `tailwindcss-motion` | `1.1.1` | `packages/tailwind-config` |
| Styling/UI | `lucide-react` | `1.27.0` | `packages/ui` |
| Styling/UI | `@radix-ui/react-dialog` | `1.1.23` | `packages/ui` |
| Styling/UI | `@radix-ui/react-tabs` | `1.1.21` | `packages/ui` |
| Styling/UI | `@radix-ui/react-tooltip` | `1.2.16` | `packages/ui` |
| Forms | `react-hook-form` | `7.83.0` | `apps/*` |
| Forms | `@hookform/resolvers` | `5.5.7` | `apps/*` |
| Testing | `vitest` | `4.1.10` | root |
| Testing | `jsdom` | `30.0.1` | root |
| Testing | `@playwright/test` | `1.62.0` | root |

### 3.2. Upgrade policy

| Rule | Chính sách |
|---|---|
| Pin version | Dùng exact version ngay từ commit scaffold đầu tiên |
| Cách nâng | Nâng theo batch, không nâng ngẫu nhiên từng package nhỏ lẻ |
| Batch đề xuất | `tooling`, `app runtime`, `data/state`, `styling/ui`, `test` |
| Khi nâng major | Chỉ nâng khi có lý do rõ ràng và có smoke check sau nâng |
| Khi nâng patch/minor | Gom theo nhóm, không để docs và lockfile lệch nhau |
| Source of truth | lockfile + file này + `FE.md` |
| Nếu lockfile khác docs | lockfile thắng, nhưng phải cập nhật ngược lại docs |

### 3.3. Minimum check sau upgrade

| Kiểm tra | Yêu cầu |
|---|---|
| Install | `pnpm install` pass |
| Typecheck | `pnpm typecheck` pass |
| Lint | `pnpm lint` pass |
| Unit/integration | `pnpm test` pass |
| E2E boot | `pnpm test:e2e` boot được |
| Storefront smoke | app chạy local và mock mode không vỡ |

## 4. Definition of Done

### 4.1. Definition of Done cho FE foundation

FE foundation chỉ được coi là **hoàn thiện toàn bộ** khi tất cả điều kiện sau đều đúng:

- root workspace chạy được
- 3 app tồn tại và boot local được
- shared config dùng được
- shared token dùng được
- Tailwind preset dùng được
- contract schemas dùng được
- api-sdk mock mode dùng được
- ui primitives đầu tiên dùng được
- storefront locale routing chạy được
- test runner boot được
- Playwright boot được
- không có feature gọi API ngoài `packages/api-sdk`
- không có server state bị copy vào Zustand như cache phụ

### 4.2. Verification checklist

Workspace:

- [ ] `pnpm install`
- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`

Apps:

- [ ] `storefront` chạy local
- [ ] `admin` chạy local
- [ ] `cms` chạy local

Foundation packages:

- [ ] `design-tokens` export được
- [ ] `tailwind-config` được app dùng lại
- [ ] `schemas` import được
- [ ] `api-sdk` mock mode chạy được
- [ ] `ui` render được primitive đầu tiên

Test harness:

- [ ] `pnpm test`
- [ ] `pnpm test:e2e` boot được

### 4.3. Gaps còn mở

Foundation xong **không có nghĩa** các câu hỏi sau đã xong — chúng không chặn foundation, nhưng chặn một số feature hoặc hardening sau đó:

- RBAC chi tiết cho `admin/cms`
- auth mock spike với middleware (`MSW + Set-Cookie + Next.js middleware`, theo ADR `0004`)
- analytics thật
- backend integration thật
- Chưa có code scaffold thật cho `apps/*` và `packages/*`
- Chưa có test file thật
- Exact version đã chốt cho baseline scaffold, nhưng chưa được chứng minh bằng package manifest và lockfile thật
- Chưa chốt Storybook có dùng ngay từ Phase 0 hay để sau
- Chưa có xác nhận thực thi từ repo code thật
