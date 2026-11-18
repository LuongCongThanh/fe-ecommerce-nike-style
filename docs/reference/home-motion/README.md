# Hồ sơ animation trang chủ

Tổng hợp sáu việc cải thiện animation đã được đánh dấu hoàn thành. Mốc đối chiếu của đợt rà là `30961c2`. Mã trang chủ hiện nằm trong `src/features/home/`.

| Mục | Nội dung đã ghi nhận                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------- |
| 001 | Đồng bộ `TrustBadgeList` với nhịp stagger của `SectionHero`. Bản viết lại Hero ở `30961c2` đã đáp ứng mục này.    |
| 002 | Bổ sung scroll reveal cho sáu nhóm nội dung tĩnh qua primitive dùng chung.                                        |
| 003 | Crossfade giữa form newsletter và trạng thái gửi thành công.                                                      |
| 004 | Căn thời điểm xuất hiện của HeroCarousel theo nhịp chữ Hero.                                                      |
| 005 | Dùng chung easing và duration cho motion trang chủ. Thứ tự 004 trước 005 giúp gom cả giá trị được thêm trong 004. |
| 006 | Dùng chuỗi `transform` đầy đủ trong biến thể reveal của `SectionHero`.                                            |

Khi sửa tiếp, kiểm tra reduced motion, lần xuất hiện đầu, trạng thái gửi newsletter và sự phối hợp giữa chữ, ảnh và carousel. Quy tắc WebGL và baseline LCP nằm trong [hướng dẫn kỹ thuật](../../FRONTEND-GUIDE.md#27-threejs-trong-storefront).
