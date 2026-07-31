# Versioned OpenAPI artifact là canonical transport contract

Status: accepted

`packages/schemas` hiện tại là baseline chuyển tiếp để hai repository thống nhất API v1. Sau API v1 handshake, Backend phát hành versioned OpenAPI artifact làm canonical transport contract; FE pin một phiên bản cụ thể và generate TypeScript client cùng Zod adapters phục vụ runtime validation/MSW. Không chia sẻ source trực tiếp, không duy trì DTO thủ công song song ở hai repo và không tự động lấy contract `latest`; breaking change phải có version mới và compatibility check trong CI.
