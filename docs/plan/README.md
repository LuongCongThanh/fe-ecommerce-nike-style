# Kế hoạch và task

Task của storefront là file Markdown cục bộ (không dùng GitHub Issues), cùng định dạng với `be-demo`. Chỉ mục nằm ở bảng dưới; kế hoạch tổng nằm ở các file `*-plan.md` cùng thư mục. Hệ thống agent chạy task: `AGENT-SYSTEM-PLAN.md`. Hộp thư khi script cần người: `AGENT-INBOX.md`.

## Cấu trúc

```text
docs/plan/
├── README.md        <- file này: định dạng + bảng task
├── AGENT-INBOX.md   <- script ghi khi cần người
└── tasks/<NN>-<tên-kebab-tiếng-Anh>/
    ├── spec.md      <- trước khi code: mục tiêu, phạm vi, AC; frontmatter
    ├── plan.md      <- trước khi code: các bước, branch, rủi ro (planner viết)
    ├── report.md    <- implementer viết trước khi trả ok; retro nối thêm
    └── metric.md    <- số đo trước -> sau; script điền bảng token
```

`NN` là thứ tự làm việc. Không phải task nào cũng có `plan.md` hay `metric.md`. Cập nhật bảng task cùng lúc với `status`.

## spec.md

```yaml
---
status: todo # xem vòng đời bên dưới
blocked-by: [] # tên thư mục task, ví dụ [03-product-card]
pr: # số PR khi đã mở, ví dụ #86
kind: ui # ui | logic | refactor | docs
approved: false # người đã duyệt spec/plan
retro-turns: # số lượt retro đã dùng, script điền
---
```

Thân bài: `# Spec <NN>: <tiêu đề>`, dòng `Branch: \`<type>/<NN>-<slug>\``, `## Problem Statement`, `## Solution`, `## Acceptance criteria` (danh sách gạch đầu dòng).

## Vòng đời trạng thái

```text
todo -> ready-for-agent -> in-progress -> review -> done
                              |  ^
                              v  |
                  needs-info / blocked
                              |
                              v
                       ready-for-human -> (người tự làm) -> done
```

| Trạng thái        | Ý nghĩa                                                 | Ai đặt |
| ----------------- | ------------------------------------------------------- | ------ |
| `todo`            | Chưa đủ rõ để giao                                      | Người  |
| `ready-for-agent` | Spec đủ rõ, mọi `blocked-by` đã `done`; agent được nhận | Người  |
| `in-progress`     | `agent-run` đang chạy task                              | Script |
| `needs-info`      | Script dừng vì cần câu trả lời của người                | Script |
| `blocked`         | Chờ task khác hoặc quyết định bên ngoài                 | Script |
| `ready-for-human` | Đã chạy tiếp 2 lần vẫn dừng; người tự làm               | Script |
| `review`          | PR đã mở vào `dev`, chờ người review                    | Script |
| `done`            | PR đã merge                                             | Người  |

Agent không tự sửa `status`. Agent chỉ nhận task `ready-for-agent` mà mọi `blocked-by` đã `done`.

## report.md và metric.md

`report.md` (implementer viết ngay trước khi trả `ok`; retro nối thêm mục cuối):

```markdown
# Report <NN>

- **PR:** #<số>
- **Ngày merge:**

## Đã làm

## Lệch so với spec và rủi ro còn lại

## Test cũ đã chạm

## Kiểm tra

## Acceptance criteria: chạy tay

## Đề xuất cho môi trường <- retro thêm: skill/agent/quy tắc cần sửa
```

`metric.md`: bảng `| Chỉ số | Trước | Sau |` rồi mục `## Token (đo thật)` do script điền bằng `pnpm tokens` (bảng `| Loại | Messages | Input | Cache write | Cache read | Output |` với các hàng code, test, docs, other, explore/chat, TOTAL). Script `tokens` và `agent-run` chưa có ở bước này; chúng được thêm ở các bước sau của `AGENT-SYSTEM-PLAN.md`.

## Agent guard (D8, D17, D40, D45)

Hook `PreToolUse` `.claude/hooks/agent-guard.ts` (chạy bằng `tsx`, đăng ký trong `.claude/settings.json`) đọc luật từ `.claude/agent-guard.json`; bảng cho người đọc nằm ở mục "Deny list storefront" của `AGENT-SYSTEM-PLAN.md`. Logic quyết định là hàm thuần `.claude/hooks/lib/guard.ts` (`decide`), phần IO ở `agent-guard.ts`. Chặn = exit 2 + lý do ở stderr; lỗi nội bộ khi `AGENT_RUN=1` cũng chặn (fail closed), còn phiên người thì bỏ qua.

