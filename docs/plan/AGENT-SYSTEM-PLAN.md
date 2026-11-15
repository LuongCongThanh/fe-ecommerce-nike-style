# Kế hoạch hệ thống Agent tự động

> Trạng thái: **Accepted cho thí điểm storefront** (2026-11-15). Các nhánh `REVIEW.md` (A3), eval (A4), nhân rộng sang `cms` và vai agent ở `be-demo` sẽ chốt khi tới phase tương ứng.
> File này nằm ở root workspace (không phải git repo) nên không có lịch sử thay đổi; giống `THREE-REPO-RESTRUCTURE-PLAN.md`. Các quyết định đã sửa sau review được ghi chú "(sửa sau review 2026-11-15)".
> Nguồn nền: [`ANTHROPIC-ACADEMY-COURSES-RESEARCH.md`](./ANTHROPIC-ACADEMY-COURSES-RESEARCH.md), [`ANTHROPIC-ACADEMY-VERIFICATION.md`](./ANTHROPIC-ACADEMY-VERIFICATION.md).
> Không tạo ADR (ADR `be-demo/docs/adr/` đóng băng). Không thêm thuật ngữ vào glossary nghiệp vụ: vai agent là khái niệm quy trình, không phải nghiệp vụ.

## Hướng đi

**C: làm A trước, B sau.**

- **A (agent làm phần mềm):** Claude Code tự động hóa một phần SDLC trên ba repo.
- **B (agent trong sản phẩm):** tính năng AI trong CMS và storefront.

Lý do: API nghiệp vụ còn đang dựng lại; A giúp dựng nhanh hơn, B cần API ổn định để bám vào.

## Quyết định đã chốt (2026-11-15)

