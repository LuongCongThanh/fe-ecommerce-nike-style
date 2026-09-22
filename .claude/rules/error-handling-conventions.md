---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/api-sdk/**/*.{ts,tsx}'
  - 'packages/schemas/**/*.{ts,tsx}'
  - 'packages/shared/**/*.{ts,tsx}'
---

# Convention xử lý lỗi

## Luồng lỗi chuẩn

```text
HTTP non-2xx
  -> ErrorEnvelopeSchema.safeParse
  -> ApiError(status, code, message, details)
  -> query/mutation boundary
  -> thông báo hoặc error state phù hợp ngữ cảnh
  -> monitoring nếu lỗi bất thường
```

- Chỉ `@repo/api-sdk` chuyển HTTP response thành `ApiError`; không tạo class lỗi API thứ hai trong app.
- Error body dùng `ErrorEnvelopeSchema`; nếu payload sai contract, trả `UNKNOWN_ERROR` an toàn, không tin trực tiếp field từ response.
- `catch` nhận `unknown`. Thu hẹp bằng `instanceof ApiError`, Zod result hoặc type guard; không ép `as Error` để truy cập `message`.
- Không nuốt lỗi bằng `catch {}`. Nếu cố ý bỏ qua, comment tiếng Việt nêu lý do và bảo đảm không làm UI treo ở trạng thái loading.
- Không log token, cookie, mật khẩu, dữ liệu cá nhân hoặc toàn bộ response nhạy cảm. `console.log` bị cấm; chỉ `console.warn/error` cho trường hợp có chủ đích.

## Phân loại và cách phản hồi

| Loại lỗi                | Cách xử lý                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Validation 400/422      | Hiển thị gần field/form khi map được; giữ dữ liệu người dùng đã nhập                                     |
| 401                     | Để auth runtime thực hiện refresh single-flight; nếu thất bại thì clear session và chuyển sang đăng nhập |
| 403                     | Hiển thị trạng thái không đủ quyền; không giả thành 404 trừ khi contract yêu cầu                         |
| 404                     | Dùng not-found/empty state phù hợp route hoặc resource                                                   |
| 409/domain conflict     | Giữ UI hiện tại, giải thích conflict và cung cấp next action                                             |
| 429                     | Thông báo giới hạn và retry có kiểm soát; không loop tự động                                             |
| 5xx/network             | Error state/toast trung tính, có retry khi thao tác idempotent                                           |
| Lỗi lập trình/invariant | Không che bằng message nghiệp vụ; để error boundary/monitoring ghi nhận                                  |

## Query, mutation và UI

- Query lỗi ảnh hưởng toàn vùng nội dung: render `ErrorState` với retry/refetch. Không chỉ toast rồi để màn hình trống.
- Mutation lỗi: hiển thị một lần tại mutation boundary. Storefront ưu tiên `useApiMutation`; không đồng thời toast ở QueryClient và component.
- Form validation dự đoán được phải chạy trước request; lỗi server vẫn là nguồn sự thật cuối cùng.
- Không hiển thị raw stack, status text hoặc `error.details` trực tiếp cho người dùng.
- Message người dùng phải đi qua i18n ở app. Message từ backend chỉ dùng khi contract xác nhận an toàn để hiển thị; luôn có fallback theo locale.
- Retry chỉ dùng cho thao tác an toàn/idempotent hoặc khi backend hỗ trợ idempotency. Không tự retry create order/payment-like mutation.
- Loading flag phải được giải phóng trong cả success và failure; ưu tiên state do TanStack Query/React Hook Form cung cấp thay vì tự quản lý song song.

## Error boundary và monitoring

- Dùng route `error.tsx` cho lỗi render/data không thể phục hồi cục bộ trong Storefront; lỗi dự kiến của query/form xử lý tại feature.
- Error boundary phải cung cấp hành động thử lại hoặc điều hướng an toàn và không làm mất toàn bộ app shell nếu boundary nhỏ hơn đủ dùng.
- Chỉ gửi monitoring cho lỗi bất thường; không báo validation/user-cancel như exception production.
- Khi thêm error code mới, cập nhật schema/contract, mapping UI, fixture/MSW và test failure path.
