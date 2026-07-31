# Backend nằm trong repository độc lập

Status: accepted

Backend NestJS được phát triển trong repository riêng, độc lập với FE Turborepo về source code, lifecycle và deployment; việc tách repository không biến Backend thành microservices, Backend vẫn là một modular monolith. Lựa chọn này chấp nhận chi phí không thể import trực tiếp `packages/schemas` và không thể cập nhật producer/consumer trong cùng commit; hai repository phải tích hợp qua một API contract có version và kiểm tra compatibility tự động.
