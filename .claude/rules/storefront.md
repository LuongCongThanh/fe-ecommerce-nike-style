---
paths:
  - 'apps/storefront/**'
---

# Quy tắc Storefront

- Giữ nguyên quy ước Next.js App Router và locale segment đang được các route lân cận sử dụng.
- Nội dung dành cho khách hàng phải hỗ trợ cả `vi` và `en`; tiếng Việt là locale mặc định.
- Lưu filter catalog, sort, pagination và navigation state có thể chia sẻ trong URL.
- Giữ luồng API mock-first thông qua server/browser adapter trong `@repo/api-sdk`.
- Coi performance, accessibility, metadata và responsive là acceptance criteria của UI phục vụ khách hàng.
- Serwist không được xung đột với MSW trong development; giữ nguyên cơ chế giới hạn theo environment hiện có.
- Thêm hoặc cập nhật Vitest gần nhất cho logic/component và Playwright cho browser flow quan trọng.
