# Reading Paths

File này gợi ý lộ trình đọc ngắn nhất theo từng mục đích. Mỗi lộ trình chỉ giữ những file thật sự cần cho mục tiêu đó.

## 1. Nếu mới vào dự án và cần nắm dự án trong 15–20 phút

Đọc theo thứ tự:

1. [`README.md`](../README.md)
2. [`requirements/functional-requirements.md`](../00-core/requirements/functional-requirements.md)
3. [`product/release-slicing.md`](product/release-slicing.md)
4. [`FE/README.md`](../FE/README.md)
5. [`FE/FE.md`](../FE/FE.md)
6. [`planning/brainstorm-summary.md`](../99-reference/planning/brainstorm-summary.md)

Sau 6 file này, bạn đủ để hiểu sản phẩm là gì, MVP gồm gì, Launch 1 ưu tiên gì, và kiến trúc FE chính đang nằm ở đâu. Không cần mở `brainstorm-session.md` hay `planning/reference/` ở vòng đầu.

## 2. Nếu là developer chuẩn bị bắt đầu implement Frontend

Đọc theo thứ tự:

1. [`requirements/functional-requirements.md`](../00-core/requirements/functional-requirements.md)
2. [`glossary.md`](../00-core/glossary.md)
3. [`decision-log.md`](../00-core/decision-log.md)
4. [`FE/README.md`](../FE/README.md)
5. [`FE/FE-ARCHITECTURE.md`](../FE/FE-ARCHITECTURE.md)
6. [`FE/FE-EXECUTION.md`](../FE/FE-EXECUTION.md)
7. [`FE/FE.md`](../FE/FE.md) §10 (delivery order)
8. [`traceability/requirements-traceability-matrix.md`](traceability/requirements-traceability-matrix.md)
9. [`traceability/test-traceability-matrix.md`](traceability/test-traceability-matrix.md)

Đọc thêm theo chủ đề:

- i18n: [`FE/FE.md`](../FE/FE.md) §7
- auth: [`FE/FE-ARCHITECTURE.md`](../FE/FE-ARCHITECTURE.md) §11
- security baseline: [`security/security-baseline.md`](security/security-baseline.md)
- testing: [`FE/FE.md`](../FE/FE.md) §4.6

Sau đường đọc này, bạn đủ để bắt đầu implement mà không phải đoán lại scope, boundary kỹ thuật, hay coverage hiện có.

## 3. Nếu là Product / Founder cần quyết định scope và release

Đọc theo thứ tự:

1. [`requirements/functional-requirements.md`](../00-core/requirements/functional-requirements.md)
2. [`product/README.md`](product/README.md)
3. [`product/release-slicing.md`](product/release-slicing.md)
4. [`product/success-metrics.md`](product/success-metrics.md)
5. [`product/open-decisions.md`](product/open-decisions.md)
6. [`traceability/requirements-traceability-matrix.md`](traceability/requirements-traceability-matrix.md)
7. [`traceability/test-traceability-matrix.md`](traceability/test-traceability-matrix.md)

Đường đọc này đủ để trả lời 4 câu hỏi: ship gì trước, cái gì chưa chốt, đo thành công bằng gì, và scope nào còn thiếu coverage.

## 4. Nếu cần hiểu vì sao dự án đi tới các quyết định hiện tại

Đọc theo thứ tự:

1. [`planning/brainstorm-summary.md`](../99-reference/planning/brainstorm-summary.md)
2. [`decision-log.md`](../00-core/decision-log.md)
3. [`adr/0001-closed-locale-list.md`](../00-core/adr/0001-closed-locale-list.md)
4. [`adr/0002-locale-scope-storefront-only.md`](../00-core/adr/0002-locale-scope-storefront-only.md)
5. [`adr/0003-single-typography-token-set-across-locales.md`](../00-core/adr/0003-single-typography-token-set-across-locales.md)
6. [`adr/0004-authentication-mechanism.md`](../00-core/adr/0004-authentication-mechanism.md)

Đường đọc này giúp tách rất rõ ba lớp: bối cảnh ban đầu, quyết định đã chốt, và tài liệu chỉ nên xem như tham khảo.

Đọc thêm khi cần đào sâu:

- [`planning/brainstorm-session.md`](../99-reference/planning/brainstorm-session.md)

## 5. Nếu cần tham khảo cảm hứng hoặc tài liệu nền

Đọc sau cùng:

- [`planning/reference/README.md`](../99-reference/planning/reference/README.md)
- [`planning/reference/vision-sketch.md`](../99-reference/planning/reference/vision-sketch.md)
- [`planning/reference/implementation-plan.md`](../99-reference/planning/reference/implementation-plan.md)
- [`planning/reference/implementation-plan-overview.md`](../99-reference/planning/reference/implementation-plan-overview.md)
- [`research/nike-ui-ux-analysis.md`](../99-reference/research/nike-ui-ux-analysis.md)

Lưu ý: đây là tài liệu tham khảo. Không dùng chúng để ghi đè `requirements/`, `decision-log`, `adr`, hoặc `architecture/`.

## 6. Những file chưa cần đọc ở vòng đầu

- `planning/brainstorm-session.md` nếu `planning/brainstorm-summary.md` đã đủ cho mục tiêu hiện tại.
- `research/nike-ui-ux-analysis.md` nếu bạn không làm design system hoặc marketing UX.
- `architecture/backend/*` nếu bạn đang làm FE mock-first.
- `planning/reference/implementation-plan.md` và các file tách của nó nếu bạn chỉ cần theo tài liệu chính thức hiện tại.
