---
status: ready-for-agent
blocked-by: []
pr:
kind: refactor
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---

# Spec 30: Một phạm vi Prettier cho script, hook và CI

Branch: `chore/30-format-scope`

## Problem Statement

Ba nơi quyết định file nào được Prettier định dạng, và chúng không khớp nhau:

| Nơi                                         | Phạm vi                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `lint-staged.config.mjs`                    | `{src,e2e}/**/*.{ts,tsx,js,mjs,cjs,json,css,md,mdx,yaml,yml}` và `*.{ts,mjs,json}` |
| `pnpm format` / `pnpm format:check`         | `{src,e2e}/**/*.{ts,tsx,json,css}` và `*.{ts,mjs,json}`                            |
| `pnpm docs:check` (`scripts/check-docs.ts`) | Markdown trong `docs/`, ở root và các file được duy trì                            |

Hệ quả: lint-staged định dạng `md` và `yaml` trong `src`, nhưng `format:check` không kiểm chúng. Ngược lại, file `.md` ở `docs/` và root được `docs:check` kiểm, nhưng lint-staged không tự định dạng khi commit. Script `format` còn chạy kèm `eslint src --fix`, trong khi đã có `lint:fix`.

## Solution

- Một danh sách glob dùng chung cho lint-staged, `format` và `format:check`. Danh sách này bao trùm những gì `format:check` và `docs:check` kiểm (gồm `.md` ở `docs/` và root, `.yml` trong `.github/`), và tuân theo `.prettierignore`.
- `format` chỉ chạy Prettier; ai cần ESLint fix thì chạy `lint:fix`.

Cách dùng chung danh sách (để Prettier đọc `.prettierignore` và chạy `prettier --write .`, hay export glob từ một file) do `plan.md` chọn.

## Phạm vi

Trong phạm vi: `lint-staged.config.mjs`, `package.json` (scripts `format` và `format:check`), `.prettierignore` (bổ sung thư mục cần loại như `.agents/`, `.claude/skills/`, `docs/plan/tasks/todo/**` nếu plan thấy cần), `CONTRIBUTING.md` nếu mô tả lệnh format.

Ngoài phạm vi: quy tắc định dạng trong `.prettierrc.mjs` (`printWidth`, quote), định dạng lại hàng loạt file chưa đạt (nếu nhiều thì báo và hỏi), `scripts/check-docs.ts`.

[Manifest file/consumer và quyền thích ứng test trong scope](manifest.md) ghi snapshot hiện tại. Sau blocker, dùng đường dẫn đích đã chuyển thay vì tạo lại path cũ. Snapshot không thay thế việc kiểm tra diff, PR/resume work và config hiện hành trước plan.

## Acceptance criteria

- [ ] `report.md` ghi danh sách file mà `format:check` kiểm, trước và sau (`prettier --list-different` hoặc `--check` kèm log).
- [ ] Sửa sai định dạng trong một file `.md` ở `docs/` và một file `.yml` ở `.github/` rồi stage: lint-staged định dạng lại cả hai. Thử trên branch nháp, không commit.
- [ ] `pnpm format:check` báo lỗi với cùng hai file đó khi chưa định dạng.
- [ ] `package.json` không còn `eslint` trong script `format`.
- [ ] Nếu phạm vi mới làm lộ hơn 20 file chưa đạt định dạng, dừng và hỏi trước khi định dạng lại.
- [ ] `pnpm format:check`, `pnpm docs:check`, `pnpm lint` xanh.

## Ghi chú/rủi ro

- `lint-staged.config.mjs` và `.prettierignore` thuộc `denyPaths`, `package.json` là `askPaths`. Người cần cấp quyền tương ứng, hoặc làm trong phiên tương tác.
- File trong `.agents/skills/` là skill lấy từ bên ngoài. Định dạng lại chúng sẽ làm lệch so với nguồn, nên nhiều khả năng phải loại khỏi phạm vi.

## Comments
