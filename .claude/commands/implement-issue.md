---
description: Triển khai một GitHub issue thành vertical slice có kiểm thử
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(git *), Bash(pnpm *)
argument-hint: '<số issue hoặc acceptance criteria>'
---

Triển khai `$ARGUMENTS` thành một vertical slice tập trung.

1. Đọc issue hoặc acceptance criteria được cung cấp, source liên quan, `AGENTS.md` và path-scoped rule áp dụng.
2. Dùng checklist trong `docs/agents/code-conventions.md` để quyết định vị trí và tên của file mới trước khi tạo.
3. Tìm component, hook, schema, endpoint, utility và constant có cùng semantics trước khi viết mới; tái sử dụng hoặc extract vào scope chung nhỏ nhất.
4. Nếu cố ý giữ code tương tự do business rule/lifecycle khác nhau, ghi rõ axis thay đổi độc lập.
5. Nêu rõ điểm mơ hồ quan trọng trước khi đưa ra giả định làm thay đổi hành vi sản phẩm.
6. Theo dõi slice xuyên suốt schema/API SDK, state, UI, localization và test khi có liên quan.
7. Tái sử dụng pattern hiện có và giữ diff tập trung; không refactor ngoài phạm vi theo cơ hội.
8. Kiểm tra component không chứa API/transport/cache logic; tách endpoint, query/mutation hook và mapper/view-model theo trách nhiệm thực tế.
9. Kiểm tra naming, TypeScript strict/type safety, import alias/public subpath, Clean Code/SOLID, side effect, error flow, loading/empty/error/success, toast ownership, accessibility và responsive theo các rule áp dụng.
10. Với UI có state/query/context, kiểm tra phạm vi subscription và re-render; chỉ memoize khi identity hoặc chi phí render thực sự yêu cầu.
11. Thêm unit/integration test ở layer thấp nhất; thêm E2E khi behavior cần browser hoặc nối nhiều feature/route.
12. Chạy focused test trước, sau đó các gate liên quan của workspace và cross-browser E2E khi cần.
13. Tóm tắt hành vi đã đổi, file đã đổi, kết quả kiểm tra và rủi ro còn lại.

Không commit, push, tạo branch hoặc PR hay thay đổi trạng thái GitHub nếu người dùng chưa yêu cầu riêng hành động bên ngoài đó.
