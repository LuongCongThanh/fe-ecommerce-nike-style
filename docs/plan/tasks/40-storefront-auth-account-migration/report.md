# Report 40

- **PR:** (điền sau khi mở)
- **Ngày merge:** (điền sau khi merge)

## Đã làm

- `features/auth/**` → `modules/auth/**`, `features/account/**` → `modules/account/**` (`git mv`); đổi tên `auth.schema.ts`, `auth.service.ts`, `address.schema.ts`, `profile.schema.ts`, `auth.store.test.ts`.
- Import/mock string của 4 route auth, 2 page account, layout account/checkout, `providers/AppProviders`, `layouts/{Header,useMergeGuestDataOnLogin}` và test đổi cùng lượt.
- `AppProviders.test` không còn mock auth store riêng tư; known violation đợt 40 đã xóa khỏi snapshot (còn 2 cạnh của task 41, 42).
- Thêm `AuthGuard.test.tsx`. Ma trận public entry: `useAuth` thêm consumer `providers`, target `auth:schemas/auth.schema`.
- Docs đồng bộ: architecture, overview, research naming.

## Lệch so với spec và rủi ro còn lại

- E2E, full E2E ba engine và production Playwright: not run, theo quyết định người dùng 26/11/2026. Không coi là pass; vi/en browser chỉ được kiểm bằng unit test.
- Assertion "bootstrap đúng một lần" trong `AppProviders.test` nay quan sát qua trạng thái session công khai (`anonymous` sau bootstrap) và việc đăng ký adapter, không đếm lời gọi `bootstrapAuth` riêng tư.
- Cookie/auth contract, UI và URL không đổi; không kéo cart/wishlist vào auth, không thêm account → orders.
- Token chưa đo.
- `plan.md` viết sau bước chuyển file cơ học.

## Test cũ đã chạm

Chỉ đổi import/mock path; assertion giữ nguyên, riêng `AppProviders.test` đổi cách quan sát bootstrap như trên.

## Kiểm tra

Môi trường: nhánh `refactor/40-storefront-auth-account-migration`, Linux, pnpm, dev mode.

| Lệnh                              | Exit | Kết quả                                 |
| --------------------------------- | ---- | --------------------------------------- |
| `pnpm lint`                       | 0    | ESLint + `lint:boundaries`, 2 exception |
| `pnpm format:check`               | 0    |                                         |
| `pnpm docs:check`                 | 0    |                                         |
| `pnpm typecheck`                  | 0    |                                         |
| `pnpm test`                       | 0    | 106 files, 1220 tests (trước 105/1218)  |
| `pnpm test:coverage`              | 0    | 99.51/99.21/100/100, ngưỡng 50          |
| `pnpm build`                      | 0    |                                         |
| `pnpm test:e2e`                   | —    | not run — user decision                 |
| `playwright.production.config.ts` | —    | not run — user decision                 |

## Đường dẫn mới cho task sau

`@/modules/auth/session/{useAuth,AuthGuard,AuthRuntimeProvider,roles}`, `@/modules/auth/stores/auth.store`, `@/modules/auth/schemas/auth.schema`, `@/modules/auth/services/auth.service`, `@/modules/account/{profile,addresses}/...`.
