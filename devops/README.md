# Hướng dẫn triển khai

## 1. Thành phần

| Thành phần | Vai trò | Cổng |
| --- | --- | --- |
| `postgres` | Lưu sự kiện, đóng góp, tài khoản quản trị | Không mở ra ngoài |
| `api` | Máy chủ dữ liệu .NET, xử lý nghiệp vụ và xác thực | 8080 nội bộ |
| `web` | Giao diện Next.js, dựng trang phía máy chủ | 3000 nội bộ |
| `caddy` | Máy chủ đảo ngược, kết thúc giao thức bảo mật | 80, 443 |

Cơ sở dữ liệu nằm trong mạng `data` đánh dấu nội bộ, không có tuyến ra internet. Chỉ `caddy` mở cổng ra ngoài.

## 2. Chuẩn bị

1. Cài Docker và Docker Compose phiên bản mới.
2. Sao chép tệp mẫu:

   ```bash
   cp devops/.env.example devops/.env
   ```

3. Điền các giá trị bắt buộc trong `devops/.env`. Sinh khóa bằng lệnh:

   ```bash
   openssl rand -base64 48
   ```

4. Kiểm tra `ADMIN_PASSWORD` dài tối thiểu 12 ký tự.

## 3. Chạy tại máy cục bộ

```bash
docker compose -f devops/docker-compose.yml --env-file devops/.env up -d --build
```

Mở `https://localhost`. Trình duyệt sẽ cảnh báo chứng chỉ vì Caddy dùng chứng chỉ tự ký. Chấp nhận cảnh báo cho môi trường chạy thử.

Kiểm tra trạng thái:

```bash
docker compose -f devops/docker-compose.yml ps
curl -k https://localhost/api/health
```

Xem nhật ký:

```bash
docker compose -f devops/docker-compose.yml logs -f api
```

Dừng hệ thống:

```bash
docker compose -f devops/docker-compose.yml down
```

Lệnh trên giữ lại dữ liệu trong ổ đĩa. Muốn xóa toàn bộ dữ liệu, thêm `--volumes`.

## 4. Triển khai với tên miền thật

1. Trỏ bản ghi `A` của tên miền về địa chỉ máy chủ.
2. Mở cổng 80 và 443 trên tường lửa.
3. Trong `devops/.env`, đặt:

   ```text
   SITE_URL=https://lichsu.example.com
   SITE_ADDRESS=https://lichsu.example.com
   CADDYFILE=./Caddyfile.production
   ACME_EMAIL=quan-tri@example.com
   ALLOWED_HOSTS=lichsu.example.com;www.lichsu.example.com;api
   ```

4. Cập nhật `SITE_URL` rồi dựng lại giao diện, vì địa chỉ này được nhúng lúc dựng:

   ```bash
   docker compose -f devops/docker-compose.yml --env-file devops/.env up -d --build web
   ```

5. Caddy tự xin chứng chỉ. Lần đầu có thể mất một đến hai phút.

Nếu đặt máy chủ đảo ngược phía sau một dịch vụ khác, giữ `API` trong mạng nội bộ và chỉ chuyển tiếp qua `caddy`.

## 5. Bảo mật khi vận hành

- Đổi toàn bộ giá trị mẫu trước khi mở ra internet.
- Không dùng lại `JWT_KEY` hoặc `IP_HASH_KEY` giữa các môi trường.
- Tệp `.env` chỉ đọc được bởi tài khoản vận hành. Với hệ thống lớn hơn, chuyển bí mật sang kho bí mật của nền tảng và bỏ khỏi tệp môi trường.
- Giữ ổ đĩa `dpkeys` khi sao lưu. Mất khóa này thì dữ liệu đã mã hóa không giải mã được.
- Chính sách bảo mật cấp dòng PostgreSQL được áp dụng tự động lần đầu khởi động khi `Database__ApplyRowLevelSecurity` bằng `true`.
- `Proxy__TrustForwardedHeaders` chỉ bật vì máy chủ dữ liệu không lộ ra ngoài. Nếu mở trực tiếp cổng 8080, phải tắt tùy chọn này để tránh giả mạo địa chỉ.

## 6. Sao lưu và phục hồi

Sao lưu cơ sở dữ liệu:

```bash
docker compose -f devops/docker-compose.yml exec -T postgres \
  pg_dump -U worldhistory -d worldhistory -Fc > backup.dump
```

Phục hồi:

```bash
docker compose -f devops/docker-compose.yml exec -T postgres \
  pg_restore -U worldhistory -d worldhistory --clean --if-exists < backup.dump
```

Sao lưu khóa bảo vệ dữ liệu:

```bash
docker run --rm -v world-history_dpkeys:/keys -v "$PWD":/backup alpine \
  tar czf /backup/dpkeys.tar.gz -C /keys .
```

## 7. Giới hạn đã biết

- Nhóm phát triển chưa chạy được toàn bộ tệp điều phối trong môi trường hiện tại vì máy phát triển không có Docker. Các tệp đã được kiểm tra cú pháp và cấu hình, nhưng lần chạy thử đầu tiên trên máy có Docker vẫn là bắt buộc trước khi phát hành chính thức.
- Chứng chỉ tự ký chỉ dùng cho chạy thử. Không dùng `Caddyfile` mặc định khi đã mở ra internet.
- Dữ liệu trong ổ đĩa `pgdata` chưa được sao lưu tự động. Cần đặt lịch sao lưu định kỳ ở mức vận hành.
- Cấu hình hiện dùng biến môi trường, phù hợp một máy chủ. Triển khai nhiều máy chủ cần thêm dịch vụ lưu trạng thái dùng chung cho giới hạn tần suất.
