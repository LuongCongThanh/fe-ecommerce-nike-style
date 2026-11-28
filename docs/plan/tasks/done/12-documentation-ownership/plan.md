# Kế hoạch hoàn thiện repo và tổ chức lại tài liệu storefront

Ngày đối chiếu: 18/11/2026. Phạm vi đã được chủ repo chốt: hoàn thiện repo, workflow và docs trước; tích hợp API thật cho luồng mua hàng thuộc lộ trình sản phẩm riêng.

Đây là kế hoạch triển khai tiếp theo, không phải thông báo mọi bước đã hoàn thành. Nguồn điều phối là [map hiện tại](../07-workflow-structure-map/spec.md); không tạo thêm một master plan cạnh tranh với map.

## 1. Đích đến và tiêu chí hoàn tất

Người mới đọc README và docs index phải trả lời được: đây là sản phẩm gì, code hiện làm được gì, phần nào dùng API thật/mock, chạy local cần gì, code nằm ở đâu và việc gì còn chưa làm.

Hoàn tất rebuild của đợt này khi:

- Source giữ kiến trúc hiện tại app/features/shared/API, các ngoại lệ có chủ sở hữu; không còn hướng dẫn bắt người đọc đi theo cây monorepo đã xóa.
- Workflow tương tác, runner và CI có cùng nghĩa cho trạng thái, quyền Git, gate, resume và bàn giao. Điều chưa có trong runtime phải ghi là backlog.
- Có một nơi chuẩn cho mỗi nhóm quy tắc; tài liệu khác dẫn tới nơi đó, không chép lại toàn bộ.
- Bộ đọc chính không quá 6 trang: README root, docs index, overview, architecture, API integration, roadmap. CONTRIBUTING/design và tài liệu vận hành đọc khi làm đúng loại việc.
- Không còn link/anchor nội bộ hoặc đường dẫn trong prompt trỏ vào tài liệu bị xóa; link liên repo được phân biệt với file trong checkout.
- Không xóa quyết định có giá trị, nguồn gốc mã, contract task hay thay đổi local của người dùng để đạt chỉ tiêu số file.
- Mỗi đợt triển khai có diff, kiểm tra phù hợp và giới hạn rõ. Không đóng map chỉ vì một đợt lint/build xanh.

Không thuộc phạm vi: đổi UI, viết lại mọi feature, thay backend/CMS, chuyển checkout/giỏ sang API thật, xóa MSW trước cutover, đổi nghiệp vụ trả hàng. Không thay dependency chỉ vì tài liệu tham khảo nhắc đến nó.

## 2. Baseline và lý do phải viết lại

Kiểm kê trước khi tạo kế hoạch này: **52 Markdown trong docs, 5.442 dòng**; 21 file không phải hồ sơ task chiếm 4.321 dòng, 31 file task chiếm 1.121 dòng. Có 1 spec trả hàng chỉ tồn tại local. GLOSSARY root cũng là thay đổi local có sẵn, không thuộc đợt này.

Năm file Nike analysis, three-repo plan, research Academy, skill guide và system plan chiếm **3.683 dòng, gần 68% toàn docs**. Tập trung giảm nội dung thừa trong các file này trước khi tối ưu vài stub lịch sử 7–19 dòng.

| Bằng chứng                                                                                                                                                               | Hệ quả cần xử lý                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| storefront-restructure-plan vẫn nói code ở route _lib/core/session, đề xuất home vào catalog và components/layout; source hiện có home, storefront-shell, catalog/search | Viết kiến trúc theo checkout; tách cây đích chưa thực hiện khỏi hiện trạng                  |
| DESIGN.md trỏ packages/tailwind-config, chép giá trị token và liệt kê homepage cũ                                                                                        | CSS là nguồn giá trị; design chỉ giữ ý nghĩa, policy và composition đã xác minh             |
| Nike analysis có các phần typography/color/spacing lặp, cây component/database/microservice đề xuất                                                                      | Rút thành tham khảo UX; không biến đề xuất thành kiến trúc hoặc backlog của sản phẩm        |
| plan/README, issue-tracker, triage-labels và system plan lặp trạng thái/guard; ví dụ approved/retro-turns khác parser thật                                               | Chốt schema và ownership một lần, sửa consumer theo cùng PR                                 |
| system plan có quyết định UI evidence/retro còn chưa triển khai; hướng dẫn resume còn nhắc worktree                                                                      | Tách runtime đang có khỏi backlog; không trình bày quyết định đã chốt như tính năng đã chạy |
| Task index còn ready-for-agent dù có report và code tương ứng                                                                                                            | Đối chiếu spec/code/PR; không suy diễn done chỉ từ sự tồn tại của report                    |

