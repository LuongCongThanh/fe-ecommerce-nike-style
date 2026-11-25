# Report 34

- **PR:** [LuongCongThanh/fe-ecommerce-nike-style#117](https://github.com/LuongCongThanh/fe-ecommerce-nike-style/pull/117).
- **Ngày merge:** Chưa merge.

## Đã làm

- Added the deterministic contract-shaped catalog HTTP fixture and tests, and configured dev/production Playwright to use isolated harness ports.
- Adapted the in-scope browser flows to the current source behavior; PDP purchase remains disabled.
- Added production Chromium runtime and PWA checks, coverage and production-browser CI jobs, and run instructions.
- Fixed client environment access to use statically referenced `NEXT_PUBLIC_*` values and restricted Playwright discovery to browser `*.spec.ts` files.
- Waited for full-page form navigations to reach network idle before interacting; WebKit could otherwise lose the first input before client form handling was ready.
- Made `/~offline` static and added a content-revisioned Serwist precache entry for the document fallback. The generated worker contains the versioned route entry; production offline navigation now passes.
- Added user-approved focused public-behavior tests for the existing 99% coverage baseline without changing implementations, thresholds, or collected coverage paths.
- `.env.example` already contains the required public URLs, mock flag, and server-only `API_ORIGIN`; no edit was needed.

## Lệch so với spec và rủi ro còn lại

- No scope deviation. The first full run preceded WebKit host dependency installation; the final run completed across all three engines.
- Two WebGL2 handover checks remain skipped in Firefox and WebKit by the existing browser capability guard; the handover runs in Chromium, and the reduced-motion path runs in all three engines.
- One `useMediaQuery` effect guard remains uncovered. React does not run effects during server rendering, so testing that path would require an implementation-coupled React mock. Global branches are 123/124 (99.19%), above the unchanged 99% threshold.
- The task is `review` while PR #117 is open; task 35 stays blocked until task 34 is merged.
- Follow-up testing policy approved for task 35 onward: add unit tests only and lower the global coverage target to about 50%; this policy change is not part of PR #117.

## Test cũ đã chạm

- Adapted the task-manifest E2E specs for auth, cart, catalog, checkout, and PDP. Kept their user-facing assertions and did not enable the disabled PDP purchase action.
- Added focused unit tests in `manifest.md` for motion, page loading, query states, media-query cleanup/SSR, local-storage SSR/quota handling, Cloudinary configuration fallback, SEO environment fallback, and invalid query values. These were approved to close the existing coverage baseline gap.

## Kiểm tra

Environment: Linux, Node 24.22.2, pnpm 11.24.0; local production build uses `NEXT_PUBLIC_API_MOCKING=false`, app origin `127.0.0.1:3101`, and HTTP fixture origin `127.0.0.1:4011`.

| Command | Result |
| --- | --- |
| `pnpm lint` | Exit 0 |
| `pnpm format:check` | Exit 0 |
| `pnpm docs:check` | Exit 0 after removing generated Playwright report artifacts that the docs scanner had picked up |
| `pnpm typecheck` | Exit 0 |
| `pnpm test` | Exit 0 — 83 files, 1,113 tests |
| `pnpm test:coverage` | Exit 0 — statements 99.47%, branches 99.19%, functions 100%, lines 100%; thresholds remain 99% |
| `pnpm build` with production test origins and API mocking disabled | Exit 0 |
| `pnpm exec playwright test --project=chromium --workers=1` | Exit 0 — 22 passed |
| `pnpm test:e2e:production` | Exit 0 — 3 passed, including offline navigation |
| `pnpm exec playwright test --project=webkit e2e/auth.spec.ts e2e/checkout.spec.ts --workers=1` | Exit 0 — 2 passed |
| `pnpm exec playwright test --workers=1` | Exit 0 — 64 passed, 2 skipped (browser-specific WebGL2 handover checks) |

An earlier full Chromium run timed out while unrelated coverage/production jobs were competing for resources; the isolated rerun above passed.

## Acceptance criteria: chạy tay

- [x] Task 21 blocker is done; task 34 remains on its own `dev`-based branch.
- [x] Manifest and plan reflect current sources, consumers, approved test seams, and rollback boundaries.
- [x] Contract-shaped HTTP harness is shared by browser and server probes; the PDP remains unavailable for purchase.
- [x] Existing 99% thresholds and coverage include/exclude paths are unchanged; coverage now passes.
- [x] Full three-engine E2E passes after WebKit host dependencies are installed.
- [x] Production build and production Chromium runtime/PWA checks pass.
- [x] README, architecture documentation, and environment example match current setup.
- [x] PR #117 is open against `dev`; the task and index are in `review`.
- [ ] PR review and merge are pending; transition to `done` only after merge.

Keep all test-generated reports out of the committed source tree.
