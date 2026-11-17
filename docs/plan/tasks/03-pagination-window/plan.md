# Plan 03: Phân trang rút gọn có dấu "..." và `aria-current`

Branch: `feat/03-pagination-window` (từ `dev`). Một PR, không breaking change (props của `Pagination` giữ nguyên).

## Phạm vi

Tạo/sửa:

- `src/shared/utils/pagination.ts` (mới): `getPageItems(currentPage, totalPages, siblingCount = 1): Array<number | 'ellipsis'>` và `type PageItem = number | 'ellipsis'` (export kiểu nếu `Pagination.tsx` cần).
- `src/shared/utils/pagination.test.ts` (mới): phủ mọi nhánh (glob coverage `src/shared/utils/**`, ngưỡng 99% trong `vitest.config.ts`).
- `src/shared/ui/Pagination.tsx` (sửa): thay `Array.from({ length: totalPages })` bằng `getPageItems(currentPage, totalPages)`.
- `src/shared/ui/Pagination.test.tsx` (mới, RTL + `userEvent`, theo mẫu `src/shared/ui/QuantitySelector.test.tsx`).

Cố ý không làm: `usePagination`, `ProductsClient`/`CategoryClient`/`SearchClient`, key i18n, token/màu mới, thư viện mới, animation, `vitest.config.ts` (deny path), e2e. Đã kiểm tra `e2e/catalog.spec.ts` (chỉ bấm nút `'2'` với 2 trang; vẫn hiện vì `totalPages <= 7`) và `e2e/search.spec.ts` (không dùng phân trang): không cần sửa.

## Seams kiểm thử

- **Unit `getPageItems`** (Vitest, hàm thuần, không mock), `it.each` dạng bảng:
  - `totalPages <= 7` trả danh sách đầy đủ: `(1, 3)` → `[1, 2, 3]`; `(4, 7)` → `[1..7]`; `(1, 1)` → `[1]`; `(1, 0)` → `[]`.
  - `(1, 20)` → `[1, 2, 'ellipsis', 20]`: đúng một `'ellipsis'`, kết thúc bằng `20`.
  - `(10, 20)` → `[1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]`: hai `'ellipsis'`.
  - `(20, 20)` → `[1, 'ellipsis', 19, 20]`: bắt đầu bằng `1, 'ellipsis'`.
  - Chỗ hở đúng 1 trang hiện luôn số: `(4, 20)` → `[1, 2, 3, 4, 5, 'ellipsis', 20]`; `(17, 20)` → `[1, 'ellipsis', 16, 17, 18, 19, 20]`.
  - `siblingCount = 2`: `(10, 20, 2)` → `[1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20]`.
  - Bất biến (với `siblingCount = 1`, mọi `currentPage` trong 1..20 của `totalPages = 20`): phần tử đầu `1`, phần tử cuối `20`, có `currentPage`, tối đa 7 phần tử, các số tăng dần, không có hai `'ellipsis'` liền nhau.
  - `currentPage` ngoài khoảng (ví dụ `0`, `25`) được kẹp về `[1, totalPages]`: chỉ thêm khi bước 1 thêm nhánh kẹp; có nhánh thì phải có test.
- **Component `Pagination`** (RTL, `render` thuần, `onPageChange = vi.fn()`, không cần provider):
  - `totalPages = 1` và `0` → `container` rỗng (`null`).
  - `totalPages = 20, currentPage = 10`: `getAllByRole('button')` có 7 nút (5 số + trước/sau), cộng 2 dấu "..." → tổng ≤ 9 mục; các dấu "..." không phải role `button` và là `aria-hidden`.
  - `aria-current="page"` chỉ ở nút `name: '10'`; các nút số khác không có thuộc tính này.
  - Nút trước (`previousLabel`) `disabled` khi `currentPage = 1`; nút sau (`nextLabel`) `disabled` khi `currentPage = totalPages`.
  - Bấm nút `'11'` → `onPageChange` được gọi với `11`; bấm trước/sau → `currentPage - 1` / `currentPage + 1`.
  - Dấu "..." không vào thứ tự tab: `user.tab()` lần lượt chỉ dừng ở các nút, không dừng ở `span`.
  - `nav` có `aria-label = navigationLabel` (`getByRole('navigation', { name })`).

