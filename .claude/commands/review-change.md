---
description: Review diff hiện tại để tìm lỗi và regression
allowed-tools: Read, Grep, Glob, Bash(git diff *), Bash(git status *), Bash(pnpm *)
argument-hint: '[base branch hoặc trọng tâm]'
---

Review thay đổi hiện tại như một senior maintainer. Dùng `$ARGUMENTS` làm base branch hoặc trọng tâm review tùy chọn.

- Đọc diff và implementation xung quanh, không chỉ các dòng đã sửa.
- Ưu tiên tính đúng đắn, bảo mật, regression, ranh giới kiến trúc, accessibility, localization và test còn thiếu.
- Đối chiếu vị trí file, naming, import boundary, TypeScript/React, API/data ownership, error flow, SOLID, UI state và test với các path-scoped rule áp dụng.
- Flag hàm nhiều trách nhiệm/tham số/boolean flag, nesting sâu, side effect ẩn, mutation input, type assertion che lỗi và abstraction không có consumer thật.
- Tìm `any`, double assertion, non-null assertion, `@ts-ignore`, nullability sai, union không exhaustive, input mutation và floating Promise.
- Tìm import parent-relative/deep-private, alias sai scope, public export thiếu và dependency cycle.
- Tìm code cùng semantics đã tồn tại hoặc duplicate mới; yêu cầu tái sử dụng/extract trừ khi business rule/lifecycle độc lập được chứng minh rõ.
- Flag component gọi API trực tiếp, parse DTO, quản lý cache hoặc trộn transport error với presentation; kiểm tra mapper/view-model được tạo vì trách nhiệm thật chứ không chỉ tách file hình thức.
- Kiểm tra subscription quá rộng, derived state qua effect, Provider value không ổn định, list key sai và memoization không có tác dụng; chỉ coi re-render là finding khi có tác động hoặc rủi ro cụ thể.
- Dùng lệnh có phạm vi hẹp để xác minh hành vi đáng ngờ khi có thể.
- Báo finding theo mức độ nghiêm trọng, kèm file và dòng chính xác.
- Không sửa file nếu người dùng chưa yêu cầu fix rõ ràng.
- Nếu không có finding, hãy nói rõ và liệt kê rủi ro còn lại hoặc kiểm tra chưa chạy.
- Nếu review để chuẩn bị commit/PR, kiểm tra scope, generated noise, secret, branch target, Conventional Commit title và traceability tới issue.
- Kiểm tra test chọn đúng layer, có failure/boundary quan trọng, không rò state, không dùng sleep/selector brittle và E2E không phụ thuộc test khác.
- Kiểm tra loading đúng phạm vi, không che stale data khi refetch, action pending chống submit lặp và mỗi outcome chỉ có một toast/inline-feedback owner.