| # | Quyết định | Lý do |
| --- | --- | --- |
| D1 | Thí điểm A1–A2 trên **storefront** (`fe-ecommerce-nike-style`), sau đó mới nhân rộng | Đã có lệnh `implement-issue`, `verify`, `review-change`; không đụng tới tiền |
| D2 | Mức tự chủ tối đa là **bậc 2** (agent mở PR vào `dev`, người merge) cho tới khi xong test phase | Module mới chưa có test, CI xanh chưa chứng minh code đúng. Quy tắc "Claude merge khi xanh" vẫn giữ cho phiên có người xem trực tiếp |
| D3 | Ở `be-demo`, agent **không** tự implement module nghiệp vụ; chỉ làm vai explorer, reviewer, verifier | `be-demo/CLAUDE.md`: tài liệu API dành cho dev tự viết code, không phải để agent sinh code |
| D4 | Mỗi repo dùng hệ thống task sẵn có của nó; task viết bằng **file Markdown cục bộ**, kể cả storefront (bỏ GitHub Issues). Agent chạy **cục bộ**; GitHub chỉ dùng cho bước review PR (A3) | Đã sửa 2026-11-15 sau khi phát hiện storefront đang ghi dùng GitHub Issues. Cần cập nhật `fe-ecommerce-nike-style/docs/agents/issue-tracker.md` và `CLAUDE.md` theo |
| D5 | Ghi kế hoạch trong file này; không ADR, không sửa glossary | ADR đóng băng; glossary chỉ chứa thuật ngữ nghiệp vụ |
| D6 | Mở hướng B khi: (1) `ordering`, `payment`, `fulfillment` xong và đã release OpenAPI, **và** (2) A đạt bậc 3 | Mở theo điều kiện, không theo ngày |
| D7 | `implementer` **viết test** cho code mới; verifier giữ các test hiện có luôn xanh. **Chỉ áp cho task do agent làm**; code người tự viết vẫn hoãn test tới test phase | Agent cần cổng kiểm chứng thật, không chỉ lint/typecheck |
| D8 | Chặn agent sửa các file nhạy cảm và chạy lệnh ngoài danh sách cho phép, thực thi bằng hook PreToolUse + `--allowedTools` (không chỉ ghi chữ). **Nguồn sự thật là `.claude/agent-guard.json` của từng repo** gồm `allowCommands`, `denyPaths`, `askPaths`; hook `agent-guard.ts` và script `agent-run` cùng đọc file này. Hook kiểm tra cả lệnh Bash, không chỉ Edit/Write. Mục "Deny list storefront" là bản cho người đọc *(sửa sau review 2026-11-15)* | Luật bắt buộc phải là hook/permission, không phải CLAUDE.md. Lệnh khác nhau giữa các repo (`pnpm` ở storefront, `npm` ở `cms`/`be-demo`) nên mỗi repo khai báo riêng |
| D9 | `implementer` chạy trong **git worktree riêng**, mỗi task một branch | Không đụng working tree của người đang code |
| D10 | Mọi vai dùng **model mặc định** (`model: inherit`). Cách chia model theo vai ở mục "Phương án để sau" chỉ áp dụng khi người dùng yêu cầu | Dùng gói thuê bao; chi phí tính vào hạn mức gói, không tính tiền theo token |
| D11 | Task storefront dùng chung định dạng với `be-demo`: `docs/plan/tasks/<NN>-<tên>/spec.md`, frontmatter `status`, `blocked-by`, `pr`. Thêm `status: ready-for-agent`; agent chỉ nhận task có trạng thái này và mọi `blocked-by` đã `done`. Frontmatter còn có `kind` (D30), `approved` và `retro-turns` (D43) | Một định dạng cho mọi repo; trạng thái `ready-for-agent` là cách người duyệt task đủ rõ để giao |
| D12 | **Retro task:** sau mỗi task có `report.md` + `metric.md` theo định dạng `be-demo`. **Implementer** viết `report.md` (đã làm gì, lệch spec ở đâu, đã quyết gì) ngay trước khi trả `ok`; bước retro (D26) nối thêm mục "Đề xuất cho môi trường"; `metric.md` do script điền. Copy `scripts/token-usage.ts` sang storefront **và chỉnh lại**: thêm tham số `--project-dir` để đọc transcript của worktree, coi `*.test.ts(x)` là test, chạy bằng `pnpm tokens`. Retro bao gồm cả **bộ skill và agent** đã dùng trong task (skill nào kích hoạt sai hoặc không kích hoạt, vai nào làm lệch việc) *(sửa sau review 2026-11-15)* | Agent không nhớ giữa các phiên; muốn tiến bộ thì phải sửa file nó đọc. Bản `be-demo` tìm transcript theo `cwd` và chỉ nhận `*.spec.ts`, nên không chạy đúng nếu copy nguyên |
| D13 | **Retro hệ thống** mỗi 5 task: agent tổng hợp `report.md`, đề xuất thay đổi rules/skills/agents/hooks/deny list dưới dạng **một PR**; người duyệt từng thay đổi. Agent không bao giờ tự sửa cấu hình của chính nó | Khớp D8: `CLAUDE.md`, `.claude/**` và `scripts/**` nằm trong deny list |
| D14 | Chỉ retro hệ thống được đề xuất nâng bậc tự chủ. Điều kiện: 5 task gần nhất không task nào bị yêu cầu sửa lớn, và đã xong test phase | Nâng bậc dựa trên bằng chứng, không theo cảm giác |
| D15 | Cầu dao số lượt: **40 lượt/task** cho 5 task thí điểm, chạy **1 task mỗi lúc**. Script cộng `num_turns` từ JSON của **mọi** lần gọi `claude -p` trong task (plan, implement, sửa, review) và truyền phần còn lại cho lần gọi sau. Retro có hạn mức riêng **5 lượt**, không tính vào 40. Ở retro hệ thống đầu tiên, chỉnh con số theo số đo thật (D12) *(sửa sau review 2026-11-15)* | Bảo vệ hạn mức gói thuê bao khi agent chạy không có người xem |
| D16 | Phạm vi AI-native SDLC playbook: áp dụng ngay spec/plan artifact, plan trước khi code, skills, hooks rào chắn và cổng duyệt, feedback loop, quy tắc "lỗi 2 lần thì thêm 1 dòng". Để theo phase: auto mode (bậc 3), AI review PR (A3), continuous evals (A4). Bỏ CI/CD deploy và on-call cho tới khi có production | Chuỗi `spec.md` → `plan.md` → `report.md` của `be-demo` đã tương đương chuỗi artifact của playbook |
| D17 | Dừng khẩn bằng file `.agent-stop` ở **root repo chính** (gitignore). Hook PreToolUse tìm root repo chính bằng `git rev-parse --git-common-dir` (vì agent chạy trong worktree), thấy file thì chặn mọi thao tác của agent. Script cũng kiểm tra file này giữa các bước *(sửa sau review 2026-11-15)* | Dừng được agent chạy nền mà không cần tìm đúng terminal; tốn 0 token. Đặt ở root worktree thì không dừng được agent |
| D18 | Luồng mỗi task do **script điều khiển** (`scripts/agent-run`), chỉ gọi `claude -p` ở bước cần phán đoán. Script phải **liệt kê và xử lý từng tình huống**; tình huống chưa xử lý được thì dừng và **thông báo cho người dùng**, không tự xoay xở | Ít token, luôn đúng thứ tự; tình huống lạ là tín hiệu để người quyết |
| D19 | Bỏ vai `verifier` dạng agent; gate chạy bằng script `verify-gates`. Gate đỏ thì gọi agent sửa **tối đa 3 lần** (tính chung vào 40 lượt); vẫn đỏ thì dừng, đánh dấu task bị chặn và **thông báo cho người dùng** quyết định. Bộ đếm số lần sửa nằm trong `.agent-run/state.json` của worktree (gitignore), dùng chung với Stop hook (D38) *(sửa sau review 2026-11-15)* | Mọi vòng lặp gọi agent phải có giới hạn; hook là tiến trình riêng nên cần chỗ lưu chung |
| D20 | Script viết bằng **TypeScript, chạy bằng `tsx`** (giống `be-demo`), và **có test** cho chính các script này | Cùng stack với 3 repo, dùng lại `token-usage.ts`; script điều khiển agent cũng là code cần kiểm chứng |
| D21 | Mỗi lần gọi `claude -p` trả JSON theo schema (`--json-schema`): `result: ok \| need_info \| blocked` + `reason` (retro thêm `turns_needed`; implementer thêm `commit_message` khi `ok`, D47; reviewer thêm `findings` có `severity`, D46). Script xử lý 16 tình huống ở mục "Danh mục tình huống"; tình huống mới được thêm ở retro hệ thống *(sửa sau review 2026-11-15)* | Script đọc kết quả có cấu trúc, không đoán từ câu chữ |
| D22 | Khi script dừng và cần người: bật thông báo desktop (`notify-send`) **và** ghi một dòng vào `docs/plan/AGENT-INBOX.md` (thời gian, task, số tình huống, việc cần làm). Chỉ script ghi file này. Chưa dùng Slack/email | Thông báo desktop dễ lỡ; file inbox là nơi lưu chắc chắn |
| D23 | Bộ trạng thái task cho mọi repo: `todo`, `ready-for-agent`, `in-progress`, `needs-info`, `blocked`, `ready-for-human`, `review`, `done`. Người đặt `todo`, `ready-for-agent`, `done`; script đặt các trạng thái còn lại. `ready-for-human`: task đã chạy tiếp 2 lần vẫn dừng (D43), người tự làm *(sửa sau review 2026-11-15)* | Thống nhất giữa các repo; `be-demo` không có task `ready-for-agent` (D3) |
| D24 | Tách bước cố định thành script/hook; chỉ giữ skill cho bước cần phán đoán. Bản đầu: skill `plan-task`, `implement-issue` (sửa lại), `tdd`, `fashion-storefront-ui-director`, `review-change`, `retro` (D26); script `agent-run`, `verify-gates`, `token-usage`; hook format, `agent-guard`, `.agent-stop`, Stop hook. Đang rà lại với bộ skill mattpocock | Giảm token; bước lặp lại không cần AI |
| D25 | **mattpocock là bộ skill chính** cho luồng làm việc. Bộ 12 skill UI trong `fe-ecommerce-nike-style/docs/SKILL-USAGE-GUIDE.md` chỉ dùng khi task là UI. Cài `setup-matt-pocock-skills` cho storefront trước task đầu tiên. Bảng gắn skill theo bước: mục "Skill theo bước" | Một bộ chính để luồng nhất quán; skill UI chỉ nạp khi cần |
| D26 | Retro dùng skill `retro` của mattpocock (bỏ ý viết `agent-retro`). Script chạy `retro` trong **chính phiên implementer** bằng `claude -p --resume <session> "/retro"` (skill có `disable-model-invocation: true` nên agent không tự gọi được, script phải gửi lệnh `/retro` làm prompt), **sau review và trước khi commit**. Retro không tự ghi file: prompt yêu cầu agent nối danh sách đề xuất vào cuối `report.md` dưới mục "Đề xuất cho môi trường". với `AGENT_PHASE=retro` và hạn mức 5 lượt (D15). Hết 5 lượt mà chưa xong thì dừng và hỏi người (tình huống 15). `metric.md` do script `token-usage` điền *(sửa sau review 2026-11-15)* | `retro` cần nhìn lại đúng phiên vừa làm; người quyết có cho thêm lượt không |
| D27 | Reviewer dùng `code-review` của mattpocock (2 trục: Standards theo rules repo, Spec theo `spec.md`), mốc so sánh là `dev`. `review-change` giữ cho người tự review | Có thêm trục khớp spec |
| D28 | PR body: nếu skill `pr` lệch template repo thì **template thắng**. Script chạy `check-pr-body.sh` trước khi mở PR; fail thì agent sửa 1 lần, vẫn fail thì dừng (tình huống 12) | Template và CI của repo là chuẩn |
| D29 | Chọn cách implement theo tình huống: luồng tự động dùng `implement-issue` + `tdd`; người tự làm việc nhỏ có ngồi xem dùng `implement`; `implement-spec` chỉ mở khi lên bậc 3 (lúc đó mới nới D15); bug khó dùng `diagnosing-bugs` trước | `implement-issue` sát luật storefront nhất; `implement-spec` chạy song song, tốn token |
| D30 | `spec.md` có trường `kind: ui \| logic \| refactor \| docs`. Khi `kind: ui`: implementer dùng `fashion-storefront-ui-director`; trước review chạy `mobile-native` + `break-ui` + `impeccable audit`; retro thêm `learn-taste`. Thêm Playwright MCP vào `.mcp.json` của storefront (tạo mới, repo chưa có file này) để chụp màn hình. Trước bước kiểm tra UI, **script** khởi động `pnpm dev --port 3100` trong worktree và tắt sau đó (implementer không có quyền chạy `pnpm dev`); cổng bận thì xử lý như tình huống 3 *(sửa sau review 2026-11-15)* | Skill UI chỉ nạp cho task UI; kiểm tra giao diện cần trình duyệt thật |
| D31 | Không cài 4 skill kiến trúc wondelai; mattpocock là bộ chính, bộ 12 skill UI của storefront dùng cho task UI | Tránh trùng vai, giữ ngân sách mô tả skill |
| D32 | Sửa quy định git storefront: chạy `agent-run` được coi là người dùng đã yêu cầu rõ việc tạo branch, commit, push **branch của task đó** và mở PR vào `dev`. **Script** làm các thao tác git này, không phải agent (D36). Tên branch `<type>/<NN>-<slug>` hoặc `<type>/<slug>`, slug phải nói rõ tính năng. Task thay GitHub Issues. Giữ cấm nhắc tên AI và cấm tự merge. `AGENTS.md`, `git-workflow.md`, `docs/agents/issue-tracker.md` do người sửa cùng Claude ở bước triển khai, không để agent tự sửa *(sửa sau review 2026-11-15)* | Luồng tự động cần quyền git có giới hạn; quy định cũ cấm toàn bộ |
| D33 | Thêm thư viện UI phải qua `pick-ui-library` và checklist 6 câu (mục "Cổng thư viện UI"), rồi người duyệt. React Bits: copy có chọn lọc khi qua cổng. Canvas UI: tạm không dùng (trùng vai `three` đã có) | Repo đã có `framer-motion`, `three`, `@react-three/fiber` |
| D34 | Mặc định dùng Framer Motion. Skill `gsap-*` chỉ được gọi sau khi người duyệt thêm `gsap` cho một nhu cầu cụ thể | Repo chưa có `gsap` |
| D35 | Vạch từ chối: First Load JS của một route tăng quá **10%** so với `dev`. Đo bằng `.next/diagnostics/route-bundle-stats.json` (Next 16.2 ghi sau `pnpm build`, trường `firstLoadUncompressedJsBytes`, chưa nén), so từng route có ở cả baseline lẫn bản mới; route mới (không có baseline) chỉ ghi vào PR body, không làm gate đỏ. Baseline build từ `dev` một lần, lưu ở `.agent-run/baseline/<sha-dev>.json`. `verify-gates` kiểm tra cho task `kind: ui`. Vượt vạch thì **không** cho agent sửa: dừng và hỏi người (tình huống 14) *(sửa sau review 2026-11-15)* | Bảo vệ hiệu năng storefront. Next 16 không in First Load JS ra terminal nữa. Bundle tăng thường do chính tính năng, chấp nhận hay không là đánh đổi của người |
| D36 | Bốn file agent ở `fe-ecommerce-nike-style/.claude/agents/`, `model: inherit`: `explorer` (Read/Grep/Glob), `planner` (Read/Grep/Glob + Write chỉ `plan.md` của task, gọi explorer), `implementer` (Read/Grep/Glob/Edit/Write, Bash chỉ các lệnh trong `allowCommands` của `agent-guard.json`, gọi explorer; **không** git add/commit/push), `reviewer` (Read/Grep/Glob, `Agent`, `Bash(git diff *)`, `Bash(git log *)`). Script gọi từng vai bằng `claude -p --agent <vai>` để vai chạy như phiên chính (gọi được sub-agent) *(sửa sau review 2026-11-15)* | Quyền thực thi bằng trường `tools`, không chỉ lời dặn. Sub-agent không gọi được sub-agent; `code-review` cần gọi 2 sub-agent. `Bash(pnpm *)` cho phép `pnpm add`/`pnpm exec` lách deny list |
| D37 | `explorer` là subagent do planner/implementer tự gọi, không phải bước của script | Giữ kết quả tìm kiếm dài ngoài context chính |
| D38 | Stop hook của implementer, khai báo trong **`.claude/settings.json`** (mục `Stop`, tự kiểm tra env `AGENT_RUN=1` + `AGENT_PHASE=implement`). Đã thử thật (2026-11-16, `claude -p --agent implementer`): hook khai báo trong frontmatter `hooks` của `implementer.md` **không chạy**, hook trong `settings.json` chạy và chặn đúng: `pnpm typecheck`, `vitest related --run` cho file đã đổi, và khi `kind` là `logic` hoặc `ui` thì diff phải có file `*.test.ts(x)` mới hoặc sửa. Khi `kind: refactor`: test liên quan phải xanh, không được xóa/sửa test nếu spec không cho phép. Khi `kind: docs`: bỏ kiểm tra test. Bỏ qua khi `AGENT_PHASE=retro`. Đỏ thì không cho dừng; mỗi lần chặn tính vào 3 lần sửa của D19 (đếm trong `state.json`); sau 3 lần cho dừng và script đánh dấu `blocked`. Gate đầy đủ vẫn do `verify-gates` *(sửa sau review 2026-11-15)* | Chặn báo "xong" khi chưa đạt, nhưng vẫn có giới hạn; không ảnh hưởng phiên người tự code; refactor đúng nghĩa không cần test mới |
| D39 | `plan.md`, `report.md`, `metric.md` commit **cùng PR** với code, trong branch của task. Thứ tự cuối task: code → `verify-gates` → review → retro → `token-usage` điền `metric.md` → **script commit một lần** (husky chạy `pnpm build` một lần) → push → PR. Token của bước viết PR body không có trong `metric.md` *(sửa sau review 2026-11-15)* | Người review thấy cả kế hoạch và bài học |
| D40 | Deny list và giới hạn ghi của planner chỉ bật khi `AGENT_RUN=1` (script đặt). Luôn bật cho mọi phiên: chặn đọc `.env*` (trừ `.env.example`) và `.agent-stop`. Tất cả nằm trong một hook `PreToolUse` `agent-guard.ts` (TypeScript, có test), đọc luật từ `agent-guard.json` (D8) | Người dùng vẫn sửa được file cấu hình khi tự làm |
| D41 | Triển khai theo 9 bước ở mục "Thứ tự triển khai thí điểm"; mỗi bước là một PR riêng vào `dev` của storefront. Chỉ bắt đầu khi người dùng nói "bắt đầu" | Bước 1 (sửa quy định) là tiền đề cho mọi bước sau |
| D42 | 5 task thí điểm nhỏ: 2 `logic`, 2 `ui`, 1 `refactor`, có tiêu chí nghiệm thu rõ, không đụng checkout hay xác thực. Claude soạn nháp `spec.md` từ `docs/plan/storefront-restructure-plan.md`, người chọn và sửa | Đo được nhiều loại task, rủi ro thấp |
| D43 | **Chạy tiếp task sau khi người trả lời.** Người duyệt bằng cách thêm `approved:` (danh sách file/lệnh) vào frontmatter `spec.md` hoặc trả lời câu hỏi trong spec, rồi đặt lại `ready-for-agent`. Script thấy worktree + branch + `state.json` của task thì **chạy tiếp trên worktree cũ** bằng **phiên mới** (đọc `plan.md` và diff hiện tại), 40 lượt mới. Sau **2 lần chạy tiếp** vẫn dừng thì đặt `ready-for-human`. **Ngoại lệ retro** (tình huống 15): người thêm `retro-turns: X`, script `--resume` đúng phiên cũ với X lượt rồi commit và mở PR; chưa xong thì hỏi lại; lần duyệt này không tính vào giới hạn 2 lần chạy tiếp | Tình huống 4 không được chặn task đang chờ người; giới hạn số lần chạy tiếp để không lặp vô hạn; retro cần đúng phiên cũ (D26) |
| D44 | **Chuẩn bị worktree:** script chạy `corepack pnpm install --frozen-lockfile` và copy `.env.example` thành `.env.local` (không copy env thật). Test dùng MSW. Build bắt buộc cần biến thật thì xử lý như tình huống 3 | Worktree mới không có `node_modules` và `.env.local`; không đưa bí mật vào worktree |
| D45 | `agent-guard.ts` và `agent-guard.json` **copy vào từng repo**, mỗi repo có test riêng. Chỉ tính tách package dùng chung khi đã nhân rộng ra 2 repo trở lên. Thí điểm chỉ tạo cho storefront | Ba repo là ba git repo riêng; package dùng chung lúc này là quá sớm |

