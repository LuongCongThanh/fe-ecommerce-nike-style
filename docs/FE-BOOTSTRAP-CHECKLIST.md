# FE Bootstrap Checklist

Mục tiêu của file này là giúp bắt đầu scaffold Frontend thật nhanh.

File này không thay thế [`FE.md`](E:/my-pj/FE/docs/FE.md). Nó chỉ là runbook ngắn gọn để làm theo.

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
pnpm add -D turbo typescript eslint prettier
```

### 3.2. Tạo thư mục

```powershell
New-Item -ItemType Directory -Force apps\storefront, apps\admin, apps\cms, packages\design-tokens, packages\tailwind-config, packages\ui, packages\commerce, packages\schemas, packages\api-sdk, packages\hooks, packages\utils, packages\eslint-config, packages\ts-config
```

### 3.3. Cài dependency theo workspace

```bash
pnpm --filter ./apps/storefront add next react react-dom next-intl @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./apps/admin add next react react-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./apps/cms add next react react-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers
pnpm --filter ./packages/schemas add zod
pnpm --filter ./packages/api-sdk add zod msw
pnpm --filter ./packages/ui add class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-tooltip
pnpm --filter ./packages/hooks add @tanstack/react-query zustand
pnpm add -D tailwindcss vitest jsdom @testing-library/react @testing-library/user-event @playwright/test
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
NEXT_PUBLIC_API_MOCKING=
NEXT_PUBLIC_APP_ENV=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_DEFAULT_LOCALE=vi
NEXT_PUBLIC_SUPPORTED_LOCALES=vi,en
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

- [`FE.md`](E:/my-pj/FE/docs/FE.md)
- [`SRS.md`](E:/my-pj/FE/docs/SRS.md)
- [`TEST.md`](E:/my-pj/FE/docs/TEST.md)
