# Bàn giao delivery Storefront

Ngày 25/11/2026. Người dùng yêu cầu viết specs từ backlog đã chốt. Mười lăm task mới đều todo, không có labels Wayfinder; blocker dùng identity thư mục thật. Thứ tự tuần tự giữ checkpoint catalog và migration trước SSR.

## Delivery specs

| Task                                                                                                       | Trạng thái | Blocked by                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Nền kiểm chứng và baseline có thể tái lập](../34-storefront-verification-foundation/spec.md)              | todo       | [Chia các đợt triển khai và blocker thế nào để mỗi đợt có thể build và kiểm tra độc lập?](spec.md) |
| [Rule và convention hỗ trợ migration có giới hạn](../35-storefront-migration-rules/spec.md)                | todo       | [Nền kiểm chứng và baseline có thể tái lập](../34-storefront-verification-foundation/spec.md)                                          |
| [Shared components và cơ chế dùng chung](../36-storefront-shared-migration/spec.md)                        | todo       | [Rule và convention hỗ trợ migration có giới hạn](../35-storefront-migration-rules/spec.md)                                            |
| [Providers và layouts giữ lifecycle](../37-storefront-providers-layouts/spec.md)                           | todo       | [Shared components và cơ chế dùng chung](../36-storefront-shared-migration/spec.md)                                                    |
| [Catalog thí điểm nguyên owner và wishlist composition](../38-storefront-catalog-migration/spec.md)        | todo       | [Providers và layouts giữ lifecycle](../37-storefront-providers-layouts/spec.md)                                                       |
| [Integration Backend và generated contract chuyển đồng lượt](../39-storefront-backend-integration/spec.md) | todo       | [Catalog thí điểm nguyên owner và wishlist composition](../38-storefront-catalog-migration/spec.md)                                    |
| [Auth và account theo public session boundary](../40-storefront-auth-account-migration/spec.md)            | todo       | [Integration Backend và generated contract chuyển đồng lượt](../39-storefront-backend-integration/spec.md)                             |
| [Cart và wishlist giữ persistence và merge](../41-storefront-cart-wishlist-migration/spec.md)              | todo       | [Auth và account theo public session boundary](../40-storefront-auth-account-migration/spec.md)                                        |
| [Orders và checkout giữ workflow và route contract](../42-storefront-orders-checkout-migration/spec.md)    | todo       | [Cart và wishlist giữ persistence và merge](../41-storefront-cart-wishlist-migration/spec.md)                                          |
| [Home và phần triển khai còn lại trong route](../43-storefront-home-route-migration/spec.md)               | todo       | [Orders và checkout giữ workflow và route contract](../42-storefront-orders-checkout-migration/spec.md)                                |
| [Khóa migration và xóa ngoại lệ đã hết consumer](../44-storefront-migration-cleanup/spec.md)               | todo       | [Home và phần triển khai còn lại trong route](../43-storefront-home-route-migration/spec.md)                                           |
| [SSR public reader và danh sách sản phẩm thí điểm](../45-storefront-ssr-products/spec.md)                  | todo       | [Khóa migration và xóa ngoại lệ đã hết consumer](../44-storefront-migration-cleanup/spec.md)                                           |
| [SSR category và search theo URL hiện có](../46-storefront-ssr-category-search/spec.md)                    | todo       | [SSR public reader và danh sách sản phẩm thí điểm](../45-storefront-ssr-products/spec.md)                                              |
| [SSR product detail và related products](../47-storefront-ssr-product-detail/spec.md)                      | todo       | [SSR category và search theo URL hiện có](../46-storefront-ssr-category-search/spec.md)                                                |
| [SSR phần catalog trên home và bàn giao trạng thái cuối](../48-storefront-ssr-home/spec.md)                | todo       | [SSR product detail và related products](../47-storefront-ssr-product-detail/spec.md)                                                  |

## Giao nhau và preflight bắt buộc

