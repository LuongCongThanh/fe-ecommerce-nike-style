# Danh sách Locale đóng, quản lý trong code — không phải runtime/CMS-managed

Status: accepted

Dự án hỗ trợ đa ngôn ngữ (Locale) từ đầu (VN + EN), và cần tránh lặp lại lỗi đã thấy ở `ecommerce-next` — nơi danh sách locale bị hard-code rải rác ở nhiều chỗ không đồng bộ (`middleware.ts`: vừa có mảng `['vi', 'en']`, vừa có regex riêng, vừa có fallback nhị phân `en`/`vi`). Quyết định: `SUPPORTED_LOCALES` là một nguồn sự thật duy nhất trong code (một package/config trung tâm); thêm locale mới nghĩa là sửa đúng một chỗ đó rồi deploy lại — không phải một danh sách quản lý runtime qua Admin/CMS.

## Considered Options

- **Runtime/CMS-managed locale list**: Admin có thể bật/tắt locale mà không cần deploy code. Bị từ chối vì kéo theo khối lượng việc lớn không tương xứng với nhu cầu hiện tại — content-per-locale workflow trong CMS, fallback logic khi thiếu bản dịch, UI quản lý locale trong Admin — trong khi phạm vi thực tế chỉ cần VN + EN, chưa có nhu cầu nghiệp vụ cụ thể nào đòi hỏi bật locale không cần deploy.
