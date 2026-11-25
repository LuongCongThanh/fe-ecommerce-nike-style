# Plan 35: Rule và convention hỗ trợ migration có giới hạn

Branch: `refactor/35-storefront-migration-rules` (từ `dev`). Một PR, không breaking change cho runtime; `pnpm lint` thêm bước boundary check.

## Blocker và trạng thái

- Task 34: PR #117 đã squash vào `dev` ngày 25/11/2026; spec còn `review` nên đặt `done` và cập nhật index/report trong cùng PR. Checkout `dev` sạch trước khi tạo branch.

## Phạm vi

Refresh manifest từ checkout: không có consumer ngoài owner; source feature không đổi. File tạo/sửa:

- `eslint.boundaries.mjs` + `eslint.boundaries.d.mts` (mới): danh sách module, zone `import/no-restricted-paths` và `boundaries/elements`, path cũ/mới cùng logical owner. `eslint.config.mjs` import thay cho cấu hình inline.
- `scripts/check-module-boundaries.ts` (mới): ma trận public entry (consumer + file + named symbol), chặn private/wrong-symbol/namespace/side-effect/dynamic/`vi.mock` string/re-export, cycle cấp module, snapshot cạnh chính xác có lý do + đợt xóa, stale snapshot, path nội bộ không resolve, module root chưa đăng ký, manifest coverage cũ→mới đối chiếu `vitest.config.ts`.
- `scripts/check-module-boundaries.test.ts`, `scripts/eslint-boundaries.test.ts` (mới): fixture tmp project chứng minh pass/fail.
- `package.json`: `lint:boundaries`, `lint` chạy thêm bước này (CI và pre-commit đã gọi `pnpm lint`).
- Docs: `AGENTS.md`, `.claude/rules/apps/frontend-architecture.md`, `docs/architecture.md` (trạng thái chuyển tiếp). Không sửa skill nên không có mirror.

Cố ý không làm: không chuyển source/test feature, không đổi coverage include/threshold, không sửa behavior test, không bật exemption cho modules/features/tests.

## Mapping logical owner

| Logical owner                                                                 | Path cũ                                           | Path đích                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------- |
| module `<m>` (account, auth, cart, catalog, checkout, home, orders, wishlist) | `src/features/<m>/`                               | `src/modules/<m>/`          |
| layouts                                                                       | `src/features/storefront-shell/`                  | `src/layouts/`              |
| providers                                                                     | `src/app/_composition/`                           | `src/providers/`            |
| integrations                                                                  | `src/lib/api/`, `src/lib/schemas/` (→ `schemas/`) | `src/integrations/backend/` |

## Ngoại lệ (người dùng đã chốt 26/11/2026 trước khi dùng)

| Cạnh                                                                                       | Symbol                                  | Đợt xóa |
| ------------------------------------------------------------------------------------------ | --------------------------------------- | ------- |
| `catalog:components/ProductCard` → `wishlist:hooks/useWishlist` + cycle catalog ↔ wishlist | useIsWishlisted                         | 38      |
| `catalog:components/ProductCard.test` → `wishlist:stores/wishlist.store`                   | resetWishlistState                      | 38      |
| `providers:AppProviders.test` → `auth:stores/auth.store`                                   | `vi.mock`                               | 40      |
| `wishlist:components/WishlistClient.test` → `cart:stores/cart.store`                       | clearCart, resetCartState, useCartStore | 41      |
| `checkout:queries/useCreateOrder` → `cart:stores/cart.store`                               | clearCart                               | 42      |

Entry dùng basename hiện tại (`auth:schemas/auth`, `orders:services/order`); đợt đổi suffix ADR cập nhật allowlist cùng lượt.

## Seams kiểm thử

- `checkModuleBoundaries(root, policy)` với fixture tmp: allowed named/type/default, private, wrong-symbol, namespace/side-effect/dynamic/mock/re-export, layer, snapshot đúng/thêm symbol/stale, cycle, test-only edge, unresolved, module chưa đăng ký.
- `locate`, `findCycles`, `collectCoverageFiles` + `checkCoverageManifest` (moved ngoài glob, file rơi khỏi coverage, thiếu mapping).
- ESLint thật với `restrictedPathZones` trên fixture tree cũ/mới (blocked và allowed).
- Policy repo: ngoại lệ có đợt xóa/lý do, không wildcard symbol, manifest trong `src/`.

## Các bước

1. [x] Checker + test, chạy trên source thật để snapshot vi phạm; người dùng chốt ngoại lệ.
2. [x] Tách zone ESLint, fixture test, nối `eslint.config.mjs` và script `lint`.
3. [x] Docs AGENTS/rule/architecture.
4. [x] Gates: focused vitest, `pnpm lint`, `pnpm format:check`, `pnpm docs:check`, `pnpm typecheck`, `pnpm test`, `pnpm build` (config ESLint/scripts không vào bundle nhưng `next build` đọc config). Không chạy E2E/production (không đổi flow; theo yêu cầu người dùng). Coverage riêng cho checker (người dùng yêu cầu ≥ 50%).

## Rủi ro

- `pnpm lint` dài hơn vài giây; pre-commit/CI fail khi slice sau chuyển file mà không cập nhật policy (đúng ý đồ).
- Checker phân tích import tĩnh bằng TypeScript AST; import dựng chuỗi động không phát hiện được.
- Rollback: revert cùng lượt rule/checker/test/docs/script; không có source cần rollback.