Số dòng là tín hiệu chọn ưu tiên, không phải bằng chứng tự động để xóa.

## 3. Cây tài liệu đích

Chỉ tạo file khi có nội dung độc lập. Không tạo folder rỗng, không chia nhỏ một chủ đề chỉ để giảm số dòng của từng file.

```text
README.md                       # sản phẩm, quickstart tối thiểu, link đọc tiếp
CONTRIBUTING.md                 # Git, commit, PR, release
AGENTS.md / CLAUDE.md           # entry point cho công cụ; link tới rule thật
GLOSSARY.md                     # thuật ngữ, nếu chủ repo đưa vào quản lý
DESIGN.md                      # hợp đồng visual; giá trị token nằm trong CSS

docs/
├── README.md                   # mục lục theo câu hỏi, lộ trình đọc
├── overview.md                 # phạm vi, route/capability, hiện trạng real/mock
├── architecture.md             # cây module hiện tại, data/state, session, locale, PWA/3D
├── api-integration.md          # proxy, contract pin, MSW boundary, cách đối chiếu API
├── roadmap.md                  # việc chưa làm, dependency, định nghĩa xong; không lặp spec
├── adr/                        # giữ tên/identity; quyết định có nhãn hiện hành/lịch sử
├── agents/
│   ├── code-conventions.md     # bản đồ .claude/rules; không chép lại rule
│   ├── issue-tracker.md        # schema/lifecycle task + ngoại lệ Wayfinder
│   ├── runner.md               # sử dụng, resume, stop, giới hạn của runner đang chạy
│   └── ui-workflow.md          # chọn skill ngắn; link tới skill thực thi và design
├── plan/
│   ├── README.md               # index và link format; không chứa lại manual runner
│   └── tasks/<NN>-<name>/      # giữ identity và tên artifact mà runner dùng
└── reference/
    ├── ux-patterns.md          # tham khảo ngắn, không phải spec/architecture
    ├── ideal.md                # stub lịch sử 7 dòng còn phục vụ ADR
    └── home-motion/README.md   # regression/provenance ngắn; link tới architecture
```

Mục tiêu mềm: khoảng 17 tài liệu ngoài task, 1.200–1.800 dòng thay vì 4.321; giảm khoảng 60% nội dung ngoài task. Đây là ngân sách định hướng, được phép vượt nếu có nội dung cần thiết. Không dùng ngưỡng độ dài để lược bỏ contract hoặc provenance.

Không tạo docs/archive để cất nguyên các file lớn. Git lưu lịch sử; chỉ giữ tóm tắt quyết định/lý do còn cần đọc trong cây hiện tại. ADR nguồn gốc mã vẫn nằm trong repo.

## 4. Hợp đồng nội dung: mỗi câu hỏi một nguồn chuẩn

| Câu hỏi                                        | Nguồn chuẩn                                                         | Không đặt lại ở đâu                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Store là gì, chạy nhanh thế nào?               | README root                                                         | Không chép toàn bộ README vào overview                              |
| Sản phẩm hiện có gì, thật/mock/chưa có?        | overview                                                            | Không lấy feature tương lai từ Nike hoặc kế hoạch BE làm hiện trạng |
| Code/data/session/cache/locale nằm ở đâu?      | architecture, đối chiếu source                                      | Roadmap không giữ cây current thứ hai                               |
| HTTP, OpenAPI pin, proxy, mock cutover ra sao? | api-integration; schema/generated/config vẫn là contract executable | Không copy DTO/endpoints/tất cả OpenAPI vào Markdown                |
| Làm việc với Git/PR/release?                   | CONTRIBUTING                                                        | Runner chỉ dẫn tới đây và ghi ngoại lệ đã được code thực thi        |
| State task và field frontmatter nghĩa gì?      | issue-tracker                                                       | Index chỉ hiện status để điều hướng, runtime vẫn đọc spec           |
| Chạy/resume/stop runner?                       | runner                                                              | Không giữ hai manual trong plan README và system plan               |
| Quy tắc code?                                  | .claude/rules; code-conventions là index                            | AGENTS chỉ giữ nguyên tắc cấp repo và đường dẫn                     |
| Visual nào được chấp nhận?                     | design.md; src/styles là nguồn giá trị token                        | UI reference không định nghĩa lại token/policy                      |
| Việc nào chưa làm?                             | roadmap dẫn tới ticket/map                                          | Không copy acceptance criteria sang nhiều plan                      |
| Vì sao đã chọn như vậy?                        | ADR hoặc resolution của ticket                                      | Không viết lại quyết định lịch sử như hành vi hiện tại              |

