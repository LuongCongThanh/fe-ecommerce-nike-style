---
paths:
  - 'apps/**/*.tsx'
  - 'packages/ui/**/*.tsx'
  - 'packages/shared/**/*.tsx'
  - '**/*.css'
---

# Convention UI, styling và accessibility

## Component và styling

- Tái sử dụng primitive từ `@repo/ui` trước khi tạo control mới. `packages/ui` chỉ chứa UI thuần, không chứa business rule hoặc gọi API.
- Giữ component đặc thù trong app/feature cho tới khi có bằng chứng reuse; không đưa abstraction lên shared package quá sớm.
- Dùng semantic token từ `packages/tailwind-config`; không hard-code màu khi đã có token tương ứng.
- Dùng `cn()` để ghép class có điều kiện và CVA khi component có variant công khai. Không nối chuỗi class thủ công phức tạp.
- Primary CTA dùng token `primary`; `brand` dành cho giá, sale hoặc promotion; surface dùng token semantic thay vì mặc định `bg-white`.
- Mỗi màn hình lấy dữ liệu phải xử lý đủ loading, empty, error và success. Loading không gây layout shift lớn; error có retry hoặc next action khi phù hợp.
- UI không được hiển thị testimonial, rating, customer count hoặc marketing claim giả như bằng chứng production.

## Accessibility

- Ưu tiên phần tử HTML semantic và accessible name rõ ràng; không biến `div` thành button/link nếu phần tử native đáp ứng được.
- Mọi interaction phải dùng được bằng bàn phím, có focus visible và giữ thứ tự focus hợp lý.
- Input phải có label liên kết; lỗi form phải được mô tả và liên kết bằng `aria-describedby` khi cần.
- Icon-only button phải có accessible label; ảnh nội dung có `alt` hữu ích, ảnh trang trí dùng alt rỗng.
- Dialog, popover, menu và tooltip ưu tiên primitive Radix hiện có để giữ focus management và ARIA.
- Motion phải tôn trọng `prefers-reduced-motion`; không dùng animation làm cách duy nhất truyền đạt trạng thái.
- Kiểm tra responsive tối thiểu tại 320, 375, 414, 768 và 1440 px; không tạo horizontal overflow hoặc label CTA bị wrap sai.
