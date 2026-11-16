---
status: review
blocked-by: []
pr: #99
kind: ui
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes:
---

# Spec 03: Phân trang rút gọn có dấu "..." và `aria-current`

Branch: `feat/03-pagination-window`

## Mục tiêu

`src/shared/ui/Pagination.tsx` render **mọi** số trang (`Array.from({ length: totalPages })`). Với danh mục nhiều trang, hàng nút tràn khỏi màn hình điện thoại. Rút gọn thành cửa sổ quanh trang hiện tại kèm dấu "...", và đánh dấu trang hiện tại cho trình đọc màn hình. Props của `Pagination` không đổi nên ba nơi dùng (`ProductsClient`, `CategoryClient`, `SearchClient`) không phải sửa.

## Phạm vi

Trong phạm vi:

- `src/shared/utils/pagination.ts` (mới): `getPageItems(currentPage: number, totalPages: number, siblingCount = 1): Array<number | 'ellipsis'>`. Luôn có trang 1 và trang cuối; có `siblingCount` trang mỗi bên trang hiện tại; chỗ hở từ 2 trang trở lên thay bằng `'ellipsis'`; chỗ hở đúng 1 trang thì hiện luôn số đó (không thay 1 trang bằng "..."); `totalPages <= 7` trả danh sách đầy đủ.
- `src/shared/utils/pagination.test.ts` (mới): phủ **mọi nhánh** (thư mục `src/shared/utils/**` nằm trong ngưỡng coverage 99% của `vitest.config.ts`).
- `src/shared/ui/Pagination.tsx`: dùng `getPageItems`; dấu "..." là `<span aria-hidden="true">` dùng `text-muted-foreground`; nút trang hiện tại có `aria-current="page"`; không thêm prop mới, nhãn của nút số vẫn là chính con số.
- `src/shared/ui/Pagination.test.tsx` (mới, React Testing Library): kiểm cách render và gọi `onPageChange`.

Ngoài phạm vi: `usePagination`, ba màn hình đang dùng, key i18n, token/màu mới, thư viện UI mới, animation.

## Tiêu chí nghiệm thu

- [ ] `getPageItems(1, 3)` = `[1, 2, 3]`; `getPageItems(1, 20)` có đúng một `'ellipsis'` và kết thúc bằng `20`; `getPageItems(10, 20)` có hai `'ellipsis'`; `getPageItems(20, 20)` bắt đầu bằng `1` rồi `'ellipsis'`.
- [ ] Với 20 trang, DOM của `Pagination` không quá 9 nút/dấu (gồm cả hai nút trước/sau), thay vì 22.
- [ ] Nút trang hiện tại có `aria-current="page"`, các nút khác không có; nút trước/sau vẫn `disabled` ở biên như cũ.
- [ ] Bấm một số trang gọi `onPageChange(số đó)`; dấu "..." không bấm được và không tab tới được.
- [ ] `totalPages <= 1` vẫn trả `null`.
- [ ] Chỉ dùng class đã có trong repo và token trong `design.md` (không hex cứng, không màu mới); `Button` giữ nguyên variant hiện tại; kích thước mục tiêu bấm không nhỏ đi.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` xanh.

## Ghi chú/rủi ro

- Rủi ro thấp: component thuần trình bày, props giữ nguyên; e2e catalog/search không phụ thuộc số nút ngoài trang 1 (kiểm tra `e2e/catalog.spec.ts`, `e2e/search.spec.ts` bằng grep, không chạy Playwright).
- Nếu `Pagination.tsx` cần prop mới (ví dụ nhãn cho "...") thì dừng và hỏi: việc đó kéo theo sửa ba màn hình và i18n, nằm ngoài task này.
