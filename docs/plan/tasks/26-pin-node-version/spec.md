---
status: ready-for-agent
blocked-by: []
pr:
kind: docs
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---

# Spec 26: Pin phiên bản Node bằng `.nvmrc`

Branch: `chore/26-pin-node-version`

## Problem Statement

README ghi "Dùng Node.js 24 và pnpm được pin trong `package.json`", nhưng `package.json` chỉ pin pnpm (`packageManager`); Storefront không có `.nvmrc` hay `engines`. Workspace `fashion-store` quy định mỗi app có `.nvmrc` riêng (mise đọc qua `idiomatic_version_file_enable_tools`). `be-demo` đã có `.nvmrc` = `24`. CI lặp `node-version: 24` ở sáu job của `ci.yml` và một job của `contract-bump.yml`.

## Solution

- Thêm `.nvmrc` với nội dung `24`, cùng dạng với `be-demo`.
- Thêm `"engines": { "node": ">=24 <25" }` vào `package.json`.
- CI đọc `node-version-file: .nvmrc` thay cho `node-version: 24`.
- README sửa câu về phiên bản Node cho đúng.

## Phạm vi

Trong phạm vi: `.nvmrc` (mới), `package.json` (`engines`), `.github/workflows/ci.yml` và `.github/workflows/contract-bump.yml` (`actions/setup-node`), `README.md`.

Ngoài phạm vi: nâng phiên bản Node, `.npmrc` (`engine-strict` không bật trong task này), các repo khác.

[Manifest file/consumer và quyền thích ứng test trong scope](manifest.md) ghi snapshot hiện tại. Sau blocker, dùng đường dẫn đích đã chuyển thay vì tạo lại path cũ. Snapshot không thay thế việc kiểm tra diff, PR/resume work và config hiện hành trước plan.

## Acceptance criteria

- [ ] `cat .nvmrc` in `24`; `mise current node` trong thư mục Storefront in một bản 24.x.
- [ ] `grep -n "node-version" .github/workflows/*.yml` chỉ còn `node-version-file: .nvmrc`.
- [ ] `corepack pnpm install --frozen-lockfile` vẫn chạy; lockfile không đổi.
- [ ] CI của PR xanh ở mọi job.
- [ ] `pnpm docs:check` và `pnpm format:check` xanh.

## Ghi chú/rủi ro

- `.github/workflows/**` thuộc `denyPaths` và `package.json` là `askPaths`. Người cần cấp `approved.files: [.github/workflows/ci.yml, .github/workflows/contract-bump.yml, package.json]`, hoặc làm task trong phiên tương tác.
- Task 22 cũng sửa `ci.yml` (khối env của job build). Hai thay đổi nằm ở dòng khác nhau; merge task nào sau thì rebase.

## Comments