## Deny list storefront (D8)

Nguồn sự thật là `fe-ecommerce-nike-style/.claude/agent-guard.json`; bảng dưới là bản cho người đọc.

| Nhóm | File | Chế độ |
| --- | --- | --- |
| Bí mật | `.env`, `.env.local`, `.env.*` trừ `.env.example` | Chặn đọc và sửa (mọi phiên) |
| File sinh tự động | `src/lib/api/generated/**`, `pnpm-lock.yaml`, `skills-lock.json` | Chặn sửa trực tiếp |
| Cấu hình agent | `.claude/**` (gồm `settings*.json`, `hooks/`, `agents/`, `skills/`, `rules/`, `commands/`, `agent-guard.json`), `.mcp.json`, `scripts/**`, `docs/plan/AGENT-INBOX.md` | Chặn sửa. Ngoại lệ: planner ghi `plan.md` của task; implementer ghi `report.md` của task ở bước retro |
| Cổng kiểm tra | `.husky/**`, `commitlint.config.mjs`, `lint-staged.config.mjs`, `eslint.config.mjs`, `.prettierrc.mjs`, `.prettierignore`, `tsconfig.json`, `tsconfig.scripts.json`, `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/**`, `.github/PULL_REQUEST_TEMPLATE.md` | Chặn sửa |
| Quyết định, hướng dẫn | `docs/adr/**`, `AGENTS.md`, `CLAUDE.md` | Chặn sửa |
| Code cũ | `apps/**` | Chặn sửa |
| Hỏi trước | `package.json` (không tự thêm dependency), `next.config.ts`, `src/middleware.ts`, `.gitignore` | Khi chạy không người: hook từ chối, agent trả `blocked` + `reason: needs_approval`, script xử lý như tình huống 6. Người duyệt qua `approved:` (D43) |
| Lệnh cho phép (implementer) | `pnpm typecheck`, `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm test`, `pnpm build`, `pnpm exec vitest run *`, `pnpm exec eslint *` | Chỉ các lệnh này |
| Lệnh chặn | Mọi `pnpm` khác (`add`, `install`, `remove`, `dlx`, `exec` lệnh khác), `npx`, `node -e`, mọi lệnh `git` ghi (add/commit/push/reset…), `rm -rf` | Chặn. Chặn `rm -rf` bằng so khớp chuỗi chỉ là **lớp phụ** (dễ lách bằng `rm -r -f`, `find -delete`); rào chính là danh sách lệnh cho phép |

