# Plan 39: Integration Backend và generated contract chuyển đồng lượt

Branch: `refactor/39-storefront-backend-integration` (từ `dev`). Một PR, không đổi UI/URL/hành vi, không đổi contract pin.

## Blocker

Task 38 `done` (PR #125, #126). Checkout sạch trên `dev` mới nhất.

## Mapping (cũ → đích)

| Cũ                                                                                    | Đích                                                           |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `lib/api/{adapters,client,endpoints,env,generated,mocks,models,testing}/**` (36 file) | `integrations/backend/<cùng thư mục>/**` (`git mv`)            |
| `lib/schemas/<domain>/<name>.ts` (12 file)                                            | `integrations/backend/schemas/<domain>/<name>.schema.ts` (ADR) |
| `shared/lib/api-mocking.ts`                                                           | `integrations/backend/adapters/browser-bootstrap.ts`           |
| `shared/types/user.ts`                                                                | `integrations/backend/models/user.types.ts`                    |
| `shared/lib/errors/api-error.ts` (re-export SDK class)                                | xóa; consumer import `integrations/backend/client/api-error`   |
| `shared/lib/errors/api-error.test.ts` (7 test)                                        | gộp vào `integrations/backend/client/api-error.test.ts`        |

## Consumer, mock string, config

- Mọi import `@/lib/api/*`, `@/lib/schemas/*`, `@/shared/lib/{api-mocking,errors/api-error}`, `@/shared/types/user` (source, type, test, `vi.mock` string, `e2e/support`, `instrumentation.node.ts`) đổi bằng một lượt; comment path cũng đổi.
- `scripts/gen-api.mjs` (OUTPUT + header), `package.json` (`gen:api` prettier path), `.github/workflows/ci.yml` (`git diff --exit-code`), `scripts/contract-bump.sh`.
- `eslint.config.mjs` (ignore generated, override mocks), `eslint.boundaries.mjs` (bỏ root cũ).
- `scripts/check-module-boundaries.ts`: bỏ hai root cũ (`lib/api`, `lib/schemas`); các test cho root cũ trong `check-module-boundaries.test.ts` / `eslint-boundaries.test.ts` bị bỏ vì path cũ không còn tồn tại (path đích giữ nguyên case).
- `vitest.config.ts`: thêm `browser-bootstrap.ts` và `client/api-error.ts` vào coverage include (file đã rời glob `shared/lib`).
- Docs/rules: `docs/{architecture,overview,api-integration}.md`, research, `AGENTS.md`, `.claude/rules/**`, `.github/copilot-instructions.md`, skill `feature`, fixture guard.

## Seams kiểm thử

Test SDK/schema/mapper/Node adapter chỉ đổi path/import; assertion giữ. Không test mới (chính sách người dùng 26/11/2026: không E2E, unit khoảng 50%; coverage hiện 99%).

## Bước

1. [x] `git mv` + đổi import/mock string, đổi tên schema.
2. [x] Config, generator, CI, lint, boundary, vitest.
3. [x] Docs/rules.
4. [x] Gates + `pnpm gen:api` (nội dung generated không đổi, chỉ dòng header).

## Rủi ro và rollback

- Import sót: `tsc`, ESLint, `lint:boundaries` bắt. Chuỗi `vi.mock` sót làm test fail.
- `pnpm gen:api` cần mạng tới GitHub release.
- Rollback: revert PR (path/import/generator/CI/lint/docs một đơn vị); không bridge.

Lưu ý: plan viết sau bước chuyển file cơ học.
