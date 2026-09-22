---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
---

# Kiến trúc frontend

- Giữ đúng chiều phụ thuộc: route/layout -> feature -> UI hoặc utility dùng chung -> API SDK và schema.
- Feature phải dùng `@repo/api-sdk`; không thêm lệnh gọi `fetch` hoặc Axios trực tiếp cho endpoint của ứng dụng.
- Dùng `@/*` cho import nội bộ app và subpath công khai `@repo/*` cho workspace package.
- Không tạo barrel `index.ts` hoặc deep import vào file private của module khác.
- Dùng TanStack Query cho server state, Zustand cho shared client state, React Hook Form cho form và URL cho filter, sort, pagination có thể chia sẻ.
- Đặt transport validation trong `@repo/schemas` và hành vi endpoint trong `@repo/api-sdk`.
- Guard xác thực phía client chỉ phục vụ UX. Backend phải chịu trách nhiệm enforce authorization.
- Không sửa thủ công file `routeTree.gen.ts` được sinh tự động.
