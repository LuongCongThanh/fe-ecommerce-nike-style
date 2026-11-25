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

# Spec 29: Cấu hình pnpm ở một chỗ và pin phiên bản dependency

Branch: `chore/29-pnpm-settings-and-pinning`

## Problem Statement

- `.npmrc` đặt `save-exact=true`, `auto-install-peers=true`, `strict-peer-dependencies=false`. Hai giá trị sau trùng mặc định của pnpm. Với pnpm 11.24.0, `pnpm config get save-exact` trả `undefined`, nên chưa rõ pnpm có đọc file này không.
- Dù có ý định `save-exact`, `package.json` có 76 dependency dùng `^` và 13 dependency pin chính xác; `typescript` (`^5`) và `tailwindcss` (`^4`) còn dùng range rộng theo major.
- `pnpm-workspace.yaml` có comment "slice 0 of the three-repo restructure" đã cũ.

## Solution

- Xác định pnpm 11 đọc setting từ `.npmrc` hay `pnpm-workspace.yaml`, rồi chuyển các setting không trùng mặc định về đúng một chỗ (`saveExact: true` trong `pnpm-workspace.yaml` nếu pnpm đọc ở đó). Xoá `.npmrc` nếu không còn setting nào.
- Đổi mọi range trong `dependencies` và `devDependencies` thành đúng phiên bản đang có trong `pnpm-lock.yaml`. Không nâng hay hạ phiên bản nào.
- Sửa comment của `pnpm-workspace.yaml` cho đúng hiện trạng.

## Phạm vi

Trong phạm vi: `.npmrc`, `pnpm-workspace.yaml`, `package.json`, `pnpm-lock.yaml` (chỉ phần `specifier` thay đổi qua `pnpm install`).

Ngoài phạm vi: nâng phiên bản dependency, `overrides` và `allowBuilds` (trừ khi task 23 đã gỡ `@sentry/cli`), dependency của ESLint (task 27).

## Acceptance criteria

- [ ] `report.md` ghi bằng chứng pnpm 11 đọc setting từ đâu: trong thư mục nháp ngoài repo, chạy `pnpm add <gói nhỏ>` với `saveExact` đặt ở `.npmrc`, rồi ở `pnpm-workspace.yaml`, và chỉ ra cách nào ghi phiên bản không có `^`.
- [ ] `grep -cE '": "[\^~]' package.json` bằng 0.
- [ ] `pnpm install --frozen-lockfile` chạy được. Diff lockfile chỉ đổi dòng `specifier`, không đổi `version` hay `resolution`. So sánh `pnpm list --depth 0 --json` trước và sau: kết quả giống nhau.
- [ ] `pnpm add -D <gói nháp>` ghi phiên bản chính xác (tạo trên branch nháp rồi bỏ, không commit).
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` xanh.

## Ghi chú/rủi ro

- `pnpm-lock.yaml` thuộc `denyPaths`, `package.json` là `askPaths`. Người cần cấp `approved.files: [package.json, pnpm-lock.yaml, pnpm-workspace.yaml, .npmrc]` và `approved.commands: [pnpm install]`, hoặc làm trong phiên tương tác.
- Pin chính xác nghĩa là nâng phiên bản luôn là thay đổi có chủ ý. ADR của workspace đã chọn bump workflow thay cho Renovate; nâng dependency theo cùng cách.
- Nếu task 27 merge trước, danh sách devDependency sẽ ngắn hơn; rebase và pin lại phần còn lại.

## Comments

Tham khảo [manifest phạm vi](manifest.md); rà lại snapshot khi lập plan. Manifest không cấp quyền sửa file.
