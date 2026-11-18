# Báo cáo quality gate tài liệu

Ngày hoàn tất: 19/11/2026.

## Đã làm

- Thêm `pnpm docs:check`, implementation/test độc lập trong `scripts/check-docs*` và không thêm dependency.
- Gate kiểm Prettier cho maintained Markdown; local file/link/anchor gồm Unicode, duplicate slug, URL encoding và reference links; bỏ code example, external URL và sibling repository.
- Gate kiểm task status/kind, blocker tồn tại, cycle, identity và Wayfinder parent theo subset parser hiện tại. Index không bị coi là runtime database.
- Gate báo literal consumer của 10 tài liệu đã xóa trong file vận hành, loại task artifact lịch sử, vendored skill và chính danh sách migration của gate.
- Thêm job Documentation vào CI và thêm `docs:check` vào `verify-gates`; guard chỉ thêm đúng command read-only này, không đổi deny/ask/secret policy.
- Cập nhật README, CONTRIBUTING, AGENTS, runner và roadmap để phản ánh gate đã enforce.

## TDD và kiểm tra

- Red: test module ban đầu fail vì `check-docs` chưa tồn tại; test verify-gates fail vì chưa gọi `pnpm docs:check`.
- Green: `scripts/check-docs.test.ts`, `scripts/verify-gates.test.ts` và guard regression đạt 302 test.
- `pnpm docs:check`: pass trên checkout thực tế.
- `pnpm typecheck` và `git diff --check`: pass.
- `pnpm lint` toàn repo không xuất kết quả sau 60 giây nên đã dừng để không lặp final validation; scoped ESLint không có error, chỉ báo scripts/hooks đang nằm trong ignore pattern hiện hữu.

## Giới hạn

Gate offline không kiểm HTTP external/sibling repo, semantic correctness, API/backend readiness hoặc browser E2E. Historical task artifacts không bị ép format nhưng vẫn tham gia link/graph validation.
