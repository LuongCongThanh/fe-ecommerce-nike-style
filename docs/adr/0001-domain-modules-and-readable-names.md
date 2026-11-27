---
status: accepted
---

# Storefront theo module nghiệp vụ và tên diễn đạt trách nhiệm

Ghi chú 27/11/2026: migration và các slice SSR 34–48 đã hoàn tất. Nội dung “chưa triển khai” bên dưới phản ánh thời điểm quyết định ban đầu; hiện trạng đọc tại [architecture](../storefront/architecture.md).

Ngày quyết định: 24/11/2026. Thiết kế được người dùng duyệt trong phiên thảo luận; source chưa được chuyển đổi. Storefront tiếp tục dùng Next.js App Router, tổ chức theo module nghiệp vụ và áp dụng Clean/Hexagonal chọn lọc cho logic có ranh giới thực sự cần bảo vệ. Ưu tiên tên gần gũi, trách nhiệm rõ và chuyển đổi từng phần để giữ hành vi hiện tại.

`src/app` chỉ giữ điểm vào Next.js và phần nối mỏng; triển khai nằm ngoài trong `providers`, `layouts`, `modules`, `integrations/backend`, `shared/components`. Module chia theo màn hình/chức năng khi lớn, chỉ tạo các folder kỹ thuật cần thiết. Service/type/schema/store có hậu tố `.service.ts`, `.types.ts`, `.schema.ts`, `.store.ts`; component PascalCase và hook `use...` không cần hậu tố bổ sung. Test đặt cạnh owner; E2E ở root `e2e`.

Module chỉ dùng public API được cho phép của module khác; không deep-import private hoặc tạo barrel `index.ts`. Form schema thuộc module; schema API thuộc phần tích hợp Backend. Logic nghiệp vụ độc lập React khi có giá trị, interface nhỏ theo consumer; không thêm lớp chuyển tiếp để đủ hình thức SOLID.

## Các phương án đã cân nhắc

- Colocation toàn bộ theo route làm phần triển khai gắn với URL và khó chia sẻ giữa nhiều màn hình; giữ route mỏng phù hợp nhu cầu người dùng.
- FSD đầy đủ cần phân lại entity/action/widget và ownership hiện tại; chọn module nghiệp vụ với boundary có kiểm soát, không tuyên bố tuân toàn bộ FSD.
- Clean/Hexagonal đủ tầng cho mọi module làm tăng contract và lớp chuyển tiếp; dùng chọn lọc ở workflow phức tạp hoặc adapter runtime.
- Giữ `lib`, `composition`, `application` làm tên gom rộng khó đọc với người bảo trì hiện tại; thay bằng tên trách nhiệm cụ thể dù phải cập nhật import/rule khi migrate.

## Hệ quả

Đây là cấu trúc đích đã duyệt, chưa là convention đã triển khai trong executable config. Rule hiện hành tiếp tục áp dụng cho source cũ cho tới khi migration cập nhật owner và config trong cùng lát cắt. Không tự đổi contract Backend, authentication, URL, state ownership hoặc delivery status của task.

Xem [thiết kế và lộ trình](../storefront/plan/done/16-storefront-refactor-map/design.md), [nghiên cứu cấu trúc](../research/nextjs-storefront-structure.md), [nghiên cứu naming và quyết định đã chốt](../research/nextjs-naming-conventions.md). [Architecture](../storefront/architecture.md) tiếp tục sở hữu mô tả hiện trạng.
