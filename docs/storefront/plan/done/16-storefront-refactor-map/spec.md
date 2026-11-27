---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:map]
---

# Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu

## Destination

Hoàn thiện các quyết định và kế hoạch triển khai tái cấu trúc Storefront đã duyệt: có mapping source, public boundary, runtime invariants, kiểm chứng và backlog các đợt có dependency rõ, đủ để viết delivery specs mà không phải đoán lại thiết kế. Map hoàn tất khi đường triển khai rõ, không đồng nghĩa source đã được chuyển.

## Notes

- Ngày 24/11/2026, người dùng yêu cầu dùng Wayfinder để lên kế hoạch thực hiện [thiết kế đích](design.md) theo [quyết định kiến trúc](../../../../adr/0001-domain-modules-and-readable-names.md). Tên và cấu trúc đã duyệt là input, không hỏi lại các quyết định đã chốt.
- Đọc rule map, tracker và owner source trước khi làm ticket. Grilling dùng kỹ năng grilling và domain-modeling. Từ vựng nghiệp vụ theo GLOSSARY; convention kỹ thuật không đưa vào glossary. Các nghiên cứu có sẵn được dẫn từ ADR, không nghiên cứu lại khi không có khoảng trống cụ thể.
- Chỉ lập kế hoạch/ghi quyết định; không có ngoại lệ execution. Không branch, commit, push, PR, đổi source, contract Backend/CMS hoặc delivery status trong charting. Giữ thay đổi đang có.
- Tracker cục bộ: children là spec có Part of trỏ map này; labels chỉ wayfinder; blocked-by dùng tên folder. Frontier truy vấn children todo/ready-for-agent chưa claim và blocker done, theo thứ tự chỉ mục kế hoạch. Không liệt kê ticket mở trong body map.
- Claim bằng in-progress và assignee trước khi giải ticket. Resolution append vào Comments, rồi done và gist/link trong Decisions so far. Phiên charting không resolve ticket nào; phiên làm việc tối đa một decision ticket, theo skill.

## Decisions so far

- [Mỗi file hiện tại sẽ chuyển về đâu và còn consumer nào cần giữ?](../17-storefront-migration-inventory/spec.md#comments): đã kiểm kê source/config, mapping ADR và consumer; owner/public/runtime chưa chốt được đánh dấu để các quyết định kế tiếp xử lý.

- [Module nào được dùng phần công khai nào của module khác?](../18-storefront-module-boundaries/spec.md#comments): chốt public entry, bỏ vòng catalog–wishlist qua composition, owner helper/type và allowlist production/test/migration.

- [Di chuyển provider và SDK thế nào để giữ đúng session, cache và server/client?](../19-storefront-runtime-boundaries/spec.md#comments): chốt runtime migration, reader SSR public độc lập session, cache/hydration theo request, phạm vi và fallback; triển khai SSR riêng.

- [Cần giữ hoặc bổ sung bằng chứng nào để xác nhận refactor không đổi hành vi?](../20-storefront-verification-policy/spec.md#comments): chốt baseline/quyền test, ma trận gates, HTTP fixture harness và production SSR/PWA evidence; phân biệt kế hoạch với kiểm tra đã chạy.

- [Chia các đợt triển khai và blocker thế nào để mỗi đợt có thể build và kiểm tra độc lập?](../21-storefront-delivery-breakdown/spec.md#comments): chốt backlog mười một đợt chuẩn bị/migration và bốn đợt SSR, dependency, consumer scope, gates và rollback.

## Not yet specified

Không còn câu hỏi chưa xác định cản handoff vào ngày 25/11/2026. Catalog pilot có checkpoint review trong backlog; nếu triển khai lộ seam mới thì ghi câu hỏi cụ thể để wayfinding bổ sung, không tự thêm abstraction/package hoặc mở lại các quyết định đã chốt.

## Out of scope

Triển khai source trong map này; thay đổi giao diện, URL, locale, nghiệp vụ commerce, auth/API cutover, contract Backend/CMS, nâng dependency, đổi toàn app sang FSD hoặc full Clean/Hexagonal, commit/push/PR/merge. SSR catalog đã nằm trong hướng đích nhưng triển khai và đo hiệu năng thuộc delivery runtime riêng sau khi chốt ranh giới.

## Comments

### 25/11/2026 — Hoàn tất map và bàn giao

Tất cả năm child đã có resolution. Đích đến đã đạt ở mức quyết định/kế hoạch: inventory, public boundary, runtime/SSR, kiểm chứng và backlog đủ để viết delivery specs. Không còn frontier hoặc fog hiện tại cần giải trước handoff. Map done không đồng nghĩa source đã migrate, test hành vi đã chạy hoặc PR đã merge. Bước tiếp theo là viết delivery specs từ backlog, bắt đầu Nền kiểm chứng và baseline có thể tái lập; specs mới ở todo theo tracker.