Overview phải có bảng capability: catalog/home/PLP/PDP/search; auth/account; cart/wishlist; checkout/orders; i18n; PWA/3D. Mỗi hàng ghi source đối chiếu, real/mock/chưa xác minh, điều kiện môi trường và giới hạn. Không gắn nhãn production-ready chỉ từ unit tests.

Architecture phải giải thích chiều phụ thuộc, seam cross-feature có chủ ý, query key/state ownership, root provider duy nhất, refresh/session boundary, metadata/locale, route offline, Serwist/MSW và 3D gate. Không cần cây đến từng file: chỉ link đến code sở hữu.

API integration chỉ mô tả capability đã thấy trong contract pin và checkout. Kế hoạch đổi contract/luồng mua hàng nằm ở roadmap sản phẩm riêng, không trở thành việc phải làm trong đợt rebuild này.

## 5. Ma trận xử lý từng tài liệu ngoài task

Các đích dưới là đích đề xuất sẽ được tạo trong các đợt triển khai; hiện tại chưa đổi tên/xóa những file này.

| Hiện tại                                               | Xử lý                                           | Nội dung giữ và đích                                                                                                                                                                                                                                        |
| ------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docs/README.md                                         | Viết lại                                        | Mục lục theo 6 câu hỏi, current/planned/reference rõ; link roadmap/task                                                                                                                                                                                     |
| docs/FRONTEND-GUIDE.md                                 | Gộp rồi xóa                                     | 43 dòng WebGL, disposal, reduced motion và baseline LCP có ngày vào architecture; giữ rõ baseline lịch sử; cập nhật source comment/anchor trước xóa                                                                                                         |
| docs/SKILL-USAGE-GUIDE.md                              | Rút gọn/chuyển rồi xóa bản cũ                   | Selection matrix và 2–3 ví dụ vào agents/ui-workflow; bỏ catalog 12 skill dài và lời khuyên lặp; không bắt cài mọi skill                                                                                                                                    |
| docs/nike-ui-ux-analysis.md                            | Trích phần hữu ích rồi xóa bản dài              | reference/ux-patterns khoảng 100–150 dòng: menu/hero/card/PLP/search/mobile/a11y; bỏ DB/scaling/stack/architecture suy đoán; cập nhật skill consumer                                                                                                        |
| docs/adr/0001-single-repo-khong-monorepo.md            | Giữ/chú thích                                   | Phân biệt quyết định cũ với independent app hiện tại; cập nhật link architecture                                                                                                                                                                            |
| docs/adr/0001-tailadmin-reuse-no-attribution.md        | Giữ nguyên provenance                           | Không mất nguồn, license/version và quyết định lịch sử; không renumber chỉ vì trùng prefix                                                                                                                                                                  |
| docs/adr/0002-headless-cms-thay-vi-tu-xay.md           | Giữ/chú thích                                   | Lý do không tự xây editor là lịch sử; không khẳng định tích hợp CMS đã có                                                                                                                                                                                   |
| docs/adr/0003-mock-first-cho-module-chua-co-backend.md | Giữ/chú thích                                   | Danh sách Django/admin là bối cảnh cũ; policy mock hiện tại dẫn tới api-integration                                                                                                                                                                         |
| docs/conventions/code-conventions.md                        | Giữ/rút ngắn                                    | Mapping rule files và checklist ra quyết định; không copy toàn bộ standards                                                                                                                                                                                 |
| docs/agents/domain.md                                  | Gộp rồi xóa                                     | Cách tra glossary/ADR vào AGENTS/tracker; cập nhật mọi consumer trước khi bỏ adapter                                                                                                                                                                        |
| docs/agents/fashion-storefront-ui-director.md          | Gộp rồi xóa                                     | Invocation/source pointer vào ui-workflow; skill executable giữ nguyên nơi sở hữu                                                                                                                                                                           |
| docs/agents/issue-tracker.md                           | Viết lại tại chỗ                                | Schema thật, status owner, task vs Wayfinder; approved.files/commands và retro-turns đúng parser                                                                                                                                                            |
| docs/agents/triage-labels.md                           | Gộp rồi xóa có điều kiện                        | Mapping role/status vào issue-tracker; kiểm tra cả cấu hình skill ngoài source trước xóa; nếu không chứng minh được consumer, giữ adapter ngắn, ghi rõ ngoại lệ                                                                                             |
| docs/plan/AGENT-SYSTEM-PLAN.md                         | Trích quyết định rồi xóa bản lớn                | Runtime -> agents/runner; quyết định chưa làm -> roadmap/ticket; source nghiên cứu cần thiết -> cuối runner; không copy 39-skill catalog                                                                                                                    |
| docs/plan/README.md                                    | Rút ngắn tại chỗ                                | Index task/map và link tới tracker/runner; report/metric schema có một nơi chuẩn                                                                                                                                                                            |
| docs/plan/storefront-restructure-plan.md               | Gộp rồi xóa                                     | Current facts -> overview/architecture/API; pending -> roadmap; bỏ hướng dẫn di chuyển đã xong                                                                                                                                                              |
| docs/plan/storefront-target-module-tree.md             | Gộp rồi xóa                                     | Architecture hiện tại; source và test colocated là bằng chứng, không chép cây file dài                                                                                                                                                                      |
| docs/plan/three-repo-restructure.md                    | Trích storefront seam rồi xóa bản lớn           | Ranh giới BE/CMS, dependency contract, invariants cần frontend -> API/roadmap. Không mang cây source BE/CMS vào docs frontend. Giữ link tới nguồn được repo kia sở hữu; nếu nội dung chỉ tồn tại ở đây phải bảo toàn phần chưa được nguồn kia ghi trước xóa |
| docs/reference/anthropic-academy-research.md           | Trích phần liên quan rồi xóa khỏi bộ docs dự án | Chỉ giữ nguồn/ngày và quyết định thực tế ảnh hưởng runner. Catalog khóa học, giá/model/SDK claims không phải hướng dẫn sản phẩm; raw research tra Git, không kết luận chúng sai vì cũ                                                                       |
| docs/reference/home-motion/README.md                   | Giữ ngắn                                        | Checklist/provenance 14 dòng; đổi link guide sau gộp                                                                                                                                                                                                        |
| docs/reference/ideal.md                                | Giữ stub lịch sử                                | 7 dòng hỗ trợ ADR; không phục hồi đề xuất monorepo thành plan hiện tại                                                                                                                                                                                      |

