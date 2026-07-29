# DEVOPS

Đây là tài liệu chính để làm DevOps.

## 1. Trạng thái hiện tại

Phần DevOps hiện chưa được chốt sâu trong bộ tài liệu gốc.

Vì vậy file này chỉ giữ:

- những gì đã biết chắc
- những gì tối thiểu phải có
- những gì còn là câu hỏi mở

Không tự bịa thêm pipeline hay hạ tầng cụ thể khi source docs chưa chốt.

## 2. Những gì đã biết

- Dự án là monorepo hướng tới `storefront`, `admin`, `cms`
- Hiện chưa có backend thật
- Hiện chưa có infra production thật
- Hiện chưa chốt CI/CD stack
- Hiện chưa chốt hosting/platform cuối cùng

## 3. Mục tiêu DevOps tối thiểu

Khi dự án bước sang giai đoạn code thật, DevOps tối thiểu phải giải quyết:

- môi trường local rõ ràng
- build lặp lại được
- môi trường cho FE và BE
- secret management
- deploy quy củ
- rollback cơ bản
- logging/monitoring cơ bản

## 4. Yêu cầu tối thiểu nên có

### 4.1. Environment Management

- Tách biến môi trường rõ cho:
  - local
  - test/staging nếu có
  - production
- Có flag rõ cho mock API và real API

### 4.2. Build & CI

- Monorepo build phải chạy nhất quán
- Lint và test tối thiểu phải chạy được trong CI
- Không cho production build phụ thuộc mock handlers

### 4.3. Secrets

- Không hard-code secret
- Secret phải tách khỏi repo
- Session/auth secret phải rotate được về sau

### 4.4. Deploy

- Storefront/Admin/CMS cần chiến lược deploy rõ
- Backend về sau cũng cần deploy độc lập hoặc bán-độc-lập theo kiến trúc được chốt
- Cần rollback path tối thiểu

### 4.5. Observability

- Logging tối thiểu
- Request correlation cho flow critical
- Audit trail cho action nhạy cảm

## 5. Liên hệ với Security

DevOps phải hỗ trợ tối thiểu:

- HTTPS ở môi trường phù hợp
- cookie `Secure` khi có HTTPS
- logging không lộ PII hoặc secret
- audit trail persistence

## 6. Liên hệ với Testing

DevOps phải hỗ trợ:

- chạy lint
- chạy unit/integration/E2E khi code đã có
- chạy contract tests khi backend thật bắt đầu

## 7. Open Questions

- Hosting/platform cho frontend
- Hosting/platform cho backend
- CI/CD tool nào
- Monitoring/logging stack nào
- Có staging environment hay không
- Chiến lược rollout/rollback cụ thể

## 8. Kết luận thực tế

Hiện tại, DevOps chưa phải vùng đã chốt xong.

Cách dùng file này:

- coi đây là checklist tối thiểu
- khi project bắt đầu có code thật, update file này trước khi chọn tool cụ thể

## 9. Nguồn gốc nội dung

File này rút gọn từ:

- `01-delivery/product/open-decisions.md`
- `01-delivery/security/security-baseline.md`
- `01-delivery/specification/technical-design.md`
