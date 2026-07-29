# FE Bootstrap Checklist

Mục tiêu của file này là giúp bắt đầu scaffold Frontend thật nhanh.

File này không thay thế [`FE.md`](E:/my-pj/FE/docs/FE/FE.md). Nó chỉ là runbook ngắn gọn để làm theo.

Trạng thái hiện tại: checklist này dùng các quyết định FE đã chốt làm baseline scaffold.

## 1. Mục tiêu bootstrap

Sau khi hoàn tất checklist này, dự án FE cần đạt:

- monorepo chạy được
- 3 app tồn tại
- shared packages tồn tại
- mock-first foundation chạy được
- i18n foundation cho storefront có thể bắt đầu
- test runner boot được

## 2. Thứ tự thực hiện

1. Tạo root workspace
2. Tạo `apps/*` và `packages/*`
3. Cài root dev tools
4. Cài dependency cho từng app/package
5. Tạo shared config packages
6. Tạo `schemas`
7. Tạo `api-sdk` + mock layer
8. Tạo `design-tokens` + `tailwind-config`
9. Tạo `ui`
10. Bootstrap `storefront`
11. Kiểm tra script và runner

## 3. Lệnh bootstrap nhanh

### 3.1. Root init

```bash
pnpm init
pnpm add -D turbo@2.10.7 typescript@7.0.2 eslint@10.8.0 prettier@3.9.6 tailwindcss@4.3.3 vitest@4.1.10 jsdom@30.0.1 @testing-library/react @testing-library/user-event @playwright/test@1.62.0
```

Ghi chú:

- đây là root dev tooling
- không dùng `"workspace:*"` cho các package npm ngoài như `turbo`, `typescript`, `eslint`, `prettier`

### 3.2. Tạo thư mục

```powershell
New-Item -ItemType Directory -Force apps\storefront, apps\admin, apps\cms, packages\design-tokens, packages\tailwind-config, packages\ui, packages\commerce, packages\schemas, packages\api-sdk, packages\hooks, packages\utils, packages\eslint-config, packages\ts-config
```

### 3.3. Cài dependency theo workspace

```bash
pnpm --filter ./apps/storefront add next@16.2.12 react@19.2.8 react-dom@19.2.8 next-intl@4.13.4 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./apps/admin add next@16.2.12 react@19.2.8 react-dom@19.2.8 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./apps/cms add next@16.2.12 react@19.2.8 react-dom@19.2.8 @tanstack/react-query@5.101.4 zustand@5.0.14 react-hook-form@7.83.0 @hookform/resolvers@5.5.7
pnpm --filter ./packages/schemas add zod@4.4.3
pnpm --filter ./packages/api-sdk add zod@4.4.3 msw@2.15.0
pnpm --filter ./packages/ui add class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.6.0 @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog@1.1.23 @radix-ui/react-tabs@1.1.21 @radix-ui/react-tooltip@1.2.16
pnpm --filter ./packages/hooks add @tanstack/react-query@5.101.4 zustand@5.0.14
pnpm --filter ./packages/tailwind-config add -D tailwindcss-motion@1.1.1
```

## 3.4. Version đã chốt

Xem bảng ngắn gọn tại [`FE-VERSIONS.md`](E:/my-pj/FE/docs/FE/FE-VERSIONS.md).

## 3.5. `.npmrc` đề xuất

```ini
save-exact=true
auto-install-peers=true
strict-peer-dependencies=false
```

## 4. File tối thiểu cần có ở root

Phải có:

```text
package.json
pnpm-workspace.yaml
turbo.json
.gitignore
.editorconfig
```

Nên có:

```text
.npmrc
.prettierrc
.prettierignore
eslint.config.js
```

## 5. `pnpm-workspace.yaml` tối thiểu

```yaml
packages:
  - apps/*
  - packages/*
```

## 6. `turbo.json` tối thiểu

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
    }
  }
}
```

## 6.1. `tsconfig` base tối thiểu

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

## 7. Cây thư mục tối thiểu sau bootstrap

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

## 8. Package bootstrap order

### 8.1. Bắt buộc làm trước

- `packages/ts-config`
- `packages/eslint-config`
- `packages/design-tokens`
- `packages/tailwind-config`
- `packages/schemas`
- `packages/api-sdk`
- `packages/ui`

### 8.2. Sau đó mới làm app

- `apps/storefront`
- `apps/admin`
- `apps/cms`

## 9. Storefront bootstrap order

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

## 10. Env tối thiểu

```text
NEXT_PUBLIC_API_MOCKING=true
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=vi
NEXT_PUBLIC_SUPPORTED_LOCALES=vi,en
```

## 10.1. Config motion nếu dùng Rombo

Nếu dùng motion plugin cho storefront:

```ts
import motion from "tailwindcss-motion";

export default {
  plugins: [motion]
};
```

## 11. Scripts tối thiểu cho mỗi app

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

## 12. Bootstrap pass criteria

Được coi là pass khi:

- `pnpm install` chạy thành công
- workspace resolve được app và packages
- `pnpm build` không vỡ vì config cơ bản
- `pnpm lint` chạy được
- `pnpm typecheck` chạy được
- `pnpm test` chạy được dù chưa có nhiều test
- `pnpm test:e2e` boot được runner
- `storefront` chạy local
- locale foundation bắt đầu dùng được
- mock mode bootstrap được

## 13. Những thứ chưa cần làm ngay

- Storybook
- analytics thật
- visual regression đầy đủ
- tối ưu performance sâu
- admin/cms feature đầy đủ trước khi storefront core xong
- package hoá quá nhỏ

## 14. Red flags

Nếu gặp các dấu hiệu sau thì nên dừng và chỉnh lại:

- feature gọi API trực tiếp không qua `packages/api-sdk`
- server state bị copy sang Zustand để cache
- tạo `services/` riêng trong feature
- tạo `constants/` folder trống khắp nơi
- làm Admin/CMS trước foundation
- auth build sâu trước khi spike cookie/middleware pass

## 15. File tham chiếu chính

- [`FE.md`](E:/my-pj/FE/docs/FE/FE.md)
- [`SRS.md`](E:/my-pj/FE/docs/SRS.md)
- [`TEST.md`](E:/my-pj/FE/docs/TEST.md)
