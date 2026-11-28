# Report 39

- **PR:** #127
- **Ngày merge:** 26/11/2026

## Đã làm

- `lib/api/**` (36 file) → `integrations/backend/**` cùng tên thư mục; `lib/schemas/**` (12 file) → `integrations/backend/schemas/<domain>/<name>.schema.ts`; `shared/lib/api-mocking.ts` → `adapters/browser-bootstrap.ts`; `shared/types/user.ts` → `models/user.types.ts`. `src/lib` không còn tồn tại.
- `shared/lib/errors/api-error.ts` (chỉ re-export class SDK) xóa; consumer import thẳng `@/integrations/backend/client/api-error`. 7 test của nó gộp vào `client/api-error.test.ts` (cùng class, cùng assertion).
- Import/mock string ở source, test, `e2e/support`, `instrumentation.node.ts` đổi cùng lượt.
- Generator (`scripts/gen-api.mjs` output + header), `gen:api`, CI `git diff --exit-code`, `contract-bump.sh`, ESLint ignore/override, `eslint.boundaries.mjs`, `check-module-boundaries.ts`, vitest coverage include.
- Docs/rules đồng bộ: architecture, overview, api-integration, research, AGENTS.md, `.claude/rules`, Copilot instructions, skill `feature`, fixture guard.

## Contract

Pin `openapi-v0.7.0` không đổi. `pnpm gen:api` chạy thật: nội dung `openapi.ts` giống bản cũ, chỉ khác dòng header (`Import only from src/integrations/backend`).

## Lệch so với spec và rủi ro còn lại

- E2E, full E2E ba engine và production Playwright: not run, theo quyết định người dùng 26/11/2026. Không coi là pass. MSW browser/Node và legacy server order reader chỉ được kiểm bằng unit test hiện có.
- Không test mới; coverage repo 99%.
- Bỏ 2 case test boundary dành riêng cho root cũ `lib/api` (path đã xóa): 1220 → 1218 test, không test hành vi nào bị bỏ.
- `shared/lib/errors/error-codes.ts`, `shared/lib/env.ts` giữ tại chỗ (ngoài scope).
- Token chưa đo (`pnpm tokens` cần sessionId).
- `plan.md` viết sau bước chuyển file cơ học.

## Test cũ đã chạm

Các test trong manifest chỉ đổi import/mock path; assertion giữ nguyên.

## Kiểm tra

Môi trường: nhánh `refactor/39-storefront-backend-integration`, Linux, pnpm, dev mode.

| Lệnh                              | Exit | Kết quả                                |
| --------------------------------- | ---- | -------------------------------------- |
| `pnpm lint`                       | 0    | ESLint + `lint:boundaries` sạch        |
| `pnpm format:check`               | 0    |                                        |
| `pnpm docs:check`                 | 0    |                                        |
| `pnpm typecheck`                  | 0    |                                        |
| `pnpm test`                       | 0    | 105 files, 1218 tests (trước 106/1220) |
| `pnpm test:coverage`              | 0    | 99.51/99.21/100/100, ngưỡng 50         |
| `pnpm build`                      | 0    |                                        |
| `pnpm gen:api`                    | 0    | chỉ khác dòng header                   |
| `pnpm test:e2e`                   | —    | not run — user decision                |
| `playwright.production.config.ts` | —    | not run — user decision                |

## Đề xuất cho task 40, 41, 43

Import SDK mới: `@/integrations/backend/{client,endpoints,models,mocks,testing,adapters,env}/...`; schema `@/integrations/backend/schemas/<domain>/<name>.schema`; `User` từ `@/integrations/backend/models/user.types`; `ensureApiMockingReady` từ `@/integrations/backend/adapters/browser-bootstrap`; `ApiError` từ `@/integrations/backend/client/api-error`. Không dùng path `@/lib/*` hay `@/shared/lib/errors/api-error` nữa.
