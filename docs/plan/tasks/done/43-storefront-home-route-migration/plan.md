# Plan 43: Home sang module và UI error/not-found/offline sang layouts

Branch: `refactor/43-storefront-home-route-migration` (từ `dev`). Một PR, không đổi UI/URL/hành vi.

## Blocker

Task 39 `done` (PR #127, #128). Tasks 40, 41, 42 chạy song song và sở hữu auth/account/cart/wishlist/orders/checkout; task này không chạm các owner đó.

## Mapping (cũ → đích)

| Cũ                                       | Đích                                          |
| ---------------------------------------- | --------------------------------------------- |
| `features/home/**` (27 file, gồm 2 test) | `modules/home/**` (`git mv`)                  |
| `features/home/types/home.ts`            | `modules/home/types/home.types.ts` (ADR)      |
| `shared/hooks/useCanRender3D.ts` + test  | `modules/home/hooks/useCanRender3D.ts` + test |
| UI trong `app/[locale]/error.tsx`        | `layouts/components/RouteErrorState.tsx`      |
| UI trong `app/not-found.tsx`             | `layouts/components/NotFoundState.tsx`        |
| UI trong `app/~offline/page.tsx`         | `layouts/components/OfflineState.tsx`         |

Special file (`error.tsx`, `not-found.tsx`, `~offline/page.tsx` với `dynamic`/`metadata`, `loading.tsx`) giữ tên và export tại `app`. `loading.tsx` đã là một dòng gọi `shared/components/PageLoader`, giữ nguyên. `app/layout.tsx`, `[locale]/layout.tsx`, `opengraph-image.tsx`, `page.tsx` giữ tại chỗ (framework entry). `AppProviders` đã ở `providers/` từ task 37.

## Không thuộc task này (ghi cho task 44)

- Wrapper auth/account/checkout trong app: `(auth)/layout.tsx`, `(shop)/account/layout.tsx`, `(shop)/checkout/layout.tsx` và các page auth/account/cart/wishlist/orders/checkout: để task 40/41/42.
- `(shop)/home/page.tsx` chỉ đổi import; route home giữ composition mỏng.

## Consumer, mock string, config

- Import đổi: `(shop)/home/page.tsx`, import nội bộ home, `HeroCarousel` (useCanRender3D), test home. Không có consumer ngoài owner.
- `scripts/check-module-boundaries.ts`: không đổi (public entry home và coverage manifest đã dùng logical key hai đường dẫn).
- `vitest.config.ts`: thêm `src/modules/home/hooks/useCanRender3D.ts` vào coverage include (file rời glob `shared/hooks`); tập collected tương đương.
- Docs: `docs/architecture/README.md`, `docs/business/overview.md`, research link, manifest task 45/46/48 (path home).

## Seams kiểm thử

- Test home và `useCanRender3D` chỉ đổi path/import; assertion giữ.
- Test mới cho UI đã tách: `RouteErrorState` (gửi Sentry, gọi reset), `NotFoundState`, `OfflineState`.
- Chính sách (quyết định người dùng 26/11/2026): không E2E, unit coverage khoảng 50% file chạm.

## Rủi ro và rollback

- Import sót: `tsc`, ESLint, `lint:boundaries`, build bắt.
- Rollback: revert cùng lượt path/import/config/docs; không bridge, không implementation kép.
