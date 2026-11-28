# Kiểm kê convention và phạm vi tái cấu trúc còn lại

Ngày đối chiếu: 18/11/2026. Đây là kiểm kê tĩnh toàn cây và sửa convention, không phải xác nhận đã refactor toàn bộ ứng dụng.

## Bằng chứng và xử lý

| Phạm vi         | Phát hiện                                                                                                                   | Kết quả                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Phạm vi rule    | Sáu rule strict TS, SOLID, loading/toast, render, UI/accessibility và error chỉ khớp apps/packages đã xóa (UI còn khớp CSS) | Chuyển paths sang source hiện tại; strict TS bao gồm scripts                                                |
| Alias/UI        | Ví dụ dùng @repo/ui, @repo/api-sdk, @repo/schemas và @repo/shared/notification                                              | Đổi sang module @/ hiện hữu                                                                                 |
| Ownership       | Rule hướng dẫn logic cạnh page, test dưới **tests**, dùng src/core                                                          | Đồng bộ features, colocated test và shared                                                                  |
| Data flow       | Ví dụ còn dùng (shop)/_lib và Admin products, bắt mọi endpoint dùng Zod dù catalog đã dùng OpenAPI                          | Thay bằng đường dẫn catalog hiện hữu; phân biệt contract pin và Zod chuyển tiếp                             |
| Admin/CMS       | Rule admin-cms yêu cầu proxy microfrontend và base path cũ                                                                  | Xóa rule không còn thuộc app; sửa hai index                                                                 |
| i18n/mock       | Rule storefront nói mock-first cho mọi luồng                                                                                | Ghi rõ catalog dùng API thật, các luồng chờ cutover giữ MSW; bỏ runtime i18n Admin/CMS khỏi rule storefront |
| Shared boundary | Scan import @/features từ src/shared                                                                                        | Không có cạnh import tĩnh dạng này; không chứng minh mọi boundary đều đúng                                  |
| Service         | addressActions, profileActions, checkoutActions chỉ alias endpoint                                                          | Tạo ticket kiểm kê consumer trước khi gộp; order service có fallback thực sự nên không xóa theo mẫu         |
| Runner          | readTasks đọc mọi spec, selectTask lọc ready-for-agent nhưng không lọc Wayfinder labels                                     | Ticket kiểm tra sự nhất quán tracker/runner; hiện các ticket Wayfinder không có trạng thái ready-for-agent  |
| Docs            | Tài liệu UI 1641 dòng, kế hoạch liên repo 956, skill guide 356, hệ thống runner 292                                         | Ticket ownership riêng; số dòng không phải bằng chứng để xóa                                                |

## Kiểm tra

- Đọc và rà mọi file trong .claude/rules; không còn paths trỏ tới apps/packages.
- Kiểm tra đích file của Markdown links trên README, CONTRIBUTING, AGENTS, docs và rules: không có đích thiếu. Không kiểm tra URL ngoài hoặc anchor trong trang.
- Rà các alias lịch sử trong rules; chỉ giữ ví dụ forbidden import và giải thích thư mục đã xóa.
- Prettier cho rules và các ticket mới; git diff --check.
- Không chạy lại 1044 test hoặc build: đợt này chỉ thay Markdown, không đổi code/config runtime. Kết quả lần trước thuộc ticket cleanup, không được coi là kiểm thử mới cho toàn bộ bản đồ.

## Phần chưa kết luận

Cây thư mục có features/shared không đủ chứng minh ownership đúng. Chưa rà đầy đủ cross-feature dependency, public seam, mock exports, unused assets/dependencies và khả năng runner resume trong các failure path. Các câu hỏi cụ thể nằm ở ticket nguồn, workflow và documentation ownership. Chưa commit/push/PR.
