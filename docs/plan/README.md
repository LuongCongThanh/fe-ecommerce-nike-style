# Kế hoạch và task

Task của storefront là file Markdown cục bộ (không dùng GitHub Issues), cùng định dạng với `be-demo`. Chỉ mục nằm ở bảng dưới; kế hoạch tổng nằm ở các file `*-plan.md` cùng thư mục. Xem [kế hoạch hệ thống agent](AGENT-SYSTEM-PLAN.md) và [kế hoạch tái cấu trúc ba repo](three-repo-restructure.md). Hộp thư local khi script cần người nằm trong `.agent-run/AGENT-INBOX.md` ở root repo.

## Cấu trúc

```text
docs/plan/
├── README.md        <- file này: định dạng + bảng task
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
approved: # người duyệt file/lệnh bị chặn (D43); bỏ trống hoặc false = chưa duyệt gì
  files: [] #   ví dụ [package.json]
  commands: [] #   ví dụ ["pnpm add zod"]
retro-turns: # người điền khi retro hết lượt (tình huống 15): số lượt cho thêm
allow-test-changes: # true = task refactor được sửa/xóa test cũ (D38), mặc định không
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

`metric.md`: bảng `| Chỉ số | Trước | Sau |` rồi mục `## Token (đo thật)` do script điền bằng `pnpm tokens` (bảng `| Loại | Messages | Input | Cache write | Cache read | Output |` với các hàng code, test, docs, other, explore/chat, TOTAL). Script `pnpm tokens` điền mục này; `agent-run` gọi nó trước khi commit.

## Agent guard (D8, D17, D40, D45)

Hook `PreToolUse` `.claude/hooks/agent-guard.ts` (chạy bằng `tsx`, đăng ký trong `.claude/settings.json`) đọc luật từ `.claude/agent-guard.json`; bảng cho người đọc nằm ở mục "Deny list storefront" của `AGENT-SYSTEM-PLAN.md`. Logic quyết định là hàm thuần `.claude/hooks/lib/guard.ts` (`decide`), phần IO ở `agent-guard.ts`. Chặn = exit 2 + lý do ở stderr; lỗi nội bộ khi `AGENT_RUN=1` cũng chặn (fail closed), còn phiên người thì bỏ qua.

**Luôn bật (mọi phiên):** chặn đọc/sửa `.env*` trừ `.env.example` (kể cả qua Bash, Glob, Grep), chặn chạm `.agent-stop`. Việc quét `.env*` trong lệnh Bash là so khớp chuỗi (chỉ là lớp phụ, lệnh gõ kiểu che giấu tên file vẫn có thể lọt khi không chạy `AGENT_RUN=1`).

**Khi `AGENT_RUN=1`:** nếu `.agent-stop` tồn tại ở root repo chính (`git rev-parse --git-common-dir`) thì chặn mọi thao tác; ghi file phải qua `denyPaths`/`askPaths` (cả hai trả lý do hướng dẫn agent trả `blocked` + `reason: needs_approval`); ghi ngoài worktree bị chặn; Bash chỉ chạy lệnh trong `allowCommands` và `readCommands` (lệnh chỉ đọc: `cat`, `ls`, `echo`, `cd <thư mục trong worktree>`, `git diff/log/status/rev-parse/show`; đường dẫn đối số phải nằm trong worktree, không symlink, glob hoặc biến; planner không có), cộng bộ lọc `outputFilters` (`tail`, `head`, `grep`, `wc -l`, chỉ hợp lệ sau `|` khi mọi đoạn trước đó đã được phép; `2>&1` được phép). Khi lệnh bị chặn nhưng có chứa lệnh được phép, thông báo bảo chạy lệnh được phép riêng thay vì trả `blocked` (tách theo `&&`, `||`, `;`, `|`, `&`, xuống dòng; từ chối `$(...)`, backtick, `(...)`, heredoc, `<(...)`; chuyển hướng file chỉ tới `/dev/null` hoặc đường dẫn tĩnh trong checkout; `cd` chỉ đứng đầu chuỗi và đi trước `&&`; `denyCommandPatterns` như `rm -rf` chỉ là lớp phụ).

