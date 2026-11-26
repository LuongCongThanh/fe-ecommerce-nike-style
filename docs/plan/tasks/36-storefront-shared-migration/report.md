# Report 36

- **PR:** [LuongCongThanh/fe-ecommerce-nike-style#120](https://github.com/LuongCongThanh/fe-ecommerce-nike-style/pull/120).
- **Ngày merge:**

## Đã làm

- Chuyển `shared/ui` → `shared/components`; `constants/{routes,auth-cookies}` → `routing/`; `lib/{motion,focusRing}` → `styles/`; `notification` → `feedback/`; `useApiMutation` → `queries/`; `createPersistedListStore` → `persistence/`; `pagination` → `pagination/`; `monitoring/sentry.ts`; tách `cn` → `styles/cn.ts` và `formatCurrency` → `formatting/currency.ts`. Mọi import/`vi.mock` string, glob coverage trong `vitest.config.ts` (ngưỡng 99 giữ nguyên) và docs hiện trạng đã cập nhật cùng lượt.
- Giữ `shared/utils/utils.ts` (formatDate, formatDateTime, slugify, buildQueryString, truncateText, validateVietnamesePhone) làm ngoại lệ có owner: task 44, đợt khóa migration (chứng minh consumer rồi xóa hoặc giữ thành inactive exception có tên). Ghi tại `plan.md` và `docs/architecture.md`; không xóa/di chuyển export.
- Làm mới `manifest.md` theo path đích; sửa `plan.md` (blocker 35 đã `done`, PR #119, commit `eb8f088` trên `dev`).
- Bổ sung test hành vi colocated (Vitest + Testing Library) cho phần đã chuyển chưa có test: `DropdownMenu`, `PageShell`, `Popover`, `Reveal`, `ScrollArea`, `SectionHeading`, `Select`, `Sheet`, `Skeleton`, `SocialMarks`, `Tooltip`, `routing/routes`. Không sửa assertion cũ, không đổi ngưỡng vitest.

## Lệch so với spec và rủi ro còn lại

- `plan.md` được viết sau khi đã chuyển file (spec yêu cầu lập plan trước code); các bước trong plan phản ánh việc đã làm.
- E2E và production Playwright không chạy theo quyết định người dùng (không đổi flow/routing/runtime).
- Token chưa đo: `pnpm tokens` cần sessionId không có trong phiên này (xem `metric.md`).
- Coverage tập file đã chuyển trước đợt bổ sung có functions 49.2% (< 50% yêu cầu); đã xử lý bằng test mới. Branch còn thấp nhất ở `Form.tsx` (46.66%), `Dialog.tsx` (66.66%), `Select.tsx` (71.42%), nhưng toàn tập vượt yêu cầu.
- `shared/utils/utils.ts` còn export chưa rõ consumer cho đến task 44.

## Test cũ đã chạm

Chỉ đổi path import/mock string và nơi đặt: `createPersistedListStore`, `useApiMutation`, `notification`, `ConfirmDialog`, `Pagination`, `QuantitySelector`, `pagination`, `PageLoader`, `QueryState`, `motion`; `utils.test.ts` tách thành `cn.test.ts`, `currency.test.ts` và phần còn lại. Assertion không đổi.

## Kiểm tra

Môi trường: nhánh `impl/36-review-fixes` trên `refactor/36-storefront-shared-migration`, pnpm 11.24.0, Linux, dev mode (không production).

| Lệnh                 | Exit | Kết quả                                             |
| -------------------- | ---- | --------------------------------------------------- |
| `pnpm lint`          | 0    | ESLint sạch; 712 internal edges, 6 known exceptions |
| `pnpm format:check`  | 0    |                                                     |
| `pnpm docs:check`    | 0    |                                                     |
| `pnpm typecheck`     | 0    |                                                     |
| `pnpm test`          | 0    | 99 files, 1200 tests (trước: 87 files, 1167 tests)  |
| `pnpm test:coverage` | 0    | Repo 99.47/99.19/100/100, ngưỡng 99 giữ nguyên      |
| `pnpm build`         | 0    |                                                     |

Coverage tập file đã chuyển (stmts/branches/funcs/lines; cách đo trong `metric.md`): trước 64.68/59/49.2/63.43 (đo lại cùng tập: 65.51/59.74/49.6/64.28), sau 97.41/89.93/98.4/97.32 (yêu cầu ≥ 50%).

Không chạy: E2E và production Playwright (quyết định người dùng).

## Acceptance criteria: chạy tay

- Blocker 35 đối chiếu PR #118/#119 trên `dev` (`eb8f088`) → done.
- Manifest/plan khớp checkout; ngoại lệ `utils.ts` có owner và đợt xóa.
- Test cũ chỉ đổi path; không skip, không giảm coverage/gate.

## Đề xuất cho môi trường
