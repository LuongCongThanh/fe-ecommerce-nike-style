---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/shared/**/*.{ts,tsx}'
  - 'packages/ui/**/*.tsx'
---

# Convention loading state và toast message

Loading và toast là hai loại feedback khác nhau:

- Loading cho biết tiến trình của đúng vùng hoặc action đang chờ.
- Toast thông báo ngắn về kết quả action hoặc sự kiện không gắn ổn định với một vùng UI.

Toast không thay thế loading, inline validation, query error state hoặc error boundary.

## Phân loại loading

| Trạng thái                                            | UI phù hợp                                              |
| ----------------------------------------------------- | ------------------------------------------------------- |
| App/session đang bootstrap và chưa thể render an toàn | `PageLoader` hoặc shell skeleton                        |
| Route đang stream/chuyển trang                        | `loading.tsx`/Suspense fallback gần route               |
| Query lần đầu, chưa có data                           | Skeleton khớp layout hoặc `QueryState`                  |
| Background refetch, đã có data                        | Giữ data; indicator nhỏ nếu người dùng cần biết         |
| Mutation/action cục bộ                                | Loading trên button/control phát action                 |
| Submit form                                           | Disable submit, giữ form hiển thị, đổi label/spinner    |
| Danh sách/table lần đầu                               | Row/card/table skeleton giữ kích thước                  |
| Infinite load/pagination                              | Loader tại vùng append/navigation, không che toàn trang |

## TanStack Query state

- Phân biệt initial loading với background fetching:
  - `isPending`/`isLoading` khi chưa có data: render skeleton/loading state.
  - `isFetching` khi đã có data: giữ nội dung cũ; không thay toàn bộ bằng spinner.
  - `isPlaceholderData`: giữ layout/data placeholder và disable navigation tạo request trùng khi cần.
- Query bị `enabled: false` có thể vẫn báo pending theo semantics TanStack Query; chỉ expose loading cho UI khi điều kiện request thực sự được thỏa.
- Không gộp nhiều query bằng `isLoadingA || isLoadingB` nếu mỗi vùng có thể render độc lập. Chỉ gộp khi toàn bộ view cần tất cả dữ liệu để hợp lệ.
- Không copy query loading vào local state bằng effect. Dùng trực tiếp state từ query hoặc derive trong controller hook.
- Khi refetch lỗi nhưng stale data còn dùng được, giữ data và hiển thị feedback không phá màn hình; không đổi sang full error state trừ khi data không còn an toàn.
- Query error lần đầu dùng inline `ErrorState`/`QueryState` với retry; không chỉ phát toast rồi để vùng nội dung trống.

## Skeleton, spinner và page loader

- Skeleton ưu tiên cho content có layout dự đoán được: product grid, product detail, table, stat card.
- Spinner dùng cho action nhỏ, kích thước/shape chưa biết, auth bootstrap hoặc fallback ngắn.
- `PageLoader` chỉ dùng khi không thể render app/route shell an toàn. Không block toàn trang vì một card hoặc mutation cục bộ.
- Skeleton phải gần kích thước content thật để tránh CLS; không dùng số row/card quá khác dữ liệu thông thường.
- Loading UI không được làm mất navigation/shell nếu shell vẫn dùng được.
- Không hiển thị đồng thời skeleton và empty/error state.
- Không thêm artificial delay chỉ để nhìn thấy spinner. Nếu cần chống flicker, dùng delay/minimum-duration helper chung có test, không rải timer trong component.
- Motion loading phải tôn trọng reduced motion; spinner có accessible label và decorative icon dùng `aria-hidden` phù hợp.

## Mutation và thao tác lặp

- Dùng `mutation.isPending` làm source of truth; không tạo `isSubmitting` song song trừ khi bao gồm nhiều operation có lifecycle khác.
- Disable đúng control phát mutation để ngăn double submit. Chỉ disable toàn form khi field không được phép đổi trong lúc request.
- Button pending phải:
  - Giữ chiều rộng/layout ổn định.
  - Có label theo action: `Đang lưu…`, `Đang xoá…`, `Đang đặt hàng…`.
  - Có `aria-busy={true}` khi phù hợp.
  - Giữ `type="submit"`/`type="button"` đúng semantics.
- Với nhiều row, loading phải gắn với ID/action đang chạy; không làm mọi row hiển thị loading nếu chỉ một item bị mutate, trừ khi mutation thực sự khóa toàn collection.
- Destructive/checkout mutation không tự retry nếu không có idempotency contract.
- Optimistic update phải có snapshot/rollback và một nơi duy nhất phát toast khi commit hoặc rollback.
- Navigation chỉ xảy ra sau success khi flow yêu cầu; không clear form/state trước khi biết mutation thành công.

## Ownership của toast

- Dùng `notify` từ `@repo/shared/notification`; component không import `sonner` trực tiếp.
- Một user action chỉ có một owner phát toast. Ưu tiên mutation/controller hook, không đồng thời phát ở API SDK, QueryClient global và component.
- Storefront mutation dùng `useApiMutation` khi phù hợp để tập trung success/error toast và tránh duplicate.
- API SDK, schema, mapper và presentational component không phát toast.
- QueryClient global không phát generic mutation toast nếu mutation hook đã sở hữu feedback.
- Không phát toast từ render body. Toast chỉ phát từ event/mutation/effect gắn với transition ổn định và phải tránh chạy lại do Strict Mode/remount.
- Không toast mỗi background refetch, polling tick hoặc retry tự động.

## Khi nào dùng toast

### Dùng success toast khi

