# Hướng dẫn dành cho agent

## Cấu trúc dự án

- Repo này là một app Next.js độc lập ở root (App Router; phục vụ khách hàng; hỗ trợ `vi` và `en`); không còn Turborepo/pnpm workspace.
- `src/app` giữ các entry point Next.js. Code màn hình và nghiệp vụ nằm trong `src/features`, UI và tiện ích dùng xuyên nghiệp vụ nằm trong `src/shared`. HTTP và hợp đồng nằm trong `src/lib/api` và `src/lib/schemas`.
- Đặt file `*.test.ts(x)` cạnh mã hoặc điểm vào được kiểm thử. Vitest setup nằm ở `src/testing/setup.ts`; helper render dùng chung ở `src/testing/render.tsx`.
- Catalog đọc API thật từ `be-demo`. MSW hỗ trợ các luồng storefront đang chờ API tương ứng.
- Không import source backend hoặc gọi API trực tiếp ngoài `src/lib/api`.

## Nguồn sự thật

- `README.md`: phạm vi sản phẩm, kiến trúc, môi trường và quy ước repository.
- `CONTRIBUTING.md`: branch, commit, pull request, hook và CI.
- `design.md`: hợp đồng visual; `docs/reference/ux-patterns.md` chỉ là tham khảo UX.
- `docs/architecture.md`: cấu trúc hiện tại; `docs/api-integration.md`: transport/cutover; `docs/roadmap.md`: việc chưa làm.

- Không dựa vào đường dẫn tài liệu trước khi xác nhận nó tồn tại trong checkout hiện tại.
- Nếu tài liệu và code mâu thuẫn, báo rõ thay vì tự suy diễn yêu cầu ảnh hưởng public API hoặc domain behavior.

## Cài đặt và kiểm tra

```bash
corepack pnpm install --frozen-lockfile
```

| Phạm vi   | Lệnh                                       |
| --------- | ------------------------------------------ |
| Lint file | `pnpm exec eslint <file>`                  |
| Test file | `pnpm exec vitest run <file>`              |
| Toàn app  | `pnpm lint && pnpm typecheck && pnpm test` |

```bash
pnpm lint
pnpm format:check
pnpm docs:check
pnpm typecheck
pnpm test
pnpm build
```

- Chạy kiểm tra hẹp trước, sau đó gate cấp root tương ứng với phạm vi thay đổi.
- Chỉ chạy `pnpm test:e2e` khi thay đổi browser flow hoặc hạ tầng E2E.
- Không sửa thủ công file sinh tự động như `src/lib/api/generated/openapi.ts`.

## Ranh giới triển khai

- Giữ đúng chiều phụ thuộc: route/layout của app -> feature -> UI hoặc utility dùng chung -> API SDK và schema.
- Dùng `@/*` cho import nội bộ app, ví dụ `@/shared/ui/Button`.
- Không dùng parent-relative import xuyên module, deep import vào file private của module khác hoặc tạo barrel `index.ts` mới.
- Dùng TanStack Query cho server state, Zustand cho shared client state, React Hook Form cho form và URL cho filter/sort/pagination có thể chia sẻ.
- Guard xác thực phía frontend chỉ phục vụ UX; backend phải chịu trách nhiệm enforce authorization.
- Storefront hỗ trợ hai ngôn ngữ.
- Giữ thay đổi theo vertical slice có thể kiểm thử và bổ sung test gần nhất có giá trị.

- Convention chi tiết dùng chung nằm trong `.claude/rules/`. Claude Code nạp theo phạm vi đường dẫn. Codex đọc các file phù hợp theo bản đồ trong `docs/agents/code-conventions.md`.
- Xem bản đồ convention và checklist tại `docs/agents/code-conventions.md`.
- `CLAUDE.md` import file này để Codex và Claude Code dùng chung nguồn hướng dẫn cấp repository.

## Quy trình task và GitHub

- Codex và Claude Code dùng cùng spec, trạng thái, tiêu chí nghiệm thu và quy tắc Git. Với task đã đủ điều kiện, làm lần lượt: đọc spec → lập `plan.md` bằng skill `plan-task` → triển khai và ghi `report.md` → chạy kiểm tra → review theo spec và quy tắc repo.
- Chọn một công cụ cho từng bước. Khi đổi công cụ, tiếp tục từ `spec.md`, `plan.md`, diff hiện tại và `report.md` nếu đã có. Dùng `handoff.md` nếu lần chạy trước để lại. Kiểm tra lại bước nào đã hoàn thành trước khi làm tiếp.

- Task nằm trong file Markdown cục bộ `docs/plan/tasks/<NN>-<tên>/spec.md`, không dùng GitHub Issues. Schema, vòng đời, quyền status và ngoại lệ Wayfinder: `docs/agents/issue-tracker.md`; index điều hướng: `docs/plan/README.md`; vận hành: `docs/agents/runner.md`.
- Chỉ nhận task có `status: ready-for-agent` và mọi `blocked-by` đã `done`. Agent không tự đổi trạng thái `todo`, `ready-for-agent`, `done`.
- Tạo branch từ `dev` theo `<type>/<NN>-<slug>` (hoặc `<type>/<slug>`; slug nói rõ tính năng); dùng Conventional Commits.
- Feature/fix target `dev`; `main` chỉ nhận release PR từ `dev`.
- Không ghi tên AI tool/model/agent/assistant hoặc AI attribution trong commit, PR, review hay comment; hook và CI enforce các tên phổ biến.
- Phiên tương tác: không tạo branch, commit, push, mở PR hoặc merge nếu người dùng chưa yêu cầu rõ.
- Thực hiện từng task theo thứ tự trong checkout hiện tại. Áp dụng cho Codex, Claude Code và `agent-run`. Không tạo thêm Git worktree, kể cả cho bước kiểm tra. Xử lý task đang dở trước khi chuyển sang task khác.
- Ngoại lệ: chạy `agent-run` được coi là người dùng đã yêu cầu rõ việc tạo branch, commit, push branch của task đó và mở PR vào `dev`. Chính script `agent-run` thực hiện các thao tác git này, agent không tự làm. Không bao giờ tự merge.
- `AGENTS.md`, `CLAUDE.md`, `.claude/rules/process/git-workflow.md`, `docs/agents/issue-tracker.md` do người sửa cùng Codex hoặc Claude Code trong phiên tương tác, không để agent tự sửa khi chạy `agent-run`.

- Đọc `GLOSSARY.md` nếu có theo chủ đề và tài liệu owner hiện tại trước khi đặt tên domain; báo xung đột thay vì tự đổi nghĩa. Glossary API thuộc `be-demo`; thuật ngữ kỹ thuật CMS thuộc repo `cms`. Không bắt buộc các sibling repo có mặt trong checkout frontend.
