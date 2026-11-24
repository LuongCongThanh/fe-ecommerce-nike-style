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

# Spec 24: Xoá `tailwind.config.ts` không được Tailwind v4 đọc

Branch: `chore/24-remove-tailwind-config`

## Problem Statement

Repo dùng Tailwind v4 qua `@tailwindcss/postcss`. Tailwind v4 chỉ đọc file config JS khi CSS khai báo `@config`, mà `src/styles/` không có. `tailwind.config.ts` vì vậy không có tác dụng; nội dung cũng rỗng (`theme.extend: {}`, `plugins: []`). File này khiến người đọc nghĩ token nằm ở đó, trong khi `design.md` nói giá trị nằm trong `src/styles/theme.css`.

## Solution

Xoá `tailwind.config.ts`. Giữ các glob `tailwind.config.*` trong ESLint, vì chúng vô hại và `eslint.config.mjs` thuộc `denyPaths`.

## Phạm vi

Trong phạm vi: xoá `tailwind.config.ts`.

Ngoài phạm vi: `eslint.config.mjs`, `eslint.base.mjs`, `.agents/skills/**` (skill bên ngoài nhắc tới tailwind.config là tài liệu chung), CSS token.

## Acceptance criteria

- [ ] Trước khi xoá, `grep -rn "@config" src/styles` rỗng; ghi kết quả vào `report.md`. Nếu có `@config`, dừng và hỏi.
- [ ] Lưu `.next/static/css` của bản build trước và sau khi xoá; so sánh và ghi vào `report.md` rằng CSS sinh ra giống nhau (khác hash tên file không tính).
- [ ] Diff chỉ gồm một file bị xoá.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- Rủi ro rất thấp. Plugin `eslint-plugin-tailwindcss` đọc `cssConfigPath` trỏ tới `src/styles/globals.css`, không đọc file này.

## Comments
