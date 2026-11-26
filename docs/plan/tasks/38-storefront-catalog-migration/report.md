# Report 38

- **PR:** #PR
- **Ngày merge:**

## Đã làm

- `features/catalog/**` → `modules/catalog/**` (`git mv`, giữ lịch sử); `shared/lib/mock-content.ts` → `modules/catalog/mock-content.ts`; `schemas/filter.ts` → `filter.schema.ts`, `types/badge.ts` → `badge.types.ts`. Import cập nhật ở route, home, layouts, wishlist, nội bộ catalog. `features/catalog` hết consumer và không còn tồn tại.
- Bỏ cạnh catalog → wishlist: `ProductCard` nhận `wishlistAction` (ReactNode), `CatalogProductGrid` nhận `renderWishlistAction(productId)`. Heart (aria-label, aria-pressed, motion, toggle) ở `layouts/catalog/CatalogWishlistAction.tsx`. Consumer cũ có `showWishlist={false}` không truyền action nên không tự bật heart.
- Xóa known violation catalog (2 cạnh) và cycle catalog ↔ wishlist khỏi `scripts/check-module-boundaries.ts`. Wishlist chỉ dùng `priceRange`, `variantResolution` của catalog.
- `vitest.config.ts`: include `modules/catalog/mock-content.ts` (manifest coverage), ngưỡng 99 → 50.
- Docs hiện trạng: `docs/architecture.md`, `docs/overview.md`, research link, `.claude/rules/data/api-data.md`.

## Chính sách kiểm thử

Quyết định người dùng 26/11/2026: không E2E, unit coverage mục tiêu khoảng 50%. Theo đó ngưỡng coverage toàn cục hạ từ 99 xuống 50 (cả bốn chỉ số) trong task này. Coverage thực tế repo vẫn 99.47/99.19/100/100.

## Lệch so với spec và rủi ro còn lại

- E2E (scoped và full `pnpm test:e2e`) và production Playwright: not run, theo quyết định người dùng. Không coi là pass.
- Chưa consumer nào nối `CatalogWishlistAction` (mọi card trước đây tắt heart); PLP/Home bật lại heart là việc riêng.
- Token chưa đo (`pnpm tokens` cần sessionId).
- `plan.md` viết sau bước chuyển file cơ học.
- Không đụng SDK/generated/pin API.

## Test cũ đã chạm

10 test catalog đổi path/import. `ProductCard.test.tsx`: bỏ nhóm toggle wishlist và `resetWishlistState` (catalog không còn biết wishlist); assertion toggle giữ nguyên ý nghĩa tại `CatalogWishlistAction.test.tsx`.

## Kiểm tra

Môi trường: nhánh `refactor/38-storefront-catalog-migration`, Linux, pnpm, dev mode.

| Lệnh                                                                                                   | Exit | Kết quả                                |
| ------------------------------------------------------------------------------------------------------ | ---- | -------------------------------------- |
| `pnpm exec vitest run src/modules/catalog src/layouts src/features/home src/features/wishlist scripts` | 0    | pass                                   |
| `pnpm lint` (ESLint + `lint:boundaries`)                                                               | 0    | sạch, không còn exception catalog      |
| `pnpm format:check`                                                                                    | 0    |                                        |
| `pnpm docs:check`                                                                                      | 0    |                                        |
| `pnpm typecheck`                                                                                       | 0    |                                        |
| `pnpm test`                                                                                            | 0    | 106 files, 1220 tests (trước 105/1221) |
| `pnpm test:coverage`                                                                                   | 0    | 99.47/99.19/100/100, ngưỡng 50         |
| `pnpm build`                                                                                           | 0    |                                        |
| `pnpm test:e2e`                                                                                        | —    | not run — user decision                |
| `playwright.production.config.ts`                                                                      | —    | not run — user decision                |

## Acceptance criteria: chạy tay

- Blocker 37 `done` (PR #122/#123).
- `grep features/catalog` trong `src` không còn kết quả; không import catalog → wishlist.

## Đề xuất cho môi trường