## Phương án để sau

**Model theo vai** (dùng khi chuyển sang API key hoặc khi người dùng yêu cầu): explorer Haiku 5.5 · planner Opus 5.5 · implementer Sonnet 5.5 · reviewer Opus 5.5. Ước lượng thô ~$2–5/task; phần lớn chi phí nằm ở implementer.

## Thang mức tự chủ

| Bậc | Agent tự làm | Người làm |
| --- | --- | --- |
| 0 | Gợi ý trong phiên | Mọi thứ |
| 1 | Code + verify cục bộ | Review diff, mở PR |
| 2 | Từ task tự mở PR vào `dev` | Review và merge |
| 3 | Mở PR, có agent review, tự merge khi CI xanh ở vùng rủi ro thấp | Duyệt vùng rủi ro (Thanh toán, Tồn kho, Voucher) |
| 4 | Routine theo lịch, tự đề xuất task mới | Đặt mục tiêu, xử lý ngoại lệ |

## Các phase (nháp, chưa chốt chi tiết)

| Phase | Nội dung | Điều kiện xong |
| --- | --- | --- |
| 0. Nền | Vùng cấm (`agent-guard`), hạn mức lượt (D15) | Được duyệt |
| A1. Vai agent | `.claude/agents/`: explorer, planner, implementer, reviewer (D36) | Mỗi vai làm đúng việc khi gọi thử |
| A2. Luồng task → PR | Script `agent-run`: task → `plan.md` → code → `verify-gates` → review → retro → commit → PR; Stop hook (D38) | 5 task thật chạy hết luồng |
| A3. Review trong CI | `claude-code-action` review PR theo `REVIEW.md` | Bắt được lỗi thật |
| A4. Eval, lên bậc 3 | Bộ 20 task mẫu; chạy lại khi rules/skills/hooks đổi | Tỉ lệ đạt ổn định, xong test phase |
| A5. Maintain | Routine quét drift OpenAPI, quét bảo mật, đề xuất task | — |
| Cổng A → B | Theo D6 | — |
| B1. Lớp tool | Bọc API `/api/v1`, chỉ đọc trước | Test bằng Inspector |
| B2. Agent nội bộ | CMS: sinh mô tả Sản phẩm | Nhân viên dùng được |
| B3. Agent cho khách | Storefront: tra Đơn hàng/Vận đơn | Eval và kiểm tra bảo mật đạt |

