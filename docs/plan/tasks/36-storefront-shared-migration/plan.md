# Plan 36: Shared components và cơ chế dùng chung

Branch: `impl/36-shared-migration` (từ `refactor/36-storefront-shared-migration` = `dev` c4f9662). Một PR, không đổi UI/URL/hành vi.

## Blocker và trạng thái

- Task 35: `done` (PR #118 merged vào `dev`; PR #119 merge commit `eb8f088` đặt status done và ghi ngày merge). Checkout sạch; manifest chỉ lệch ở chỗ `PageLoader.test.tsx`, `QueryState.test.tsx`, `lib/motion.test.ts` đã tồn tại cạnh source (đi cùng owner); manifest đã được làm mới theo path đích.

## Mapping (cũ → đích, theo boundaries.md)

| Cũ                                                                                                                    | Đích                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/ui/*` (31 file + 5 test)                                                                                      | `shared/components/*`                                                                                                                                                                                                                                     |
| `shared/constants/{routes,auth-cookies}.ts`                                                                           | `shared/routing/`                                                                                                                                                                                                                                         |
| `shared/lib/{motion,focusRing}.ts` (+ `motion.test.ts`)                                                               | `shared/styles/`                                                                                                                                                                                                                                          |
| `shared/lib/notification.ts` + test                                                                                   | `shared/feedback/`                                                                                                                                                                                                                                        |
| `shared/lib/hooks/useApiMutation.ts` + test                                                                           | `shared/queries/`                                                                                                                                                                                                                                         |
| `shared/lib/hooks/createPersistedListStore.ts` + test                                                                 | `shared/persistence/`                                                                                                                                                                                                                                     |
| `shared/utils/pagination.ts` + test                                                                                   | `shared/pagination/`                                                                                                                                                                                                                                      |
| `shared/utils/utils.ts`: `cn` / `formatCurrency` (+ tests tách theo owner)                                            | `shared/styles/cn.ts` / `shared/formatting/currency.ts`                                                                                                                                                                                                   |
| `shared/utils/utils.ts`: formatDate, formatDateTime, slugify, buildQueryString, truncateText, validateVietnamesePhone | giữ `shared/utils/utils.ts` (export chưa rõ consumer; không xóa, không công khai thêm). Owner: task 44 (khóa migration và xóa ngoại lệ đã hết consumer); đợt xóa: task 44 chứng minh consumer từng export và xóa hoặc giữ thành inactive exception có tên |
| `shared/lib/monitoring/sentry.ts`                                                                                     | `shared/monitoring/sentry.ts`                                                                                                                                                                                                                             |

Giữ tại chỗ (ngoài scope, owner slice khác hoặc không đổi): `app-config`, `query-keys`, `env`, `errors`, `useLocalStorage`, `useMediaQuery`, `usePagination`, `cloudinary`, `seo`, `query-client`, `api-mocking`, `mock-content`, `useCanRender3D`, `types/user`.

## Consumer, mock string, config

- Mọi import `@/shared/...` cũ (65 consumer shared UI cùng các consumer routes/cookies/notification/useApiMutation/persisted store/cn/currency/sentry) đổi bằng một lượt thay thế đường dẫn; `vi.mock('@/shared/...')` string cùng lượt.
- `vitest.config.ts`: glob `shared/ui/{...}` → `shared/components/{...}`; exclude `shared/lib/monitoring/**` → `shared/monitoring/**`; thêm glob thư mục đích mới (`feedback, formatting, pagination, persistence, queries, styles`) để tập file collected tương đương; ngưỡng 99 giữ nguyên.
- `eslint.boundaries.mjs` / `scripts/check-module-boundaries.ts` đã nhận path đích (task 35), `COVERAGE_MANIFEST` đối chiếu path mới; không đổi.
- Docs: `docs/architecture.md`, `AGENTS.md`, `.claude/rules/**` (đường dẫn `shared/ui` → `shared/components`, routes, notification).

## Seams kiểm thử

Test colocated chuyển cùng source (notification, useApiMutation, createPersistedListStore, pagination, motion, ConfirmDialog, Pagination, QuantitySelector, PageLoader, QueryState); `utils.test.ts` tách thành `styles/cn.test.ts`, `formatting/currency.test.ts` và phần còn lại, giữ nguyên assertion. Consumer tests chạy qua `pnpm test`.

## Các bước

1. [x] `git mv` source + test, đổi import/mock string bằng thay thế đường dẫn.
2. [x] Tách `cn` / `formatCurrency`; cập nhật consumer (`PriceDisplay` import cả hai).
3. [x] Cập nhật `vitest.config.ts` glob (tập file tương đương, ngưỡng không đổi).
4. [x] `eslint --fix` (thứ tự import), prettier.
5. [x] Docs hiện trạng.
6. [x] Bổ sung test hành vi colocated cho phần đã chuyển chưa có test (yêu cầu người dùng: unit coverage tập đã chuyển ≥ 50%); không đổi assertion hay ngưỡng vitest.
7. [x] Gates: focused vitest, `pnpm lint`, `pnpm format:check`, `pnpm docs:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, `pnpm build`. Không chạy E2E/production theo quyết định người dùng.

## Rủi ro và rollback

- Thay thế đường dẫn hàng loạt có thể bỏ sót import động/chuỗi; `tsc`, ESLint `import-x` và checker boundaries (resolve path) bắt các trường hợp này.
- Rollback: revert cùng lượt toàn bộ commit source/import/coverage/docs; không có implementation kép giữ lại.
