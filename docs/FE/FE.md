# FE

Đây là tài liệu chính để làm Frontend.

Mục tiêu của file này là đủ cụ thể để bắt đầu scaffold và build FE thật, không chỉ dừng ở mức định hướng.

Nếu cần xem riêng phần kiến trúc Frontend cho cả `storefront`, `admin`, `cms`, module chung, package responsibilities, cấu trúc app chi tiết, và design system, xem [`FE-ARCHITECTURE.md`](E:/my-pj/FE/docs/FE/FE-ARCHITECTURE.md).

Nếu cần xem riêng phần nền kỹ thuật phải hoàn thành trước mọi feature (foundation checklist, bootstrap steps, version matrix, Definition of Done), xem [`FE-EXECUTION.md`](E:/my-pj/FE/docs/FE/FE-EXECUTION.md).

## 1. Trạng thái quyết định

- `Đã chốt`: đã được chấp nhận làm quyết định làm việc hiện hành cho FE
- `Mở`: còn phụ thuộc spike kỹ thuật, backend, hoặc quyết định business khác

## 1.1. Kết luận chốt FE ngày 29/07/2026

Phạm vi của file này đã được chốt ở mức **đủ để scaffold và build Frontend thật**.

Những quyết định chỉ ảnh hưởng FE foundation và không còn trade-off lớn đã được nâng lên `Đã chốt`.

Những thứ vẫn giữ `Mở` là:

- chi tiết RBAC cho `admin/cms`
- spike kỹ thuật refresh/retry concurrency + protected-route bootstrapping
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

- `Đã chốt` `Zod` cho runtime validation trong `packages/schemas`; transport schemas chuyển sang generated/adapted từ OpenAPI version đã pin sau API v1 handshake
- `Đã chốt` `MSW` cho mock API
- `Đã chốt` `TanStack Query` cho server state
- `Đã chốt` `Zustand` cho client state dùng chung
- `Đã chốt` `next-intl` cho storefront locale routing

Lý do:

- Decision `#13`: `packages/schemas` dùng Zod
- Decision `#64`: versioned OpenAPI artifact từ BE là canonical transport contract sau API v1 handshake
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

## 4.7. 3D visualization (chỉ `storefront`, chỉ PDP)

- `Đã chốt` `three`
- `Đã chốt` `@react-three/fiber`
- `Đã chốt` `@react-three/drei`

Lý do:

- Decision `#59`: PDP product viewer 3D xoay 360°, đồng bộ màu theo Variant đang chọn — vị trí duy nhất dùng Three.js trong FE, lazy-load bắt buộc để không ảnh hưởng Lighthouse > 95 của các trang khác
- chi tiết kiến trúc và ràng buộc lazy-load xem [`FE-ARCHITECTURE.md`](E:/my-pj/FE/docs/FE/FE-ARCHITECTURE.md) §4.1.1

## 4.8. PWA (chỉ `storefront`, chỉ production)

- `Đã chốt` `@ducanh2912/next-pwa`

Lý do:

- Decision `#58`: installable + offline-capable cho `storefront`; chỉ bật ở production build để tránh xung đột scope với service worker của MSW (Decision #28, chỉ chạy ở dev/mock mode)
- không dùng cho `admin`/`cms` (app nội bộ, không cần installable)

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
dotenv
cross-env
```

`Optional` ở đây nghĩa là hữu ích cho local workflow, không phải requirement business. `husky`/`lint-staged`/`commitlint`/`@next/bundle-analyzer` đã chốt dùng (Decision `#52`, `#54`) — xem [`FE-EXECUTION.md`](E:/my-pj/FE/docs/FE/FE-EXECUTION.md) §2.16–§2.17, không còn là optional.

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

## 7. i18n

- Chỉ storefront là đa locale UI
- Locale hiện tại là `vi` và `en`
- Default locale là `vi`
- Thiếu translation thì fallback về `vi`
- Typography token dùng chung cho mọi locale
- `SUPPORTED_LOCALES` là nguồn sự thật duy nhất trong code

### 7.1. Vị trí đã chốt cho Phase 0

```text
packages/utils/src/i18n/
  locales.ts
  localized-text.ts
  fallback.ts
```

Không tách package i18n riêng ở Phase 0. Nếu sau này đủ lớn mới tách.

## 8. Auth ở FE

- FE chỉ nên phụ thuộc vào `httpOnly` session-cookie contract
- Không lưu token dài hạn trong `localStorage`
- Route guard ở FE chỉ là UX layer
- Permission thật phải được backend enforce

### 8.1. Điều vẫn còn mở và cần spike sớm

Theo ADR `0004`, cần spike nhỏ để xác nhận:

- MSW mock auth
- `Set-Cookie`
- Next.js middleware

có hoạt động đúng với nhau hay không.

Không nên build toàn bộ `use-auth` trước khi spike này pass.

## 9. Performance

### 9.1. Storefront

- LCP `< 2.5s`
- CLS `< 0.1`
- INP `< 200ms`
- Lighthouse `> 95`

### 9.2. Admin/CMS

- LCP `< 4s`
- INP `< 500ms`

### 9.3. Cách hỗ trợ performance

- self-host font
- subset font Latin + Vietnamese glyph
- hạn chế runtime styling overhead
- giữ shared primitives gọn
- tránh over-fetching

## 10. FE delivery order

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

## 11. Nguồn gốc nội dung

File này tổng hợp từ:

- `01-delivery/architecture/frontend`
- `01-delivery/specification/technical-design.md`
- `01-delivery/specification/implementation-plan.md`
- `00-core/decision-log.md`
- `00-core/adr/0010-jwt-access-with-rotating-refresh.md` (thay thế ADR 0004)
- `01-delivery/security/security-baseline.md`
