# Report 01

- **PR:** #
- **Ngày merge:**

## Đã làm

- `src/features/catalog/categoryTree.ts`: thêm hàm thuần `getCategoryTrail(flat, slug)` trả chuỗi gốc -> lá (gồm chính danh mục). Slug lạ trả `[]`; dừng khi `parentId` trỏ tới id không tồn tại hoặc gặp id đã thăm (chặn vòng lặp). Chỉ `import type`, không mutate input.
- `src/features/catalog/categoryTree.test.ts` (mới): 9 test. `flattenCategories`: thứ tự depth-first, `parentId` gốc là `null` và con là id cha. `getCategoryTrail`: gốc (1 phần tử), cấp 2, cấp 3 (3 phần tử gốc -> lá), slug lạ, cha bị thiếu, vòng `parentId`, không mutate input.
- `src/features/catalog/category-detail/components/CategoryPageClient.tsx`: `CategoryPageContent` dùng `getCategoryTrail`; `category = trail.at(-1)`, trail rỗng thì giữ khối "Không tìm thấy danh mục". Mọi cấp cha render bằng `trail.slice(0, -1)` trong `Fragment` theo `ancestor.id`, giữ nguyên class, chuỗi "Trang chủ"/"Danh mục" và URL.

## Lệch so với spec và rủi ro còn lại

- Không lệch phạm vi: chỉ chạm đúng 3 file trong spec.
- Với dữ liệu vòng `parentId`, trail bắt đầu từ cấp cha cuối cùng chưa thăm (ví dụ A<->B, slug A -> `[B, A]`). Kết quả hữu hạn, lá vẫn ở cuối.
- Chuỗi tiếng Việt cứng trong breadcrumb là nợ có sẵn, chưa sửa (ngoài phạm vi).

## Test cũ đã chạm

- Không có. Không có test component sẵn cho `CategoryPageClient`.

## Kiểm tra

- `pnpm exec vitest run src/features/catalog/categoryTree.test.ts`: đỏ trước khi cài (7 fail, `getCategoryTrail is not a function`), xanh sau khi cài (9/9).
- `pnpm exec eslint <3 file>`: lỗi sắp xếp import, đã sửa bằng `eslint --fix`, xanh.
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`: xanh.
- `pnpm test`: 72 file, 897 test xanh.
- `pnpm build`: xanh.
- Không chạy `pnpm test:e2e` vì không đổi luồng trình duyệt hoặc route.

## Acceptance criteria: chạy tay

- Mở `/vi/categories/<slug-cấp-3>` với API thật: breadcrumb phải là "Trang chủ > Danh mục > <ông> > <cha> > <hiện tại>".
- Mở `/vi/categories/<slug-gốc>`: breadcrumb là "Trang chủ > Danh mục > <hiện tại>".
- Mở `/vi/categories/khong-ton-tai`: hiện "Không tìm thấy danh mục".

## Đề xuất cho môi trường

Phiên này dùng skill `mattpocock-skills:tdd`, `mattpocock-skills:handoff`, `mattpocock-skills:retro` và `mattpocock-skills:writing-for-agents`. Không gọi agent `explorer` vì 3 file đã được plan nêu sẵn. Không có lỗi logic; các điểm dưới đây là lãng phí lượt gọi hoặc nhiễu context, xếp từ nặng tới nhẹ.

- **Tool economy (guard):** 2 lượt Bash bị guard chặn: `cat spec.md plan.md` (lượt đầu tiên của phiên) và `pnpm exec vitest run … | tail -20` (cả lệnh bị chặn vì một đoạn sau pipe). Thêm một dòng vào prompt phase `implement`: "Đọc file bằng Read/Grep; guard kiểm từng đoạn sau `|`, `&&`, nên chạy `pnpm …` không kèm pipe." Như vậy agent biết trước lệnh nào chạy được, không phải đoán rồi bị chặn.
- **Automated checks (thứ tự import):** lần chèn `import { Fragment } from 'react'` đầu tiên sai thứ tự `simple-import-sort` (react đứng nhóm riêng ở trên cùng) nên tốn thêm một vòng eslint đỏ rồi `--fix`. Đây là lỗi máy móc: thêm hook PostToolUse chạy `pnpm exec eslint --fix` trên file `.ts/.tsx` vừa Edit/Write (cùng chỗ với hook impeccable hiện có), hoặc cho phép lint-staged/prettier tự sắp import. Không cần viết thêm quy tắc chữ.
- **Coding standards (mâu thuẫn vị trí test):** bảng đặt tên trong `.claude/rules/core/typescript-react.md` ghi test nằm "under `__tests__`", còn `AGENTS.md`, `.claude/rules/process/testing.md` và `project-structure.md` ghi đặt cạnh source. Sửa dòng trong bảng thành "beside the source" để có một nguồn sự thật duy nhất. Plan đã ghi rõ vị trí nên phiên này không sai, nhưng phiên không có plan dễ chọn nhầm.
- **No-ops (rule cũ của Admin/CMS):** các rule tự nạp mang nội dung legacy không áp dụng cho storefront: `localization.md` (react-i18next, Admin/CMS), `api-data.md` (cây `features/products` của Admin, `(shop)/_lib`), `typescript-react.md` (`routeTree.gen.ts`, `useAdminProducts`), `git-workflow.md` ("turbo, cached" trong pre-commit). Mỗi lần chạm file `src/**` đều nạp chúng vào context. Cắt các đoạn Admin/CMS/turbo vì `AGENTS.md` đã ghi `apps/admin`, `apps/cms` là code chờ xóa.
- **Tool economy (nhiễu output):** mỗi lần chạy Vitest in cảnh báo `configLoader: 'native'` (`vitest.config.ts` dùng ESM trong package CommonJS). Đổi tên thành `vitest.config.mts` hoặc đặt `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` trong script `test` để bỏ 4 dòng nhiễu mỗi lần chạy.
- **Tool economy (hook thiết kế):** hook `impeccable` báo cùng một dòng "No deterministic design-quality issues found" sau mỗi Edit (4 lần trong phiên), kể cả khi task có `kind: logic`. Chỉ in khi có phát hiện thật, hoặc bỏ qua khi `kind` khác `ui`.
- **Skill mâu thuẫn với chế độ không tương tác:** `mattpocock-skills:tdd` yêu cầu "confirm seams with the user" trước khi viết test, trái với prompt implement ("không hỏi người duyệt seams"). Prompt thắng nên phiên này không bị chặn, nhưng hai chỉ dẫn ngược nhau. Thêm vào prompt implement câu "Seams trong `plan.md` đã được duyệt" để thay bước xác nhận đó bằng một điều kiện cụ thể.
