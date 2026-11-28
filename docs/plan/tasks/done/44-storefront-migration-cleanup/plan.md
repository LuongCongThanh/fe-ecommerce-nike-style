# Plan 44: Khóa migration và xóa ngoại lệ đã hết consumer

Branch: `refactor/44-storefront-migration-cleanup` (từ `dev`). Một PR, không đổi UI/URL/hành vi, không đổi SDK/generated/pin.

## Blocker

Task 40, 42, 43 `done` (xác nhận trong spec của từng task). Checkout sạch trên `dev` mới nhất.

## Audit path literal (source, test, config, CI, scripts, skills, docs live)

- Import active `@/features`, `@/lib`, `shared/ui`, `app/_composition`, `storefront-shell` trong `src`, `e2e`, `scripts`: 0. `src/features` và `src/lib` không còn tồn tại.
- Còn root cũ trong config/check (xóa): `eslint.boundaries.mjs` (`features/<module>`, `features/storefront-shell`), `scripts/check-module-boundaries.ts` (`ROOTS`, regex `locate`).
- `COVERAGE_MANIFEST` còn khóa path cũ (`shared/ui`, `shared/lib/*`, `shared/utils` tách) → đổi sang path hiện hành, giá trị `null` (file ở nguyên chỗ); file biến mất vẫn bị báo.
- `vitest.config.ts`, `package.json`, `scripts/gen-api.mjs`, `.github/workflows/ci.yml`, `eslint.config.mjs`: không còn path cũ; production harness (`playwright.production.config.ts`, `e2e/production/*`, job `production-browser`, script `test:e2e:production`) tồn tại.
- Docs live: `AGENTS.md`, `docs/architecture/README.md`, rule trong `.claude/rules` còn nhắc `src/features` → cập nhật hiện trạng. Artifact task lịch sử, `docs/research`, `docs/plan/tasks/done/16-storefront-refactor-map/design.md` (bảng mapping lịch sử) giữ nguyên.

## Ngoại lệ

- Known violation/cycle: rỗng (task 42). Giữ rỗng.
- `shared/utils/utils.ts`: 6 export (`formatDate`, `formatDateTime`, `slugify`, `buildQueryString`, `truncateText`, `validateVietnamesePhone`) không có consumer ngoài `utils.test.ts`. Quyết định: giữ thành inactive exception có tên (không xóa vì file nằm trong coverage scope và spec cấm xóa ngầm inactive helper; không cấp API mới). Ghi trong `docs/architecture/README.md`.
- Wrapper `(auth)/layout`, `account/layout`, `checkout/layout`: đã mỏng (layout cột trung tâm / `AuthGuard`), giữ trong `app`.

## Test seams

`scripts/check-module-boundaries.test.ts` và `scripts/eslint-boundaries.test.ts` chuyển fixture từ root cũ sang `src/modules/*`; fixture âm (layer, private, wrong-symbol, cycle, unregistered-module) giữ nguyên ý nghĩa. Thêm regression: root cũ không còn được map vào module/layer.

## Rollback

Revert PR; config/rules/docs độc lập, không cần revert module migration.
