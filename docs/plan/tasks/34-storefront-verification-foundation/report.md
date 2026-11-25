# Report 34

- **PR:** [LuongCongThanh/fe-ecommerce-nike-style#117](https://github.com/LuongCongThanh/fe-ecommerce-nike-style/pull/117).
- **Ngày merge:** Chưa merge.

## Đã làm

- Added the deterministic contract-shaped catalog HTTP fixture and tests, and configured dev/production Playwright to use isolated harness ports.
- Adapted the in-scope browser flows to the current source behavior; PDP purchase remains disabled.
- Added production Chromium runtime and PWA checks, coverage and production-browser CI jobs, and run instructions.
- Fixed client environment access to use statically referenced `NEXT_PUBLIC_*` values and restricted Playwright discovery to browser `*.spec.ts` files.
- Replaced `networkidle` waits with `fillField` (`e2e/support/session.ts`): it fills a server-rendered field and retries until the value sticks, because WebKit could reset a value typed before the client form hydrated.
- Moved shared login, logout, guest-cart and middleware-hint steps into `e2e/support/session.ts`, and shared Playwright runner settings, ports and harness server definitions into `e2e/support/playwright-base.ts`.
- Made `/~offline` static and added a Serwist precache entry for the document fallback. Its revision is the current git commit (a random UUID when git is unavailable), so any change to what the page renders, including layout and styles, refreshes the cached copy. The generated worker carries that revision; production offline navigation passes.
- Added a production check that tags browser requests with an id, reads the harness request log for that id, and probes the harness directly from Node, proving both reach the same harness.
- Added user-approved focused public-behavior tests for the existing 99% coverage baseline without changing implementations, thresholds, or collected coverage paths.
- `.env.example` already contains the required public URLs, mock flag, and server-only `API_ORIGIN`; no edit was needed.

## Lệch so với spec và rủi ro còn lại

- **Ngoại lệ sửa source ngoài test (người dùng đã duyệt giữ ngày 26/11/2026).** Spec ghi "không đổi source feature để sửa test" và yêu cầu mọi ngoại lệ có lý do, owner và đợt xóa. Ba file production đổi trong PR này:

  | File                                           | Lý do                                                                                                                                                           | Owner                   | Đợt xóa                            |
  | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------- |
  | `src/lib/api/env/config.ts`                    | Đọc `process.env[key]` động khiến Next.js không inline `NEXT_PUBLIC_*` vào client bundle, nên client không thấy cờ mock và site URL. Sửa thành tham chiếu tĩnh. | Storefront API boundary | Không xóa; đây là sửa lỗi cấu hình |
  | `src/app/~offline/page.tsx` (`force-static`)   | Fallback được precache dưới dạng document tĩnh; render động thì precache không có bản HTML ổn định.                                                             | Storefront PWA          | Không xóa                          |
  | `next.config.ts` (`additionalPrecacheEntries`) | Trước đó worker không precache `/~offline`, nên điều hướng offline không có fallback.                                                                           | Storefront PWA          | Không xóa                          |

  Cả ba đổi hành vi production theo hướng sửa lỗi, không thêm bypass. Chúng được chốt sau khi đã dùng, không phải trước như spec yêu cầu; người dùng duyệt giữ cả ba trong PR này ngày 26/11/2026.

- **Baseline E2E trước harness chưa được ghi.** Plan bước 1 yêu cầu chạy baseline trước khi đổi harness; bước này bị bỏ qua và không dựng lại được mà không checkout lại source cũ (repo không cho tạo worktree). Drift đã biết trước đó chỉ có ở dạng đối chiếu tĩnh trong [verification policy](../20-storefront-verification-policy/verification.md): catalog kỳ vọng taxonomy mock, PDP/checkout kỳ vọng mua từ PDP đang tắt. Chỉ baseline coverage được đo thật. Người dùng chấp nhận thiếu sót này ngày 26/11/2026; không dựng lại baseline.
- The first full run preceded WebKit host dependency installation; the final run completed across all three engines.
- Two WebGL2 handover checks remain skipped in Firefox and WebKit by the existing browser capability guard; the handover runs in Chromium, and the reduced-motion path runs in all three engines.
- One `useMediaQuery` effect guard remains uncovered. React does not run effects during server rendering, so testing that path would require an implementation-coupled React mock. Global branches are 123/124 (99.19%), above the unchanged 99% threshold.
- The task is `review` while PR #117 is open; task 35 stays blocked until task 34 is merged.

## Test cũ đã chạm

- Adapted the task-manifest E2E specs for auth, cart, catalog, checkout, and PDP; did not enable the disabled PDP purchase action. `search`, `home`, `providers` and `hero-3d` pass against the harness without changes.
- Cart merge still checks the cart page total (`Tạm tính (3 sản phẩm)`), reached by client-side navigation because the mock session lives in memory.
- PDP still checks Variant resolution: the price hint stays while the selection is incomplete and disappears once Color+Size resolve, and the resolved price matches the fixture Variant. The old out-of-stock check ("Hết hàng") is gone because the pinned product-detail contract has no stock field and purchase is disabled; it returns with the purchase slice.
- Auth now expects the API's own bad-credentials message. The `ApiError` gap noted in Decision #90 no longer reproduces, so the generic-fallback assertion no longer matched current behavior.
- Checkout sets the middleware's `access_token` login hint in the test, because a cookie set by the MSW worker never reaches the browser in mock mode (`src/lib/api/mocks/auth-fixtures.ts`). It is test-only; API calls still use the session from the real login response.
- Added focused unit tests in `manifest.md` for motion, page loading, query states, media-query cleanup/SSR, local-storage SSR/quota handling, Cloudinary configuration fallback, SEO environment fallback, and invalid query values. These were approved to close the existing coverage baseline gap.

## Kiểm tra

Environment: Linux, Node 24.22.2, pnpm 11.24.0; local production build uses `NEXT_PUBLIC_API_MOCKING=false`, app origin `127.0.0.1:3101`, and HTTP fixture origin `127.0.0.1:4011`.

| Command                                                                                                             | Result                                                                       |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm lint`                                                                                                         | Exit 0                                                                       |
| `pnpm format:check`                                                                                                 | Exit 0                                                                       |
| `pnpm docs:check`                                                                                                   | Exit 0                                                                       |
| `pnpm typecheck`                                                                                                    | Exit 0                                                                       |
| `pnpm test`                                                                                                         | Exit 0                                                                       |
| `pnpm test:coverage`                                                                                                | Exit 0 — thresholds remain 99%                                               |
| `pnpm build` with production test origins and API mocking disabled                                                  | Exit 0; `public/sw.js` carries `/~offline` with the HEAD commit as revision  |
| `pnpm exec vitest run e2e/support/catalog-server.test.ts`                                                           | Exit 0 — 4 passed                                                            |
| `pnpm exec playwright test --project=chromium --workers=2`                                                          | Exit 0 — 22 passed                                                           |
| `pnpm exec playwright test --project=webkit --project=firefox --workers=2`                                          | Exit 0 — 42 passed, 2 skipped (browser-specific WebGL2 handover checks)      |
| `pnpm exec playwright test --project=webkit e2e/auth.spec.ts e2e/checkout.spec.ts e2e/cart.spec.ts --repeat-each=3` | Exit 0 — 12 passed                                                           |
| `pnpm test:e2e:production`                                                                                          | Exit 0 — 4 passed, including offline navigation and the shared-harness probe |

An earlier full Chromium run timed out while unrelated coverage/production jobs were competing for resources; the isolated rerun above passed.

## Acceptance criteria: chạy tay

- [x] Task 21 blocker is done; task 34 remains on its own `dev`-based branch.
- [x] Manifest and plan reflect current sources, consumers, approved test seams, and rollback boundaries.
- [x] Contract-shaped HTTP harness is shared by browser and server probes (`e2e/production/runtime.spec.ts`); the PDP remains unavailable for purchase.
- [x] Pre-harness E2E baseline was not recorded; the user accepted the gap on 26/11/2026 (see above).
- [x] The user approved keeping the three production-source exceptions on 26/11/2026.
- [x] Existing 99% thresholds and coverage include/exclude paths are unchanged; coverage now passes.
- [x] Full three-engine E2E passes after WebKit host dependencies are installed.
- [x] Production build and production Chromium runtime/PWA checks pass.
- [x] README, architecture documentation, and environment example match current setup.
- [x] PR #117 is open against `dev`; the task and index are in `review`.
- [ ] PR review and merge are pending; transition to `done` only after merge.

Keep all test-generated reports out of the committed source tree.