## Thứ tự triển khai thí điểm (đề xuất, chờ duyệt)

1. Sửa quy định storefront (D32, D4): `AGENTS.md`, `.claude/rules/process/git-workflow.md`, `docs/agents/issue-tracker.md`, `CLAUDE.md`; tạo `docs/plan/README.md` + `docs/plan/tasks/` theo D11, D23.
2. Chạy `setup-matt-pocock-skills` và `git-guardrails-claude-code` cho storefront (D25).
3. `.claude/agent-guard.json` + hook `agent-guard.ts` + test (D8, D40, D17, D45); thêm `.agent-stop` và `.agent-run/` vào `.gitignore`; tạo `.mcp.json` với Playwright MCP (D30).
4. Bốn file agent (D36) và skill `plan-task`; sửa `implement-issue` đọc task Markdown.
5. Script `verify-gates` + test (D19, D35); Stop hook trong frontmatter `implementer.md` (D38).
6. Copy và chỉnh `scripts/token-usage.ts` từ `be-demo` (D12).
7. Script `agent-run` + test: chuẩn bị worktree (D44), `state.json`, 15 tình huống (D21), chạy tiếp (D43), thông báo (D22), retro (D26), commit/PR (D39). Thử trước `--max-turns` (flag không còn hiện trong `claude --help`); nếu không chạy thì script dừng theo `num_turns` sau mỗi lần gọi.
8. Chạy thử từng vai riêng lẻ, rồi chạy 5 task thí điểm (D15).
9. Retro hệ thống đầu tiên (D13): chỉnh số lượt, danh mục tình huống.