Root cần đồng bộ cùng đợt: README chỉ quickstart, CONTRIBUTING giữ Git, AGENTS/CLAUDE không mô tả apps đã xóa, DESIGN.md đối chiếu CSS/home/login. Không sửa GLOSSARY local trước khi chủ repo đưa vào phạm vi tương ứng.

## 6. Hồ sơ task: giảm nhiễu nhưng không phá runner

| Nhóm hiện có                                                                        | Xử lý                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 category, 02 date, 03 pagination, 05 config: mỗi nhóm có spec/plan/report/metric | Đối chiếu code, PR và trạng thái trước; không tự đổi ready-for-agent thành done. Sau merge được xác nhận, cân nhắc giữ spec + report, gộp phần độc nhất của plan/metric vào report rồi xóa artifact thừa nếu không còn state/resume/consumer |
| 04 badge i18n chỉ có spec                                                           | Giữ task đang mở; cập nhật source pointer khi module đổi, không xóa vì trông cũ                                                                                                                                                              |
| 06 return lifecycle local-only                                                      | Giữ nguyên file và hàng index local; không vô tình stage hoặc coi là contract backend đã xác nhận                                                                                                                                            |
| 07 Wayfinder map                                                                    | Giữ index quyết định, không nhét nguyên plan mới vào map                                                                                                                                                                                     |
| 08 cleanup, 09 convention, 10 boundaries                                            | Giữ spec/resolution và evidence độc nhất; chuyển current rules sang owner mới, report vẫn ghi thời điểm/giới hạn                                                                                                                             |
| 11 workflow runner                                                                  | Giữ decision ticket; dùng làm cửa kiểm chứng runner trước viết manual                                                                                                                                                                        |
| 12 documentation ownership                                                          | File này là kế hoạch canonical; spec chỉ link kết luận, không tạo thêm master plan                                                                                                                                                           |
| 13 provider ownership                                                               | Giữ spec/report và test evidence; không xóa plan khi PR/trạng thái vẫn cần đối chiếu                                                                                                                                                         |