- Action hoàn tất nhưng kết quả không đủ hiển nhiên trong UI hiện tại: lưu profile, cập nhật trạng thái, sao chép, gửi yêu cầu.
- Destructive action có undo: toast có action `Hoàn tác` và callback khôi phục an toàn.
- Action diễn ra trong dialog/sheet sẽ đóng sau success và cần xác nhận ngắn.

Không cần success toast khi navigation hoặc UI thay đổi đã xác nhận rõ kết quả, ví dụ đi tới trang order success có heading cụ thể. Tránh vừa page success vừa toast cùng một message.

### Dùng error toast khi

- Mutation/action do người dùng khởi tạo thất bại và không có vùng inline tự nhiên.
- Failure xảy ra sau dialog đóng/navigation hoặc ảnh hưởng global action.

Không chỉ dùng error toast cho:

- Query lần đầu thất bại: dùng inline error state + retry.
- Field/form validation: hiển thị cạnh field hoặc form summary.
- Permission block gắn với cả page: dùng forbidden state.
- Fatal render error: dùng error boundary.

### Info/warning toast

- `info`: sự kiện trung tính, clipboard/copy hoặc background action hoàn tất khi không có UI khác.
- `warning`: action hoàn tất một phần, sắp hết hạn, conflict có thể tiếp tục hoặc trạng thái cần chú ý.
- Không dùng warning thay confirm dialog trước destructive action.

## Nội dung message

- Message ngắn, nói rõ outcome bằng động từ và đối tượng: `Đã cập nhật tồn kho`, `Không thể xoá sản phẩm`.
- Success dùng quá khứ/kết quả; pending nằm trên control, không tạo toast `Đang xử lý…` cho request ngắn.
- Error cho biết điều người dùng có thể làm tiếp nếu có: `Không thể tải đơn hàng. Vui lòng thử lại.`
- Không hiển thị raw stack, status text, exception name, endpoint, SQL, token hoặc `error.details`.
- `ApiError.message` chỉ hiển thị nếu contract xác nhận message an toàn cho người dùng; luôn có fallback theo locale.
- UI message phải qua `next-intl` ở Storefront hoặc `react-i18next` ở Admin/CMS. Không thêm hard-coded message mới trong hook/component đã dùng i18n.
- Không viết toàn chữ hoa, không dùng dấu chấm than liên tiếp và hạn chế jargon kỹ thuật.
- Description chỉ bổ sung ngữ cảnh hữu ích, không lặp lại title.
- Action label cụ thể (`Thử lại`, `Hoàn tác`, `Xem giỏ hàng`), không dùng `OK` khi có hành động rõ hơn.

## Dedupe và tần suất

- Không phát nhiều toast cho cùng một failure qua các layer.
- Với action có thể bấm nhanh hoặc event lặp, dùng toast ID/dismiss/update nếu notification API được mở rộng; không xếp hàng message giống nhau.
- Validation nhiều field không tạo một toast cho mỗi lỗi.
- Bulk operation phát một summary toast (`Đã cập nhật 8/10 sản phẩm`), không phát 10 toast riêng.
- Khi retry thành công sau error, success toast chỉ phát nếu action bình thường vốn cần success feedback; không bắt buộc “đã kết nối lại” cho mọi query.

## Accessibility và UX

- Loading spinner có `role="status"`/accessible label; status text bổ sung có thể dùng `sr-only` để không làm layout thay đổi.
- Vùng được cập nhật async dùng `aria-busy` khi semantics phù hợp; không đặt `aria-live` lên container lớn thay đổi liên tục.
- Error quan trọng inline dùng `role="alert"`; toast không phải cách duy nhất truyền đạt lỗi làm người dùng mất dữ liệu.
- Focus không tự nhảy vào toast. Sau form error, focus field lỗi đầu tiên hoặc form summary khi phù hợp.
- Toast có action phải dùng được bằng bàn phím và label tự đủ nghĩa.
- Thời gian toast không được là nơi duy nhất chứa thông tin người dùng cần đọc lâu hoặc cần tham chiếu lại.

## Pattern mẫu

```tsx
const updateProfile = useApiMutation({
  mutationFn: updateProfileEndpoint,
  successMessage: t('profile.updateSuccess'),
  errorFallback: t('profile.updateError'),
});

<Button type="submit" loading={updateProfile.isPending} disabled={updateProfile.isPending} aria-busy={updateProfile.isPending}>
  {updateProfile.isPending ? t('actions.saving') : t('actions.save')}
</Button>;
```

```tsx
<QueryState
  isLoading={query.isLoading}
  error={query.error}
  onRetry={() => {
    void query.refetch();
  }}
  loadingFallback={<ProductDetailSkeleton />}
>
  <ProductDetail product={query.data} />
</QueryState>
```

## Pattern bị cấm

- Full-page spinner cho mutation nhỏ.
- Toast loading cho mọi request ngắn.
- Toast error đồng thời ở QueryClient, hook và component.
- `finally(() => setLoading(false))` song song với `mutation.isPending`.
- Giữ button enabled trong mutation rồi dựa vào backend chống double submit.
- Thay stale content bằng spinner khi background refetch.
- Raw `error.message` không có type/fallback/i18n.
- Hard-code chuỗi loading/toast mới ở feature đã dùng translation catalog.
- `setTimeout` giả lập loading hoặc che flicker mà không có helper/policy chung.

## Test bắt buộc

- Initial loading hiển thị đúng skeleton/spinner và không hiển thị empty/error/success cùng lúc.
- Mutation pending disable đúng action, có pending label và không submit hai lần.
- Success phát đúng một toast khi policy yêu cầu.
- Failure phát đúng một toast hoặc inline error, không cả hai nếu cùng message.
- Query error có retry và retry gọi đúng callback.
- Background refetch giữ stale content nếu đó là contract.
- Message lấy từ i18n và fallback error không lộ raw transport detail.