## Câu hỏi còn mở

- `REVIEW.md` cho phase A3; bộ eval cho phase A4; nhân rộng sang `cms`; vai agent ở `be-demo` (để tới phase tương ứng).

## Cổng thư viện UI (D33)

1. Framer Motion hoặc `three` đã có làm được không? Được thì không thêm.
2. Chỉ ở trang marketing (home, collection, campaign); cấm ở grid, filter, cart, checkout.
3. Tải lười (dynamic import, chỉ client).
4. Tắt khi `prefers-reduced-motion`; có bản tĩnh thay thế.
5. First Load JS của trang tăng không quá 10% (D35).
6. Còn được bảo trì; license cho phép dùng thương mại.

## Skill theo bước (D25)

| Giai đoạn | Lúc nào | Skill | Ai gọi |
| --- | --- | --- | --- |
| Cài đặt một lần | Trước task đầu tiên mỗi repo | `setup-matt-pocock-skills`, `git-guardrails-claude-code` | Người |
| Chuẩn bị task | Ý tưởng mơ hồ | `grill-with-docs` | Người |
| | Ra spec / chia task | `to-spec`, `to-tickets` | Người |
| | Chưa chắc UI/logic | `prototype` | Người |
| | Task `needs-info` | `triage` | Người |
| Agent làm task | Viết code | `tdd` | Agent |
| | Gate đỏ (trong 3 lần sửa) | `diagnosing-bugs` | Agent |
| | Viết PR body | `pr` (template repo thắng) | Agent |
| | Review | `code-review` (mốc `dev`) | Agent |
| | Dừng ở tình huống 7/8 | `handoff` | Agent |
| Retro | Cuối mỗi task, trước commit | `retro` | Agent |
| | Retro hệ thống | `writing-for-agents` | Agent đề xuất, người duyệt |
| | Định kỳ khi tái cấu trúc | `improve-codebase-architecture`, `codebase-design` | Người |

