# Report 05

- **PR:** #
- **Ngày merge:**

## Đã làm

- `src/shared/constants/app-config.ts`: xóa `ORDER_STATUS_LABEL`, `PAYMENT_METHOD_LABEL`, `ORDER_STATUS_COLOR_MAP`, `SORT_OPTIONS`, `type SortOption` (dòng 7–40 cũ, gồm dòng trống trước chúng). Khối `APP_CONFIG` (dòng 1–6) giữ nguyên từng giá trị: `ITEMS_PER_PAGE: 20`, `MAX_CART_QUANTITY: 99`, `LOCALES: ['vi', 'en']`, `DEFAULT_LOCALE: 'vi'`. File kết thúc bằng một newline.
- Diff code chỉ gồm một file và chỉ xóa dòng.

## Lệch so với spec và rủi ro còn lại

- Không lệch.
- `docs/storefront/plan/storefront-current-file-tree.md` (và có thể tài liệu khác) vẫn nhắc các hằng số đã xóa; cố ý để PR dọn tài liệu riêng xử lý theo spec.

## Test cũ đã chạm

- Không có (không thêm, sửa hay xóa test). Seam là trình biên dịch và bộ test hiện có.

## Kiểm tra

- `pnpm typecheck`: xanh (`tsc --noEmit` cho app và `tsconfig.scripts.json`).
- `pnpm lint`: xanh.
- `pnpm format:check`: xanh.
- `pnpm test`: xanh, 71 file / 886 test.
- `pnpm build`: xanh (`next build --webpack`, 34 trang tĩnh).

## Acceptance criteria: chạy tay

- AC1, trước khi xóa: tìm `ORDER_STATUS_LABEL|PAYMENT_METHOD_LABEL|ORDER_STATUS_COLOR_MAP|SORT_OPTIONS|SortOption` (công cụ Grep) trên `src`, `e2e`, `scripts`:

  ```text
  src/shared/constants/app-config.ts:8:export const ORDER_STATUS_LABEL: Record<string, string> = {
  src/shared/constants/app-config.ts:17:export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  src/shared/constants/app-config.ts:24:export const ORDER_STATUS_COLOR_MAP: Record<string, string> = {
  src/shared/constants/app-config.ts:33:export const SORT_OPTIONS = [
  src/shared/constants/app-config.ts:40:export type SortOption = (typeof SORT_OPTIONS)[number]['value'];
  ```

  Chỉ có chính `app-config.ts`, không có consumer khác.

- AC2, sau khi xóa: cùng pattern trên `src`, `e2e`, `scripts` → `No matches found`. `APP_CONFIG` giữ nguyên giá trị.
- AC3: diff chỉ một file (`src/shared/constants/app-config.ts`), chỉ xóa dòng.
- AC4: không test nào bị sửa/xóa/thêm; 886/886 test xanh.
- AC5: lint, typecheck, test, format:check, build đều xanh.

## Đề xuất cho môi trường

Phiên này dùng skill `mattpocock-skills:writing-for-agents` (cho bước retro) và không gọi agent `explorer`. Không gọi `mattpocock-skills:tdd` vì spec cấm sửa test (xem mục 3).

- **[Cao] Information access: phase `implement` không có lệnh git chỉ đọc nào nên không tự kiểm được AC3 ("diff chỉ gồm một file, chỉ xóa dòng").** `git diff --stat` bị guard chặn vì `allowCommands` chung và `phases.implement` trong `.claude/agent-guard.json` không có lệnh git nào; chỉ `review` có `git diff *`/`git log *`. Implementer phải khẳng định AC3 dựa trên trí nhớ thay vì bằng chứng. Đề xuất: thêm `git diff *` và `git status --short` (chỉ đọc) vào `phases.implement.allowCommands` (và `retro`). Rẻ, không có rủi ro ghi.
- **[Cao] Automated checks: không có guardrail bắt export chết, vốn là lý do task này tồn tại.** ESLint chỉ có `unused-imports` (biến/import cục bộ). Export không có consumer (`ORDER_STATUS_LABEL`, `SORT_OPTIONS`, ...) lọt qua lint, typecheck và CI cho tới khi người dùng tự phát hiện. Đề xuất: thêm `knip` (hoặc `ts-prune`) làm script `pnpm check:unused` và một job CI, ban đầu cho `src/shared/**` và `src/lib/**`, có ignore list cho entry Next.js (`page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`). Mỗi lần dọn dead code sau này sẽ được phát hiện tự động thay vì phải viết thành task.
- **[Trung bình] Coding standards / steering: prompt implementer bắt buộc "test-first với `mattpocock-skills:tdd`" xung đột với task `kind: refactor` có `allow-test-changes` trống.** Spec và plan nói rõ seam là trình biên dịch cộng bộ test hiện có, nên implementer phải tự chọn bỏ qua skill. Đề xuất: trong prompt phase `implement`, ghi điều kiện "dùng `tdd` khi spec cho phép thêm test; với `kind: refactor` và `allow-test-changes` trống thì seam là `pnpm typecheck` + bộ test hiện có, như plan đã ghi". Làm vậy để một quyết định ngầm thành một nhánh có tên.
- **[Trung bình] Tool economy / guard UX: guard chặn cả lệnh gate khi có pipe (`pnpm typecheck 2>&1 | tail -15`) vì `tail` không có trong allow list, và thông báo "Do not retry or work around it... return blocked" khiến việc chạy lại đúng lệnh gate (không pipe) trông như lách luật.** Thông báo này đẩy agent tới chỗ trả `blocked` sai, dù lệnh thật đã được phép. Đề xuất (chọn một): (a) cho phép `tail -n *`/`head -n *` làm bộ lọc ở cuối pipe sau một lệnh đã được phép; hoặc (b) khi segment bị chặn chỉ là bộ lọc output, đổi thông báo thành "chạy lại lệnh đã cho phép mà không pipe". Kèm thêm một dòng trong prompt implementer: "chạy lệnh gate trần, không pipe".
- **[Thấp] Navigation: phải grep `docs/storefront/plan/README.md` để tìm mẫu `report.md`.** Mẫu nằm giữa một file dài về guard/trạng thái. Đề xuất: tách mẫu ra `docs/storefront/plan/report-template.md` và để prompt implementer trỏ thẳng tới đó, hoặc đổi tham chiếu thành `docs/storefront/plan/README.md#reportmd-và-metricmd`.
- **[Thấp] Docs sediment: `docs/storefront/plan/storefront-current-file-tree.md` vẫn liệt kê các hằng số đã xóa** (cố ý để ngoài phạm vi). Đề xuất: đưa vào hàng đợi của task dọn tài liệu, hoặc sinh bảng kiểm kê này bằng script thay vì viết tay để nó không thành cache cũ.
