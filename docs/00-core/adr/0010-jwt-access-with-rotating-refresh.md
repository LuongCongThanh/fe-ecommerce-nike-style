# JWT access token với rotating opaque refresh token

Status: accepted

Thay thế ADR-0004. Browser auth dùng JWT access token sống ngắn, chỉ giữ trong memory và gửi qua `Authorization: Bearer`; refresh token là opaque random token trong cookie `HttpOnly`, `Secure`, `SameSite`, được rotate sau mỗi lần dùng và chỉ lưu hash cùng token-family metadata trong PostgreSQL để revoke và phát hiện reuse. Không lưu access/refresh token trong `localStorage` hoặc `sessionStorage`, không dùng JWT dài hạn và không dùng JWT làm refresh token; logout, reset password và khóa tài khoản phải revoke refresh-token family. TTL được chốt ở Decision #66; same-origin proxy/cookie boundary được chốt ở Decision #67 và ADR-0011.
