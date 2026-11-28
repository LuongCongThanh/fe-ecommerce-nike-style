# Report 03

- **PR:**
- **Ngày merge:**

## Đã làm

- `src/shared/utils/pagination.ts` (mới): `getPageItems(currentPage, totalPages, siblingCount = 1)` trả `PageItem[]` (`number | 'ellipsis'`). `totalPages <= 7` trả đầy đủ; ngược lại luôn có trang 1 và trang cuối, `siblingCount` trang mỗi bên trang hiện tại, chỗ hở >= 2 trang thành `'ellipsis'`, chỗ hở đúng 1 trang hiện số đó. `currentPage` ngoài khoảng được kẹp về `[1, totalPages]`.
- `src/shared/utils/pagination.test.ts` (mới): bảng `it.each` cho danh sách đầy đủ (gồm `0` và `1` trang), cửa sổ có "..." hai bên, khe 1 trang trái/phải, `siblingCount = 2`, kẹp `currentPage` (0, 25) và bất biến cho mọi trang 1..20 của 20 trang. Coverage file: 100% stmt/branch/func/line.
- `src/shared/ui/Pagination.tsx`: dùng `getPageItems`; nút số có `aria-current="page"` khi là trang hiện tại; "..." là `<span aria-hidden="true">` (ký tự `…`) với `flex h-8 min-w-10 items-center justify-center text-sm text-muted-foreground` (cùng kích thước nút `sm` + `min-w-10`). Props, variant `Button`, nút trước/sau và guard `totalPages <= 1 → null` giữ nguyên.
- `src/shared/ui/Pagination.test.tsx` (mới, RTL + `userEvent`): trả rỗng khi 0/1 trang, landmark `navigation`, danh sách đầy đủ khi ít trang, 20 trang chỉ còn 7 nút + 2 "..." ẩn, `aria-current` chỉ ở trang hiện tại, disabled ở biên, `onPageChange` cho nút số và trước/sau, tab chỉ dừng ở các nút.
- Rà UI: với 20 trang hàng nút tối đa 9 mục (2 nút `size-11` + tối đa 7 mục `h-8 min-w-10`, `gap-2`) ≈ 88 + 7·40 + 8·8 = 432 px ở trường hợp xấu nhất. `nav` dùng `flex-wrap`, nên ở 320/375 px các mục xuống hàng thay vì tràn ngang; không thêm token/màu/animation và kích thước mục tiêu bấm không đổi.

## Lệch so với spec và rủi ro còn lại

- Key của "..." chọn theo vị trí trong mảng (`index === 1` → `ellipsis-start`, ngược lại `ellipsis-end`), tương đương với "đứng trước trang hiện tại" trong plan vì "..." đầu luôn ở chỉ số 1.
- Chưa kiểm trên phần cứng thật; trình duyệt có dữ liệu catalog không khả dụng trong môi trường local. Đã kiểm ở viewport 320/375/414/768/1440 px bằng cấu trúc DOM và `flex-wrap`: hàng không thể tràn ngang, có thể xuống hàng ở 320/375 px.
- Coverage ngưỡng 99% của `src/shared/utils/**` được đo bằng `vitest run --coverage` riêng cho file mới (100%); `pnpm test` không bật coverage nên không chạy kiểm ngưỡng toàn cục.
- e2e: `e2e/catalog.spec.ts` chỉ bấm nút `'2'` (2 trang, vẫn hiện đầy đủ); `e2e/search.spec.ts` không dùng phân trang. Không chạy Playwright.

## Test cũ đã chạm

Không.

## Kiểm tra

- `pnpm exec vitest run src/shared/utils/pagination.test.ts --coverage --coverage.include=src/shared/utils/pagination.ts`: 33 test xanh, coverage 100%.
- `pnpm exec vitest run src/shared/ui/Pagination.test.tsx src/shared/utils/pagination.test.ts`: 45 test xanh.
- `pnpm typecheck`: xanh.
- `pnpm lint`: xanh.
- `pnpm format:check`: xanh.
- `pnpm test`: 73 file, 933 test xanh.
- `pnpm build`: xanh.

## Acceptance criteria: chạy tay

- [x] `getPageItems(1, 3)` = `[1, 2, 3]`; `(1, 20)` = `[1, 2, 'ellipsis', 20]`; `(10, 20)` có hai `'ellipsis'`; `(20, 20)` = `[1, 'ellipsis', 19, 20]` (unit test).
- [x] 20 trang: DOM có 7 nút + 2 "..." = 9 mục (component test).
- [x] `aria-current="page"` chỉ ở trang hiện tại; trước/sau `disabled` ở biên (component test).
- [x] Bấm số gọi `onPageChange(số đó)`; "..." là `span aria-hidden`, không nằm trong thứ tự tab (component test).
- [x] `totalPages <= 1` trả `null` (component test).
- [x] Chỉ dùng class/token đã có (`text-muted-foreground`, `h-8`, `min-w-10`); variant `Button` giữ nguyên; kích thước nút không đổi.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` xanh.
- [x] Kiểm tra bố cục responsive 320/375/414/768/1440 px: `flex-wrap` giữ mọi nút trong khung; không thể kiểm thử dữ liệu catalog thật vì API local không trả dữ liệu.
