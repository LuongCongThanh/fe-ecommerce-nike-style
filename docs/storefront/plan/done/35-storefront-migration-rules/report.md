# Report 35

- **PR:** [LuongCongThanh/fe-ecommerce-nike-style#118](https://github.com/LuongCongThanh/fe-ecommerce-nike-style/pull/118).
- **Ngày merge:** 25/11/2026 (PR #118 squash vào `dev`, xác minh qua GitHub).

## Đã làm

- `eslint.boundaries.mjs` (+ `.d.mts`): module registry, zone `import/no-restricted-paths` và `boundaries/elements` nhận cả path cũ lẫn path đích của cùng logical owner; `eslint.config.mjs` dùng lại thay cho cấu hình inline. Zone mới: shared/integrations không import module/app/layouts/providers; module không import app/layouts/providers.
- `scripts/check-module-boundaries.ts` (`pnpm lint:boundaries`, chạy trong `pnpm lint`): ma trận public entry từ [boundaries](../18-storefront-module-boundaries/boundaries.md) theo consumer + file + named symbol; chặn private, wrong-symbol, namespace/side-effect/dynamic import, `vi.mock` string liên module, re-export, cycle cấp module, path nội bộ không resolve, module root chưa đăng ký; snapshot cạnh chính xác có lý do + đợt xóa và báo stale khi hết consumer; manifest coverage cũ→mới đối chiếu `vitest.config.ts`.
- Fixture tests: `scripts/check-module-boundaries.test.ts` (40 case) và `scripts/eslint-boundaries.test.ts` (14 case, ESLint thật trên cây fixture cũ/mới).
- Docs hiện trạng: `AGENTS.md`, `.claude/rules/apps/frontend-architecture.md`, `docs/storefront/architecture.md` (mục boundary trong giai đoạn chuyển). Không sửa skill nên không có mirror.
- Tracker: task 34 → done (PR #117 merged 25/11/2026), ghi ngày merge vào report 34; task 35 → review; index cập nhật.

## Lệch so với spec và rủi ro còn lại

- Ngoại lệ ngoài cạnh catalog ↔ wishlist được người dùng chốt ngày 26/11/2026 trước khi ghi: `useCreateOrder` → cart store (42), `ProductCard.test` → wishlist store (38), `WishlistClient.test` → cart store (41), `AppProviders.test` mock auth store (40; không có trong boundaries.md).
- Allowlist dùng basename hiện tại `auth:schemas/auth`, `orders:services/order`; đích ADR là `.schema`/`.service`, đợt đổi tên cập nhật cùng lượt.
- Thêm ngoài manifest snapshot: `eslint.boundaries.mjs`, `eslint.boundaries.d.mts`, `scripts/eslint-boundaries.test.ts`, `package.json` (script) — cần cho lint fixture test theo scope.
- Checker đọc import tĩnh/literal; specifier dựng động không phát hiện được. `import-x/no-cycle` file-level giữ nguyên.

## Test cũ đã chạm

Không có. Không sửa test feature.

## Kiểm tra

Môi trường: HEAD gốc `95f5363` (dev) + diff branch, Node v24.22.2, pnpm 11.24.0, Linux, dev mode (không production).

| Lệnh                                                                                             | Exit | Kết quả                                                                                                     |
| ------------------------------------------------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run scripts/check-module-boundaries.test.ts scripts/eslint-boundaries.test.ts` | 0    | 54/54                                                                                                       |
| Coverage riêng checker (`--coverage.include=scripts/check-module-boundaries.ts`)                 | 0    | Lines 92.78%, Branches 89.16%, Functions 95%, Statements 91.4% (yêu cầu ≥ 50%); phần chưa phủ là CLI `main` |
| `pnpm lint`                                                                                      | 0    | ESLint sạch; 697 internal edges, 6 known exceptions                                                         |
| `pnpm format:check`                                                                              | 0    |                                                                                                             |
| `pnpm docs:check`                                                                                | 0    |                                                                                                             |
| `pnpm typecheck`                                                                                 | 0    |                                                                                                             |
| `pnpm test`                                                                                      | 0    | 85 files, 1167 tests                                                                                        |
| `pnpm test:coverage`                                                                             | 0    | 99.47/99.19/100/100, tập file và ngưỡng 99 không đổi                                                        |
| `pnpm build`                                                                                     | 0    |                                                                                                             |

Không chạy: E2E và production Playwright (không đổi flow/routing/runtime; người dùng yêu cầu không viết E2E và không test production).

## Acceptance criteria: chạy tay

- Blocker 34 đối chiếu PR #117 merged → done.
- Path cũ/mới cùng logical owner: test `locate` + fixture ESLint/checker ở `src/modules`, `src/layouts`, `src/providers`, `src/integrations/backend`.
- Allowed/wrong-symbol/private/cycle fixtures pass/fail; snapshot exact edge + stale; không exemption cho modules/features/tests.

## Đề xuất cho môi trường