**Luôn bật (mọi phiên):** chặn đọc/sửa `.env*` trừ `.env.example` (kể cả qua Bash, Glob, Grep), chặn chạm `.agent-stop`. Việc quét `.env*` trong lệnh Bash là so khớp chuỗi (chỉ là lớp phụ, lệnh gõ kiểu che giấu tên file vẫn có thể lọt khi không chạy `AGENT_RUN=1`).

**Khi `AGENT_RUN=1`:** nếu `.agent-stop` tồn tại ở root repo chính (`git rev-parse --git-common-dir`) thì chặn mọi thao tác; ghi file phải qua `denyPaths`/`askPaths` (cả hai trả lý do hướng dẫn agent trả `blocked` + `reason: needs_approval`); ghi ngoài worktree bị chặn; Bash chỉ chạy lệnh trong `allowCommands` (tách theo `&&`, `||`, `;`, `|`, `&`, xuống dòng; từ chối `$(...)`, backtick, `(...)`, heredoc, `<(...)`; chuyển hướng `>` chỉ tới `/dev/null` hoặc đường dẫn tĩnh hợp lệ; `denyCommandPatterns` như `rm -rf` chỉ là lớp phụ).

| Biến môi trường      | Ai đặt      | Ý nghĩa                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENT_RUN=1`        | `agent-run` | Bật deny list + allow-list lệnh                                                                                                                                                                                                                                                                                                                                                 |
| `AGENT_PHASE`        | `agent-run` | `plan` (chỉ ghi `plan.md` của task, không Bash), `implement` (mặc định; ghi thêm `report.md`), `retro` (như implement), `review` (không ghi, chỉ `git diff *`/`git log *`). Giá trị lạ bị chặn hết                                                                                                                                                                              |
| `AGENT_TASK_DIR`     | `agent-run` | Thư mục task, ví dụ `docs/plan/tasks/03-product-card` (tương đối với worktree hoặc tuyệt đối); thay `{taskDir}` trong `phases`                                                                                                                                                                                                                                                  |
| `AGENT_APPROVED`     | `agent-run` | JSON `{"paths":["package.json"],"commands":["pnpm add zod"]}` lấy từ `approved:` trong frontmatter `spec.md` (D43) **lúc khởi động** (agent sửa spec giữa chừng không có tác dụng). Path là glob, lệnh khớp theo từ (`*` cuối = mọi đối số). Mở khóa `denyPaths`/`askPaths` và lệnh ngoài danh sách; **không** mở khóa `.env*`, `.agent-stop`, hay giới hạn của `plan`/`review` |
| `CLAUDE_PROJECT_DIR` | Claude Code | Root worktree (nơi tìm `.claude/agent-guard.json`, ghi `.agent-run/state.json`)                                                                                                                                                                                                                                                                                                 |

`report.md`: D12 (implementer viết trước khi trả `ok`) và bảng deny list (implementer ghi ở bước retro) được gộp: `implement` và `retro` đều được ghi `{taskDir}/report.md`. Hiện `docs/plan/tasks/**` không nằm trong `denyPaths` nên ngoại lệ này chỉ là lớp phòng thủ.

**Đếm lần bị chặn:** mỗi lần chặn khi `AGENT_RUN=1` được ghi vào `<worktree>/.agent-run/state.json` dưới `blocks: [{tool, target, at, kind}]` (`target` = đường dẫn tương đối với file, nguyên chuỗi lệnh với Bash; `kind` = `deny-path`, `ask-path`, `command`, `secret`, ...). Module dùng chung `scripts/agent-run/state.ts` (`readState`, `updateState`, `recordBlock`, `countBlocks`, `findRepeatedBlock`) được `agent-run` (bước 7) dùng lại để phát hiện tình huống 9 (cùng tool + cùng target 3 lần) và giữ các trường khác của state (giữ nguyên khóa lạ). `agent-run` nên chạy thử hook (preflight: một lệnh bị chặn phải trả exit 2) trước khi giao việc, vì nếu `node_modules/.bin/tsx` thiếu thì hook lỗi không phải exit 2 và Claude Code coi là không chặn.

## Bảng task

| #   | Task | Status | Blocked by | PR  |
| --- | ---- | ------ | ---------- | --- |