**Không di chuyển docs/plan/tasks/todo hoặc đổi tên NN/spec/plan/report/metric/handoff trong PR docs-only.** TASKS_DIR, blocked-by, PR marker, AGENT_TASK_DIR và guard phase rules phụ thuộc chúng. Không sửa `.agent-run` state/markers để “dọn tài liệu”.

Chỉ xóa artifact của task đã đóng khi: xác nhận merge/resolution đúng loại tracker; không còn resume đang dùng; không có blocker/consumer bị mất; report giữ đủ scope/checks/result. Không xóa hàng task lịch sử để che trạng thái chưa đối chiếu.

## 7. Thứ tự triển khai và điều kiện nghiệm thu

### Đợt A — Chốt baseline và nguồn chuẩn

- Đọc task/PR, phân biệt thay đổi tracked với local-only. Lập danh sách current facts từ source và config.
- Đánh dấu rõ các yêu cầu đã triển khai/chưa triển khai trong kế hoạch cũ trước khi trích.
- Mỗi requirement độc nhất trong 5 file lớn phải có một đích trong ma trận hoặc lý do loại bỏ; không chỉ kiểm link để kết luận không mất nội dung.
- Kết quả: owner table, ledger chuyển nội dung và thống nhất trạng thái task. Không đổi status delivery nếu thiếu xác nhận theo quy tắc tracker.

### Đợt B — Tạo bộ đọc chính từ code

- Viết overview, architecture, API integration và roadmap; viết lại README/index, sửa design.md.
- Đối chiếu homepage thật, route locale/offline, root provider, CSS token, API pin và mode mock; không chép target tree BE/CMS như hiện trạng frontend.
- Hợp nhất 3D vào architecture; giải quyết mâu thuẫn hero-only trong skill với PDP đã có theo code. Chỉ mô tả hành vi hiện tại; thay đổi policy 3D mới phải có quyết định riêng.
- Nghiệm thu: người đọc có thể theo 6 trang trả lời các câu hỏi ở mục 1, cả khi chỉ checkout frontend. API backend không chạy vẫn biết vì sao catalog chưa có dữ liệu.

### Đợt C — Tracker và workflow vận hành

- Thực hiện sau [đối chiếu workflow runner](../11-runner-workflow/spec.md): runtime là bằng chứng, guard JSON là config executable.
- Viết runner.md và sửa issue-tracker tại chỗ. Gộp role mapping và report schema; cập nhật BOTH bộ vai/cấu hình, storefront-workflow và plan-task khi đổi nơi đọc hướng dẫn.
- Phân biệt done của delivery task và done của Wayfinder. approved là danh sách file/lệnh, không phải bool sign-off; retro-turns là ngân sách bổ sung theo runtime.
- Bảo toàn 3 quyết định đã ghi cuối system plan: bằng chứng browser/UI; spec là nguồn status; retro hết lượt có thể PR kèm ghi nhận. Cái chưa được code thực thi nằm ở backlog, không ghi là tính năng đã có.
- Không chọn thêm phương án autonomous merge, worktree hoặc thay quyền Git từ tài liệu lịch sử.
- Nghiệm thu: chọn task không nhận map/decision ticket; state/index không giả làm hai nguồn authoritative; resume/stop/preflight được mô tả đúng từng provider.

### Đợt D — Rút gọn và xóa tài liệu cũ

- Tạo ux-patterns/ui-workflow ngắn, giữ ADR/những stub lịch sử có giá trị.
- Cập nhật toàn bộ Markdown links, anchor, AGENTS/CLAUDE, local skills, prompt/role configs, rule index, guard comments và source comments trước khi xóa nguồn cũ.
- Xóa bản Nike/skill/system/cross-repo plan/research dài sau content ledger được đối chiếu. Không để cả file mới và file cũ cùng được gọi canonical.
- Một file redirect chỉ được giữ nếu còn consumer không thể cập nhật; ghi lý do và điều kiện xóa, không để hàng loạt wrapper vĩnh viễn.
- Nghiệm thu: mọi tài liệu giữ lại có purpose/status/owner rõ; không còn recipe trùng và kiến trúc giả trong đường đọc chính.

