---
status: todo
blocked-by: []
pr:
kind: refactor
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---

# Spec 27: Gộp ESLint về một file và bỏ rule chạy trùng

Branch: `refactor/27-eslint-single-config`

## Problem Statement

ESLint được cấu hình qua hai lớp chồng nhau:

- `eslint.base.mjs` là phần còn lại của `packages/eslint-config` cũ (`strictTypeChecked`, `import-x`, `parserOptions.project: true`).
- `eslint.config.mjs` khai báo lại parser, plugin `@typescript-eslint` và nhiều rule trùng với lớp base.

Hệ quả đo được ngày 24/11/2026 (`TIMING=20 pnpm exec eslint .`):

| Rule                | Thời gian | Tỉ lệ |
| ------------------- | --------: | ----: |
| `import/no-cycle`   | 48 706 ms | 76,0% |
| `import-x/no-cycle` |    278 ms |  0,4% |

Hai rule cùng kiểm tra vòng import với cùng tuỳ chọn (`ignoreExternal: true, maxDepth: 3`). Ngoài ra còn các cặp trùng: `import/no-duplicates` và `import-x/no-duplicates`; `import-x/order` và `simple-import-sort/imports` (hiện không xung đột nhưng hai rule cùng sắp import). Danh sách `globals` viết tay là thừa vì `no-undef` đã tắt cho TypeScript. `eslint-plugin-vitest` 0.5.4 đã được thay bằng `@vitest/eslint-plugin`. Các devDependency `@typescript-eslint/eslint-plugin` và `@typescript-eslint/parser` trùng với `typescript-eslint`.

## Solution

Một file `eslint.config.mjs` duy nhất, dùng `typescript-eslint` (`tseslint.config`) và `projectService: true`, giữ nguyên bộ rule hiệu lực trừ các thay đổi có danh sách dưới đây:

- Mọi rule `import/*` chuyển sang `import-x/*` tương ứng; bỏ bản `import/*`.
- `simple-import-sort` là bộ sắp import duy nhất; bỏ `import-x/order`.
- Bỏ khối `globals` tự viết ở các file TS; test dùng globals từ plugin Vitest.
- `eslint-plugin-vitest` → `@vitest/eslint-plugin`, giữ bộ rule `recommended`.
- Xoá `eslint.base.mjs`; gỡ `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-import`, `eslint-plugin-vitest` khỏi `devDependencies` nếu không còn import trực tiếp.

## Phạm vi

Trong phạm vi: `eslint.config.mjs`, `eslint.base.mjs` (xoá), `package.json` và `pnpm-lock.yaml` qua `pnpm add -D` / `pnpm remove`.

Ngoài phạm vi: thêm, bỏ hoặc đổi mức độ rule ngoài danh sách trên; sửa source để thoả rule mới; Prettier và lint-staged (task 30).

[Manifest file/consumer và quyền thích ứng test trong scope](manifest.md) ghi snapshot hiện tại. Sau blocker, dùng đường dẫn đích đã chuyển thay vì tạo lại path cũ. Snapshot không thay thế việc kiểm tra diff, PR/resume work và config hiện hành trước plan.

## Acceptance criteria

- [ ] Trước khi sửa, lưu `pnpm exec eslint --print-config <file>` cho bốn file mẫu: một `src/**/*.tsx`, một `*.test.tsx`, một `src/lib/api/mocks/**/*.ts`, `next.config.ts`. Sau khi sửa, chạy lại và đính kèm diff vào `report.md`. Mọi khác biệt về rule phải thuộc danh sách trong Solution.
- [ ] `TIMING=20 pnpm exec eslint .` trước và sau được ghi vào `metric.md`; tổng thời gian lint giảm, không còn `import/no-cycle`.
- [ ] Một vòng import cố ý giữa hai file nháp vẫn bị `import-x/no-cycle` báo lỗi (tạo rồi xoá, không commit).
- [ ] `pnpm lint` xanh mà không sửa file source nào. Nếu cần sửa source, dừng và hỏi.
- [ ] Repo chỉ còn một file `eslint.*.mjs`.
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- `eslint.config.mjs` và `pnpm-lock.yaml` thuộc `denyPaths`, `package.json` là `askPaths`. Người cần cấp `approved.files: [eslint.config.mjs, eslint.base.mjs, package.json, pnpm-lock.yaml]` và lệnh `pnpm add -D @vitest/eslint-plugin`, `pnpm remove ...`, hoặc làm trong phiên tương tác.
- `eslint-config-next` tự đăng ký plugin `import`. Nếu không tắt được các rule `import/*` mà nó bật, giữ chúng và ghi lý do vào `report.md`; mục tiêu bắt buộc chỉ là bỏ `import/no-cycle`.
- `projectService` có thể đổi file nào được lint có type. Diff `--print-config` ở trên là bằng chứng không đổi hành vi.

## Comments