## Danh mục tình huống (D21)

| # | Tình huống | Script làm gì | Báo người |
| --- | --- | --- | --- |
| 1 | Không có task `ready-for-agent` | Thoát | Có |
| 2 | `blocked-by` chưa `done` | Bỏ qua, chọn task kế | Không |
| 3 | Gate đỏ trước khi agent bắt đầu (kể cả build cần env thật, D44) | Dừng trước khi code | Có |
| 4 | Worktree/branch đã tồn tại mà **không** có `state.json` | Dừng, không ghi đè. Có `state.json` thì chạy tiếp theo D43 | Có |
| 5 | Spec mơ hồ (planner trả `need_info`) | `needs-info`, ghi câu hỏi vào task | Có |
| 6 | Plan hoặc implementer cần sửa file "Hỏi trước"/deny list hoặc chạy lệnh ngoài danh sách | `needs-info`, chờ `approved:` (D43) | Có |
| 7 | Gate đỏ sau 3 lần sửa | `blocked`, ghi lỗi | Có |
| 8 | Chạm 40 lượt | `blocked`, ghi đã làm tới đâu | Có |
| 9 | Hook chặn cùng tool + cùng file/lệnh **3 lần** trong một task | Dừng và hỏi | Có |
| 10 | Có `.agent-stop` | Dừng ngay | Không |
| 11 | Hết hạn mức gói, lỗi mạng, `claude` crash | Dừng, giữ worktree | Có |
| 12 | Push/tạo PR lỗi | Dừng | Có |
| 13 | Tình huống khác | Dừng, ghi nguyên lỗi | Có |
| 14 | First Load JS của route tăng quá 10% (D35) | Dừng, không cho agent sửa; ghi route và mức tăng | Có |
| 15 | Retro chạm 5 lượt chưa xong | Gọi 1 lượt `--resume` hỏi `turns_needed` (không tính hạn mức); `needs-info`, ghi "retro task NN cần thêm X lượt: lý do"; chờ `retro-turns:` (D43) | Có |

Mọi trường hợp dừng đều giữ worktree; không xóa tự động. Task đã chạy tiếp 2 lần vẫn dừng thì đặt `ready-for-human` (D43).
