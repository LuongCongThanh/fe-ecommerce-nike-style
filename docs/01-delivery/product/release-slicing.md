# Release Slicing

## Mục đích

Roadmap theo phase trong [`../architecture/frontend/11-roadmap.md`](../architecture/frontend/11-roadmap.md) rất tốt cho triển khai kỹ thuật. File này thêm một lớp nhìn theo phát hành sản phẩm: cái gì chặn launch, cái gì nên theo sau, và cái gì có thể để sau nữa.

## Quy ước

- `Launch-blocking`: thiếu là chưa nên ra mắt.
- `Post-launch`: nên làm sớm sau launch đầu tiên.
- `Later`: có giá trị nhưng không nên chiếm chỗ của capability cốt lõi.

## Launch 1 — Storefront commerce core

### Launch-blocking

- PLP hoạt động, filter/sort/pagination đúng URL.
- PDP hoạt động, chọn variant đúng SKU.
- Search cơ bản hoạt động: tìm kiếm sản phẩm, trả kết quả ổn định, không làm vỡ luồng browse.
- Add to cart, cart update, rollback khi lỗi.
- Checkout COD hoàn chỉnh.
- Order success.
- Authentication cơ bản: sign in/up, account guard.
- Account core hoạt động: profile, địa chỉ, lịch sử đơn hàng xem được ở mức đủ dùng.
- Wishlist toggle + merge guest → authenticated.
- Home có đủ content tối thiểu để storefront không trống.
- CMS publish được các content P0 phục vụ Home/SEO cơ bản.

Các mục này **không** phủ định dependency kỹ thuật trong [`../architecture/frontend/11-roadmap.md`](../architecture/frontend/11-roadmap.md). Ví dụ, Search cơ bản chặn Launch 1, nhưng predictive search, tuning relevance, và các tối ưu sâu hơn vẫn có thể đi sau nếu nền tảng đã đủ cho luồng MVP.

### Post-launch

- Search nâng cao và tuning relevance.
- Account polish: cải thiện trình bày order history, quản lý tài khoản sâu hơn, tinh chỉnh UX không chặn luồng mua hàng.
- Recently viewed, related products.
- CMS content types P1/P2 hoàn thiện hơn.

### Later

- Tối ưu conversion nâng cao.
- Animation/marketing experience cao cấp ngoài critical path.
- Dashboard nội bộ không chặn vận hành.

## Admin / CMS slicing

### Launch-blocking cho vận hành nội bộ

- Admin CRUD sản phẩm.
- Admin cập nhật trạng thái đơn hàng.
- CMS draft → preview → publish cho content P0.

### Post-launch cho vận hành nội bộ

- Category management polish.
- Inventory tooling tốt hơn.
- Blog/Campaign workflow đầy đủ hơn.

### Later

- Dashboard BI nội bộ.
- Quyền chi tiết vượt nhu cầu thực tế ban đầu.

## Cách dùng với roadmap phase

- `11-roadmap.md` vẫn là nguồn chính cho thứ tự kỹ thuật.
- File này chỉ trả lời câu hỏi phát hành.
- Khi có xung đột giữa “nên build theo nền tảng” và “nên ship sớm”, ưu tiên roadmap phase cho dependency kỹ thuật, nhưng dùng file này để tránh scope creep.
- Không copy lại checklist kỹ thuật chi tiết từ roadmap sang đây. File này chỉ giữ quyết định ở cấp phát hành và ưu tiên sản phẩm.
