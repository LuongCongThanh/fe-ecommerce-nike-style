# Nghiên cứu Anthropic Academy

Đối chiếu chín khóa học và các tài liệu chính thức, cập nhật theo báo cáo xác minh ngày 14/11/2026. Thời lượng và cấp độ là số liệu tại thời điểm khảo sát. Phần mô tả nội dung dựa trên đề cương công khai và tài liệu tham khảo. Video và nội dung bài giảng yêu cầu đăng nhập.

## Tổng quan khóa học

### Bảng đối chiếu 9 tiêu đề với catalog

| #   | Tiêu đề bạn đưa                         | Tìm thấy?                                                                                                | Tên chính xác / URL                                                                                                                                       |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Claude 101                              | Có                                                                                                       | "Claude 101" - <https://anthropic.skilljar.com/claude-101>, <https://academy.claude.com/courses/claude-101>                                               |
| 2   | Claude Code 101                         | Có                                                                                                       | <https://anthropic.skilljar.com/claude-code-101>, <https://academy.claude.com/courses/claude-code-101>                                                    |
| 3   | Claude Code in action                   | Có                                                                                                       | Catalog viết "Claude Code in Action" - <https://anthropic.skilljar.com/claude-code-in-action>, <https://academy.claude.com/courses/claude-code-in-action> |
| 4   | Introduction to Model Context Protocol  | Có                                                                                                       | <https://anthropic.skilljar.com/introduction-to-model-context-protocol>                                                                                   |
| 5   | Claude Platform 101                     | Có                                                                                                       | <https://anthropic.skilljar.com/claude-platform-101>                                                                                                      |
| 6   | Model Context Protocol: Advanced topics | Có                                                                                                       | <https://anthropic.skilljar.com/model-context-protocol-advanced-topics>                                                                                   |
| 7   | The AI-native SDLC playbook             | **Không có trong catalog Skilljar** (trang catalog fetch được không liệt kê). **Có trên Claude Academy** | <https://academy.claude.com/courses/ai-native-sdlc-playbook>; bài viết gốc: <https://claude.com/resources/articles/the-ai-native-sdlc-playbook>           |
| 8   | Introduction to agent skills            | Có                                                                                                       | <https://anthropic.skilljar.com/introduction-to-agent-skills>                                                                                             |
| 9   | Introduction to subagents               | Có                                                                                                       | <https://anthropic.skilljar.com/introduction-to-subagents>                                                                                                |

Nguồn catalog: <https://anthropic.skilljar.com/>.

Ghi chú về các khóa **không** nằm trong danh sách 9 nhưng có trong catalog (tránh nhầm): Introduction to Claude Cowork, Building with the Claude API, AI Fluency (nhiều bản), AI Capabilities and Limitations, Claude with Amazon Bedrock, Claude on Google Cloud, Deploying Claude Enterprise with Confidence (nguồn: <https://anthropic.skilljar.com/>).

### Bảng tổng quan

| Khóa                         | Thời lượng (Claude Academy) | Số bài                       | Đối tượng                                 | Level (chính thức, catalog.json)* |
| ---------------------------- | --------------------------- | ---------------------------- | ----------------------------------------- | --------------------------------- |
| Claude 101                   | 2.5 giờ                     | 13 + quiz + badge            | Người mới dùng Claude trong công việc     | Beginner                          |
| Claude Code 101              | ~1.5 giờ                    | 12 + quiz + badge            | Dev mới và dev chưa dùng coding agent     | Beginner                          |
| Claude Code in Action        | ~1 giờ                      | 9 + quiz + badge             | Dev đã dùng Claude Code cho prompt đơn lẻ | Intermediate                      |
| Introduction to MCP          | 1 giờ                       | 10 + quiz + badge            | Engineer muốn xây MCP server              | Intermediate                      |
| Claude Platform 101          | 1.5 giờ                     | 13 + quiz + badge            | Dev muốn nhúng Claude vào app/agent       | Beginner                          |
| MCP: Advanced topics         | 1.5 giờ                     | 11 + quiz + badge            | Engineer xây MCP server production        | Advanced                          |
| AI-native SDLC playbook      | ~1 giờ                      | 14 (không quiz, không badge) | Engineering/platform/security lead        | Advanced                          |
| Introduction to agent skills | 1 giờ                       | 6                            | Không nêu                                 | Intermediate                      |
| Introduction to subagents    | 45 phút                     | 4                            | Không nêu                                 | Intermediate                      |

\*Level lấy từ `catalog.json` của Academy (<https://academy.claude.com/assets/data/catalog.json>, trường `level`, tất cả `visibility: public`; skill chính thức `academy-guide` ghi catalog này là nguồn gợi ý khóa: <https://github.com/anthropics/skills/blob/main/skills/academy-guide/SKILL.md>). Các trang khóa học (Skilljar, Academy) không hiển thị chữ beginner/intermediate/advanced, nhưng catalog.json có. Bản trước của báo cáo dùng cột "Mức" tự đánh giá và nói không trang nào ghi level; điều đó đã được sửa (xem [kết quả xác minh](#kết-quả-xác-minh-ngày-14112026)). Chỉ Claude Platform 101 lệch so với đánh giá cũ (cũ: "cơ bản đến trung cấp", chính thức: beginner).

Nguồn thời lượng/số bài: các trang <https://academy.claude.com/courses/...> tương ứng, dẫn ở từng mục. Khóa Introduction to MCP và MCP Advanced trên Skilljar liệt kê thêm bài "Welcome to the course", "Course satisfaction survey", "Wrapping up" nên số mục hiển thị ở hai site khác nhau.

## Lộ trình và bài học

### Lộ trình học đề xuất

| Cấp                          | Thứ tự                                                                                                                                    | Lý do                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Cơ bản**                   | 1) Claude 101 (2.5h, có thể bỏ qua nếu đã quen) → 2) Claude Code 101 (1.5h)                                                               | Nền tảng khái niệm, Plan Mode, CLAUDE.md, quyền                         |
| **Trung cấp**                | 3) Introduction to agent skills (1h) → 4) Introduction to subagents (45p) → 5) Claude Code in Action (1h)                                 | Mở rộng Claude Code: skills, subagents, rồi tự động hóa/xác minh/plugin |
| **Trung cấp (API/tích hợp)** | 6) Claude Platform 101 (1.5h; **beginner theo catalog.json**, dù prerequisites cần biết code) → 7) Introduction to MCP (1h; intermediate) | Nếu bạn xây tính năng AI hoặc MCP server riêng                          |
| **Nâng cao**                 | 8) MCP: Advanced topics (1.5h) → 9) AI-native SDLC playbook (~1h)                                                                         | Server production và quản trị quy trình toàn tổ chức                    |

Tổng thời lượng: khoảng 11 giờ 45 phút theo số liệu trên các trang Academy (2.5 + 1.5 + 1 + 1 + 1.5 + 1.5 + 1 + 0.75 + 1 = 11.75 giờ; mang tính ước lượng vì nhiều trang ghi "about"). Thứ tự và cách nhóm cấp ở bảng trên là đề xuất của mình; level chính thức (catalog.json) là: beginner (Claude 101, Claude Code 101, Claude Platform 101), intermediate (Claude Code in Action, Introduction to MCP, agent skills, subagents), advanced (MCP Advanced, SDLC playbook). Các trang khóa học không công bố lộ trình bắt buộc (trừ prerequisites đã dẫn).

### Bài học xuyên khóa

