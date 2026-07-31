# Backend dùng NestJS modular monolith

Status: accepted

Backend dùng Node.js LTS, TypeScript strict và NestJS theo kiến trúc modular monolith. Lựa chọn này giữ cùng hệ sinh thái TypeScript với Front-end và cung cấp convention rõ cho một developer chưa có kinh nghiệm Backend; Django REST bị từ chối vì buộc học thêm Python/Django cùng lúc, Express/Fastify thuần bị từ chối vì phải tự thiết kế nhiều nền tảng kiến trúc, còn microservices chưa có lợi ích tương xứng với chi phí vận hành của dự án solo. Database, ORM và hạ tầng không thuộc quyết định này và sẽ được chốt riêng.
