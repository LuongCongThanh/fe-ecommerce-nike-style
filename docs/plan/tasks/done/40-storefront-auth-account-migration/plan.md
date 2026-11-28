# Plan 40: Auth và account theo public session boundary

Branch: `refactor/40-storefront-auth-account-migration` (từ `dev`). Một PR, không đổi UI/URL/cookie/hành vi.

## Blocker

Task 39 `done` (PR #127, #128). Checkout sạch trên `dev` mới nhất.

## Mapping (cũ → đích)

| Cũ                                     | Đích                                                       |
| -------------------------------------- | ---------------------------------------------------------- |
| `features/auth/**` (18 file)           | `modules/auth/**` (`git mv`)                               |
| `features/account/**` (15 file)        | `modules/account/**` (`git mv`)                            |
| `auth/schemas/auth.ts`                 | `modules/auth/schemas/auth.schema.ts` (ADR)                |
| `auth/services/auth.ts`                | `modules/auth/services/auth.service.ts` (ADR)              |
| `account/addresses/schemas/address.ts` | `modules/account/addresses/schemas/address.schema.ts`      |
| `account/profile/schemas/profile.ts`   | `modules/account/profile/schemas/profile.schema.ts`        |
| `auth/stores/auth-store.test.ts`       | `modules/auth/stores/auth.store.test.ts` (stem khớp owner) |

Manifest cũ ghi `app/_composition/AppProviders` và `storefront-shell/*`: sau task 37 đã là `providers/AppProviders` và `layouts/{components/Header,hooks/useMergeGuestDataOnLogin}`; dùng path mới.

## Consumer, mock string, config

- Import đổi: 4 route `(auth)`, 2 page account, 2 layout (`account`, `checkout`), `providers/AppProviders(.test)`, `layouts/components/Header(.test)`, `layouts/hooks/useMergeGuestDataOnLogin(.test)`, import nội bộ.
- Layout `account`/`checkout` đã mỏng (chỉ `AuthGuard`); login page giữ nguyên, không đổi UI/URL.
- `AppProviders.test`: bỏ `vi.mock` auth store riêng tư (known violation đợt 40). Test dùng auth thật, quan sát `useAuth().authStatus` chuyển sang `anonymous` sau bootstrap và adapter đăng ký/hủy đăng ký. `useAuth` thêm consumer `providers` trong ma trận public entry.
- `scripts/check-module-boundaries.ts`: target `auth:schemas/auth.schema`, consumer `providers` cho `useAuth`, xóa known violation `providers:AppProviders.test` → `auth:stores/auth.store`.
- `eslint.boundaries.mjs`: element `core-session` chỉ còn path `modules/auth/session`.
- Docs: `docs/architecture/README.md`, `docs/business/overview.md`, `docs/research/nextjs-naming-conventions.md`.
- `vitest.config.ts`: không đổi (coverage glob không chứa file auth/account).

## Seams kiểm thử

Test cũ (store, session, roles, PasswordInput, ProfileClient, AddressesClient) chỉ đổi path/import; assertion giữ. Test mới: `AuthGuard.test.tsx` (redirect khi chưa có session, render children khi có token). Chính sách người dùng 26/11/2026: không E2E, unit khoảng 50% file chạm.

## Bước

1. [x] `git mv` + đổi import/mock string/đổi tên schema, service, test.
2. [x] Boundary policy, ESLint element, `AppProviders.test`.
3. [x] Docs.
4. [x] Gates.

## Rủi ro và rollback

- Import sót: `tsc`, ESLint, `lint:boundaries` bắt.
- Thứ tự bootstrap (adapter đăng ký trước `bootstrapAuth`) giữ nguyên vì `AuthRuntimeProvider` không đổi nội dung.
- Rollback: revert PR (path/import/policy/docs một đơn vị); không bridge, không implementation kép.

Lưu ý: plan viết sau bước chuyển file cơ học.