1. **Phân tầng cơ chế kiểm soát.** CLAUDE.md = ngữ cảnh gợi ý; skill = quy trình nạp theo nhu cầu; subagent = cô lập context và quyền; hook = luật tất định; permission rule/managed settings = chặn cứng. Xuất hiện nhất quán ở Claude Code 101, Claude Code in Action, Skills, Subagents và SDLC playbook (<https://code.claude.com/docs/en/memory>, <https://code.claude.com/docs/en/skills>, <https://code.claude.com/docs/en/sub-agents>, <https://claude.com/resources/articles/the-ai-native-sdlc-playbook>).
2. **Context là tài nguyên khan hiếm.** `/clear` giữa tác vụ, compaction, subagent cho việc ồn, skill nạp theo nhu cầu, context editing/caching ở tầng API (<https://code.claude.com/docs/en/best-practices>, <https://platform.claude.com/docs/en/build-with-claude/context-editing>).
3. **Kiểm chứng tự động trước khi tin.** Test/Stop hook/feedback loop/eval (<https://code.claude.com/docs/en/best-practices>, <https://claude.com/resources/articles/the-ai-native-sdlc-playbook>).
4. **Người trong vòng lặp ở các cổng quan trọng.** Spec MCP khuyến nghị người duyệt tool/sampling; Claude Code có permission modes; playbook đặt hook làm cổng duyệt (<https://modelcontextprotocol.io/specification/2025-06-18/server/tools>, <https://code.claude.com/docs/en/permission-modes>).
5. **MCP là lớp kết nối chung.** Từ Claude Code (`claude mcp add`) đến API (MCP connector) và deploy qua CI/CD (<https://code.claude.com/docs/en/mcp>, <https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview>).
6. **Chọn mức tự động hóa theo rủi ro:** thủ công → acceptEdits → plan → auto → headless/CI → managed agents.
7. **Tài liệu thay đổi nhanh.** Có nhiều chỗ lệch giữa nội dung khóa và docs hiện tại (thinking, `/agents`, tên lớp MCP SDK, phiên bản spec). Ví dụ đã xác minh 2026-11-14: `FastMCP` bị đổi tên thành `MCPServer` ở mcp 2.0.0 (không alias); spec MCP đi từ 2025-06-18 qua 2025-11-25 tới 2026-07-28 (bỏ session, roots/sampling/logging Deprecated). Luôn đối chiếu docs trước khi áp dụng.

## Áp dụng vào storefront

- Dùng tài liệu dự án cho ngữ cảnh và skill cho quy trình theo nhu cầu. Áp dụng hook và quyền công cụ cho các giới hạn cần thực thi. Xem [kế hoạch hệ thống agent](../plan/AGENT-SYSTEM-PLAN.md).
- Dùng OpenAPI làm hợp đồng giữa ba repo. Với luồng có rủi ro như thanh toán, giá, tồn kho hoặc Voucher, xác minh bằng test và review của người.
- Các gợi ý về MCP, API hoặc CI cần được đối chiếu với phiên bản runtime và tài liệu chính thức trước khi đưa vào vận hành.

## Kết quả xác minh ngày 14/11/2026

### Tóm tắt nhanh

| #   | Điểm                                                             | Trạng thái                                                                                       |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Nội dung bài giảng, Claude 101                                   | ⚠️ Không thể xác minh (bài giảng sau đăng ký/đăng nhập); đã có thêm nguồn help center để làm nền |
| 2   | Level/độ khó                                                     | ❌ Bác bỏ: có level chính thức trong `catalog.json` của Academy                                  |
| 3   | Đối tượng của skills và subagents                                | ✅ Đã xác minh: không trang nào nêu đối tượng                                                    |
| 4   | SDLC playbook: 12 so với 16 plays, Skilljar                      | ✅ Đã xác minh và đối chiếu được con số                                                          |
| 5   | Ngôn ngữ SDK của Claude Platform 101                             | ⚠️ Không thể xác minh bản nào đúng; xác nhận hai trang mâu thuẫn                                 |
| 6   | MCP Python SDK: `FastMCP` hay `MCPServer`, Context, cờ stateless | ✅ Đã xác minh (đổi tên ở mcp 2.0.0, không có alias)                                             |
| 7   | Phiên bản spec MCP                                               | ✅ Đã xác minh: 2026-07-28 tồn tại và là bản "Current"                                           |
| 8   | Stateless và stateful khi scale                                  | ✅ Đã xác minh bằng trích dẫn trực tiếp                                                          |
| 9   | Các trang docs bị cắt                                            | ✅ Đã đọc đủ các phần còn thiếu                                                                  |
| 10  | Con số/phiên bản Platform                                        | ✅ Khớp báo cáo; có vài điểm cần bổ sung (liệt kê ở dưới)                                        |

---

### 1. Nội dung bài giảng từng bài, đặc biệt Claude 101

**Trạng thái: ⚠️ Không thể xác minh nội dung bài giảng. Có thể bổ sung nền kiến thức cho Claude 101 từ help center.**

Những gì nguồn chính thức cho thấy:

- Trang Skilljar Claude 101 chỉ liệt kê tiêu đề bài, không có mô tả hay transcript. Chữ trên trang: "Register | FREE" và "Already registered? Sign In"; link đăng nhập là `https://anthropic.skilljar.com/auth/login?next=%2Fclaude-101`. Trang không hiện link tới từng bài khi chưa đăng nhập. (<https://anthropic.skilljar.com/claude-101>)
- Trang Academy Claude 101 liệt kê 13 bài kèm link và có nút "Start course" và dòng "Sign in to save progress". Không có văn bản bài giảng. Thử mở URL bài đoán theo slug (`.../claude-101/lessons/introduction-to-projects`) trả 404, nên mình không xác định được liệu từng bài có yêu cầu đăng nhập hay không. (<https://academy.claude.com/courses/claude-101>)
- Repo GitHub của Anthropic không chứa bài giảng của các khóa này. `anthropics/courses` ("Anthropic's educational courses") chỉ có 5 khóa cũ: `anthropic_api_fundamentals`, `prompt_engineering_interactive_tutorial`, `real_world_prompting`, `prompt_evaluations`, `tool_use`, và README ghi các khóa dùng Claude 3 Haiku. Đây không phải nội dung 9 khóa đang xét. `anthropics/skills` có skill `academy-guide` chỉ trỏ tới catalog (xem điểm 2), không có bài giảng. `anthropics/claude-cookbooks` là notebook cookbook, không phải bài giảng Academy.
- Manh mối chưa kiểm chứng: kết quả tìm kiếm trên support.claude.com có các bài help center mang hậu tố tiêu đề "· Claude Academy", ví dụ "Using Research · Claude Academy" (<https://support.claude.com/en/articles/11106443-using-research>) và "Build and share tools in Claude with custom artifacts · Claude Academy" (<https://support.claude.com/en/articles/11649427-use-artifacts-to-visualize-and-create-ai-apps-without-ever-writing-a-line-of-code>). Có thể nội dung dạng bài viết của Academy được đăng song song ở help center. Mình chưa chứng minh được bài nào tương ứng với bài giảng nào.

Nền kiến thức cho Claude 101 từ help center (nguồn chính, đã đọc):

| Tính năng         | Nội dung chính thức                                                                                                                                                                                                                                                                                                                               | Nguồn                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projects          | "Projects allow you to create self-contained workspaces with their own chat histories and knowledge bases." Có knowledge base (tải tài liệu/code), custom instructions riêng từng project, chế độ RAG trên gói trả phí ("expand capacity by up to 10x"), chia sẻ cho Team/Enterprise ở mức "Can view" hoặc "Can edit". Gói Free tối đa 5 project. | <https://support.claude.com/en/articles/9517075-what-are-projects>                                                                                                                                      |
| Artifacts         | Một artifact là sản phẩm độc lập Claude tạo ra (tài liệu, thiết kế, công cụ tương tác nhỏ), mở cạnh khung chat để sửa và chia sẻ; lưu ở tab Artifacts ở sidebar; xuất Word/PDF/Markdown hoặc PowerPoint tùy loại; có trên Free và gói trả phí, cần bật "Create and edit files".                                                                   | <https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them>                                                                                                              |
| Research          | Dành cho nghiên cứu nhiều bước, lâu hơn và có thể tốn nhiều tin nhắn hơn; tìm trên web và các tool đã kết nối (Gmail, Calendar, Docs, connector khác); cần bật web search; trên mobile chỉ tìm web.                                                                                                                                               | <https://support.claude.com/en/articles/11088861-use-research-on-claude>                                                                                                                                |
| Enterprise search | Gói Team và Enterprise; owner phải cài đặt trước (bắt buộc chọn connector cho Documents và Chat, Email là khuyến nghị); mỗi người dùng tự xác thực app; kết quả tôn trọng quyền truy cập ở từng hệ thống. Tối ưu cho tra cứu nhanh, khác với Research.                                                                                            | <https://support.claude.com/en/articles/12489464-use-enterprise-search>                                                                                                                                 |
| Connectors        | Mở rộng khả năng Claude bằng dịch vụ ngoài; custom connector dùng remote MCP.                                                                                                                                                                                                                                                                     | <https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities>, <https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp> |

Lưu ý: bốn dòng cuối của bảng (Artifacts, Research, Enterprise search, Connectors) mình đọc qua kết quả tìm kiếm trên domain support.claude.com chứ chưa mở nguyên văn từng bài; chỉ Projects được mở trực tiếp. Hãy mở link trước khi đưa vào báo cáo dưới dạng trích dẫn.

**Cần sửa trong báo cáo gốc:**

- Giữ nguyên nhận định "nội dung bài giảng không công khai" nhưng nêu rõ lý do: Skilljar chuyển sang đăng nhập/đăng ký, Academy chỉ hiện tiêu đề và link.
- Mục 1 ("Giới hạn nguồn"): thay câu "không tìm được trang tài liệu chính thức nào" bằng bảng trên (các bài help center ở trên là nguồn chính thức đã tồn tại).
- Mục 13 điểm 1: đổi thành "Nội dung bài giảng không công khai khi chưa đăng nhập; phần Claude 101 đã được đối chiếu với help center nhưng chưa phải trích bài giảng".

---

### 2. Level/độ khó

**Trạng thái: ❌ Bác bỏ. Báo cáo cũ sai khi nói "không được nêu trên bất kỳ trang nào".**

Academy công bố catalog dạng JSON, có trường `level` cho từng khóa: <https://academy.claude.com/assets/data/catalog.json> (`schemaVersion: 1`, `generatedAt: 2026-11-12T18:27:45Z`, `staleAfter: 2026-12-12`, `counts: {courses: 29, tutorials: 140, useCases: 156}`). Skill chính thức `academy-guide` của Anthropic ghi rằng catalog này là nguồn để gợi ý khóa và các trường gồm "title, url, summary, kind, level, products, tags, visibility" (<https://github.com/anthropics/skills/blob/main/skills/academy-guide/SKILL.md>, mục "The catalog").

Các trang khóa học (Skilljar, Academy) vẫn không hiển thị chữ beginner/intermediate/advanced, nên báo cáo cũ đúng về "trang khóa học", sai về "bất kỳ trang nào". Skilljar catalog (<https://anthropic.skilljar.com/>) cũng không có bộ lọc level (chỉ có tab Plans/Paths/Courses/Lessons).

Level chính thức của 9 khóa (từ `catalog.json`, tất cả `visibility: public`):

| Khóa                                    | Level chính thức | Cột "Mức" trong báo cáo cũ | Khớp?    |
| --------------------------------------- | ---------------- | -------------------------- | -------- |
| Claude 101                              | beginner         | Cơ bản                     | Khớp     |
| Claude Code 101                         | beginner         | Cơ bản                     | Khớp     |
| Claude Code in action                   | intermediate     | Trung cấp                  | Khớp     |
| Introduction to Model Context Protocol  | intermediate     | Trung cấp                  | Khớp     |
| Claude Platform 101                     | **beginner**     | Cơ bản đến trung cấp       | **Lệch** |
| Model Context Protocol: Advanced topics | advanced         | Nâng cao                   | Khớp     |
| The AI-native SDLC playbook             | advanced         | Nâng cao                   | Khớp     |
| Introduction to agent skills            | intermediate     | Trung cấp                  | Khớp     |
| Introduction to subagents               | intermediate     | Trung cấp                  | Khớp     |

Bổ sung từ catalog: Academy hiện có 29 khóa (Skilljar liệt kê 23), thêm các khóa như "Introduction to evals", "Tool use with the Messages API", "Introduction to Claude Tag", "AI Fluency for pK-12 Train the Trainer", "Building effective human-agent teams (beta)".

**Cần sửa trong báo cáo gốc:**

- Bảng tổng quan (mục 0): đổi cột "Mức (tự đánh giá)" thành "Level (chính thức, catalog.json)" và sửa Claude Platform 101 thành "Beginner". Bỏ chú thích dấu sao nói trang không ghi level.
- Mục 5: dòng "Cơ bản đến trung cấp" thành "Beginner (theo catalog.json)".
- Mục 10 (lộ trình): đặt Claude Platform 101 vào nhóm cơ bản hoặc ghi chú rằng đây là beginner theo Anthropic, dù prerequisites cần biết code.
- Mục 13 điểm 2: xóa hoặc thay bằng "Level lấy từ catalog.json của Academy; trang khóa học không hiển thị".
- Mục 14: thêm `https://academy.claude.com/assets/data/catalog.json` và `https://github.com/anthropics/skills/blob/main/skills/academy-guide/SKILL.md` vào nguồn.

---

### 3. Đối tượng của Introduction to agent skills và Introduction to subagents

**Trạng thái: ✅ Đã xác minh: không có tuyên bố đối tượng chính thức.**

Đã kiểm tra:

- <https://academy.claude.com/courses/introduction-to-agent-skills>: "6 lessons", "1 hr"; không có đối tượng, level hay prerequisites.
- <https://academy.claude.com/courses/introduction-to-subagents>: "4 lessons", "45 min", trang "Course complete" ghi "No completion badge"; không có đối tượng, level hay prerequisites.
- `catalog.json` (mục `summary`):
  - agent skills: "Build, configure, and share skills in Claude Code — reusable markdown instructions that Claude applies automatically to matching tasks. Covers creating your first skill through team distribution and troubleshooting."
  - subagents: "Decompose complex tasks across parallel Claude subagents and orchestrate them deterministically."
    Cả hai đều mô tả nội dung, không nêu đối tượng.
- Trang Skilljar của hai khóa này không được fetch lại trong lượt này (lượt trước đã báo "không nêu").

Hai điều đáng chú ý:

- Câu trong báo cáo mục 9 "Skilljar nói hướng tới người chạy phiên dài" không có cơ sở trong các nguồn đã đọc lại.
- Summary chính thức của subagents nhấn mạnh "parallel" và "orchestrate them deterministically", nghiêng hơn so với mô tả "bảo vệ context" trong báo cáo cũ (mục tiêu khóa trên Skilljar vẫn có phần cửa sổ context riêng).

**Cần sửa trong báo cáo gốc:**

- Giữ "Không nêu đối tượng" cho hai khóa; xóa cụm "(người chạy phiên dài)" ở bảng tổng quan và mục 9.
- Có thể thêm câu summary chính thức ở trên vào mục 8 và mục 9.

---

### 4. The AI-native SDLC playbook: 12 plays so với 16 plays, và Skilljar

**Trạng thái: ✅ Đã xác minh. Hai con số đo hai thứ khác nhau, không mâu thuẫn.**

Bằng chứng:

1. Trang khóa Academy ghi: "Twelve plays for using Claude at each stage of the software development lifecycle (SDLC)" (trùng nguyên văn với `summary` trong `catalog.json`). Đối tượng: "For engineering, platform, and security leads whose organization already uses Claude Code." Thời lượng: "About an hour of reading, with no quiz or completion badge." Level (catalog): advanced. (<https://academy.claude.com/courses/ai-native-sdlc-playbook>)
2. Trang khóa liệt kê 14 bài: Introduction; Plan (1); Design (1); Build (4: plan mode, CLAUDE.md, skills, parallel sessions and subagents); Test (2); Deploy (3); Maintain (1: "Closing the loop on metrics"); Closing. Số bài nội dung (trừ Introduction và Closing) = 1+1+4+2+3+1 = **12**. Đây chính là "twelve plays".
3. Bài viết claude.com **không nêu tổng số plays**. Fetch hai lần với prompt khác nhau: trang không chứa từ "twelve" hoặc "sixteen", và câu gần nhất là "The plays are the core of the playbook and are grouped into six non-linear stages (Plan, Design, Build, Test, Deploy, Maintain)". Tác giả Louis Claxton, ngày August 21, 2026. (<https://claude.com/resources/articles/the-ai-native-sdlc-playbook>)
4. Cấu trúc bài viết (heading theo thứ tự, theo kết quả fetch): `01 Plan` (Capture as intent.md); `02 Design` (Requirements and design); `03 Build` (plan mode as default; Claude Code on auto mode; Legacy systems and the source of truth; The CLAUDE.md; Skills as institutional knowledge; Hooks as build-time guardrails; Parallel sessions and subagents); `04 Test` (feedback loop; Continuous evals in CI); `05 Deploy` (AI in the PR review loop; Hooks as approval gates, kèm ví dụ "Managed settings for a regulated enterprise"; CI/CD integration and deployment); `06 Maintain` (Closing the loop; Recurring codebase scans; Claude on call with Claude Tag).
   Đếm heading con: 1+1+7+2+3+3 = 17; trừ phần sidebar "Legacy systems" = **16**. Như vậy "16" là số lần mình (và công cụ fetch lần trước) đếm heading con, không phải con số do Anthropic công bố.
5. Chênh lệch 12 và 16: khóa học gộp "Auto mode" vào bài plan mode hoặc CLAUDE.md và gộp "Hooks as build-time guardrails", "Recurring codebase scans", "Claude on call" vào các bài liền kề (mình chỉ suy ra từ so sánh danh sách heading với danh sách bài; không có trang nào nói thẳng cách gộp).
6. Skilljar: <https://anthropic.skilljar.com/ai-native-sdlc-playbook> trả **404**, và khóa không có trong catalog Skilljar 23 khóa (<https://anthropic.skilljar.com/>). Khóa chỉ có trên Academy.

Lưu ý: số "6 stage" là số chính thức ở bài viết; "twelve plays" là số chính thức ở trang khóa.

**Cần sửa trong báo cáo gốc:**

- Mục 7 ("Lệch số liệu"): thay đoạn "Mình chưa phân định được" bằng: "Trang khóa nói 12 plays = 12 bài nội dung (14 bài trừ Introduction và Closing). Bài viết không nêu tổng; bản tóm tắt cũ đếm 16 heading con (17 nếu tính sidebar Legacy). Hai con số đo hai thứ khác nhau."
- Mục 7 dòng đầu: giữ "không có trên Skilljar" và thêm "URL Skilljar trả 404".
- Danh sách bài (mục 7): sửa "Maintain (closing the loop on production metrics)" thành tên bài chính thức "Closing the loop on metrics"; bài cuối là "Closing thoughts and resources".
- Mục 13 điểm 4: đổi thành "Bài viết chưa đọc nguyên văn từng đoạn, nhưng cấu trúc heading đã đối chiếu hai lần; con số 12 vs 16 đã giải thích".
- Câu "đọc ~40 phút, có PDF" ở mục 7: mình không thấy trong lượt fetch này; nên đánh dấu "chưa xác nhận lại".

---

### 5. Claude Platform 101: Python hay TypeScript

**Trạng thái: ⚠️ Không thể xác định trang nào đúng. Xác nhận hai trang mâu thuẫn; có thể nói rõ từng trang ghi gì.**

Trích dẫn theo kết quả fetch:

| Trang                                                              | Câu chữ                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Academy (<https://academy.claude.com/courses/claude-platform-101>) | "Most demos use the Python SDK (`anthropic`, installed with pip)." / "The lessons "Your first API call", "What is tool use?" and "Building with Claude Code" use the TypeScript SDK (`@anthropic-ai/sdk`) with Node and npm." / "You don't need to be an expert in either language..." / "Most lessons include a code demo you can adapt for your own projects." |
| Skilljar (<https://anthropic.skilljar.com/claude-platform-101>)    | "The demos use the TypeScript SDK (`@anthropic-ai/sdk`) with Node and npm." / "You don't need to be a TypeScript expert..." / "The platform also offers a Python SDK; the course examples are in TypeScript." / "Every lesson ends with a runnable demo, so you finish each one with working code."                                                              |

Quan sát:

- Hai trang khác nhau cả về số lượng demo ("Most lessons" so với "Every lesson") và về ngôn ngữ, nên rất có thể là hai phiên bản nội dung khác nhau (một trang chưa cập nhật). Mình **không có nguồn nào nói bản nào mới hơn**; việc ưu tiên Academy chỉ là suy đoán vì đó là site mới hơn.
- Tiêu đề bài trên hai trang giống nhau (13 bài). Skilljar nhóm module: What is the Claude Platform / Teaching your Agent / Extending your Agent / Managed Agents / Building with Claude Code, cộng "Claude Platform 101 Quiz". Tiêu đề bài không gợi ý ngôn ngữ.
- Trang Academy nêu cụ thể 3 bài TypeScript ("Your first API call", "What is tool use?", "Building with Claude Code"); phần còn lại Python.
- Level chính thức của khóa: beginner (xem điểm 2). Trang Skilljar nêu thêm: "You don't need prior experience building with LLMs." và "You don't need prior agent experience".

**Cần sửa trong báo cáo gốc:**

- Mục 5 prerequisites: nêu rõ cả hai câu trích trên thay vì tóm tắt. Giữ kết luận "chưa xác định bản nào đúng" nhưng bỏ cụm "mình ưu tiên mô tả của Academy" (không có cơ sở).
- Gợi ý cho người học: chuẩn bị cả Node/npm lẫn Python 3 vì cả hai nguồn đều nhắc TypeScript SDK.
- Mục 13 điểm 5: giữ, thêm "đã đọc lại cả hai trang, vẫn mâu thuẫn".

---

### 6. MCP Python SDK: `FastMCP`, `MCPServer`, Context, cờ stateless và JSON response

**Trạng thái: ✅ Đã xác minh từ mã nguồn và release notes.**

Kết luận: `FastMCP` **đã bị đổi tên thành `MCPServer`** ở bản **mcp 2.0.0 (phát hành 2026-07-28)**. Không có alias: import cũ sẽ lỗi. Nhánh `v1.x` vẫn giữ `FastMCP`.

Bằng chứng:

- Release `v2.0.0` ("MCP Python SDK v2 Stable Release", 2026-07-28T13:41:36Z): "`FastMCP` is now `MCPServer`, and there is a first-class `Client`. The decorator API is unchanged"; "`pip install mcp` now installs 2.x"; "v1.x is in maintenance mode and will only receive security fixes". Các bản sau: v2.1.0, v2.1.1, v2.0.1, v2.2.0, v2.3.0 (2026-10-02, mới nhất mình thấy); nhánh v1: v1.29.1, v1.30.0 (2026-09-07). (<https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0>)
- `src/mcp/server/fastmcp.py` trên `main` chỉ còn một docstring và `raise ModuleNotFoundError`: "Removed in mcp 2: `FastMCP` is now `mcp.server.mcpserver.MCPServer`." và thông báo "This is mcp 2.x, where FastMCP was renamed to MCPServer (from mcp.server.mcpserver import MCPServer)... or pin 'mcp<2' to keep running v1 code." (<https://github.com/modelcontextprotocol/python-sdk/blob/main/src/mcp/server/fastmcp.py>)
- Mã `MCPServer` ở `src/mcp/server/mcpserver/server.py`; `Context` ở `src/mcp/server/mcpserver/context.py`. README `main` dùng `from mcp.server import MCPServer` và `mcp = MCPServer("Demo")`. (<https://github.com/modelcontextprotocol/python-sdk/blob/main/README.md>)
- Hướng dẫn migration: mục "FastMCP renamed to MCPServer"; mọi submodule `mcp.server.fastmcp.*` chuyển sang `mcp.server.mcpserver.*`; `ctx.fastmcp` thành `ctx.mcp_server`; tên mặc định server đổi từ `FastMCP` sang `mcp-server`. (<https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/migration.md>, quanh dòng 645-711)
- **Context object** (có ở cả v1 và v2): `report_progress(progress, total=None, message=None)`, `log(...)`, `debug/info/warning/error(...)`. v2 `Context` còn có `elicit`, `elicit_url`, `read_resource`, `notify_tools_changed`... (<https://github.com/modelcontextprotocol/python-sdk/blob/main/src/mcp/server/mcpserver/context.py>, dòng 120, 265, 374-389). Trong v1.x: `Context` ở `src/mcp/server/fastmcp/server.py` (dòng 1133), `report_progress` (1197), `log` (1299), `info(message, **extra)` (1380).
- **Cờ `stateless_http` / `json_response`**:
  - v1.x: là tham số của `FastMCP(...)` (constructor), kèm docstring "Define if the server should create a new transport per request." (`v1.x/src/mcp/server/fastmcp/server.py` dòng 110-112, 177-178). `StreamableHTTPSessionManager(stateless=...)`: "creates a completely fresh transport for each request with no session tracking".
  - v2: **không còn ở constructor**, chuyển sang `run(...)` / `streamable_http_app(...)` (và `run_streamable_http_async`): "`MCPServer("x", port=9000)` is a `TypeError`" (<https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/whats-new.md> dòng 123).
  - Ý nghĩa: `json_response=True` trả mỗi POST bằng một JSON; khi đó tool gọi ngược client giữa chừng (`ctx.elicit()`, sampling) ném `NoBackChannelError` và "progress from `ctx.report_progress()`, per-call log messages" bị bỏ (<https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/run/index.md> dòng 68). `stateless_http=True`: "a fresh transport per request, no session tracking" (dòng 69).
- Ảnh hưởng tới khóa: trang khóa Advanced (Skilljar và Academy) **không nhắc** `FastMCP`, `MCPServer`, phiên bản SDK; chỉ nhắc "context objects, logging callbacks, and progress reporting". Vì vậy mình **không xác định được khóa dạy tên lớp nào**. Danh từ "context objects, logging callbacks" khớp API Context kiểu v1 nhưng cũng tồn tại ở v2.

**Cần sửa trong báo cáo gốc:**

- Mục 4: câu "README hiện tại dùng lớp MCPServer; khóa học có thể dùng FastMCP ở phiên bản SDK cũ hơn" thay bằng: "`FastMCP` được đổi tên thành `MCPServer` ở mcp 2.0.0 (2026-07-28), không có alias, nhánh v1.x (mới nhất v1.30.0) vẫn dùng `FastMCP`. Trang khóa không nêu tên lớp hay phiên bản."
- Mục 4: ví dụ `mcp = MCPServer("Demo")` kèm ghi chú import v1: `from mcp.server.fastmcp import FastMCP`; v2: `from mcp.server.mcpserver import MCPServer`.
- Mục 6 phần "Log and progress": thay "Mình không xác minh được API Context" bằng `ctx.report_progress(progress, total, message)`, `ctx.info/debug/warning/error`, `ctx.log`.
- Mục 6 phần "State and StreamableHTTP": thay "cờ ... không xác minh được tên cờ" bằng `stateless_http` và `json_response` (v1: constructor; v2: `run()`/`streamable_http_app()`).
- Mục 13 điểm 6: đánh dấu đã xác minh.
- Mục 14: thêm các file GitHub ở trên và `docs/migration.md`, `docs/whats-new.md`, `docs/run/index.md`.

---

### 7. Phiên bản spec MCP

**Trạng thái: ✅ Đã xác minh. 2026-07-28 tồn tại và là bản "Current".**

- Trang versioning: "The **current** protocol version is **2026-07-28**." Các phiên bản đánh dấu Draft / Current / Final. (<https://modelcontextprotocol.io/specification/versioning>)
- Bản trước: **2025-11-25** (báo cáo cũ không nhắc). Changelog 2026-07-28 liệt kê thay đổi "since the previous revision, 2025-11-25". Các bản cũ khác: 2025-06-18, 2025-03-26, 2024-11-05. (`llms.txt` của modelcontextprotocol.io có tài liệu cho cả năm phiên bản và `draft`.)
- Changelog đầy đủ: <https://modelcontextprotocol.io/specification/2026-07-28/changelog>.

Thay đổi chính ảnh hưởng tới chủ đề các khóa (so với 2025-06-18, qua 2025-11-25):

| Chủ đề khóa       | Thay đổi ở 2026-07-28 (trích)                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Session / state   | "Remove protocol-level sessions and the `Mcp-Session-Id` header from the Streamable HTTP transport."                                                                                                                                                                                                                                                                                                                                                                                 |
| Khởi tạo          | "Make MCP stateless: remove the `initialize`/`notifications/initialized` handshake. Every request now carries its protocol version and client capabilities in `_meta`." Thêm RPC bắt buộc `server/discover`.                                                                                                                                                                                                                                                                         |
| Transport         | Bỏ HTTP GET endpoint và `resources/subscribe`; thay bằng `subscriptions/listen`. Bỏ resume SSE (`Last-Event-ID`). HTTP+SSE (2024-11-05) chuyển sang Deprecated. Header `Mcp-Method`/`Mcp-Name` bắt buộc ở POST. stdio vẫn còn.                                                                                                                                                                                                                                                       |
| Sampling, roots   | Server không còn gửi request độc lập; thay bằng Multi Round-Trip Requests (MRTR): server trả `InputRequiredResult`, client retry kèm `inputResponses`. Roots, Sampling và Logging **được đánh dấu Deprecated** ("remain fully functional during the deprecation window but new implementations should not add support"). Gợi ý thay thế: Roots thành tham số tool/resource URI/config; Sampling thành gọi trực tiếp API nhà cung cấp LLM; Logging thành `stderr` hoặc OpenTelemetry. |
| Logging, progress | Bỏ `logging/setLevel`, `ping`, `notifications/roots/list_changed`; log level đặt theo từng request qua `_meta` `io.modelcontextprotocol/logLevel`. `notifications/progress` và `notifications/message` vẫn chạy trên response stream của chính request.                                                                                                                                                                                                                              |
| Khác              | Tasks chuyển thành extension; `ttlMs`/`cacheScope` trên list; DCR (RFC 7591) deprecated, ưu tiên Client ID Metadata Documents; thêm quy tắc mã lỗi `-32020` đến `-32099`.                                                                                                                                                                                                                                                                                                            |

Quan trọng cho người học: chủ đề của khóa Advanced (sampling, roots, notifications, "dual-connection architectures", session) mô tả giao thức đời 2025. Khóa Advanced vì thế dạy kiến thức vẫn đúng với server/client đời 2025 (SDK Python v2 vẫn phục vụ client đời 2025 từ cùng một `MCPServer`, theo release notes v2.0.0), nhưng đó không còn là hướng mới: roots, sampling, logging đã deprecated.

**Cần sửa trong báo cáo gốc:**

- Mục 4 và 6: ghi rõ tiêu đề "theo spec 2025-06-18 (bản trước, vẫn được phục vụ bởi SDK mới)". Thêm hộp "Khác biệt ở 2026-07-28" dùng bảng trên.
- Mục 4 "Bài học rút ra" cuối: thay câu "Inspector docs nhắc phiên bản 2026-07-28" bằng "2026-07-28 là bản Current; 2025-11-25 là bản Final liền trước".
- Mục 6: sửa mô tả transport cho khớp hai kỷ nguyên (xem bảng) và nhắc roots/sampling/logging đã Deprecated.
- Mục 13 điểm 7: đánh dấu đã xác minh; nội dung khóa vẫn chưa biết dạy theo phiên bản nào.
- Mục 11 bài học số 7 (tài liệu thay đổi nhanh): thêm ví dụ này.

---

### 8. Stateless và stateful khi scale ngang

**Trạng thái: ✅ Đã xác minh. Có trích dẫn trực tiếp từ spec, SEP và tài liệu SDK; suy luận trong báo cáo cũ đúng.**

Nguồn trực tiếp:

1. Trang khóa Advanced nói thẳng chủ đề này: "stateless HTTP for horizontal scaling with load balancers" và "stateful and stateless server configurations", kèm "session management and dual-connection architectures". Bài học "State and the StreamableHTTP transport". (<https://anthropic.skilljar.com/model-context-protocol-advanced-topics>, <https://academy.claude.com/courses/model-context-protocol-advanced-topics>)
2. Spec 2025-06-18 (mục Session Management) **không** có câu nào nói về load balancer hay scale; chỉ quy định `Mcp-Session-Id` (MAY gán, MUST gửi lại, 404 khi session bị hủy, DELETE để kết thúc). Vì vậy suy luận ở đây không có trong spec đó. (<https://modelcontextprotocol.io/specification/2025-06-18/basic/transports>)
3. SEP-2575 "Make MCP Stateless" (nền tảng của spec 2026-07-28) nói: "This inherent statefulness makes it difficult to run MCP at scale. Placing an MCP server behind a standard load balancer, for example, is challenging because a client's session is coupled to the specific server instance holding its state." Giải pháp hiện hữu là "sticky sessions, which bind a client to a specific server. This complicates infrastructure, can lead to uneven load distribution". Kết quả mong muốn: "enables straightforward horizontal scaling and improves resilience, as any request can be handled by any server instance." (<https://modelcontextprotocol.io/seps/2575-stateless-mcp>)
4. Spec 2026-07-28, mục "Statelessness": "The Model Context Protocol (MCP) is a **stateless protocol**: all the information needed to process a request is contained in the request itself." và "Servers **SHOULD NOT** require that a client reuse the same connection or process to perform related operations." (<https://modelcontextprotocol.io/specification/2026-07-28/basic>)
5. Tài liệu Python SDK v2: "Over Streamable HTTP there is no `Mcp-Session-Id` on the 2026 path, which is the operational headline: **nothing ties a modern request to a worker**, so any replica behind a plain round-robin load balancer can answer it. ... Your 2025-era clients ... still open sessions and still need whatever stickiness they needed on v1." Ngoại lệ: MRTR retry cần `request_state` đã niêm phong, khóa mặc định tạo theo tiến trình, nên scale-out phải cấu hình `RequestStateSecurity(keys=[...])`. Cũng ghi rõ: "`stateless_http=True` is unrelated: it only affects how 2025-era clients are served, and 2026 traffic never reads it". (<https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/whats-new.md> dòng 159)
6. Về "không có session thì server-initiated request khó thực hiện": đúng ở mức SDK, vì `stateless_http` hoặc `json_response` làm `ctx.elicit()`/sampling ném `NoBackChannelError` (xem điểm 6). Ở spec 2026-07-28, server-initiated request được thay bằng MRTR nên không còn là hạn chế theo cách đó.

**Cần sửa trong báo cáo gốc:**

- Mục 6 "State and StreamableHTTP": thay phần "suy luận của mình, chưa có trích dẫn trực tiếp" bằng các trích dẫn 1, 3, 5. Tách rõ hai đời: đời 2025 (stateful cần sticky routing hoặc chia sẻ session, stateless dùng `stateless_http`) và đời 2026 (không còn session, mọi replica trả lời được).
- Mục 6 "Bài học rút ra" cuối: câu "cân nhắc stateless để scale" kèm nguồn SEP-2575.
- Mục 13 điểm 8: đánh dấu đã xác minh.

---

### 9. Các trang docs bị cắt: đọc lại theo đoạn

**Trạng thái: ✅ Đã đọc đủ các phần còn thiếu (qua bản `.md` thô của từng trang).**

#### 9.1 Skills: "Skill not triggering" và "Claude stops following a skill"

(<https://code.claude.com/docs/en/skills>, mục `## Troubleshooting`, dòng 1193-1250 của bản `.md`)

- **Skill not triggering:** (1) kiểm tra description có từ khóa người dùng hay nói; (2) xác nhận skill nằm trong `What skills are available?`; (3) diễn đạt lại yêu cầu cho gần description; (4) gọi trực tiếp `/skill-name` nếu skill user-invocable; (5) nếu `/skill-name` cũng không nhận, kiểm tra tên bị từ chối; (6) nếu skill có `paths`, các file Claude đọc/sửa phải nằm trong thư mục làm việc hiện tại (ví dụ worktree anh em không kích hoạt, kể cả khi `/add-dir`). YAML hỏng thì thân skill vẫn nạp nhưng metadata rỗng, `/skill-name` vẫn chạy, chạy `--debug` để xem lỗi parse. Có `claude plugin validate .claude/skills` (v2.1.233+) và eval `claude plugin eval` với grader `tool_used: Skill`.
- **Skill triggers too often:** làm description cụ thể hơn; thêm `disable-model-invocation: true`.
- **Claude stops following a skill:** (a) quy tắc phải luôn đúng thì chuyển sang hook (có thể khai báo trong `hooks` frontmatter của skill); (b) hướng dẫn cần phán đoán thì viết áp cho cả tác vụ ("Run the tests after every edit") vì Claude Code không đọc lại file ở các lượt sau; (c) sau compaction thì gọi lại skill để khôi phục đầy đủ, vì chỉ giữ phần đầu của skill đã gọi, nên để chỉ dẫn quan trọng nhất ở đầu `SKILL.md`.
- **Skill descriptions are cut short:** danh sách tên+mô tả có ngân sách ký tự bằng 1% context window; khi tràn thì bỏ mô tả của skill ít dùng nhất; chỉnh bằng `skillListingBudgetFraction` hoặc `SLASH_COMMAND_TOOL_CHAR_BUDGET`; mỗi mục cắt ở 1.536 ký tự (cấu hình `skillListingMaxDescChars`); `/doctor` và `/skill-doctor` để xem chi phí.
- Mục khác: ký tự `<` `>` trong description hiển thị thành `&lt;` `&gt;`; skill cá nhân "biến mất" thì tìm trong `~/.claude/skills/.trash/`.

#### 9.2 Chi phí subagent

(<https://code.claude.com/docs/en/best-practices>, mục `### Know what subagents cost`, dòng 445)
Claude tự giao việc cho subagent (Explore cho tìm kiếm rộng, fork cho việc phụ, mặc định chạy nền). "What they cost you is mostly tokens, since every subagent sends its own requests and they count against the same usage as your main conversation. Sometimes it's time as well: a fresh subagent first has to gather context ... so it can end up _slower_." Mặc định dùng cùng model hoặc nhỏ hơn, "You get parallelism or a fresh pair of eyes ... but not a smarter answer." Cách giảm chi phí: `model: haiku` cho việc đơn giản, yêu cầu trả tóm tắt ngắn, xem `/usage` theo loại subagent, giới hạn `tools: Read, Grep, Glob` (do Claude Code ép chứ không phải lời nhắc). Có ví dụ `.claude/agents/reviewer.md`.

#### 9.3 MCP tool search

(<https://code.claude.com/docs/en/mcp>, `## Scale with MCP tool search` dòng 1736 và `### Configure tool search` dòng 1790)
Tool search hoãn nạp định nghĩa tool đến khi cần: "Only tool names and server instructions load at session start". Bật mặc định. Dùng trên Opus 4, Sonnet 4, Haiku 4.5 trở lên; model cũ hơn nạp hết. Biến `ENABLE_TOOL_SEARCH`: bỏ trống/`true` (hoãn tất cả), `auto` (nạp sớm khi định nghĩa dưới 10% context, từ 10% trở lên bật tool search), `auto:N` (ngưỡng N%), `false` (nạp hết). Tắt riêng bằng `permissions.deny: ["ToolSearch"]`. `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` giữ tool search tắt; phiên cấu hình HIPAA thì tắt; không hỗ trợ trên Microsoft Foundry hosted on Azure (tự nạp sớm).

#### 9.4 Permission modes

(<https://code.claude.com/docs/en/permission-modes>, đầu trang, dòng 556-573 cho phần fallback)
Sáu mode `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, khớp bảng trong báo cáo. Các điểm bổ sung/chỉnh:

- `plan`: ngoài đọc còn "classifier-approved commands when auto mode is available".
- `dontAsk`: "File reads inside your working directories and pre-approved tools"; mọi thứ cần hỏi bị từ chối.
- Auto mode: mặc định cho Team và Enterprise, admin tắt bằng `permissions.disableAutoMode: "disable"`; yêu cầu model (API: Opus 4.6+, Sonnet 4.6+, Haiku 5.5 hoặc Fable; Bedrock/Google Cloud/Foundry: Sonnet 5+, Opus 4.7+, Haiku 5.5 hoặc Fable; Sonnet 4.5, Opus 4.5, Haiku 4.5, claude-3 không hỗ trợ). **Từ Claude Code v2.1.283, auto mode là mode khởi đầu tích hợp cho phiên terminal và VS Code tương tác.**
- "if the classifier blocks an action 3 times in a row or 20 times total, auto mode pauses" và ngưỡng không cấu hình được: khớp báo cáo.
- Trang có thêm mục Protected paths và Critical paths (các lệnh xóa), chưa có trong báo cáo.

#### 9.5 Hooks guide

(<https://code.claude.com/docs/en/hooks-guide>, `## Limitations and troubleshooting` dòng 934)
Giới hạn: command hook chỉ giao tiếp qua stdout/stderr/exit code; timeout mặc định 10 phút (`command`, `http`, `mcp_tool`), 30 giây cho `UserPromptSubmit`/`PreModelSwitch`/`PostModelSwitch`, 10 giây `MessageDisplay`, `prompt` 30 giây, `agent` 60 giây, `SessionEnd` chia nhau 1,5 giây; `PostToolUse` không hoàn tác được; `Stop` hook chạy mỗi lần Claude trả lời xong (không chạy khi người dùng ngắt); nhiều hook `PreToolUse` cùng `updatedInput` thì không đảm bảo thứ tự. Hooks và permission mode: hook trả `"deny"` chặn tool ở **mọi** mode kể cả `bypassPermissions`; hook trả `"allow"` không vượt được deny rule. Cũng có các kiểu hook ngoài command: prompt-based, agent-based, HTTP. Troubleshooting: hook không chạy, lỗi JSON, Stop hook chạm block cap, JSON bị ảnh hưởng bởi shell profile.

#### 9.6 Prompt caching

(<https://platform.claude.com/docs/en/build-with-claude/prompt-caching>)
Hai kiểu: automatic caching (một `cache_control` ở cấp request) và explicit breakpoints; "You can define up to 4 cache breakpoints" (dòng 589); ghi 5 phút 1,25x, 1 giờ 2x, đọc 0,1x, riêng Opus 5.5 và Sonnet 5.5 là 0,05x (dòng 280); ngưỡng tối thiểu 512 token cho các model 5.x trong đó có Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5 (dòng 617). Khớp báo cáo. Thay đổi thinking/effort làm mất cache.

#### 9.7 Context editing

(<https://platform.claude.com/docs/en/build-with-claude/context-editing>)
Beta, header `context-management-2025-06-27` (dòng 60); với tool result clearing: `trigger` mặc định 100.000 input token, `keep` mặc định 3 tool use, `clear_at_least` mặc định không có, `exclude_tools` (dòng 1760-1765). "For most use cases, server-side compaction is the primary strategy." Tool result clearing làm mất cache nên dùng `clear_at_least`. Khớp báo cáo.

#### 9.8 Best practices

(<https://code.claude.com/docs/en/best-practices>)
Có thêm điểm cần biết: "new terminal and VS Code sessions start in auto mode"; Claude tự giao việc cho subagent và tự compaction; các mục `Keep CLAUDE.md short`, `Enforce the check with a Stop hook`, `Enforce steps with hooks`, `Keep cost and context down`, `Run sessions in parallel`.

**Cần sửa trong báo cáo gốc:**

- Mục 8 "Troubleshooting": thay đoạn "chưa đọc được" bằng 9.1.
- Mục 9: thay "mình chưa đọc chi tiết mục này" bằng 9.2.
- Mục 2/3 (permission modes): thêm câu về auto mode là mode khởi đầu từ v2.1.283 và yêu cầu model; chỉnh mô tả `plan` và `dontAsk`.
- Mục 13 điểm 9: đánh dấu đã đọc; ghi chú "dùng bản `.md` thô để tránh bị cắt".
- Thêm mục tool search vào mục 2 bài 11 (MCP) hoặc mục 3.

---

### 10. Con số, tên model, giá và header beta của Platform

**Trạng thái: ✅ Các con số trong báo cáo khớp trang hiện tại. Có vài điểm cần bổ sung, không có số nào sai.**

Đối chiếu với <https://platform.claude.com/docs/en/about-claude/models/overview> (nay chuyển hướng về `/docs/en/models/overview`), <https://platform.claude.com/docs/en/about-claude/pricing> và các trang liên quan:

| Mục                  | Báo cáo                                                                               | Trang hiện tại                                                                                                                                                                                                      | Kết quả                                   |
| -------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Fable 5.2            | `claude-fable-5-2`, $8 / $40                                                          | Giống                                                                                                                                                                                                               | Khớp                                      |
| Opus 5.5             | `claude-opus-5-5`, $4 / $20                                                           | Giống                                                                                                                                                                                                               | Khớp                                      |
| Sonnet 5.5           | `claude-sonnet-5-5`, $2 / $10                                                         | Giống                                                                                                                                                                                                               | Khớp                                      |
| Haiku 5.5            | `claude-haiku-5-5`, từ $0.10 / từ $0.50                                               | Giống ("From $0.10 / From $0.50"); trang Pricing giải thích: prompt trên 100.000 token tính giá cao hơn, $0.25 / $1.25                                                                                              | Khớp, nên giải thích "từ"                 |
| Context / max output | 1M / 128K                                                                             | 1M / 128K cho cả bốn                                                                                                                                                                                                | Khớp                                      |
| Khuyến nghị          | bắt đầu với Opus 5.5                                                                  | "start with Claude Opus 5.5 for most workloads"                                                                                                                                                                     | Khớp                                      |
| Prompt caching       | 1,25x / 2x / 0,1x (0,05x cho Opus 5.5 và Sonnet 5.5); tối đa 4 breakpoint; ngưỡng 512 | Khớp (xem 9.6)                                                                                                                                                                                                      | Khớp                                      |
| Context editing      | header `context-management-2025-06-27`; trigger 100.000; giữ 3                        | Khớp (xem 9.7)                                                                                                                                                                                                      | Khớp                                      |
| Managed Agents       | beta, header `managed-agents-2026-04-01`; không ZDR/HIPAA trừ self-hosted             | Giống ("Not eligible for ZDR, except for self-hosted Managed Agents"; beta trên mọi model)                                                                                                                          | Khớp                                      |
| Thinking             | `budget_tokens` bị từ chối từ 4.7 trở lên                                             | Bảng ở trang Thinking: `"enabled"` với `budget_tokens` trả "400 error" cho Opus 4.7, 4.8, 5, 5.5, Sonnet 5, 5.5, Haiku 5.5, Fable, Mythos; Extended thinking chỉ còn hỗ trợ model cũ (Opus 4.6, Sonnet 4.6, 4.5...) | Khớp; model 4.6 vẫn nhận nhưng deprecated |

Điểm cần bổ sung hoặc đổi:

- URL: trang thinking chính nay là <https://platform.claude.com/docs/en/build-with-claude/thinking>; trang `extended-thinking` chỉ còn mô tả "manual extended thinking ... on Claude models that support it, and migrate to adaptive thinking".
- Bảng "All models" có thêm Claude Mythos 5.2/5.1/5 (limited availability, $8-10 / $40-50), Fable 5.1/5, Opus 5 ($5/$25), Sonnet 5 ($2/$10), Opus 4.x; Opus 5.5 hiện cho thời hạn ngừng hỗ trợ "Not sooner than September 22, 2027", Sonnet 5.5 "September 28, 2027", Haiku 5.5 "October 7, 2027", Fable 5.2 "November 9, 2027".
- Mặc định effort: Fable 5.2 và Sonnet 5.5 `high`, Opus 5.5 và Haiku 5.5 `medium`; Sonnet 5.5 có thêm `thinking: {type: "between_tools"}`; Haiku 5.5 và Opus 5 cho tắt thinking ở effort `high` trở xuống.
- Cache read 0,05x áp dụng cho Opus 5.5 và Sonnet 5.5 (Fable 5.2 và 5.1 là 0,025x); báo cáo chỉ nhắc 0,05x cho Opus/Sonnet.
- Message Batches: giảm 50%; batch hỗ trợ output tới 300k với header `output-300k-2026-03-24` (chưa có trong báo cáo).
- Auto mode (Claude Code) yêu cầu Haiku 5.5 hoặc Fable, xem 9.4.

**Cần sửa trong báo cáo gốc:**

- Mục 5 bảng model: thêm chú thích Haiku 5.5 trên 100.000 token tính $0.25 / $1.25; thêm cột hoặc dòng ghi thời hạn retire và cache read 0,025x cho Fable.
- Mục 5 "What is thinking?": trỏ tới trang `/build-with-claude/thinking` thay vì chỉ `extended-thinking`, và ghi rõ bảng 400 error.
- Mục 13 điểm 10: giữ cảnh báo "thay đổi nhanh" nhưng ghi "đã đối chiếu lại ngày 2026-11-14, khớp".

---

## Những điều vẫn chưa xác minh được sau lượt này

- Nội dung từng bài giảng (video/văn bản) của cả 9 khóa: không công khai khi chưa đăng nhập.
- Ngôn ngữ SDK nào là đúng cho Claude Platform 101 (hai trang mâu thuẫn, chưa có nguồn xác định bản mới hơn).
- Tên lớp (`FastMCP` hay `MCPServer`) và phiên bản spec mà khóa MCP Advanced thực sự dạy: trang khóa không nêu.
- Ba bài help center về Artifacts, Research, Enterprise search và Connectors mới được đọc qua kết quả tìm kiếm trên domain chính thức, chưa mở nguyên văn.
- Việc gộp 16 heading con của bài viết thành 12 bài của khóa: mình suy ra từ so sánh danh sách, không có trang nào nói thẳng.
- Câu "Louis Claxton ... đọc ~40 phút, có PDF": ngày và tác giả đã xác nhận, còn "~40 phút" và "PDF" thì lượt này chưa thấy.

## Danh mục nguồn chính

**Trang khóa học:** <https://anthropic.skilljar.com/> · <https://anthropic.skilljar.com/claude-101> · <https://anthropic.skilljar.com/claude-code-101> · <https://anthropic.skilljar.com/claude-code-in-action> · <https://anthropic.skilljar.com/introduction-to-model-context-protocol> · <https://anthropic.skilljar.com/claude-platform-101> · <https://anthropic.skilljar.com/model-context-protocol-advanced-topics> · <https://anthropic.skilljar.com/introduction-to-agent-skills> · <https://anthropic.skilljar.com/introduction-to-subagents> · <https://academy.claude.com/courses/claude-101> · <https://academy.claude.com/courses/claude-code-101> · <https://academy.claude.com/courses/claude-code-in-action> · <https://academy.claude.com/courses/introduction-to-model-context-protocol> · <https://academy.claude.com/courses/claude-platform-101> · <https://academy.claude.com/courses/model-context-protocol-advanced-topics> · <https://academy.claude.com/courses/introduction-to-agent-skills> · <https://academy.claude.com/courses/introduction-to-subagents> · <https://academy.claude.com/courses/ai-native-sdlc-playbook> · <https://claude.com/resources/articles/the-ai-native-sdlc-playbook> · <https://academy.claude.com/assets/data/catalog.json> · <https://github.com/anthropics/skills/blob/main/skills/academy-guide/SKILL.md>

**Help center (thêm 2026-11-14):** <https://support.claude.com/en/articles/9517075-what-are-projects> (đã mở) · <https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them> · <https://support.claude.com/en/articles/11088861-use-research-on-claude> · <https://support.claude.com/en/articles/12489464-use-enterprise-search> · <https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities> · <https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp> (5 bài cuối chỉ thấy qua kết quả tìm kiếm)

**Tài liệu Claude Code:** <https://code.claude.com/docs/en/common-workflows> · <https://code.claude.com/docs/en/best-practices> · <https://code.claude.com/docs/en/memory> · <https://code.claude.com/docs/en/permission-modes> · <https://code.claude.com/docs/en/hooks-guide> · <https://code.claude.com/docs/en/skills> · <https://code.claude.com/docs/en/sub-agents> · <https://code.claude.com/docs/en/mcp> · <https://code.claude.com/docs/en/plugins> · <https://code.claude.com/docs/en/headless> · <https://code.claude.com/docs/en/github-actions>

**Tài liệu Claude Platform:** <https://platform.claude.com/docs/en/about-claude/models/overview> · <https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview> · <https://platform.claude.com/docs/en/build-with-claude/extended-thinking> · <https://platform.claude.com/docs/en/build-with-claude/prompt-caching> · <https://platform.claude.com/docs/en/build-with-claude/context-editing> · <https://platform.claude.com/docs/en/managed-agents/overview> · <https://platform.claude.com/docs/en/build-with-claude/thinking> · <https://platform.claude.com/docs/en/about-claude/pricing>

**MCP:** <https://modelcontextprotocol.io/specification/2025-06-18/server/tools> · <https://modelcontextprotocol.io/specification/2025-06-18/server/resources> · <https://modelcontextprotocol.io/specification/2025-06-18/server/prompts> · <https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/logging> · <https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/progress> · <https://modelcontextprotocol.io/specification/2025-06-18/client/sampling> · <https://modelcontextprotocol.io/specification/2025-06-18/client/roots> · <https://modelcontextprotocol.io/specification/2025-06-18/basic/transports> · <https://modelcontextprotocol.io/docs/tools/inspector> · <https://github.com/modelcontextprotocol/python-sdk> · <https://modelcontextprotocol.io/specification/versioning> · <https://modelcontextprotocol.io/specification/2026-07-28/changelog> · <https://modelcontextprotocol.io/specification/2026-07-28/basic> · <https://modelcontextprotocol.io/seps/2575-stateless-mcp>

**MCP Python SDK (thêm 2026-11-14):** <https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0> · <https://github.com/modelcontextprotocol/python-sdk/blob/main/src/mcp/server/fastmcp.py> · <https://github.com/modelcontextprotocol/python-sdk/blob/main/src/mcp/server/mcpserver/context.py> · <https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/migration.md> · <https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/whats-new.md> · <https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/run/index.md> · <https://github.com/modelcontextprotocol/python-sdk/blob/main/README.md>