| Biến môi trường      | Ai đặt      | Ý nghĩa                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENT_RUN=1`        | `agent-run` | Bật deny list + allow-list lệnh                                                                                                                                                                                                                                                                                                                                                 |
| `AGENT_PHASE`        | `agent-run` | `plan` (chỉ ghi `plan.md` của task, không Bash), `implement` (mặc định; ghi thêm `report.md`), `retro` (như implement), `review` (không ghi, chỉ lệnh đọc `cat`/`ls`/`git diff                                                                                                                                                                                                  | log | status | rev-parse | show`, không `pnpm`). Giá trị lạ bị chặn hết |
| `AGENT_TASK_DIR`     | `agent-run` | Thư mục task, ví dụ `docs/plan/tasks/03-product-card` (tương đối với worktree hoặc tuyệt đối); thay `{taskDir}` trong `phases`                                                                                                                                                                                                                                                  |
| `AGENT_APPROVED`     | `agent-run` | JSON `{"paths":["package.json"],"commands":["pnpm add zod"]}` lấy từ `approved:` trong frontmatter `spec.md` (D43) **lúc khởi động** (agent sửa spec giữa chừng không có tác dụng). Path là glob, lệnh khớp theo từ (`*` cuối = mọi đối số). Mở khóa `denyPaths`/`askPaths` và lệnh ngoài danh sách; **không** mở khóa `.env*`, `.agent-stop`, hay giới hạn của `plan`/`review` |
| `CLAUDE_PROJECT_DIR` | Claude Code | Root worktree (nơi tìm `.claude/agent-guard.json`, ghi `.agent-run/state.json`)                                                                                                                                                                                                                                                                                                 |

`report.md`: D12 (implementer viết trước khi trả `ok`) và bảng deny list (implementer ghi ở bước retro) được gộp: `implement` và `retro` đều được ghi `{taskDir}/report.md`. Hiện `docs/plan/tasks/**` không nằm trong `denyPaths` nên ngoại lệ này chỉ là lớp phòng thủ.

**Đếm lần bị chặn:** mỗi lần chặn khi `AGENT_RUN=1` được ghi vào `<worktree>/.agent-run/state.json` dưới `blocks: [{tool, target, at, kind}]` (`target` = đường dẫn tương đối với file, nguyên chuỗi lệnh với Bash; `kind` = `deny-path`, `ask-path`, `command`, `secret`, ...). Module dùng chung `scripts/agent-run/state.ts` (`readState`, `updateState`, `recordBlock`, `countBlocks`, `findRepeatedBlock`) được `agent-run` (bước 7) dùng lại để phát hiện tình huống 9 (cùng tool + cùng target 3 lần) và giữ các trường khác của state (giữ nguyên khóa lạ). `agent-run` nên chạy thử hook (preflight: một lệnh bị chặn phải trả exit 2) trước khi giao việc, vì nếu `node_modules/.bin/tsx` thiếu thì hook lỗi không phải exit 2 và Claude Code coi là không chặn.

## Gate và Stop hook (D19, D35, D38)

- `pnpm verify-gates [--worktree <dir>] [--task-dir <dir> | --kind <kind>] [--with-build]` chạy `lint`, `typecheck`, `test`, `format:check` và in một JSON (`gates[]` có `status` + `log` đã cắt, `failureType`, `bundle`). Exit 0 xanh, 1 `gate_failed` (agent sửa được), 2 `bundle_regression` (không cho agent sửa, hỏi người), 64 lỗi dùng/nội bộ. Với `kind: ui` còn đo First Load JS: baseline lưu ở `<repo chính>/.agent-run/baseline/<sha-dev>.json` (tự export đúng commit `dev` bằng `git archive` và build trong thư mục tạm lần đầu), route tăng quá 10% thì đỏ, route mới chỉ báo. Next chỉ ghi `route-bundle-stats.json` khi build bằng Turbopack, nên gate chạy `pnpm exec next build` (không phải `pnpm build --webpack`) cho cả baseline lẫn bản mới; con số tuyệt đối khác bundle webpack thật, nhưng so sánh cùng điều kiện.
- `verify-gates --task-dir <dir>` thêm gate `test-presence`: kiểm lại quy tắc test theo `kind` của D38 (dùng chung logic với Stop hook, `checkTestPresence`). `agent-run` truyền `--task-dir` cho mọi lần chạy sau implementer, nên thiếu test thì gate đỏ, vào vòng sửa và hết 3 lần thì dừng ở tình huống 7 (không bao giờ mở PR). Lần chạy trước khi giao việc không có gate này.
- Stop hook `.claude/hooks/implementer-stop.ts` đăng ký trong `.claude/settings.json` (hook khai báo trong frontmatter của `implementer.md` không chạy dưới `claude -p --agent`). Chỉ hoạt động khi `AGENT_RUN=1` và `AGENT_PHASE=implement`. Đỏ thì exit 2 và tăng `fixAttempts` trong `state.json`; `fixAttempts >= 3` thì cho dừng, script `agent-run` đánh dấu blocked.

## Làm task với Codex hoặc Claude Code

Trong phiên tương tác, mở checkout frontend hiện tại và chỉ định task, ví dụ: “Tiếp tục task 03 theo AGENTS.md”. Hai công cụ đọc cùng spec, plan, report và quy tắc repo. Các vai của Codex nằm trong `.codex/agents/`, các vai của Claude nằm trong `.claude/agents/`. Skill `plan-task` có nguồn chung trong `.agents/skills/`. Khi đổi công cụ giữa chừng, bàn giao bằng file của task và diff trong checkout.

Chạy tự động bằng `pnpm agent-run --provider claude --task NN` hoặc `pnpm agent-run --provider codex --task NN`. Mặc định là Claude Code. Trước lần đầu dùng Codex, chạy `pnpm agent-run --provider codex --check-provider`. Nếu CLI yêu cầu duyệt hook, mở Codex bằng lệnh được in, kiểm tra hook trong `/hooks`, rồi chạy lại phép thử. Phép thử yêu cầu CLI thực sự chặn một lệnh mẫu. Nếu chưa xác nhận được, runner dừng trước khi giao việc.

Nếu CLI báo vượt giới hạn danh mục skill, dùng cấu hình Codex gọn hơn hoặc chọn một `CODEX_HOME` riêng đã đăng nhập. Dùng cùng cấu hình cho lần kiểm tra, lần chạy và lần tiếp tục vì Codex lưu phiên theo cấu hình đó.

Task đã bắt đầu được tiếp tục bằng cùng công cụ để giữ đúng phiên implementer cho các bước sửa và retro. Với Codex, mỗi lần gọi tool qua hook và mỗi câu trả lời cuối tính một đơn vị ngân sách. Với Claude Code, runner đọc `num_turns`. Cả hai chế độ dùng cùng khóa chạy, quy trình task và checkout hiện tại.

## Chạy agent-run (D18, D22, D43)

`pnpm agent-run [--task NN] [--provider claude|codex]` chạy **một** task từ `ready-for-agent` tới PR vào `dev`, hoặc dừng và báo người. Chạy trong checkout chính của storefront (nơi bạn sửa spec); mã nguồn: `scripts/agent-run/` (`index.ts` là cửa vào, `run.ts` là luồng).

- **Chọn task:** task `ready-for-agent` đầu tiên theo tên thư mục mà mọi `blocked-by` đã `done` (task còn bị chặn bị bỏ qua, ghi vào log). `--task NN` chỉ chạy task đó.
- **Checkout hiện tại:** runner chạy trong checkout chính, mỗi lúc một task. Khi bắt đầu task mới, checkout phải sạch và `origin/dev` phải có phiên bản runner này. Script chuyển checkout sang branch `<type>/<NN>-<tên>` từ `origin/dev`, cài dependency theo lockfile và giữ `.env.local` nếu đã có. Branch đang làm ở lại checkout sau khi mở PR hoặc khi dừng. Branch đã tồn tại từ các lần chạy cũ cần được kiểm tra riêng trước khi tiếp tục.
- **Một task mỗi lúc (D15):** `<repo chính>/.agent-run/run.lock` (`pid`, task, giờ bắt đầu) có trong suốt lần chạy. Lần chạy thứ hai thấy pid còn sống thì in thông báo rõ và thoát (exit 1, không đổi spec, không ghi inbox); pid đã chết thì khóa cũ bị thay.
- **Luồng:** planner (`plan.md`) -> implementer -> `verify-gates` (đỏ thì implementer sửa, tối đa 3 lần dùng chung với Stop hook và review) -> với `kind: ui`: bật `pnpm dev --port 3100`, kiểm tra giao diện, tắt -> reviewer (`mattpocock-skills:code-review`, mốc `dev`; blocker/major vào vòng sửa) -> retro (`/mattpocock-skills:retro` trong phiên implementer, 5 lượt) -> `pnpm tokens` -> **script commit một lần**, push, viết PR body (agent, `scripts/check-pr-body.sh` + lọc từ cấm, sửa 1 lần) và `gh pr create --base dev`. Spec được commit với `status: review`. Link PR lưu tại `.agent-run/prs/<tên-task>` để lần đổi branch sau vẫn bỏ qua task đã mở PR. Script **không bao giờ merge**.
- **Số lượt (D15):** cộng `num_turns` mọi lần gọi trong một lần chạy, phần còn lại truyền làm `--max-turns`; lần chạy tiếp được 40 lượt mới. Retro (5 lượt) và agent viết PR body (6 lượt) có hạn mức riêng, không tính vào 40.
- **Kiểm tra UI (D30):** chỉ là bước tối thiểu (một lần gọi `claude` với các skill `mobile-native`, `break-ui`, `impeccable`); cần Playwright MCP trong `.mcp.json` (chưa có trong repo). Chỉnh ở bước chạy thử 5 task.

**Ctrl-C / SIGTERM:** tiến trình con (claude, pnpm, next) chạy trong nhóm tiến trình riêng; `agent-run` theo dõi các nhóm đang chạy, khi nhận SIGINT/SIGTERM thì gửi SIGTERM, 3 giây sau SIGKILL nhóm nào còn sống, xóa `run.lock`, thoát với mã 130/143. Checkout và `state.json` giữ nguyên. Đặt lại `ready-for-agent` để tiếp tục nếu lần chạy bị ngắt khi task đang `in-progress`.

**Dừng khẩn:** `touch .agent-stop` ở root checkout chính (hook và script kiểm tra giữa mọi bước; tình huống 10). Xóa file rồi chạy lại để tiếp tục; task về `ready-for-agent`, lần tiếp không tính là "chạy tiếp".

**Khi script dừng (D22):** xem log mới tại `.agent-run/AGENT-INBOX.md` và thông báo desktop. Nếu chưa bắt đầu task, spec vẫn giữ nguyên. Sau khi bắt đầu, runner ghi `needs-info` (5, 6, 9, 14, 15), `blocked` (3, 4, 7, 8, 11, 12, 13) hoặc `ready-for-agent` (10). Trường hợp 16 giữ trạng thái hiện tại.

**Trả lời và chạy tiếp (D43):** ở đúng branch của task trong checkout chính, sửa spec và đặt lại `ready-for-agent`. Runner tiếp tục từ `.agent-run/state.json`, giữ các bước đã xong, tăng `resumeCount` và cấp lại ngân sách cho lần chạy.

- Câu hỏi của agent (tình huống 5) nằm ở cuối spec dưới `## Câu hỏi cho người duyệt`: viết câu trả lời ngay dưới, rồi đặt lại `ready-for-agent`.
- Duyệt file/lệnh (tình huống 6): thêm vào `approved:` như mẫu ở trên rồi đặt lại `ready-for-agent`. Script đọc danh sách **lúc khởi động** và truyền cho hook qua `AGENT_APPROVED` (không mở khóa `.env*` hay `.agent-stop`).
- Bundle tăng quá 10% (tình huống 14): chấp nhận thì tự mở PR hoặc làm tiếp; agent không tự sửa.
- Sau **2 lần chạy tiếp** mà vẫn dừng, script đặt `ready-for-human` (người tự làm). Tình huống 10 và 15 không tính.
- **Chạy tiếp đúng chỗ dừng:** `state.json` ghi `completedSteps` (`plan`, `implement`, `gates`, `review`, `retro`, `committed`, `pushed`). Lần chạy tiếp bỏ qua các bước đã xong: sau tình huống 12 (commit đã có, PR body đã lưu) chỉ push và tạo PR; retro sập (11) thì chỉ chạy lại retro rồi commit. Implementer hỏi hoặc xin quyền (5, 6) thì bước `implement` bị xóa khỏi danh sách để lần sau nó đọc câu trả lời. Worktree vừa tạo mà `pnpm install` lỗi đã có `state.json` (đánh dấu `installPending`): chạy tiếp thì cài lại, không gặp tình huống 4 và không tính là một lần chạy tiếp.
- **Handoff (tình huống 7 và 8):** sau khi báo người, script `--resume` phiên implementer với 3 lượt không tính vào 40 và lệnh `/mattpocock-skills:handoff`, ghi kết quả vào `<thư mục task>/handoff.md` trong worktree (xóa khi run hoàn tất). Lỗi ở bước này chỉ vào log, không đổi tình huống dừng.
- **Retro:** không có session implementer đã ghi thì dừng ở tình huống 13 (không bỏ qua im lặng). Task `kind: ui` thì prompt retro thêm `learn-taste` (D30).
- Retro hết lượt (tình huống 15): script hỏi agent cần thêm bao nhiêu lượt và ghi vào inbox. Thêm `retro-turns: X` vào spec, đặt lại `ready-for-agent`: script `--resume` đúng phiên cũ với X lượt rồi commit và mở PR (không chạy lại plan/implement, không tính vào 2 lần chạy tiếp).

## Bảng task

| #   | Task                                                                    | Status          | Blocked by | PR  |
| --- | ----------------------------------------------------------------------- | --------------- | ---------- | --- |
| 01  | [category-breadcrumb-trail](tasks/01-category-breadcrumb-trail/spec.md) | ready-for-agent | -          |     |
| 02  | [order-date-locale](tasks/02-order-date-locale/spec.md)                 | ready-for-agent | -          |     |
| 03  | [pagination-window](tasks/03-pagination-window/spec.md)                 | ready-for-agent | -          |     |
| 04  | [order-status-badge-i18n](tasks/04-order-status-badge-i18n/spec.md)     | ready-for-agent | -          |     |
| 05  | [remove-dead-app-config](tasks/05-remove-dead-app-config/spec.md)       | ready-for-agent | -          |     |

## Wayfinder: bảo trì workflow và cấu trúc

Các hồ sơ Wayfinder dùng quy trình riêng tại [tracker](../agents/issue-tracker.md#wayfinding-operations); `done` là đã ghi resolution, không đồng nghĩa đã merge PR. Không đưa chúng vào hàng đợi triển khai của runner.

| Hồ sơ | Loại | Trạng thái |
| --- | --- | --- |
| [Đồng bộ workflow, cấu trúc và tài liệu storefront](tasks/07-workflow-structure-map/spec.md) | Map | in-progress |
| [Đồng bộ cấu trúc hiện tại và các gate kiểm tra](tasks/08-workflow-structure-cleanup/spec.md) | Task | done |
| [Kiểm kê độ lệch convention sau khi tách repository](tasks/09-convention-audit/spec.md) | Task | done |
| [Ranh giới feature và các lớp service có còn cần thiết?](tasks/10-source-boundaries/spec.md) | Task | done |
| [Workflow runner, task tracker và CI đã nhất quán khi tiếp tục công việc chưa?](tasks/11-runner-workflow/spec.md) | Task | todo |
| [Tài liệu nào là nguồn chuẩn và phần nào có thể gộp hoặc xóa?](tasks/12-documentation-ownership/spec.md) | Task | todo |
| [Provider cấp app nên được mount ở layout nào?](tasks/13-provider-ownership/spec.md) | Task | done |
