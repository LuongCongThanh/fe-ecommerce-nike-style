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
- `design.md`: hợp đồng visual và các commerce interaction checks.
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
- Dùng `@/*` cho import nội bộ app, ví dụ `@/shared/components/Button`.
- Không dùng parent-relative import xuyên module, deep import vào file private của module khác hoặc tạo barrel `index.ts` mới.
- Import liên module chỉ qua ma trận public entry (consumer + file + named symbol). `pnpm lint` chạy thêm `pnpm lint:boundaries` (`scripts/check-module-boundaries.ts`); zone layer ở `eslint.boundaries.mjs`. Khi chuyển file, cập nhật entry/snapshot/coverage manifest cùng lượt; ngoại lệ là cạnh chính xác có lý do và đợt xóa.
- Dùng TanStack Query cho server state, Zustand cho shared client state, React Hook Form cho form và URL cho filter/sort/pagination có thể chia sẻ.
- Guard xác thực phía frontend chỉ phục vụ UX; backend phải chịu trách nhiệm enforce authorization.
- Storefront hỗ trợ hai ngôn ngữ.
- Giữ thay đổi theo vertical slice có thể kiểm thử và bổ sung test gần nhất có giá trị.

- Convention chi tiết dùng chung nằm trong `.claude/rules/`. Claude Code nạp theo phạm vi đường dẫn. Codex đọc các file phù hợp theo bản đồ trong `docs/agents/code-conventions.md`.
- Xem bản đồ convention và checklist tại `docs/agents/code-conventions.md`.
- `CLAUDE.md` import file này để Codex và Claude Code dùng chung nguồn hướng dẫn cấp repository.

## Quy trình task và GitHub

- Mọi agent (Codex, Claude Code, Copilot và agent khác) dùng cùng spec, trạng thái, tiêu chí nghiệm thu và quy tắc Git. Với task đã đủ điều kiện, làm lần lượt: đọc spec → lập `plan.md` bằng skill `plan-task` → triển khai và ghi `report.md` → chạy kiểm tra → review theo spec và quy tắc repo.
- Chọn một công cụ cho từng bước. Khi đổi công cụ, tiếp tục từ `spec.md`, `plan.md`, diff hiện tại và `report.md` nếu đã có. Dùng `handoff.md` nếu lần chạy trước để lại. Kiểm tra lại bước nào đã hoàn thành trước khi làm tiếp.

- Task nằm trong file Markdown cục bộ `docs/plan/tasks/<NN>-<tên>/spec.md`, không dùng GitHub Issues. Schema, vòng đời, quyền status và ngoại lệ Wayfinder: `docs/agents/issue-tracker.md`; index điều hướng: `docs/plan/README.md`; vận hành: `docs/agents/runner.md`.
- Chỉ nhận task có `status: ready-for-agent` và mọi `blocked-by` đã `done`. Agent nhận task tự chuyển status của task đó `in-progress` → `review` khi mở PR → `done` sau khi PR đã merge, và cập nhật index cùng lượt. Không tự chuyển task `todo` sang `ready-for-agent`.
- Tạo branch từ `dev` theo `<type>/<NN>-<slug>` (hoặc `<type>/<slug>`; slug nói rõ tính năng); dùng Conventional Commits.
- Feature/fix target `dev`; `main` chỉ nhận release PR từ `dev`.
- Không ghi tên AI tool/model/agent/assistant hoặc AI attribution trong commit, PR, review hay comment; hook và CI enforce các tên phổ biến.
- Khi làm task `ready-for-agent`, mọi agent được tự tạo branch, commit, push, mở PR vào `dev` và squash-merge sau khi CI xanh, không cần hỏi lại. Không merge vào `main`. Ngoài task, chỉ làm các thao tác git này khi người dùng yêu cầu.
- Thực hiện từng task theo thứ tự trong checkout hiện tại. Áp dụng cho mọi agent và `agent-run`. Không tạo thêm Git worktree, kể cả cho bước kiểm tra. Xử lý task đang dở trước khi chuyển sang task khác.
- `agent-run` vẫn để script tự làm branch, commit, push và mở PR; script không merge.
- Mọi agent được sửa `AGENTS.md`, `CLAUDE.md`, `.claude/rules/process/git-workflow.md`, `docs/agents/issue-tracker.md` khi task yêu cầu. Chỉ stop file `.agent-stop` và file secret vẫn được bảo vệ.

- Đọc `GLOSSARY.md` nếu có theo chủ đề và tài liệu owner hiện tại trước khi đặt tên domain; báo xung đột thay vì tự đổi nghĩa. Glossary API thuộc `be-demo`; thuật ngữ kỹ thuật CMS thuộc repo `cms`. Không bắt buộc các sibling repo có mặt trong checkout frontend.

## AI skills và cấu hình

- `AGENTS.md` là hướng dẫn dùng chung; `CLAUDE.md` là entrypoint chuyển tiếp. Copilot và các agent khác cần theo cùng quy ước, không thay thế chúng bằng hướng dẫn từ repo sibling.
- Chọn skill theo nhu cầu: `storefront-workflow` cho làm rõ/tracker, `plan-task` cho bước lập plan đã được workflow yêu cầu, `fashion-storefront-ui-director` cho UI, `feature` cho implementation, `vitest` cho test, và `api-security-review` chỉ cho review tĩnh/read-only.
- `api-security-review` không cho phép gọi service, chạy scanner/active test hoặc dùng credentials. UI guard chỉ phục vụ UX; không coi đó là authorization phía server.
- `.agents/skills/` là nguồn chuẩn của project skills. Những skill được expose cho Claude Code và Copilot có bản mirror chọn lọc trong `.claude/skills/` và `.github/skills/`.
- Sửa skill tại `.agents/skills/`, cập nhật các mirror đã chọn trong cùng thay đổi và so sánh toàn bộ file (kể cả references) trước khi hoàn tất. Không sửa riêng một bản mirror.
- Giữ nguyên cấu hình, quyền, hooks và workflow theo định dạng riêng của từng nền tảng. Không sao chép settings cục bộ, quyền hoặc đường dẫn tuyệt đối giữa repo/máy.
