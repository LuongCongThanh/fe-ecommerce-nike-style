# Open Decisions

File này gom các quyết định còn mở từ `planning/`, `requirements/`, và `architecture/` về một chỗ để dễ theo dõi và chốt theo phase.

## Cách đọc bảng

- `Owner` là người hoặc vai trò cần chốt quyết định.
- `Need by` là mốc chậm nhất nên có câu trả lời.
- `Fallback` là phương án tạm để không chặn toàn bộ tiến độ.

## Danh sách hiện tại

| Decision | Bối cảnh | Owner | Need by | Fallback tạm thời |
|---|---|---|---|---|
| Catalog thật / SKU ban đầu / category thật | Ảnh hưởng mock data, IA, Home/CMS content | Product / Founder | Trước Phase 3 | Dùng mock catalog tối thiểu, nhưng không nên kéo dài qua Phase 3 |
| Logging/monitoring runtime | Ảnh hưởng error handling production-like | Engineering | Trước Phase 5 | `console.error` + endpoint log nội bộ tối thiểu |
| Validation env đầy đủ | Ảnh hưởng fail-fast config ngoài mocking flag | Engineering | Trước khi có API thật | Chuẩn hoá `NEXT_PUBLIC_API_MOCKING` trước, env khác thêm dần |
| Analytics tool và event ownership | Ảnh hưởng đo success metrics | Product + Engineering | Trước soft launch | Giữ event list làm contract tạm, chưa gắn vendor cụ thể |
| Release definition cho Launch 1 | Ảnh hưởng ưu tiên và kỳ vọng stakeholder | Product / Founder | Trước khi bắt đầu Phase 5 | Dùng `Launch-blocking` trong [`release-slicing.md`](release-slicing.md) làm mốc tạm |
| Mở rộng RBAC vượt baseline tối thiểu | Ảnh hưởng workflow nội bộ khi sau này phát sinh vai trò mới | Product / Founder | Sau Phase 6 hoặc trước khi thêm role mới | Dùng baseline hiện tại ở [`../architecture/backend/rbac-matrix.md`](../architecture/backend/rbac-matrix.md) |

## Mức chốt mong muốn theo phase

Trước khi đi sang các phase sau, số quyết định mở nên giảm theo nhịp này:

- Trước Phase 3: chốt catalog thật hoặc ít nhất catalog skeleton.
- Trước Phase 5: chốt observability và release definition.
- Trước Phase 6: chốt baseline RBAC đủ để không phải vá guard sau đó.

## Nguồn tham chiếu

- [`../planning/brainstorm-session.md`](../../99-reference/planning/brainstorm-session.md)
- [`../architecture/frontend/01-frontend-overview.md`](../architecture/frontend/01-frontend-overview.md)
- [`../architecture/frontend/08-authentication-authorization.md`](../architecture/frontend/08-authentication-authorization.md)
- [`../architecture/frontend/11-roadmap.md`](../architecture/frontend/11-roadmap.md)