Đây là coordination check trước triển khai, không thêm blocker tùy ý vào các quyết định đã duyệt và không tự đổi trạng thái task cũ. Nếu một thay đổi là prerequisite thật sau reconcile, chỉ người dùng chốt cập nhật scope/blocker. Không triển khai hai task đang xung đột cùng lúc.

| Task đang có                                                         | Đợt cần đối chiếu / lý do                                                                      |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [category-breadcrumb-trail](../01-category-breadcrumb-trail/spec.md) | Catalog: giữ breadcrumb và test, không dựa vào index cũ để kết luận merge.                     |
| [order-date-locale](../02-order-date-locale/spec.md)                 | Orders: giữ date locale helper/consumer.                                                       |
| [pagination-window](../03-pagination-window/spec.md)                 | Shared/catalog: pagination component và test.                                                  |
| [order-status-badge-i18n](../../todo/04-order-status-badge-i18n/spec.md)     | Orders: status label i18n, không ghi đè task đang ready.                                       |
| [remove-dead-app-config](../05-remove-dead-app-config/spec.md)       | Shared/cleanup: không di chuyển hoặc tạo lại config đã xóa.                                    |
| [order-return-lifecycle](../../todo/06-order-return-lifecycle/spec.md)       | Orders: migration không triển khai thêm return lifecycle.                                      |
| [env-contract](../../todo/22-env-contract/spec.md)                           | Nền harness/SDK/SSR: env naming và API origin; dùng source mới nếu task đã hoàn thành.         |
| [remove-sentry](../../todo/23-remove-sentry/spec.md)                         | Shared/home route: nếu monitoring đã gỡ không tạo lại sentry helper.                           |
| [remove-tailwind-config](../../todo/24-remove-tailwind-config/spec.md)       | Shared/config: giữ CSS/build setup thực tế, không phục hồi Tailwind legacy.                    |
| [git-hook-scope](../../todo/25-git-hook-scope/spec.md)                       | Foundation: hook config và required gates, không sửa workflow ngoài slice.                     |
| [pin-node-version](../../todo/26-pin-node-version/spec.md)                   | Foundation/CI: toolchain/version phải theo pin thực tế lúc chạy.                               |
| [eslint-single-config](../../todo/27-eslint-single-config/spec.md)           | Rule/shared/SDK: không tái tạo eslint.base nếu task đã gộp config; giữ bằng chứng lint parity. |
| [next-config-hardening](../../todo/28-next-config-hardening/spec.md)         | Foundation/SSR/PWA: origin, rewrite, headers; không revert hardening.                          |
| [pnpm-settings-and-pinning](../../todo/29-pnpm-settings-and-pinning/spec.md) | Foundation/CI: package manager, install/pinning; không nâng pin ngoài scope.                   |
| [format-scope](../../todo/30-format-scope/spec.md)                           | Foundation/root gates: format phạm vi theo config thật.                                        |
| [skills-lock-integrity](../../todo/31-skills-lock-integrity/spec.md)         | Rule/convention: sync skill mirrors chỉ nếu sửa skill, không ghi đè lock.                      |
| [middleware-to-proxy](../32-middleware-to-proxy/spec.md)             | Auth/shared/thin routes: dùng entry hiện tại, không phục hồi middleware nếu đã chuyển proxy.   |
| [remove-admin-route-guard](../../todo/33-remove-admin-route-guard/spec.md)   | Auth/shared: giữ guard scope mới nếu task đã hoàn thành, không khôi phục admin legacy.         |

## Ranh giới handoff

- Wayfinder map vẫn done; đây là delivery queue todo, không resolve thêm decision ticket.
- Người dùng triage quyền/config và ready-for-agent sau khi spec/blocker đủ điều kiện; riêng foundation rule/stop files có phần phải làm trong phiên tương tác.
- Source snapshot trong manifest có thể trước prerequisite; plan phải refresh và dùng owner đích, không coi file chưa migrate là đường đích cuối.
- Không có source/test/config ứng dụng được thay bởi lần ghi specs; chưa có plan/report/metric runtime giả định hoặc test pass giả.
