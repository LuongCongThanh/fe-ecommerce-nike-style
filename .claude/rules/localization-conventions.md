---
paths:
  - 'apps/storefront/src/**/*.{ts,tsx,json}'
  - 'apps/admin/src/**/*.{ts,tsx,json}'
  - 'apps/cms/src/**/*.{ts,tsx,json}'
  - 'packages/i18n/**'
---

# Convention localization

- Storefront dùng `next-intl`; Admin và CMS dùng `react-i18next`. Không trộn API của hai thư viện.
- Storefront phải có message cho cả `vi` và `en`; tiếng Việt là locale mặc định và fallback.
- Admin/CMS dùng translation key cho UI chrome và mặc định hiển thị tiếng Việt; không hard-code chuỗi mới trong JSX nếu màn hình đã dùng namespace i18n.
- Thêm cùng một key vào mọi locale/namespace liên quan trong cùng thay đổi; giữ cấu trúc key đồng nhất giữa các locale.
- Key mô tả ý nghĩa (`checkout.submitOrder`), không mô tả vị trí hoặc wording hiện tại (`greenButton`, `text1`).
- Không ghép câu dịch từ nhiều fragment khi trật tự từ có thể khác giữa ngôn ngữ; dùng interpolation/pluralization của thư viện.
- Format ngày, số và tiền tệ bằng locale phù hợp; không tự nối ký hiệu tiền hoặc hard-code định dạng ngày trong component.
- Nội dung do backend/CMS cung cấp dùng Localized Text theo contract; UI label tĩnh dùng message catalog.
