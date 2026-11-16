---
status: review
blocked-by: []
pr: #96
kind: logic
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes:
---

# Spec 01: Breadcrumb danh mục theo chuỗi cha–con

Branch: `feat/01-category-breadcrumb-trail`

## Mục tiêu

Trang danh mục hiện chỉ hiển thị tối đa **một** cấp cha trong breadcrumb (`categories.find(parentId)` trong `CategoryPageContent`). Cây danh mục từ API có thể sâu hơn, nên danh mục cấp 3 mất cấp ông. Tách logic thành hàm thuần `getCategoryTrail` có test, rồi dùng nó để breadcrumb hiển thị đủ chuỗi từ gốc tới danh mục hiện tại.

## Phạm vi

Trong phạm vi:

- `src/features/catalog/categoryTree.ts`: thêm `getCategoryTrail(flat: readonly CategoryEntry[], slug: string): CategoryEntry[]`, trả chuỗi từ gốc đến danh mục có `slug` (gồm chính nó). Slug không tồn tại trả `[]`. Phải chặn vòng lặp `parentId` (dữ liệu lỗi) bằng tập id đã thăm, không được treo.
- `src/features/catalog/categoryTree.test.ts` (mới): test `flattenCategories` (cây lồng nhiều cấp, `parentId` đúng, thứ tự depth-first) và `getCategoryTrail`.
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx`: breadcrumb render từ `getCategoryTrail`; các mục cha và mục hiện tại giữ nguyên class hiện có, không thêm thư viện, không thêm màu mới.

Ngoài phạm vi: `useCategoryTree.ts`, `src/lib/api/**`, FilterSidebar, thông điệp i18n, link bấm được trong breadcrumb, mọi thay đổi route/URL.

## Tiêu chí nghiệm thu

- [ ] `getCategoryTrail` là hàm thuần, không import React hay API.
- [ ] Test: danh mục gốc trả đúng 1 phần tử; danh mục cấp 3 trả 3 phần tử theo thứ tự gốc -> lá; slug lạ trả `[]`; dữ liệu có vòng `parentId` trả kết quả hữu hạn (không treo).
- [ ] Test `flattenCategories` xác nhận `parentId` của node gốc là `null` và của con là id cha.
- [ ] Breadcrumb ở `CategoryPageContent` hiển thị mọi cấp cha (không chỉ một cấp); phần "Không tìm thấy danh mục" khi `trail` rỗng giữ nguyên hành vi.
- [ ] Không đổi chuỗi hiển thị hiện có ("Trang chủ", "Danh mục") và không đổi URL.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` xanh.

## Ghi chú/rủi ro

- Rủi ro thấp: logic mới là hàm thuần; component chỉ đổi cách lấy danh sách breadcrumb.
- Chuỗi tiếng Việt cứng trong `CategoryPageClient` là nợ có sẵn, không sửa ở task này.
- Task chạm đúng 3 file; nếu cần sửa thêm file khác thì dừng và hỏi.
