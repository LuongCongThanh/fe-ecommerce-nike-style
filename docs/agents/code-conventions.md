# Code conventions dành cho AI agent

Tài liệu này là bản đồ điều hướng. Convention có hiệu lực nằm trong `.claude/rules/` để được nạp theo đường dẫn và không làm phình context của mọi tác vụ.

| Chủ đề                                 | Rule canonical                                   |
| -------------------------------------- | ------------------------------------------------ |
| Vị trí code và cây thư mục             | `.claude/rules/project-structure-conventions.md` |
| Kiến trúc và dependency boundary       | `.claude/rules/frontend-architecture.md`         |
| TypeScript, React, naming và import    | `.claude/rules/typescript-react-conventions.md`  |
| TypeScript strict và type safety       | `.claude/rules/typescript-strict-style.md`       |
| Import alias và tái sử dụng code       | `.claude/rules/imports-and-reuse-conventions.md` |
| Schema, API, TanStack Query và Zustand | `.claude/rules/api-data-conventions.md`          |
| Xử lý lỗi                              | `.claude/rules/error-handling-conventions.md`    |
| Clean Code, SOLID và pattern           | `.claude/rules/solid-patterns.md`                |
| Kiểm soát re-render React              | `.claude/rules/react-render-performance.md`      |
| UI và accessibility                    | `.claude/rules/ui-accessibility-conventions.md`  |
| Loading state và toast message         | `.claude/rules/loading-and-toast-conventions.md` |
| Localization                           | `.claude/rules/localization-conventions.md`      |
| Unit, integration và E2E testing       | `.claude/rules/testing.md`                       |
| Storefront                             | `.claude/rules/storefront.md`                    |
| Admin/CMS                              | `.claude/rules/admin-cms.md`                     |
| Git, commit và Pull Request            | `.claude/rules/git-workflow-conventions.md`      |

## Thứ tự ra quyết định

1. Domain behavior và contract đang được test.
2. Config được enforce: TypeScript, ESLint, Prettier, package exports và CI.
3. Path-scoped rule trong `.claude/rules/`.
4. `AGENTS.md`, `CONTRIBUTING.md` và tài liệu kiến trúc hiện có.
5. Pattern chiếm ưu thế trong code gần nhất cùng boundary.

Nếu hai nguồn cùng mức mâu thuẫn, agent phải báo rõ thay vì tự chọn một thay đổi ảnh hưởng public API hoặc business behavior.

## Checklist trước khi tạo file

- File này thuộc route, feature, app-shared hay cross-app package?
- Đã có module chịu đúng trách nhiệm chưa?
- Có consumer thứ hai thật sự cho abstraction dùng chung chưa?
- Tên file có phản ánh export/trách nhiệm chính không?
- Import mới có đi đúng public boundary và tránh cycle không?
- Đã tìm implementation cùng semantics trước khi viết mới chưa?
- Nếu giữ hai đoạn code giống nhau, business rule hoặc axis thay đổi độc lập đã được xác định rõ chưa?
- Dữ liệu network đã có schema và API SDK endpoint chưa?
- Component có đang gọi API, parse DTO, quản lý query key hoặc invalidate cache không? Nếu có, chuyển trách nhiệm sang endpoint/query hook/controller phù hợp.
- Transform dữ liệu có đủ phức tạp hoặc được reuse để cần mapper riêng không, hay `select` thuần của query đã đủ?
- State/subscription có nằm ở phạm vi nhỏ nhất và chỉ theo dõi dữ liệu component thực sự dùng không?
- UI đã có loading, empty, error, success và i18n chưa?
- Loading có đúng phạm vi/action, và toast có một owner duy nhất thay vì trùng với inline feedback không?
- Interaction đã có keyboard, focus và test hành vi chưa?
- Behavior mới nên được chứng minh ở unit/integration hay E2E, và đã chọn layer thấp nhất phù hợp chưa?

## Checklist trước khi hoàn tất

- Không tạo direct fetch, barrel export, cross-feature private import hoặc server-cache copy trong Zustand.
- Không để duplicate cùng semantics; tái sử dụng hoặc extract vào scope chung nhỏ nhất. Duplicate khác business rule phải được giải thích.
- Presentational component không phụ thuộc transport envelope, HTTP status, query key hoặc cache invalidation.
- Không để raw error, secret, stack trace hoặc message không dịch xuất hiện trong UI.
- SOLID làm code đơn giản hơn; không thêm layer/service/interface không có giá trị boundary.
- Hàm/module có intent và responsibility rõ; không có boolean flag mơ hồ, side effect ẩn, nesting sâu hoặc assertion che lỗi thiết kế.
- Không có `any`, double assertion, non-null assertion hoặc ignore directive mới để né type system.
- Không thêm memoization theo thói quen; performance optimization phải xử lý đúng nguồn cập nhật hoặc có bằng chứng profiling.
- Test bao phủ hành vi mới và failure path có ý nghĩa.
- Test độc lập, deterministic, không sleep/network thật/shared state và không phụ thuộc implementation detail.
- Không có full-page loading cho action cục bộ, duplicate toast hoặc raw transport error trong message.
- Chạy kiểm tra hẹp trước, sau đó gate tương ứng với phạm vi thay đổi.
- Không commit/push/PR nếu chưa được yêu cầu; khi được yêu cầu phải stage chọn lọc, review staged diff và tuân thủ branch/commit convention.
