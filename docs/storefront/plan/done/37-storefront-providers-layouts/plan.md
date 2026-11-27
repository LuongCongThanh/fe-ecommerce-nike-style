# Plan 37: Providers và layouts giữ lifecycle

Branch: `refactor/37-storefront-providers-layouts` (chứa tip `origin/dev`). Một PR, không đổi UI/URL/hành vi.

## Blocker

Task 36 `done` (PR #120, #121 trên `dev`). Checkout sạch trước khi bắt đầu.

## Mapping (cũ → đích, theo runtime.md)

| Cũ                                                         | Đích                                     |
| ---------------------------------------------------------- | ---------------------------------------- |
| `app/_composition/AppProviders.tsx` + test                 | `providers/AppProviders.tsx` + test      |
| `shared/lib/query-client.ts`                               | `providers/query-client.ts`              |
| `features/storefront-shell/components/*` (4 file)          | `layouts/components/*`                   |
| `features/storefront-shell/hooks/useMergeGuestDataOnLogin` | `layouts/hooks/useMergeGuestDataOnLogin` |

Giữ nguyên: `AuthRuntimeProvider`, auth/cart/wishlist/catalog (path `features/*` cũ, là entry cụ thể trong allowlist), `app/layout.tsx` mount `Providers` ngoài locale.

## Consumer, mock string, config

- Import đổi: `app/layout.tsx`, `app/layout.test.tsx` (`vi.mock('@/providers/AppProviders')`), `app/[locale]/(shop)/layout.tsx`, `Header.tsx` (3 import nội bộ layouts), `AppProviders.tsx`/test.
- `vitest.config.ts`: bỏ exclude `src/shared/lib/query-client.ts` (file không còn dưới glob `src/shared/lib/**`; `src/providers/**` không nằm trong include nên tập file collected tương đương); ngưỡng 99 giữ nguyên.
- `scripts/check-module-boundaries.ts`, `eslint.boundaries.mjs` đã nhận path đích từ task 35; không đổi. `COVERAGE_MANIFEST` không có query-client (đã bị exclude), không đổi.
- Docs: `docs/storefront/architecture.md`, `design.md` (hiện trạng).

## Seams kiểm thử

- `AppProviders.test`, `layout.test` chuyển/đổi path, assertion giữ nguyên.
- Test mới: `providers/query-client.test.ts` (retry/staleTime/mutation policy), `layouts/hooks/useMergeGuestDataOnLogin.test.tsx`, `layouts/components/{Footer,MobileNav,DesktopMegaMenu,Header}.test.tsx`.
- Test layouts không `vi.mock` module nghiệp vụ (ma trận public entry chặn): dùng store/hook công khai thật, mock endpoint tại `@/lib/api/endpoints/*` và `next/navigation`.

## Bước

1. [x] `git mv` + đổi import/mock string.
2. [x] Bỏ exclude query-client ở vitest config.
3. [x] Test mới cho phần đã chuyển (yêu cầu người dùng: ≥ 50% line coverage tập file task).
4. [x] Docs hiện trạng.
5. [x] Gates (E2E và production Playwright không chạy theo quyết định người dùng).

## Rủi ro và rollback

- Import chuỗi bị bỏ sót: `tsc`, ESLint, `lint:boundaries` (resolve path) bắt.
- Rollback: revert cùng lượt source/import/config/test/docs; không có bridge hay implementation kép.

Lưu ý: plan.md được viết sau khi chuyển file (bước cơ học), ghi lại thực tế.
