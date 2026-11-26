# Plan 38: Catalog thí điểm nguyên owner và wishlist composition

Branch: `refactor/38-storefront-catalog-migration` (từ `dev`). Một PR, không đổi UI/URL/hành vi.

## Blocker

Task 37 `done` (PR #122, #123). Checkout sạch trên `dev` mới nhất.

## Mapping (cũ → đích)

| Cũ                                           | Đích                                               |
| -------------------------------------------- | -------------------------------------------------- |
| `features/catalog/**` (50 file, gồm 10 test) | `modules/catalog/**` (`git mv`)                    |
| `features/catalog/schemas/filter.ts`         | `modules/catalog/schemas/filter.schema.ts` (ADR)   |
| `features/catalog/types/badge.ts`            | `modules/catalog/types/badge.types.ts` (ADR)       |
| `shared/lib/mock-content.ts`                 | `modules/catalog/mock-content.ts`                  |
| heart trong `ProductCard` (`showWishlist`)   | `layouts/catalog/CatalogWishlistAction.tsx` + slot |

## Consumer, mock string, config

- Import đổi: 4 route page, `home/SectionFeaturedCategories`, `SectionNewArrivals`, `layouts/{Header,DesktopMegaMenu,MobileNav}`, `wishlist/{WishlistClient,useMoveToCart}`, import nội bộ catalog, `ProductDetailTabs` (mock-content).
- `ProductCard`: bỏ `showWishlist` + import wishlist, thêm `wishlistAction?: ReactNode`. `CatalogProductGrid`: thêm `renderWishlistAction?(productId)`. Hai consumer cũ (`showWishlist={false}`) không truyền gì, nên không bật heart; chưa consumer nào nối action.
- `scripts/check-module-boundaries.ts`: xóa 2 known violation và cycle catalog ↔ wishlist (đợt 38). `PUBLIC_ENTRIES` đã cho `layouts → wishlist:useIsWishlisted`.
- `vitest.config.ts`: thêm `src/modules/catalog/mock-content.ts` vào coverage include (file đã rời glob `shared/lib`), giữ tập collected tương đương; ngưỡng hạ 99 → 50 theo quyết định người dùng 26/11/2026.
- Docs: `docs/architecture.md`, `docs/overview.md`, `docs/research/nextjs-naming-conventions.md` (link), `.claude/rules/data/api-data.md`.

## Seams kiểm thử

- Test catalog cũ chỉ đổi path/import; assertion giữ. `ProductCard.test`: nhóm "wishlist toggle" chuyển sang `CatalogWishlistAction.test` (cùng assertion: trạng thái đầu, toggle, toggle lại), thay bằng test slot (mặc định không có button, action nằm ngoài link).
- Test mới: `layouts/catalog/CatalogWishlistAction.test.tsx` (dùng store/hook công khai thật).
- Chính sách (quyết định người dùng 26/11/2026): không E2E, unit coverage mục tiêu khoảng 50% file chạm.

## Bước

1. [x] `git mv` + đổi import/mock string/đổi tên schema, type.
2. [x] Slot + `CatalogWishlistAction`; bỏ import wishlist khỏi catalog.
3. [x] Boundary snapshot, vitest config, docs.
4. [x] Gates.

## Rủi ro và rollback

- Import sót: `tsc`, ESLint, `lint:boundaries` bắt.
- Heart biến mất nếu consumer tương lai quên nối slot; hiện không consumer nào dùng heart.
- Rollback: revert cùng lượt path/import/slot/config/docs; không bridge, không implementation kép.

Lưu ý: plan viết sau bước chuyển file cơ học.
