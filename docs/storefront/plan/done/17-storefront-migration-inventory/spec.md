---
status: done
blocked-by: []
assignee: Luong Cong Thanh
kind: docs
labels: [wayfinder:task]
---

Part of 16-storefront-refactor-map

# Mỗi file hiện tại sẽ chuyển về đâu và còn consumer nào cần giữ?

Type: task

## Question

Lập inventory từ source/config hiện tại để xác định mapping đường dẫn cũ → đường dẫn đích theo ADR đã duyệt. Cần bằng chứng trước khi chốt ranh giới triển khai, không di chuyển source trong ticket này.

Phạm vi khảo sát: route và metadata/config export; providers và shell; features; shared helpers/types/UI; SDK/schemas/generated/mocks; test/fixture; i18n/PWA; scripts, alias và lint/build/test glob. Với mỗi nhóm cần nêu owner, consumer, runtime server/browser, naming mới, API công khai hiện có và trường hợp chưa phân loại. Kiểm git status để không đưa thay đổi đang dở vào mapping ngoài ý muốn.

Kết quả cần đủ để biết file nào thực sự cần đổi, file nào giữ nguyên và xung đột nào phải đưa tới quyết định tiếp theo. Chỉ ghi bằng chứng vào inventory.md cùng ticket và resolution comment; không coi suffix/type mới là lý do tạo abstraction.

## Context

Map: [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](../16-storefront-refactor-map/spec.md).

## Comments

### 24/11/2026 — Resolution

Đã claim và hoàn tất tác vụ kiểm kê trong phiên Wayfinder. Bằng chứng: [Inventory chuyển cấu trúc Storefront](inventory.md).

- Snapshot HEAD `e0a0c23c37732e349ad2ceb2653ea842a45977e8`; giữ các thay đổi docs đang có. Kê đủ 345 file src/e2e, 671 cạnh import nội bộ trực tiếp qua quét tĩnh, export và consumer từng file, dấu hiệu runtime và mapping theo ADR.
- 37 file shared ngoài UI chưa chốt owner/naming; mapping shell cũng là đề xuất. Đây là đầu vào cho quyết định boundary/runtime, không phải quyền tự chọn thiết kế hoặc tạo abstraction. Giữ suffix ADR và ghi ngoại lệ test legacy cần ghép source.
- Đã chỉ ra root/locale provider ownership, singleton auth/refresh, Node adapter chỉ bật mock, các cross-feature imports và đường dẫn hardcode trong generator/CI/lint/coverage. Không khẳng định SSR/session đã hoạt động.
- Các câu hỏi còn lại đã thuộc children hiện có; không tạo ticket trùng. Tác vụ thu thập dữ kiện hoàn tất; public allowlist, runtime/SSR scope và gate policy chưa được resolve.
- Kiểm tra: đối chiếu danh mục với filesystem và kiểm docs bằng `corepack pnpm docs:check`. Không chạy app/test/build hoặc regenerate contract; inventory là bằng chứng tĩnh, không chứng minh refactor đã giữ behavior.

`done` chỉ nghĩa tác vụ Wayfinder đã có resolution; source chưa migrate, không có delivery task hay PR được hoàn tất trong phiên này.
