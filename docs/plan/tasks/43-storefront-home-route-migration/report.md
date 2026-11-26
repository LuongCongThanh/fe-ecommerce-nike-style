# Report 43

- **PR:** (điền sau khi mở)
- **Ngày merge:** (điền sau khi merge)

## Đã làm

- `features/home/**` → `modules/home/**` (`git mv`); `types/home.ts` → `types/home.types.ts`; `shared/hooks/useCanRender3D` + test → `modules/home/hooks/`. `features/home` hết consumer và không còn tồn tại.
- UI của `error.tsx`, `not-found.tsx`, `~offline/page.tsx` tách sang `layouts/components/{RouteErrorState,NotFoundState,OfflineState}.tsx`; file special trong app giữ tên, `dynamic`, `metadata`, export mặc định. `loading.tsx` đã mỏng, giữ.
- `vitest.config.ts` giữ `useCanRender3D` trong coverage include tại path mới. Docs hiện trạng và manifest task 45/46/48 cập nhật path home.

## Chính sách kiểm thử

Quyết định người dùng 26/11/2026: không E2E, unit coverage khoảng 50%. Test home/3D giữ assertion; thêm 3 test file cho UI tách.

## Lệch so với spec và rủi ro còn lại

- E2E (focused và full) và production Playwright: not run, theo quyết định người dùng. Không coi là pass.
- Wrapper auth/account/checkout trong app (`(auth)/layout.tsx`, `account/layout.tsx`, `checkout/layout.tsx`) thuộc task 40/42; task 44 kiểm tra lại sau khi các task đó merge.
- Token chưa đo.
- Không đụng SDK/generated/pin API; không đổi `home-content.ts` basename (kebab legacy, ghi trong nghiên cứu naming).

## Kiểm tra

Môi trường: nhánh `refactor/43-storefront-home-route-migration`, Linux, pnpm, dev mode.

| Lệnh                                                        | Exit | Kết quả                        |
| ----------------------------------------------------------- | ---- | ------------------------------ |
| `pnpm exec vitest run src/modules/home src/layouts src/app` | 0    | pass                           |
| `pnpm lint` (ESLint + `lint:boundaries`)                    | 0    | sạch                           |
| `pnpm format:check`                                         | 0    |                                |
| `pnpm docs:check`                                           | 0    |                                |
| `pnpm typecheck`                                            | 0    |                                |
| `pnpm test`                                                 | 0    | 108 files, 1222 tests          |
| `pnpm test:coverage`                                        | 0    | 99.51/99.21/100/100, ngưỡng 50 |
| `pnpm build`                                                | 0    |                                |
| `pnpm test:e2e`                                             | —    | not run — user decision        |
| `playwright.production.config.ts`                           | —    | not run — user decision        |
