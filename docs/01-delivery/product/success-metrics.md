# Success Metrics

## Mục đích

Tài liệu này bổ sung lớp đo lường ở cấp sản phẩm cho bộ `docs/`. Các metric kỹ thuật như LCP, CLS, INP, Lighthouse vẫn giữ ở [`../FE/FE.md`](../FE/FE.md) §9. File này chỉ tập trung vào việc trả lời: sau khi phát hành, làm sao biết sản phẩm đang tạo giá trị.

## Nguyên tắc

- Ưu tiên metric gần với hành vi thật của người dùng.
- Không dùng vanity metric làm tiêu chí thành công chính.
- Mỗi capability lớn nên có ít nhất 1 metric outcome và 1 metric guardrail.
- Khi chưa có analytics thật, metric vẫn được giữ như mục tiêu để định hướng instrument sau này.

## North Star định hướng

Ở giai đoạn hiện tại, North Star tạm dùng là:

`Completed COD orders per active week`

Lý do:

- Bám sát giá trị cốt lõi của storefront MVP.
- Bao phủ chuỗi Browse → PDP → Add to cart → Checkout → Order success.
- Không bị đánh lừa bởi traffic hoặc add-to-cart đơn thuần.

## Metric theo capability

| Capability                    | Outcome metric                                                         | Guardrail metric                                             | Ghi chú                                                                       |
| ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Storefront browse + discovery | Tỷ lệ từ PLP/Search sang PDP                                           | Bounce rate của PLP/Search                                   | Dùng để xem IA, search và card UI có dẫn được người dùng đi tiếp hay không    |
| PDP                           | Add-to-cart rate từ PDP                                                | Tỷ lệ lỗi chọn variant / add-to-cart fail                    | Nếu PDP đẹp nhưng add-to-cart thấp, thường nằm ở variant selection hoặc trust |
| Cart                          | Cart-to-checkout start rate                                            | Tỷ lệ rollback do tồn kho / giá thay đổi                     | Guardrail này bám với chiến lược mock/API contract hiện tại                   |
| Checkout COD                  | Checkout completion rate                                               | Tỷ lệ drop ở từng bước Contact / Address / Shipping / Review | Capability quan trọng nhất của MVP storefront                                 |
| Authentication                | Tỷ lệ sign-up hoàn tất, tỷ lệ sign-in thành công                       | Tỷ lệ lỗi auth / reset password fail                         | Auth có trong MVP nên phải đo riêng, không coi là phần phụ                    |
| Wishlist                      | Tỷ lệ user dùng wishlist, tỷ lệ merge guest → authenticated thành công | Tỷ lệ lỗi optimistic toggle / merge fail                     | Nên đo riêng vì wishlist có logic cross-session                               |
| CMS                           | Thời gian từ draft đầu tiên đến publish                                | Tỷ lệ publish fail / preview mismatch                        | Giúp đánh giá công cụ nội bộ có thực sự usable không                          |
| Admin                         | Thời gian hoàn tất tác vụ cập nhật sản phẩm / trạng thái đơn hàng      | Tỷ lệ lỗi thao tác hoặc phải làm lại                         | Dùng để đo hiệu quả vận hành, không chỉ correctness                           |

## Metric theo release

### Launch 1

- Có thể hoàn tất đơn COD từ đầu đến cuối.
- Tỷ lệ lỗi chặn checkout ở mức chấp nhận được.
- Wishlist merge không làm mất dữ liệu.
- CMS publish được ít nhất các loại content P0.

### Sau launch

- Tăng tỷ lệ add-to-cart từ PDP.
- Tăng tỷ lệ hoàn tất checkout.
- Giảm thời gian thao tác nội bộ trong Admin/CMS.

## Instrumentation cần có khi bắt đầu tích hợp analytics thật

- `view_product_list`
- `view_product_detail`
- `select_variant`
- `add_to_cart`
- `begin_checkout`
- `place_cod_order`
- `sign_up_success`
- `sign_in_success`
- `wishlist_toggle`
- `wishlist_merge_success`
- `cms_preview`
- `cms_publish_success`
- `admin_product_update_success`

## Chưa chốt

- Công cụ analytics cụ thể.
- Dashboard owner.
- Ngưỡng số tuyệt đối cho từng metric khi chưa có baseline traffic thật.

Các câu hỏi này nên được chốt trước khi sản phẩm có traffic thật hoặc trước đợt soft launch đầu tiên.
