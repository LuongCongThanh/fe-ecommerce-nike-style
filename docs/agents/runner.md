# Vận hành agent-run

Owner: maintainer; hiện trạng runtime `scripts/agent-run/` ngày 18/11/2026. Schema task/report tại [tracker](issue-tracker.md), Git/PR tại [CONTRIBUTING](../../CONTRIBUTING.md). Đây là manual hiện tại; quyết định chưa chạy nằm ở [roadmap](../roadmap.md).

## Chạy và preflight

```bash
pnpm agent-run --provider claude --task NN
pnpm agent-run --provider codex --check-provider
pnpm agent-run --provider codex --task NN
```

Mặc định provider Claude. Một invocation chạy một task; không chỉ định NN thì chọn ready-for-agent đầu tiên theo folder có mọi blocker done. Runtime giữ mọi record cho blocker nhưng loại labels Wayfinder/Type khỏi delivery selection, kể cả explicit --task. Spec là nguồn status, index không phải runtime database. Marker `.agent-run/prs/<folder>` tránh chạy lại task đã mở PR.

Runner chạy tuần tự trong checkout chính, không tạo worktree. Task mới đòi checkout sạch, branch an toàn và origin/dev có runner; script tạo branch task từ origin/dev, cài dependency lockfile. Biến nội bộ/flag `worktree` nghĩa working directory hiện tại, không cấp phép tạo worktree mới. Không sửa .agent-run state/markers để dọn docs.

Provider phải có CLI/session và guard hoạt động thật. Claude preflight thử hook chặn ghi lockfile với exit 2; thiếu tsx/hook không block thì dừng. Codex check-provider kiểm tra CLI hook thực sự chặn command mẫu; nếu cần duyệt hook, chạy lệnh runner in, kiểm `/hooks`, rồi chạy lại. Giữ cùng CODEX_HOME/cấu hình đã đăng nhập khi check/run/resume; catalog skill vượt giới hạn cần cấu hình gọn hơn. Không suy ra tool availability từ cấu hình provider khác.

Lock `.agent-run/run.lock` lưu pid/task/time; pid sống làm lần chạy sau thoát trước khi đổi spec/inbox; pid chết được thay. State/resume ở `.agent-run/state.json`; inbox local `.agent-run/AGENT-INBOX.md`. Paths này không phải tài liệu cần commit.

## Luồng và ngân sách

Planner → implementer → verify-gates → UI check nếu kind ui → reviewer → retro → tokens → script commit/push/PR vào dev. Script không merge. Vai/schema/prompt của hai provider ở `.claude/agents`, `.codex/agents`, `scripts/agent-run/prompts.ts` và schemas.ts.

Ngân sách task mặc định 40, fix chung tối đa 3 cho Stop hook/gate/review. Claude dùng num_turns; Codex tính tool-hook/final-message theo adapter. Retro 5 lượt và PR body 6 lượt có ngân sách riêng. Xem index.ts/config/runtime trước khi override. Refactor không sửa/xóa test cũ trừ khi spec cho phép; gates enforce theo kind.

verify-gates chạy lint/format/typecheck/test/`docs:check` và build khi runner yêu cầu; bundle regression hơn 10% dừng cho người quyết định, không vào vòng agent sửa. Route mới chưa baseline chỉ được ghi nhận. CI có job docs offline riêng; gate này kiểm maintained Markdown, local links/anchors, consumer tài liệu đã xóa và graph task, nhưng không chạy E2E hay xác minh nội dung nghiệp vụ. Runner vẫn chạy gate source rộng cho mọi kind.

UI check khởi động dev port cấu hình (mặc định 3100), dùng schema UI riêng và browser tools rồi tắt server trong finally. blocked/need_info/malformed hoặc thiếu evidence hợp lệ đều dừng; contract evidence ở mục dưới. Browser tools/config phải sẵn trong provider thực tế; repo không chứng minh Playwright MCP đã cài.

Reviewer blocker/major vào fix loop; minor ghi PR. Retro resume đúng implementer session; thiếu session là lỗi, không bỏ qua im lặng. PR body dùng template và checker/attribution filter, có một lần sửa. Script commit một lần, push, tạo PR, ghi review/marker; quyền này là ngoại lệ được ủy quyền khi người chạy agent-run, không áp dụng tự động cho phiên tương tác.

## Guard contract

Executable owner là `.claude/agent-guard.json`; decision engine `.claude/hooks/lib/guard.ts`, IO hook `.claude/hooks/agent-guard.ts`. Không sao chép deny list vào docs vì config thay đổi độc lập.

| Env            | Nghĩa                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| AGENT_RUN=1    | Bật giới hạn automation                                                 |
| AGENT_PHASE    | plan/implement/review/retro; phase quyết định file và command được phép |
| AGENT_TASK_DIR | Task folder thay placeholder taskDir                                    |
| AGENT_APPROVED | JSON quyền file/command từ spec, đọc khi startup                        |

