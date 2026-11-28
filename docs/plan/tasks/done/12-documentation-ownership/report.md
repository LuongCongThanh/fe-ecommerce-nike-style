# Report 12: documentation ownership rebuild

- **PR:** chưa mở; thay đổi tổng hợp nằm trên integration branch `refactor/storefront-docs-rebuild`, chưa commit/push.
- **Ngày merge:** chưa xác nhận cho đợt này.

## Đã làm

Thực hiện phases A–D của plan trong checkout hiện tại: sáu trang onboarding (README/index/overview/architecture/API/roadmap), design theo CSS và route thật, tracker schema/lifecycle/report tại một owner, runner manual phản ánh runtime baseline. Đợt nội dung ban đầu giữ ADR provenance, ideal/home-motion, task identity và mọi artifact hiện có; quyết định owner ngày 19/11/2026 sau đó xóa toàn bộ ADR lịch sử khỏi cây hiện tại và giữ chúng trong Git history.

## Content migration ledger

| Nguồn cũ                                         | Đích và nội dung độc nhất được giữ                                                                                                                                                                                                                                                                                                                            | Nội dung không giữ như contract                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| FRONTEND-GUIDE                                   | architecture: Hero/PDP gate khác nhau, drei, disposal, DOM/pixel ownership, shader uniform/GLSL pitfalls, historical LCP date/method/values                                                                                                                                                                                                                   | Không tuyên bố baseline cũ là phép đo mới                                                            |
| Nike analysis                                    | reference/ux-patterns: navigation/cognitive load, hero/image priority, cards/grid, desktop/mobile filter, search, PDP trust, a11y/reduced motion/tokens                                                                                                                                                                                                       | Database/scaling/microservice/stack/component-tree speculation không phải requirement                |
| SKILL-USAGE-GUIDE                                | agents/ui-workflow và executable director: selection matrix, invocation, examples, optional motion/3D                                                                                                                                                                                                                                                         | Catalog dài và recipe trùng; không bắt cài GSAP/12 skills                                            |
| AGENT-SYSTEM-PLAN                                | runner: selection/preflight/provider/resume/stop/budget/guard/PR; tracker: schema/lifecycle/report/metric; roadmap: UI evidence, spec status, unfinished-retro PR decisions                                                                                                                                                                                   | Ngoại lệ merge/worktree lịch sử không thành quyền hiện tại; catalog39 skills không là setup bắt buộc |
| three-repo plan: frontend contract               | API integration: pin/generator/proxy/mappers, transport vs domain, ownership/glossary sources; roadmap: Product→Variant→SKU, server price/Voucher/stock/order authority, Guest cookie/expiry/merge, multi-device cart, quote confirmation/requote, idempotency, snapshots/allocation, Guest lookup/cancel/address, Wishlist scope, vi/en                      | Không mang cây Nest/Prisma/Vue hay blanket no-tests lịch sử thành convention hiện hành               |
| three-repo plan: chưa có nguồn frontend thay thế | roadmap giữ Effective price/SalePrice lifecycle/rounding/conflict, Voucher mutation rules/timezone, tier API-first, online reservation15min, COD/VNPay/MoMo/GHN/IPN/signature/reconciliation, shipping fallback/free threshold, locale email/outbox/readiness, returns/refunds/manual/audit, consent/access/erasure/retention và verification/test priorities | Backend implementation tree do repo API/CMS sở hữu; không tuyên bố integrations đang ship            |
| restructure plan/target tree                     | overview/architecture/API cho hiện trạng; roadmap cho pending cutover                                                                                                                                                                                                                                                                                         | Cây đích tám feature/search riêng khác source hiện tại; không tiếp tục recipe di chuyển đã xong      |
| Academy research                                 | runner provenance: nguồn/ngày, quyết định thực sự ảnh hưởng workflow; raw nghiên cứu tra Git                                                                                                                                                                                                                                                                  | Course/model/price/SDK claims không phải tài liệu vận hành; không kết luận sai chỉ vì cũ             |
| domain/triage/UI adapters                        | AGENTS/tracker cho glossary/ADR/lifecycle; ui-workflow cho invocation                                                                                                                                                                                                                                                                                         | domain/UI wrapper xóa sau consumer rewrite                                                           |
| design                                           | root CSS/local typography/semantic tokens, current homepage/login, dark/motion/accessibility policy                                                                                                                                                                                                                                                           | Token số/cross-app package/login assertions cũ không là hiện trạng                                   |

