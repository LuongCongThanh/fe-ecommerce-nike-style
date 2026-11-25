---
status: todo
blocked-by: [39-storefront-backend-integration]
pr:
kind: refactor
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: true
---

# Spec 40: Auth và account theo public session boundary

Branch: `refactor/40-storefront-auth-account-migration`

## Problem Statement

Đợt này thực hiện phần **Auth và account theo public session boundary** trong backlog Storefront đã chốt ngày 25/11/2026. Source hiện còn cấu trúc cũ; các quyết định Wayfinder là thiết kế, chưa là bằng chứng code/test/build đã hoàn tất. Cần một slice có consumer, cấu hình, test và điểm dừng đồng bộ để checkout tiếp tục kiểm chứng được.

## Solution

Triển khai theo scope dưới đây và các quyết định owner ở phần Context. Lập plan.md với mapping source/consumer và test seams trước code; ghi report.md/metric.md theo tracker sau triển khai. Không tạo bridge mặc định, không nhân đôi implementation và không ghép auth/API cutover, nâng dependency hoặc thay UI/URL ngoài scope.

## Phạm vi và điểm dừng

- **Prerequisite:** Integration Backend và generated contract chuyển đồng lượt.
- **Scope:** features/auth/account → modules/auth/account, schema/service/store/types suffix; providers/layout/route consumers; extract auth/account layout UI triển khai vào owner/layouts nhưng framework guard entry vẫn mỏng.
- **Điểm dừng:** bootstrap-before/after ordering và auth memory/session reload giữ nguyên, User alias tích hợp không nhân đôi, không kéo cart/wishlist vào auth, không thêm account→orders vì URL. Recheck active task/resume ở owner trước chạy.
- **Test/gates/docs:** auth-store/session/roles, auth endpoint nếu caller thay, profile/address component tests; auth/account/browser vi/en + root/build/full E2E và runtime production smoke khi liên quan. Test scope đúng owner/consumers. Docs kiến trúc/entry.
- **Rollback:** owner paths và consumer/import/guard layout/test/rule cùng lượt; không sửa cookie/auth contract.

[Manifest file/consumer và quyền thích ứng test trong scope](manifest.md) ghi snapshot hiện tại. Sau blocker, dùng đường dẫn đích đã chuyển thay vì tạo lại path cũ. Snapshot không thay thế việc kiểm tra diff, PR/resume work và config hiện hành trước plan.

## Acceptance criteria

- [ ] Blocker thật đã done theo tracker; đối chiếu status/spec/PR và xử lý việc đang dở trong checkout trước khi đổi owner.
- [ ] File manifest đã cập nhật theo checkout sau blocker, plan.md ghi mapping, consumer/mock string/config và rollback cho đúng scope; không có implementation kép hay private import mới.
- [ ] Scope và điểm dừng cụ thể ở trên đạt; hành vi/constraint trong Context được giữ. Mọi ngoại lệ có lý do/owner/đợt xóa được ghi và được chốt trước khi dùng.
- [ ] Test cũ chỉ thích ứng trong manifest; ý nghĩa assertion giữ, regression mới kiểm risk thực. Không skip/bỏ test hoặc giảm coverage/gate để qua refactor.
- [ ] Focused checks và gate profile bên dưới đạt; report có command, exit code, môi trường, baseline, mode/engine và artifact thật. Chưa chạy hoặc thiếu môi trường không được ghi pass.
- [ ] Docs hiện trạng, config và import graph khớp source tại điểm dừng; report nêu rủi ro/rollback và các phép kiểm chưa chạy. Không tự đổi status done hoặc merge.

## Kiểm tra

- Focused: `pnpm exec vitest run <test-files-trong-manifest>`; lint/check fixture và browser spec cụ thể theo boundary của đợt. Không truyền placeholder như lệnh thật; plan liệt kê path chính xác.
- Root: `pnpm lint`, `pnpm format:check`, `pnpm docs:check`, `pnpm typecheck`, `pnpm test`; `pnpm build` cho graph/config/framework/bundle bị tác động.
- `pnpm test:coverage` khi file trong collected scope hoặc coverage glob bị đổi; giữ tập file tương đương và ngưỡng hiện tại.
- Focused browser Chromium trước; full `pnpm test:e2e` ba engine khi flow/routing/auth/storage/E2E infra bị tác động. Baseline/harness đã reconcile phải có trước khi dùng làm bằng chứng.
- Production SSR/PWA/runtime: `pnpm exec playwright test --config=playwright.production.config.ts --project=chromium` sau khi config/harness foundation tồn tại. Production build/server riêng, không dùng dev result thay production evidence. Đợt foundation phải xây và kiểm config này; SSR slices bổ sung assertions cùng source, không placeholder xanh.
- Contract/generated chỉ khi scope chạm SDK/generator: giữ pin, `pnpm gen:api` và diff đúng generated path sau migration; không sửa generated bằng tay.

## Quyền và phối hợp

`allow-test-changes: true` chỉ cho các test trong manifest và regression đúng scope, không cho sửa toàn suite. approved.files/commands để trống, chưa cấp quyền vượt deny/ask paths. File config/policy cần quyền riêng theo repo trước runner. Đợt Rule/convention có AGENTS/stop files phải làm cùng người trong phiên tương tác, không giao runner tự mở khóa.

Tạo spec không đồng nghĩa ready-for-agent. Không chạy runner, branch/commit/push/PR/merge trong phiên viết tài liệu. Nếu sau này được yêu cầu PR: target dev và squash theo repository.

## Context

- [Inventory](../17-storefront-migration-inventory/inventory.md).
- [Public boundary](../18-storefront-module-boundaries/boundaries.md).
- [Runtime và SSR](../19-storefront-runtime-boundaries/runtime.md).
- [Chính sách kiểm chứng](../20-storefront-verification-policy/verification.md).
- [Backlog đã chốt](../21-storefront-delivery-breakdown/delivery.md).

Cách dùng: decision thuộc các owner trên; spec này sở hữu delivery scope và acceptance của đợt. Không mở lại thiết kế khi chỉ đổi path do prerequisite.

## Giao nhau với task đang có

Đối chiếu [bảng giao nhau](../21-storefront-delivery-breakdown/handoff.md) trước triển khai. Giữ identity/status/artifact các task cũ; nếu thay đổi cấu hình/owner đã được task khác hoàn thành thì dùng hiện trạng mới, không khôi phục file legacy chỉ vì manifest cũ. Nếu hai task cùng sửa behavior/config chưa reconcile được, dừng phần phụ thuộc và chốt scope với người dùng.
