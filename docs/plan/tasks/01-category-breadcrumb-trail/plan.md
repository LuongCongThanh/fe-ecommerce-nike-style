# Plan 01: Breadcrumb danh mục theo chuỗi cha–con

Branch: `feat/01-category-breadcrumb-trail` (từ `dev`). Một PR, không có breaking change (không đổi URL, route, API, i18n).

## Phạm vi

Sửa/tạo đúng 3 file (đã kiểm tra tồn tại):

- `src/features/catalog/categoryTree.ts` (sửa): thêm `export function getCategoryTrail(flat: readonly CategoryEntry[], slug: string): CategoryEntry[]`. Giữ nguyên `flattenCategories`.
- `src/features/catalog/categoryTree.test.ts` (mới, đặt cạnh source như `discount.test.ts`, `priceRange.test.ts`).
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx` (sửa): `CategoryPageContent` dùng `getCategoryTrail` thay cho `categories.find(slug)` + `categories.find(parentId)`.

Type dùng lại: `CategoryEntry`, `CategoryNode` từ `@/lib/api/models/catalog` (chỉ `import type`).

Cố ý không làm: `useCategoryTree.ts`, `src/lib/api/**`, `FilterSidebar`, message i18n (chuỗi tiếng Việt cứng "Trang chủ", "Danh mục", "Không tìm thấy danh mục" là nợ có sẵn, giữ nguyên), link bấm được trong breadcrumb, đổi route/URL, thêm thư viện/màu/class mới, test component cho `CategoryPageClient`. Nếu cần sửa file thứ 4 thì dừng và hỏi.

## Seams kiểm thử

- `getCategoryTrail` (unit, Vitest, không mock gì): input là mảng `CategoryEntry[]` dựng tay nhỏ, hoặc lấy từ `flattenCategories` của một cây 3 cấp fixture.
  - slug gốc -> mảng 1 phần tử (chính nó).
  - slug cấp 3 -> 3 phần tử, thứ tự gốc -> lá (`toEqual` trên mảng slug).
  - slug không tồn tại -> `[]`.
  - Dữ liệu vòng `parentId` (A.parentId = B, B.parentId = A) -> trả về kết quả hữu hạn, không treo; assert độ dài <= số entry và chứa slug yêu cầu ở cuối.
  - (thêm) `parentId` trỏ tới id không tồn tại -> chuỗi dừng ở entry đó (không lỗi).
- `flattenCategories` (unit): cây lồng 3 cấp, có 2 nhánh anh em -> `parentId` của gốc là `null`, của con là id cha; thứ tự depth-first (gốc1, con1.1, cháu1.1.1, con1.2, gốc2...).
- `CategoryPageClient`: không thêm test component (ngoài phạm vi 3 file); hành vi được đảm bảo bởi hàm thuần + typecheck/lint. Nếu thấy có sẵn test cho component này thì chạy lại, không sửa.

## Các bước

1. [ ] Viết `src/features/catalog/categoryTree.test.ts` (đỏ trước): `describe('flattenCategories')` và `describe('getCategoryTrail')` với các case ở trên; dùng `it.each` khi hợp lý. Fixture builder nhỏ `node(id, slug, children = [])` trong file test.
2. [ ] Cài `getCategoryTrail` trong `categoryTree.ts`:
   - Dựng `Map` id -> entry; tìm entry theo slug; không có -> `[]`.
   - Đi ngược theo `parentId`, mỗi bước kiểm tra `Set<string>` id đã thăm; gặp id đã thăm hoặc cha không có trong map thì dừng.
   - Trả mảng mới theo thứ tự gốc -> lá (unshift/`reverse` trên mảng cục bộ, không mutate input).
   - JSDoc tiếng Anh ngắn; có return type tường minh; không import React/API runtime.
   - Chạy `pnpm exec vitest run src/features/catalog/categoryTree.test.ts` -> xanh.
3. [ ] Sửa `CategoryPageContent` trong `CategoryPageClient.tsx`:
   - `const trail = getCategoryTrail(categories, slug); const category = trail.at(-1);` — nếu `category === undefined` (trail rỗng) render nguyên block "Không tìm thấy danh mục" hiện có.
   - Bỏ biến `parent`; render `trail.slice(0, -1).map((ancestor) => <Fragment key={ancestor.id}><ChevronRight className="size-3.5" /><span>{ancestor.name}</span></Fragment>)` ở vị trí cũ của `parent`.
   - Giữ nguyên "Trang chủ", "Danh mục", mục hiện tại với class `text-foreground line-clamp-1 font-medium`, header, FilterSidebar, CategoryClient. Import `getCategoryTrail` bằng `@/features/catalog/categoryTree`, `Fragment` từ `react` (theo thứ tự import ESLint).
4. [ ] Kiểm tra hẹp: `pnpm exec eslint src/features/catalog/categoryTree.ts src/features/catalog/categoryTree.test.ts src/features/catalog/category-detail/components/CategoryPageClient.tsx`.
5. [ ] Chạy gate: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`.

Ánh xạ tiêu chí nghiệm thu:

- Hàm thuần, không import React/API -> bước 2 (chỉ `import type`).
- Test gốc/cấp 3/slug lạ/vòng -> bước 1.
- Test `flattenCategories` parentId -> bước 1.
- Breadcrumb hiển thị mọi cấp cha; "Không tìm thấy" khi trail rỗng -> bước 3.
- Không đổi chuỗi/URL -> bước 3 (chỉ đổi nguồn dữ liệu breadcrumb).
- Gate xanh -> bước 4–5.

## Rủi ro

- Thấp: logic mới là hàm thuần; component chỉ đổi cách lấy danh sách breadcrumb.
- `noUncheckedIndexedAccess` có thể bật: dùng `trail.at(-1)` + kiểm `undefined`, không dùng non-null assertion.
- Slug trùng trong dữ liệu lỗi: `getCategoryTrail` lấy entry đầu tiên khớp (giống `find` hiện tại), không đổi hành vi.
- Không chạm deny/ask path trong `.claude/agent-guard.json`; mọi lệnh nằm trong `allowCommands`.
