# Domain độc lập dùng same-origin API proxy

Status: accepted

`storefront`, `admin` và `cms` có registrable domain độc lập. Browser của mỗi app chỉ gọi `/api/*` trên chính origin đó; hosting/CDN/reverse proxy chuyển tiếp request sang Backend deployment riêng. Refresh cookie vì vậy là first-party và host-only cho từng app, dùng `HttpOnly`, `Secure`, `SameSite=Lax`; không dùng credentialed cross-site refresh trực tiếp tới Backend domain vì third-party cookie có thể bị browser chặn. Proxy không chứa business/auth logic và không biến Backend thành thành phần cùng repository hay cùng deployment với FE.