### Đợt E — Phần source/config còn lại của rebuild

- Qua [kiểm kê legacy source/config](../14-rebuild-source-audit/spec.md) trước khi xóa: role admin cũ, public scaffold assets, mock exports back-office, wrapper/dependency/config thực sự còn consumer hay không.
- Kiểm tra import/export, dynamic import, convention Next.js, CSS/assets URL, scripts/hooks/generator/Vitest/Playwright. Unused scan chỉ là ứng viên, không phải bằng chứng cuối.
- Giữ MSW và runtime chưa cutover; không refactor nghiệp vụ chỉ để đẹp cây. Cập nhật module boundary lint theo seam có chủ ý, không cấm mọi cross-feature import.
- Nghiệm thu: phạm vi delete được chứng minh, không import đường dẫn cũ, tests bảo vệ hành vi cần giữ, docs current vẫn khớp sau cleanup.

### Đợt F — Guard chất lượng docs và bàn giao

- Theo [cổng kiểm tra docs](../15-docs-quality-gate/spec.md): lựa chọn check không đòi backend/network hoặc dependency mới vô cớ.
- Gate cần kiểm Markdown/style ở các file maintained; local links/anchors; đường dẫn literal trong skill/role/prompt/comment; identity/blocker/status task. Phân biệt sibling-repo, external URL, historical artifact và code-fence minh họa để tránh báo sai.
- Đặt gate thích hợp trong CI/hook/verify-gates theo quyết định workflow. CI hiện chưa enforce docs/links/rules/E2E, không được ghi là đã có trước khi triển khai.
- Code/runtime hoặc runner đổi: focused regression rồi lint/format/typecheck/test/build và E2E phù hợp. Docs-only: formatting, links/anchors, path consumer và content ledger; không chạy lại 1050 test chỉ vì sửa văn bản.
- Đối chiếu trạng thái map và checklist mục 1. Không tự commit/push/merge nếu chưa được yêu cầu cho đợt triển khai đó.

Các đợt là thứ tự triển khai có thể review, không phải 6 Wayfinder decision ticket giả. B và C có thể chuẩn bị độc lập, D cần owner thật từ cả hai. F cần schema/workflow được chốt. E không chặn viết docs hiện trạng nhưng phải được nghiệm thu trước tuyên bố hoàn tất rebuild.

## 8. Consumer bắt buộc kiểm tra khi đổi đường dẫn

- Task runtime: scripts/agent-run/tasks.ts, spec.ts, spec-file.ts, checkout/state/finish/retro modules và tests tương ứng.
- Docs chỉ dẫn vai/format: .claude/agents, .codex/agents, .claude/commands/implement-issue.md, .agents/skills/{storefront-workflow,plan-task}/SKILL.md.
- Cấu hình/hook/rule: .claude/agent-guard.json, hooks/agent-guard.ts, hooks/lib/guard.ts, .claude/rules và .codex/config.toml khi có consumer liên quan.
- UI: fashion-storefront-ui-director skill, AGENTS, DESIGN.md, docs index; nguồn slot tokens ở src/styles/{theme,preset,login}.css và homepage thật.
- 3D source comments: HeroCarousel, HeroSlides3D, dissolveShader, ProductInfoPanel, ProductViewer3D; anchor 27-threejs-trong-storefront phải được cập nhật cùng lượt đổi guide.
- ADR ideal/history và link liên repo. Nếu glossary chỉ có local không tạo link bắt buộc tới file chưa được commit.

## 9. Trạng thái của kế hoạch

Đã làm trong phiên này: kiểm kê nội dung và consumer, chốt phạm vi với chủ repo, viết ma trận và thứ tự triển khai. Chưa xóa/di chuyển/viết lại bộ docs vận hành, chưa sửa runner/source, chưa commit/push.

Bằng chứng audit đã chuyển thành các phát hiện trong kế hoạch này. Ghi chú khảo sát tạm ở /tmp không phải tài liệu dự án hay dependency cho lần chạy sau. Những việc cần điều tra tiếp nằm ở ticket workflow, legacy source/config và quality gate; map tiếp tục mở.
