# FE Versions

File này thuộc bộ tài liệu Frontend trong thư mục `docs/FE/`.

Theo dõi dependency matrix và policy nâng version cho Frontend.

Nguồn kiểm tra version: npm registry tại **Thứ Tư, ngày 29 tháng 7 năm 2026**.

Các version trong file này đã được **chốt làm baseline scaffold FE**.

## Dependency Matrix

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

## Upgrade Policy

| Rule | Chính sách |
|---|---|
| Pin version | Dùng exact version ngay từ commit scaffold đầu tiên |
| Cách nâng | Nâng theo batch, không nâng ngẫu nhiên từng package nhỏ lẻ |
| Batch đề xuất | `tooling`, `app runtime`, `data/state`, `styling/ui`, `test` |
| Khi nâng major | Chỉ nâng khi có lý do rõ ràng và có smoke check sau nâng |
| Khi nâng patch/minor | Gom theo nhóm, không để docs và lockfile lệch nhau |
| Source of truth | lockfile + file này + `FE.md` |
| Nếu lockfile khác docs | lockfile thắng, nhưng phải cập nhật ngược lại docs |

## Minimum Check Sau Upgrade

| Kiểm tra | Yêu cầu |
|---|---|
| Install | `pnpm install` pass |
| Typecheck | `pnpm typecheck` pass |
| Lint | `pnpm lint` pass |
| Unit/integration | `pnpm test` pass |
| E2E boot | `pnpm test:e2e` boot được |
| Storefront smoke | app chạy local và mock mode không vỡ |
