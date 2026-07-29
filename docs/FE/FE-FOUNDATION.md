# FE Foundation

Đây là tài liệu chốt riêng cho phần **FE foundation** của website bán hàng này.

Mục tiêu của file này là trả lời rõ:

- FE foundation gồm chính xác những gì
- cái gì phải hoàn thành trước khi build feature storefront/admin/cms
- đầu ra bắt buộc của từng package nền
- khi nào được coi là “xong foundation”

File này không thay thế [`FE.md`](E:/my-pj/FE/docs/FE/FE.md). Nó là bản rút riêng phần nền để execution không bị mơ hồ.

## 1. Định nghĩa FE foundation

`FE foundation` là toàn bộ lớp nền kỹ thuật phải tồn tại trước khi bắt đầu làm feature nghiệp vụ lớn như:

- catalog browse
- PDP
- search
- cart
- wishlist
- auth/account
- checkout
- admin flows
- cms flows

Nói ngắn gọn:

- foundation không phải business feature
- foundation là hạ tầng FE để business feature có thể được build nhanh, nhất quán, và không phải đập đi làm lại

## 2. FE foundation của dự án này bao gồm gì

Phần foundation **bắt buộc phải hoàn thiện** gồm 8 khối sau:

1. Monorepo workspace foundation
2. Shared TypeScript + ESLint + formatting foundation
3. Design token foundation
4. Tailwind preset foundation
5. Contract foundation (`schemas`)
6. API foundation (`api-sdk` + mock adapter + MSW)
7. Shared UI foundation
8. App shell foundation cho `storefront`, `admin`, `cms`

## 3. Những gì không thuộc FE foundation

Các phần sau **không** được coi là foundation:

- Product list thật
- Product detail thật
- Search thật
- Cart thật
- Wishlist thật
- Auth flow hoàn chỉnh
- Checkout flow hoàn chỉnh
- Admin CRUD hoàn chỉnh
- CMS content workflow hoàn chỉnh

Các phần đó là **feature layer**, làm sau khi foundation pass.

## 4. Đầu ra bắt buộc của từng khối foundation

## 4.1. Monorepo workspace foundation

Phải có:

