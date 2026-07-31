# Nest DTO validation và OpenAPI code-first

Status: accepted

Backend định nghĩa request/response bằng Nest DTO classes, dùng `class-validator`, `class-transformer`, global `ValidationPipe` và `@nestjs/swagger` để generate versioned OpenAPI artifact. Global pipe bật whitelist, từ chối non-whitelisted/unknown fields và chỉ transform theo khai báo tường minh; validation errors phải map về error envelope ổn định. Backend không duy trì Zod transport schemas thủ công song song; FE generate TypeScript client/Zod adapters từ OpenAPI theo Decision #64. Zod community adapters phía Backend bị từ chối để ưu tiên integration chính thức, ít moving parts hơn cho developer mới làm Backend.
