---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:map]
---

# Đồng bộ workflow, cấu trúc và tài liệu storefront

## Destination

Rà toàn bộ workflow tương tác/runner/CI, ranh giới source và hệ thống tài liệu; chốt hoặc triển khai từng đợt có kiểm chứng để cấu trúc và hướng dẫn khớp checkout. Hoàn tất khi các quyết định trong phạm vi đã có resolution, không chỉ khi gate của một đợt cleanup xanh.

## Notes

Ngày 18/11/2026, chủ repo chốt hoàn thiện repo, workflow và docs trước; API giỏ hàng/checkout thuộc lộ trình sản phẩm riêng. [Kế hoạch tổ chức tài liệu và hoàn tất rebuild](../12-documentation-ownership/plan.md) là artifact chi tiết của quyết định ownership, không phải map thứ hai. Phiên lập kế hoạch chưa xóa/di chuyển bộ docs vận hành.

Chủ repo phản hồi cleanup ban đầu quá hẹp. Map được mở lại ngày 18/11/2026: kết quả ticket cleanup vẫn đúng cho đợt đó, nhưng không chứng minh hoàn tất mục tiêu tổng thể.

Ngày 18/11/2026, chủ repo đồng ý bao gồm workflow phát triển và GitHub Actions, đồng thời cho triển khai trực tiếp cleanup trong map này. Đây là ngoại lệ execution của Wayfinder. Giữ thay đổi đang có, URL và hành vi sản phẩm. Không tạo branch, commit, push hoặc PR trong phiên này.

## Decisions so far

- [Đồng bộ cấu trúc hiện tại và các gate kiểm tra](../08-workflow-structure-cleanup/spec.md): giữ kiến trúc features/shared đã có, hợp nhất hướng dẫn cũ và bổ sung build CI; kiểm tra local đạt.

- [Kiểm kê độ lệch convention sau khi tách repository](../09-convention-audit/spec.md): sửa rule không khớp source và alias cũ; kiểm kê lộ ra các quyết định source, workflow và ownership tài liệu còn mở.

- [Ranh giới feature và các lớp service có còn cần thiết?](../10-source-boundaries/spec.md): bỏ alias endpoint, chuyển form/UI/composition về nơi sở hữu và giữ seam có hành vi; phát hiện câu hỏi provider mount còn mở.

- [Provider cấp app nên được mount ở layout nào?](../13-provider-ownership/spec.md): root layout sở hữu một bộ provider; locale giữ bản dịch, offline root được phục vụ trực tiếp và có regression/E2E.

- [Tài liệu nào là nguồn chuẩn và phần nào có thể gộp hoặc xóa?](../12-documentation-ownership/spec.md): chốt owner và kế hoạch current/planned/reference, trích nội dung trước xóa, bảo toàn contract task và nguồn gốc quyết định.

## Resolution

Ngày 19/11/2026, các ticket 11–15 đã có resolution và được triển khai trên integration branch: runner loại hồ sơ Wayfinder khỏi delivery queue, UI evidence fail-closed, docs được hợp nhất sau content-transfer, source/config legacy được audit theo consumer và `pnpm docs:check` được nối vào CI/`verify-gates`. Báo cáo từng ticket ghi bằng chứng và giới hạn; API commerce thật và unfinished-retro PR vẫn thuộc backlog đã nêu.

## Out of scope

Backend/CMS, hợp đồng API, vòng đời trả hàng, xóa MSW trước cutover và thay đổi giao diện.