Đã xóa 10 tài liệu cũ sau chuyển nội dung/consumer. Giữ `triage-labels.md` adapter ngắn vì các engineering skills cài ngoài repo có thể còn dùng đường cố định; chỉ xóa khi xác minh external consumers đã chuyển. Ngày 19/11/2026, owner yêu cầu xóa thêm cả bốn ADR lịch sử, gồm hồ sơ TailAdmin; license/source/version và quyết định cũ từ đây chỉ truy xuất qua Git history. Không tạo archive nguyên bản dài.

## Snapshot sau phases A–D

Ở thời điểm hoàn tất phases A–D, phases E/F runtime/source/gate chưa được thực thi và có ticket riêng. Runner manual khi đó còn ghi baseline chưa loại Wayfinder, chưa fail-closed UI evidence, retro hết lượt còn dừng; hai mục đầu sau đó được task11 xử lý, còn unfinished-retro PR vẫn là accepted backlog. Kết quả tích hợp hiện tại nằm ở phần cuối report; không nhận done từ bảng index như bằng chứng merge.

Đã đối chiếu Git/GitHub: task01/PR96, task02/PR97, task03/PR99, task05/PR94 đã merge vào dev trong khi spec còn ready-for-agent. Giữ trạng thái/artifact chờ reconcile có chủ sở hữu. Wayfinder index giữ mọi hàng/status có sẵn. Không sửa GLOSSARY/task06 local. Đề xuất task06 phạm vi toàn đơn còn mâu thuẫn chương trình liên repo theo dòng: roadmap ghi rõ chưa thống nhất, không áp dụng như contract mới.

Ngân sách số dòng là mềm; bộ docs giữ gọn thay vì thêm nội dung để đạt mức tối thiểu. Ngày 19/11/2026, owner tiếp tục xóa cả ba file `docs/reference`: UX rules được chuyển vào `DESIGN.md`, home-motion checklist vào architecture, còn stub ideal chỉ giữ trong Git. Sau quyết định này còn 11 Markdown ngoài task trong docs; root instructions/design tính riêng.

## Test cũ đã chạm

Không sửa test. Source/script/config thay đổi trong phạm vi này chỉ là comment/reference; guard JSON chỉ `$comment`, không đổi luật thực thi. TDD skill đã đọc: docs-only kiểm nội dung/link thay vì mirror tests.

## Kiểm tra

- Literal source paths trong sáu trang mới đối chiếu filesystem; sửa i18n messages thành `src/lang`.
- Local maintained links/anchors kiểm bằng script độc lập, bỏ fenced examples. Broad scan cũng ghi nhận 13 link pre-existing của vendored hallmark trỏ upstream site/docs không nằm trong repo; không sửa chúng trong đợt này.
- Consumer scan không còn filename đã xóa trong live docs/skills/roles/rules/source comments; task artifacts cố ý giữ lịch sử.
- Prettier check PASS trên toàn bộ file owned đã chạm mà parser hỗ trợ. Lần đầu có lỗi parser TOML; bỏ TOML khỏi Prettier và parse riêng bằng Python tomllib: PASS.
- Local maintained links/anchors: 125 checked, 0 errors (loại vendored hallmark upstream references). Literal source paths mới: không thiếu. git diff --check: PASS.
- Guard JSON so HEAD sau bỏ `$comment`: bằng nhau; không đổi rule. Hiện docs ngoài task: 18 file, 614 dòng (baseline 21 file/4.321 dòng, giảm khoảng 86%; root docs tính riêng).
- Không chạy app tests/build cho docs/comment-only; không gọi external API, không thêm dependency.

## Acceptance criteria: chạy tay

Onboarding đọc sáu trang để biết sản phẩm, local/backend dependency, real/mock, module/state/API và backlog. Homepage/design so source thật; PDP và Hero gate phân biệt. Tracker schema approved.files/commands/retro-turns đúng parser baseline; report owner cả hai provider đã đổi. Runtime/gate follow-up đã cập nhật manual hiện hành và được ghi ở phần kết quả tích hợp bên dưới.

## Kết quả tích hợp phases E–F

Ticket 14 đã xóa asset scaffold và mock admin definition-only sau consumer audit, đồng thời chặn dependency ngược từ shared/API/schema lên app/feature. Ticket 15 thêm quality gate offline cho format, link/anchor, live consumer path và task graph; gate chạy bằng `pnpm docs:check`, CI và `verify-gates`. Ticket 11 cập nhật runner/UI evidence trước đó; report riêng của từng ticket là nguồn chi tiết.

Lượt validation cuối trên integration branch: `pnpm docs:check`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, 79 test file/1.076 test và production build đều pass. Không chạy full browser E2E vì backend `127.0.0.1:8080` không thuộc phạm vi và không được khởi động trong đợt offline này.