- root `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- thư mục `apps/*`
- thư mục `packages/*`

Pass khi:

- `pnpm install` chạy được
- `turbo` nhận ra apps và packages

## 4.2. Shared config foundation

Phải có:

- `packages/ts-config`
- `packages/eslint-config`
- `.npmrc`
- file format cơ bản

Pass khi:

- `pnpm typecheck` chạy được
- `pnpm lint` chạy được
- app/package có thể extend config dùng chung

## 4.3. Design token foundation

Phải có:

- color tokens
- spacing tokens
- typography tokens
- radius
- shadow
- motion
- breakpoints

Pass khi:

- token export được từ `packages/design-tokens`
- typography token support tiếng Việt
- không có hard-coded design value trong shared setup mẫu

## 4.4. Tailwind foundation

Phải có:

- `packages/tailwind-config`
- preset dùng chung cho 3 app
- mapping từ token sang Tailwind/CSS vars
- plugin motion nếu dùng

Pass khi:

- 3 app dùng chung preset được
- class utility và token chạy thống nhất
- không cần mỗi app tự định nghĩa theme riêng

## 4.5. Contract foundation

Phải có:

- `packages/schemas`
- common schemas
- auth schemas
- catalog schemas
- cart schemas
- wishlist schemas
- account schemas
- checkout schemas
- admin schemas
- cms schemas
- error envelope schemas

Pass khi:

- app import được schema
- schema dùng lại được cho form validation và API contract

## 4.6. API foundation

Phải có:

- `packages/api-sdk`
- fetch wrapper
- env switch mock/real
- MSW handlers
- typed endpoint functions

Pass khi:

- mock mode boot được
- request path đi qua `api-sdk`
- feature không gọi `fetch` trực tiếp ra ngoài hợp đồng chung

## 4.7. Shared UI foundation

Phải có:

- `packages/ui`
- primitive UI components đầu tiên
- layout primitives
- helper class utilities
- variant pattern qua `cva`

Pass khi:

- app render được vài component nền
- component dùng chung token và Tailwind preset
- không rò business logic vào `packages/ui`

## 4.8. App shell foundation

Phải có cho cả:

- `apps/storefront`
- `apps/admin`
- `apps/cms`

Mỗi app tối thiểu cần:

- app directory chạy được
- global styles
- provider layer
- base layout
- script `dev/build/lint/typecheck/test`

Riêng `storefront` cần thêm:

- locale routing foundation
- `next-intl` bootstrap

Pass khi:

- 3 app boot được local
- `storefront` route locale chạy được
- provider shell không vỡ

## 5. Thứ tự hoàn thành foundation đã chốt

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

## 6. Definition of Done cho FE foundation

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

## 7. Verification checklist

### Workspace

- [ ] `pnpm install`
- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`

### Apps

- [ ] `storefront` chạy local
- [ ] `admin` chạy local
- [ ] `cms` chạy local

### Foundation packages

- [ ] `design-tokens` export được
- [ ] `tailwind-config` được app dùng lại
- [ ] `schemas` import được
- [ ] `api-sdk` mock mode chạy được
- [ ] `ui` render được primitive đầu tiên

### Test harness

- [ ] `pnpm test`
- [ ] `pnpm test:e2e` boot được

## 8. Mốc chuyển sang feature layer

Chỉ sau khi foundation pass mới bắt đầu:

1. storefront catalog browse
2. storefront PDP
3. storefront search
4. cart/wishlist
5. auth/account
6. checkout
7. admin feature
8. cms feature

## 9. Những thứ vẫn mở sau khi foundation hoàn tất

Foundation xong **không có nghĩa** các câu hỏi sau đã xong:

- RBAC chi tiết cho `admin/cms`
- auth mock spike với middleware
- analytics thật
- backend integration thật

Chúng không chặn foundation, nhưng chặn một số feature hoặc hardening sau đó.

## 10. Checklist chi tiết theo từng package

Phần này dùng như checklist nghiệm thu thật cho từng package hoặc app shell.

## 10.1. `packages/ts-config`

### Bắt buộc phải có

- [ ] `base.json`
- [ ] `nextjs.json`
- [ ] `react-library.json`

### Rule bắt buộc

- [ ] `strict: true`
- [ ] `noImplicitAny: true`
- [ ] `verbatimModuleSyntax: true`
- [ ] `moduleResolution: Bundler`
- [ ] `noEmit: true`

### Pass khi

- [ ] app Next.js extend được config
- [ ] package library extend được config
- [ ] `pnpm typecheck` không fail vì config nền

## 10.2. `packages/eslint-config`

### Bắt buộc phải có

- [ ] base config
- [ ] ignore cho `.next`, `dist`, `coverage`, `test-results`
- [ ] import/order rules
- [ ] boundaries rules

### Rule bắt buộc

- [ ] không cho feature gọi API trực tiếp ngoài `@repo/api-sdk`
- [ ] không import xuyên feature bừa bãi
- [ ] ưu tiên `import type` khi phù hợp
- [ ] cấm `any` không có lý do

### Pass khi

- [ ] app dùng được config lint chung
- [ ] package dùng được config lint chung
- [ ] `pnpm lint` chạy được ở toàn workspace

## 10.3. `packages/design-tokens`

### Bắt buộc phải có

- [ ] `colors.ts`
- [ ] `spacing.ts`
- [ ] `typography.ts`
- [ ] `radius.ts`
- [ ] `shadow.ts`
- [ ] `motion.ts`
- [ ] `breakpoints.ts`
- [ ] `index.ts`

### Rule bắt buộc

- [ ] token được export tập trung
- [ ] typography support glyph tiếng Việt
- [ ] line-height đủ an toàn cho uppercase tiếng Việt
- [ ] không có locale-specific typography override

### Pass khi

- [ ] `packages/ui` import được token
- [ ] app render được style từ token
- [ ] không phải hard-code spacing/color trong shared setup mẫu

## 10.4. `packages/tailwind-config`

### Bắt buộc phải có

- [ ] shared preset
- [ ] mapping token -> theme
- [ ] plugin motion nếu dùng

### Rule bắt buộc

- [ ] 3 app dùng chung một preset
- [ ] không tạo theme tách rời cho từng app ở Phase 0
- [ ] motion nếu dùng thì ưu tiên `storefront`

### Pass khi

- [ ] `storefront` nhận được preset
- [ ] `admin` nhận được preset
- [ ] `cms` nhận được preset
- [ ] utility class và CSS vars hoạt động thống nhất

## 10.5. `packages/schemas`

### Bắt buộc phải có

- [ ] `common/`
- [ ] `auth/`
- [ ] `catalog/`
- [ ] `cart/`
- [ ] `wishlist/`
- [ ] `account/`
- [ ] `checkout/`
- [ ] `admin/`
- [ ] `cms/`
- [ ] `errors/`
- [ ] `index.ts`

### Rule bắt buộc

- [ ] error envelope có schema chung
- [ ] request/response schema tách rõ
- [ ] schema dùng lại được cho form validation khi hợp lý

### Pass khi

- [ ] app import được schema
- [ ] `api-sdk` dùng được schema
- [ ] mock handler bám theo schema

## 10.6. `packages/api-sdk`

### Bắt buộc phải có

- [ ] `client/`
- [ ] `endpoints/`
- [ ] `mocks/`
- [ ] `adapters/`
- [ ] `env/`
- [ ] `index.ts`

### Rule bắt buộc

- [ ] fetch wrapper dùng `credentials: "include"`
- [ ] có env switch mock/real
- [ ] endpoint function typed
- [ ] mock handlers nằm trong `api-sdk`
- [ ] feature/app không gọi API trực tiếp bên ngoài package này

### Pass khi

- [ ] mock mode boot được
- [ ] query function gọi qua `api-sdk`
- [ ] `NEXT_PUBLIC_API_MOCKING=true` cho mock mode

## 10.7. `packages/ui`

### Bắt buộc phải có

- [ ] `components/`
- [ ] `primitives/`
- [ ] `layout/`
- [ ] `lib/`
- [ ] `index.ts`

### Primitive tối thiểu nên có

- [ ] `Button`
- [ ] `Input`
- [ ] `Label`
- [ ] `Dialog/Modal`
- [ ] `Tabs`
- [ ] `Tooltip`
- [ ] `Container`
- [ ] `Grid`
- [ ] `Stack`
- [ ] `Section`

### Rule bắt buộc

- [ ] component dùng token chung
- [ ] variant đi qua `cva`
- [ ] class merge qua `clsx` + `tailwind-merge` khi cần
- [ ] không nhét business logic vào `packages/ui`

### Pass khi

- [ ] `storefront` render được primitive đầu tiên
- [ ] `admin` render được primitive đầu tiên
- [ ] `cms` render được primitive đầu tiên

## 10.8. `packages/commerce`

### Bắt buộc phải có

- [ ] package tồn tại
- [ ] `index.ts`

### Rule bắt buộc

- [ ] chỉ đưa vào đây component nghiệp vụ có khả năng share thật
- [ ] không chuyển toàn bộ storefront component vào package này từ đầu

### Pass khi

- [ ] package resolve được
- [ ] chưa cần nhiều component, nhưng boundary phải rõ

## 10.9. `packages/hooks`

### Bắt buộc phải có

- [ ] query key factories
- [ ] shared hooks thật sự cross-app hoặc cross-feature
- [ ] `index.ts`

### Rule bắt buộc

- [ ] không biến package này thành nơi nhét mọi hook
- [ ] hook nào chỉ dùng 1 feature thì giữ ở feature trước

### Pass khi

- [ ] app import được shared hook đầu tiên
- [ ] query key pattern dùng được trong app

## 10.10. `packages/utils`

### Bắt buộc phải có

- [ ] helper thuần
- [ ] parser/formatter cơ bản
- [ ] `index.ts`

### Rule bắt buộc

- [ ] không chứa React hook
- [ ] không chứa UI render logic
- [ ] không chứa network call

### Pass khi

- [ ] app import được helper đầu tiên
- [ ] test unit được helper thuần đầu tiên

## 11. Checklist chi tiết theo từng app shell

## 11.1. `apps/storefront`

### Bắt buộc phải có

- [ ] `app/[locale]/`
- [ ] `globals.css`
- [ ] `src/providers/`
- [ ] `src/features/`
- [ ] `package.json`

### Foundation bắt buộc

- [ ] locale routing boot được
- [ ] `QueryClientProvider` boot được
- [ ] mock mode boot được
- [ ] app render được shared UI primitive đầu tiên
- [ ] app import được schema đầu tiên
- [ ] app gọi được endpoint mock đầu tiên qua `api-sdk`

### Pass khi

- [ ] `pnpm --filter ./apps/storefront dev`
- [ ] route locale như `/vi` hoặc `/en` chạy được
- [ ] app không vỡ khi dùng provider shell

## 11.2. `apps/admin`

### Bắt buộc phải có

- [ ] `app/(protected)/`
- [ ] `globals.css`
- [ ] `src/providers/`
- [ ] `src/features/`
- [ ] `package.json`

### Foundation bắt buộc

- [ ] provider shell boot được
- [ ] app render được shared UI primitive đầu tiên
- [ ] app import được schema đầu tiên
- [ ] app gọi được endpoint mock đầu tiên qua `api-sdk`

### Pass khi

- [ ] `pnpm --filter ./apps/admin dev`
- [ ] protected shell boot được ở mức khung

## 11.3. `apps/cms`

### Bắt buộc phải có

- [ ] `app/(protected)/`
- [ ] `globals.css`
- [ ] `src/providers/`
- [ ] `src/features/`
- [ ] `package.json`

### Foundation bắt buộc

- [ ] provider shell boot được
- [ ] app render được shared UI primitive đầu tiên
- [ ] app import được schema đầu tiên
- [ ] app gọi được endpoint mock đầu tiên qua `api-sdk`

### Pass khi

- [ ] `pnpm --filter ./apps/cms dev`
- [ ] protected shell boot được ở mức khung

## 12. Foundation completion gate

Chỉ được nói "FE foundation hoàn thiện toàn bộ" khi:

- [ ] mọi checklist package ở mục 10 đã pass
- [ ] mọi checklist app shell ở mục 11 đã pass
- [ ] checklist verification ở mục 7 đã pass

Nếu thiếu bất kỳ mục nào ở trên, trạng thái đúng là:

- `Foundation đang triển khai`, hoặc
- `Foundation mới hoàn thiện một phần`
