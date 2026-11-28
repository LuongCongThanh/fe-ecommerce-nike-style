# UI workflow và chọn skill

Owner: maintainer; visual contract và commerce interaction checks ở [design](../../DESIGN.md), thực thi ở `.agents/skills/fashion-storefront-ui-director/SKILL.md` (Claude entry dùng cùng nguồn).

Gọi `/fashion-storefront-ui-director <brief>` trong Claude hoặc `$fashion-storefront-ui-director` trong Codex; nếu skill không được harness expose thì đọc source và ghi giới hạn. Chọn ít skill phù hợp, không cài/nạp catalog toàn bộ.

| Công việc                  | Skill theo nhu cầu                                             | Kết quả                                                |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| Trang mới/redesign         | ui-ux-pro-max, design-taste-frontend, hallmark                 | Direction gắn business goal và locked design           |
| Composition/implementation | emil-design-eng, pick-ui-library                               | Tái dùng UI hiện có                                    |
| Polish/review/mobile       | impeccable, hallmark, mobile-native, break-ui                  | Findings ưu tiên và browser states                     |
| Motion                     | animation-vocabulary, review-animations, animation-performance | Purpose/trigger/easing/reduced-motion                  |
| So sánh phương án          | prototype                                                      | Hai hoặc ba direction có khác biệt thật                |
| Hero/PDP 3D hiện có        | director + architecture                                        | Dynamic load, static fallback, disposal và measurement |

GSAP/Scroll World/Canvas là lựa chọn khi yêu cầu có lý do riêng, không phải dependencies đã cài hay mặc định mọi task. Dùng Framer Motion hiện có trước, không thêm UI kit hoặc dependency chỉ vì skill gợi ý.

Ví dụ: polish PLP dùng director + mobile/review, inspect URL filters và API data; không đổi transport. Sửa Hero motion dùng director + motion review, kiểm first entry/reduced motion/static fallback và LCP nếu mount đổi. Sửa PDP 3D theo architecture hiện tại; PDP có implementation riêng, không giả định mọi gate Hero đã áp dụng.

Trước code chốt route/action/content source, desktop/mobile và loading/empty/error/unavailable/focus. Sau code ghi browser route/viewport/state, lệnh thực sự chạy và hạn chế. Workflow runner hiện còn gap evidence; [roadmap](../plan/roadmap.md) giữ accepted fix. Không báo pass UI từ findings rỗng khi browser không chạy.
