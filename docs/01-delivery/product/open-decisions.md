# Open Decisions

File này gom các quyết định còn mở từ `planning/`, `requirements/`, và `architecture/` về một chỗ để dễ theo dõi và chốt theo phase.

## Cách đọc bảng

- `Owner` là người hoặc vai trò cần chốt quyết định.
- `Need by` là mốc chậm nhất nên có câu trả lời.
- `Fallback` là phương án tạm để không chặn toàn bộ tiến độ.

## Danh sách hiện tại

| Decision                                              | Bối cảnh                                                                                                                                                                                                           | Owner                 | Need by                                                                  | Fallback tạm thời                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Monitoring/tracing vendor                             | Runtime logging đã chốt Pino + correlation ID + PostgreSQL audit trail ở Decision `#70`; còn vendor ingest/dashboard/alerting                                                                                      | Engineering           | Trước staging                                                            | Giữ log JSON vendor-neutral, chưa thêm OpenTelemetry/Sentry/Datadog ở Phase 0                                                 |
| Validation env đầy đủ                                 | Ảnh hưởng fail-fast config ngoài mocking flag                                                                                                                                                                      | Engineering           | Trước khi có API thật                                                    | Chuẩn hoá `NEXT_PUBLIC_API_MOCKING` trước, env khác thêm dần                                                                  |
| Analytics tool và event ownership                     | Ảnh hưởng đo success metrics                                                                                                                                                                                       | Product + Engineering | Trước soft launch                                                        | Giữ event list làm contract tạm, chưa gắn vendor cụ thể                                                                       |
| Release definition cho Launch 1                       | Ảnh hưởng ưu tiên và kỳ vọng stakeholder                                                                                                                                                                           | Product / Founder     | Trước khi bắt đầu Phase 5                                                | Dùng `Launch-blocking` trong [`release-slicing.md`](release-slicing.md) làm mốc tạm                                           |
| Mở rộng RBAC vượt baseline tối thiểu                  | Baseline (mô hình + role/permission MVP) đã chốt ở Decision `#78` và [`rbac-matrix.md`](../architecture/backend/rbac-matrix.md); còn mở là việc thêm role/permission mới ngoài baseline khi phát sinh nhu cầu thật | Product / Founder     | Khi phát sinh vai trò mới ngoài `SUPER_ADMIN`/`ADMIN_STAFF`/`CMS_EDITOR` | Dùng đúng baseline 3 role hiện tại ở [`rbac-matrix.md`](../architecture/backend/rbac-matrix.md), không thêm role mới tuỳ tiện |
| Package manifest và lockfile thực tế sau khi scaffold | Version đã chốt ở `FE/FE-EXECUTION.md` §3 là baseline dự kiến, chưa được xác nhận bằng lockfile thật                                                                                                               | Engineering           | Ngay sau khi scaffold Phase 0                                            | Không chặn — lockfile thật sinh ra tự nhiên từ `pnpm install` đầu tiên; chỉ cần cập nhật ngược lại `FE-EXECUTION.md` nếu lệch |

## Đã chốt gần đây

- **Catalog thật / SKU ban đầu / category thật** — chốt làm mock catalog spec ở Decision `#50` (`decision-log.md`), không chờ catalog thật từ business nữa. Xem chi tiết ở đó.
- **Baseline RBAC `admin`/`cms`** — chốt mô hình permission-based guard và 3 role MVP (`SUPER_ADMIN`, `ADMIN_STAFF`, `CMS_EDITOR`) ở Decision `#78`/`#79` (`decision-log.md`), [`ADR 0013`](../../00-core/adr/0013-permission-based-authorization-admin-cms.md) và [`rbac-matrix.md`](../architecture/backend/rbac-matrix.md).

## Mức chốt mong muốn theo phase

Trước khi đi sang các phase sau, số quyết định mở nên giảm theo nhịp này:

- Trước Phase 3: catalog skeleton đã chốt (Decision `#50`) — không còn là quyết định mở.
- Trước Phase 5: chốt observability và release definition.
- Trước Phase 6: chốt baseline RBAC đủ để không phải vá guard sau đó — đã chốt, xem "Đã chốt gần đây".

## Nguồn tham chiếu

- [`../planning/brainstorm-session.md`](../../99-reference/planning/brainstorm-session.md)
- [`../FE/FE.md`](../../FE/FE.md)
- [`../FE/FE-ARCHITECTURE.md`](../../FE/FE-ARCHITECTURE.md) §11 (auth)
- [`../FE/FE.md`](../../FE/FE.md) §10 (delivery order)