## Các bước

1. [ ] **`getPageItems` (TDD)**: viết `src/shared/utils/pagination.test.ts` theo các seam trên trước, rồi viết `src/shared/utils/pagination.ts`:
   - Hằng `MAX_FULL_PAGES = 7` (theo spec; 7 = 1 + "..." + 3 số + "..." + cuối với `siblingCount = 1`).
   - `if (totalPages <= MAX_FULL_PAGES)` → `Array.from({ length: Math.max(totalPages, 0) }, (_, i) => i + 1)`.
   - Kẹp `currentPage` về `[1, totalPages]`; `start = max(2, current - siblingCount)`, `end = min(totalPages - 1, current + siblingCount)`.
   - Bên trái: `start - 2 >= 2` → `'ellipsis'`; `start - 2 === 1` → thêm số `2`; `0` → không thêm gì. Bên phải đối xứng với `totalPages - 1 - end`.
   - Kết quả: `[1, ...left, start..end, ...right, totalPages]`. Return type khai báo tường minh; không `enum`, không `as`.
   - Chạy `pnpm exec vitest run src/shared/utils/pagination.test.ts`.
2. [ ] **`Pagination.tsx`** (TDD, viết `src/shared/ui/Pagination.test.tsx` trước):
   - `const items = getPageItems(currentPage, totalPages);` (import `@/shared/utils/pagination`). Giữ nguyên guard `totalPages <= 1 → null`, props, nút trước/sau, class `nav`.
   - Nút số: giữ `Button variant={isCurrent ? 'default' : 'outline'} size="sm" className="min-w-10"`, thêm `aria-current={isCurrent ? 'page' : undefined}`, nội dung vẫn là con số (không `aria-label`), `key={page}`.
   - Dấu "...": `<span aria-hidden="true" className="flex h-8 min-w-10 items-center justify-center text-sm text-muted-foreground">...</span>` (hoặc ký tự `…`); chỉ dùng class Tailwind/token đã có (`text-muted-foreground`), không tab được vì không phải phần tử tương tác. Key ổn định theo vị trí: `ellipsis-start` nếu đứng trước trang hiện tại, ngược lại `ellipsis-end`.
   - Không thêm prop mới. Nếu phát hiện cần prop/nhãn mới cho "..." thì dừng và báo người (theo spec).
   - Chạy `pnpm exec vitest run src/shared/ui/Pagination.test.tsx`.
3. [ ] **Rà UI** (`kind: ui`): áp dụng skill `fashion-storefront-ui-director` cho `Pagination`, kiểm:
   - Responsive: với 20 trang, hàng nút (tối đa 9 mục, nút icon `size-11`, nút số `h-8 min-w-10`, `gap-2`) không tràn ở 320/375/414 px; desktop 768/1440 không đổi bố cục.
   - Trạng thái: trang đầu (nút trước disabled), trang giữa (hai "..."), trang cuối (nút sau disabled), `totalPages <= 7` (đầy đủ, như cũ), `totalPages <= 1` (không render). Loading/empty/error thuộc ba màn hình dùng component, ngoài phạm vi.
   - Accessibility: `aria-current="page"`, "..." `aria-hidden`, kích thước mục tiêu bấm không nhỏ đi, focus ring của `Button` giữ nguyên, không hex cứng/màu mới.
4. [ ] Chạy gate: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` (kể cả ngưỡng coverage của `src/shared/utils/**`), `pnpm build`.

## Rủi ro

- Coverage 99% cho `src/shared/utils/**`: mọi nhánh của `getPageItems` (đầy đủ, ellipsis trái/phải, khe 1 trang trái/phải, không khe, kẹp `currentPage`) phải có test; không được sửa `vitest.config.ts` (deny path).
- Số mục thay đổi theo vị trí (4–7 số với `siblingCount = 1`), nên hàng nút co giãn khi đổi trang; đây là hành vi theo spec, không cố định chiều rộng.
- e2e `catalog.spec.ts` bấm `getByRole('button', { name: '2', exact: true })`: thêm `aria-current` không đổi accessible name; "..." là `aria-hidden` nên không tạo nút trùng tên. Không chạy Playwright (ngoài `allowCommands`).
- Không động tới path deny/ask; không cần `approved:`.
