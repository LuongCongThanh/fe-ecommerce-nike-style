---
status: in-progress
blocked-by: []
kind: docs
labels: [wayfinder:map]
---

# Đồng bộ workflow, cấu trúc và tài liệu storefront

## Destination

Rà toàn bộ workflow tương tác/runner/CI, ranh giới source và hệ thống tài liệu; chốt hoặc triển khai từng đợt có kiểm chứng để cấu trúc và hướng dẫn khớp checkout. Hoàn tất khi các quyết định trong phạm vi đã có resolution, không chỉ khi gate của một đợt cleanup xanh.

## Notes

Chủ repo phản hồi cleanup ban đầu quá hẹp. Map được mở lại ngày 18/11/2026: kết quả ticket cleanup vẫn đúng cho đợt đó, nhưng không chứng minh hoàn tất mục tiêu tổng thể.

Ngày 18/11/2026, chủ repo đồng ý bao gồm workflow phát triển và GitHub Actions, đồng thời cho triển khai trực tiếp cleanup trong map này. Đây là ngoại lệ execution của Wayfinder. Giữ thay đổi đang có, URL và hành vi sản phẩm. Không tạo branch, commit, push hoặc PR trong phiên này.

## Decisions so far

- [Đồng bộ cấu trúc hiện tại và các gate kiểm tra](../08-workflow-structure-cleanup/spec.md): giữ kiến trúc features/shared đã có, hợp nhất hướng dẫn cũ và bổ sung build CI; kiểm tra local đạt.

- [Kiểm kê độ lệch convention sau khi tách repository](../09-convention-audit/spec.md): sửa rule không khớp source và alias cũ; kiểm kê lộ ra các quyết định source, workflow và ownership tài liệu còn mở.

- [Ranh giới feature và các lớp service có còn cần thiết?](../10-source-boundaries/spec.md): bỏ alias endpoint, chuyển form/UI/composition về nơi sở hữu và giữ seam có hành vi; phát hiện câu hỏi provider mount còn mở.

## Not yet specified

Ảnh hưởng của việc gộp hoặc xóa tài liệu dài tới các skill và prompt nạp tài liệu; các thay đổi tiếp theo chỉ được xác định sau khi kiểm kê consumer. Cutover API và thay đổi nghiệp vụ là nỗ lực riêng.

## Out of scope

Backend/CMS, hợp đồng API, vòng đời trả hàng, xóa MSW trước cutover và thay đổi giao diện.
