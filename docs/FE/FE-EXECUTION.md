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

_(sẽ điền ở commit gộp `FE-FOUNDATION.md`)_

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
pnpm add -D turbo typescript eslint prettier
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
module.exports = [
  {
    ignores: ["dist/**", ".next/**", "coverage/**", "test-results/**"]
  }
];
```

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

_(sẽ điền ở commit gộp `FE-FOUNDATION.md`)_
