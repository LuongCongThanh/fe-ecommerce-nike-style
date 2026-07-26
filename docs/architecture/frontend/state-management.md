# State Management

Brainstorm chưa có Decision Log entry riêng cho state ownership — nội dung dưới đây là **[Đề xuất]**, dựa trên nguyên tắc FE tổng quát không mâu thuẫn với các quyết định đã chốt (đối chiếu `FE-first.md` §12, giữ lại vì hợp lý, không phải vì file đó là chuẩn).

## Pattern data-fetching cho server state [Đã chốt]

`packages/hooks` dùng **`useQuery`** (TanStack Query truyền thống, không phải `useSuspenseQuery`) — component tự xử lý `isLoading`/`error`/`success`, không dùng Suspense boundary để che trạng thái loading của data fetching. Lý do: khớp trực tiếp với hợp đồng Storybook đã chốt ở [`design-system.md`](./design-system.md) (mỗi component trong `packages/ui`/`packages/commerce` phải có story riêng cho "Loading" và "Error") — nếu dùng `useSuspenseQuery`, hai trạng thái này không còn thuộc về component nữa mà thuộc về `<Suspense>`/error boundary ở tầng cha, phá vỡ khả năng dựng/preview từng trạng thái độc lập trong Storybook.

```ts
const { data, isLoading, error } = useProductList(params); // hook trong packages/hooks, bọc useQuery

if (isLoading) return <ProductListSkeleton />;
if (error) return <ProductListError />;
return <ProductGrid items={data.items} />;
```

`React.lazy`/`next/dynamic` để code-split theo bundle là việc khác, không liên quan tới nguyên tắc này — xem [`performance-seo.md`](./performance-seo.md).

## Ma trận sở hữu state

| Loại state | Ví dụ | Sở hữu bởi | Vì sao |
|---|---|---|---|
| Search/filter/sort/pagination của PLP | `color`, `size`, `sort`, `page` | **URL (query string)** | Chia sẻ được, back/forward đúng, SEO/analytics theo dõi được — xem [`routing.md`](./routing.md) |
| Dữ liệu từ mock/API (product list, cart, order...) | Kết quả `GET /products` | **TanStack Query** (qua `packages/hooks`, gọi `packages/api-sdk`) | Cache, revalidate, loading/error state có sẵn, không tự chế lại bằng `useEffect` |
| State UI thuần, không cần chia sẻ giữa component xa nhau | Filter drawer mở/đóng, tab đang chọn | **Local component state** (`useState`) | Không cần global, tránh re-render thừa |
| State client cần chia sẻ nhưng không phải dữ liệu server | Grid/list view preference, theme UI-only (nếu có) | **Zustand** | Nhẹ, không cần boilerplate của Redux, đúng cho state không đến từ server |
| Wishlist status hiển thị ngay khi thao tác | Toggle tim trên ProductCard | **Server state (TanStack Query) + optimistic update** | Cần rollback nếu mock/API lỗi — xem nguyên tắc bên dưới |

**Nguyên tắc chung** [Đã chốt — Decision #32]: dữ liệu server (kết quả fetch/mock) và state UI/client **không bao giờ trộn lẫn**. Không copy response của TanStack Query vào Zustand để "cache lại lần nữa" — Zustand chỉ giữ state không đến từ server (xem ví dụ cụ thể nhất — giá tiền — ở nguyên tắc bên dưới).

## Quy ước Zustand store [Đã chốt — Decision #32]

Mỗi feature sở hữu **một store unit** (một hook Zustand), đặt ở `features/{feature}/stores/{feature}.store.ts` (xem cấu trúc feature-module ở [`module-architecture.md`](./module-architecture.md)), export qua barrel của feature, có `reset()` để dọn state khi rời trang. Interface state dùng tiền tố `I` theo quy ước đặt tên chung (`module-architecture.md`):

```ts
// features/cart/stores/cart.store.ts
import { create } from 'zustand';

export interface ICartUiState {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  reset: () => void;
}

export const useCartUiStore = create<ICartUiState>()((set) => ({
  isDrawerOpen: false,
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  reset: () => set({ isDrawerOpen: false }),
}));
```

Component subscribe theo selector cụ thể (`useCartUiStore((s) => s.isDrawerOpen)`), không lấy nguyên object state, để tránh re-render thừa.

**Nguyên tắc chống re-render thừa, áp dụng rộng hơn Zustand** [Đề xuất]: cùng mục tiêu tránh re-render thừa, áp dụng thêm cho `packages/ui`/`packages/commerce`:

- Handler truyền xuống qua props bọc `useCallback` khi component con dùng `React.memo` hoặc nằm trong danh sách render lặp (`ProductCard` trong grid, `CartItem` trong list).
- Component thuần, nhận props ổn định, render tốn kém (`ProductGallery`, `ProductCard` khi list dài) bọc `React.memo`.
- Không áp dụng máy móc cho mọi component — chỉ khi đã đo thấy re-render thừa ảnh hưởng INP/CLS (nhất quán YAGNI, không tối ưu sớm cho component chưa có vấn đề thật).

## Phương án đã cân nhắc cho state client dùng chung [Đã chốt — Decision #24]

Bảng so sánh dưới đây là cơ sở cho Decision #24, để quyết định này có mức độ kỹ lưỡng tương đương các ADR khác:

| Phương án | Lý do không chọn |
|---|---|
| **Redux Toolkit** | Boilerplate (action/reducer/slice) không tương xứng với phạm vi state client thực tế còn lại sau khi đã tách URL-state và TanStack Query ra khỏi client state — chỉ còn vài UI preference đơn giản. |
| **React Context + `useReducer`** | Re-render toàn bộ subtree khi state thay đổi trừ khi tự chia nhỏ context — Zustand tránh vấn đề này mặc định (subscribe theo selector) mà không cần tự thiết kế thêm. |
| **Jotai** (atomic state) | Phù hợp hơn khi có nhiều state nhỏ độc lập cần compose linh hoạt; ở phạm vi hiện tại (view preference, UI-only theme) chưa đủ phức tạp để cần mô hình atomic — cân nhắc lại nếu số lượng client state tăng đáng kể. |
| **Zustand** (chọn) | Ít boilerplate nhất cho nhu cầu hiện tại, selector tránh re-render thừa, không ràng buộc vào provider tree như Context. |

## Nguyên tắc: giá hiển thị trên client chỉ mang tính thông tin [Đề xuất — áp dụng ngay cả ở giai đoạn mock-first]

Ngay cả khi chưa có backend thật, MSW handler đóng vai trò "server" và phải là nơi tính lại giá cuối cùng (product price, promotion, coupon, tổng tiền) — **không** để Zustand hoặc component tự tính và coi đó là nguồn sự thật. Lý do xây thói quen này từ đầu: tránh phải viết lại toàn bộ logic tính giá khi thay MSW bằng API thật (đúng tinh thần OWASP-safe form ngay từ mock-first — Assumption #2 trong brainstorm).

Hệ quả cụ thể:

- Cart hiển thị trạng thái "recalculating" khi gọi lại MSW handler sau mỗi thay đổi số lượng/coupon.
- Update quantity dùng optimistic UI nhưng có rollback nếu handler mock trả lỗi (vd: vượt tồn kho mock).
- Không lưu tổng tiền cuối cùng trong Zustand như một giá trị độc lập — luôn tính lại từ response mock/API mới nhất.