Secret files và stop file được bảo vệ mọi phiên. Config hiện tại mở: `allowAllCommands` true, denyPaths/askPaths/denyCommandPatterns rỗng, nên agent-run được sửa mọi file và chạy mọi lệnh trong checkout; còn lại path boundary và phase rules. Engine vẫn hỗ trợ các giới hạn này, test engine dùng `.claude/hooks/lib/guard.fixture.json`. Planner chỉ ghi plan của mình, không Bash; reviewer read-only; implement/retro được report. Approval không mở secret/stop. Hook fail-closed khi AGENT_RUN; interactive internal errors có policy khác trong engine. Read commands/output filters, static paths và hạn chế shell composition nằm trong config/engine, không coi regex là sandbox đầy đủ. Đọc config trước khi xin quyền file/lệnh bị chặn.

Codex adapter/preflight và Claude hook khác nhau; chỉ tuyên bố provider được bảo vệ khi phép thử provider đó pass. Stop hook chạy gate theo pha và dùng fix counter chung. Claude preflight thử ghi `.env.local` và mong exit 2.

## Dừng và tiếp tục

Ctrl-C/SIGTERM gửi TERM cho process group con, sau ba giây KILL nếu cần; xóa run.lock, giữ checkout/state, exit 130/143. Nếu task còn in-progress, người kiểm tra rồi đặt ready-for-agent để tiếp tục. Không reset branch hoặc xóa thay đổi đang làm.

Dừng khẩn: người tạo `.agent-stop` ở root checkout chính. Hook/script kiểm tra stop; xóa file sau khi xử lý rồi chạy lại. Stop khẩn đưa task về ready-for-agent và không tính một resume. Agent không tự chạm stop file.

Khi dừng đọc inbox và spec. Pre-start failure giữ spec. Sau bắt đầu: need-info/quyền/bundle/retro thường needs-info; gate/budget/provider/network/push lỗi blocked; sau hai resume vẫn dừng chuyển ready-for-human (trừ emergency/retro-turn exception). Chi tiết và nguyên lỗi ở `scripts/agent-run/situations.ts`; không sửa state theo phỏng đoán.

Tiếp tục ở đúng checkout/branch/provider, trả lời dưới Câu hỏi cho người duyệt trong spec, hoặc thêm approved.files/commands, rồi người đặt ready-for-agent. Runner dùng completedSteps để bỏ qua plan/implement/gates/review/retro/committed/pushed đã xong. Khi implementer cần câu trả lời/quyền, bước implement được reset để đọc spec mới. installPending cài lại dependency trong checkout hiện tại, không tạo worktree và không tính resume.

Sau commit/push/PR lỗi, resume giữ commit và chỉ tiếp tục việc thiếu. Handoff khi hết fix/budget dùng phiên implementer, 3 lượt riêng, ghi task/handoff.md; failure chỉ log, không thay nguyên nhân dừng. Hoàn tất run xóa handoff theo runtime. Không đổi provider giữa resume tự động; phiên tương tác có thể bàn giao qua spec/plan/report/diff và kiểm bước đã xong.

Retro hết lượt hiện hỏi turns_needed, lưu retro-wait và dừng; người thêm retro-turns rồi ready-for-agent, runner resume session cũ mà không làm lại plan/implement. Quyết định cho PR kèm retro dang dở vẫn backlog, chưa thay hành vi này.

## Chọn skill và provenance

Tương tác dùng storefront-workflow để chọn tối thiểu skill: domain/grilling khi yêu cầu mơ hồ; research/prototype khi thiếu bằng chứng; to-spec/to-tickets để ghi todo; codebase-design để chọn boundary; plan-task → triển khai/TDD → verify → review cho task đã sẵn. UI dùng [UI workflow](ui-workflow.md). Quy tắc repo tuần tự trong checkout ghi đè recipe implement-spec tạo nhiều worktree.

System plan trước đây tổng hợp quyết định từ nghiên cứu Anthropic Academy (khảo sát 2026-11-14, quyết định hệ thống cập nhật 2026-11-15; nguồn https://anthropic.skilljar.com/ và https://platform.claude.com/docs/). Giữ provenance này, không dùng catalog khóa học/giá/model/SDK cũ như contract vận hành. Lịch sử raw nghiên cứu/system plan tra Git; runtime/config và các quyết định pending ở roadmap là nguồn hiện tại.

## UI evidence và decision selection

Runner loại Wayfinder labels (inline/dash list) và body Type research/prototype/grilling/task khỏi delivery selection, kể cả `--task`; spec status vẫn được giữ để xét blocker. Index chỉ điều hướng.

UI dùng response schema riêng, giữ reviewer schema thường tương thích. `ok` phải có route cùng origin devserver hiện tại, viewport nguyên dương, state/actions không rỗng và screenshot PNG mới tại đường dẫn duy nhất runner cấp dưới task checkout. Runner kiểm tra path chính xác, không symlink/escape, file thường, PNG signature và timestamp (dung sai filesystem 1 giây). Browser tool phải tạo screenshot; thiếu tool phải trả blocked. blocked/need_info/malformed hoặc evidence lỗi dừng trước review/PR; server luôn được stop trong finally. Đây là bằng chứng audit cùng mô tả kiểm tra, không chứng minh mọi AC UI được kiểm tra đầy đủ hoặc attestation provider. [Report11](../plan/tasks/11-runner-workflow/report.md) ghi phạm vi kiểm thử. Retro hết lượt vẫn dừng xin retro-turns; chính sách mở PR với retro dang dở còn backlog.
