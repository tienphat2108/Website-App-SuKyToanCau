# Kịch bản kiểm thử gọi dữ liệu

## 1. Phạm vi

Bộ kịch bản này kiểm tra hợp đồng giữa giao diện và máy chủ dữ liệu: mã trạng thái, tham số lọc, phân trang, cấu trúc phản hồi, xử lý lỗi, giới hạn tần suất, chặn công cụ tự động, bộ nhớ đệm và phương án dự phòng khi máy chủ không sẵn sàng.

## 2. Điều kiện chung

- Máy chủ dữ liệu chạy tại `http://localhost:5080`, đã nạp 149 sự kiện.
- Giao diện chạy tại `http://localhost:3000`.
- Dùng `curl.exe` hoặc công cụ gọi giao diện lập trình ứng dụng.
- Khi kiểm tra nhánh quản trị, cần một tài khoản quản trị hợp lệ trong biến môi trường.

## 3. Danh sách kịch bản

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-API-01 | Trạng thái hoạt động | `GET /api/health` | 200, thân có `status`, `database`, `timestamp` | Cao |
| TC-API-02 | Số liệu tổng quan | `GET /api/meta/stats` | 200, có tổng sự kiện, số thời kỳ là 4, số quốc gia, số nổi bật, năm sớm nhất và muộn nhất | Cao |
| TC-API-03 | Danh sách mặc định | `GET /api/events` | 200, trang 1, kích thước 12, tổng 99, tổng số trang 9 | Cao |
| TC-API-04 | Giới hạn kích thước trang | `GET /api/events?pageSize=1000` | Trả tối đa 200 bản ghi, trường `pageSize` là 200 | Cao |
| TC-API-05 | Trang không hợp lệ | `GET /api/events?page=0` | Trả trang 1 thay vì lỗi | Trung bình |
| TC-API-06 | Lọc theo thời kỳ hợp lệ | `GET /api/events?era=trung-dai` | 200, mọi bản ghi có `era` là `trung-dai` | Cao |
| TC-API-07 | Thời kỳ không hợp lệ | `GET /api/events?era=abc` | 400, thân lỗi có khóa `era` trong danh sách lỗi | Cao |
| TC-API-08 | Lọc theo khoảng năm đảo | `GET /api/events?fromYear=1945&toYear=1802` | 200, kết quả nằm trong khoảng 1802 đến 1945 | Trung bình |
| TC-API-09 | Làm sạch từ khóa | `GET /api/events?search=%3Cb%3EB%E1%BA%A1ch%3C%2Fb%3E` | 200, tìm được sự kiện Bạch Đằng, thẻ bị loại bỏ | Cao |
| TC-API-10 | Giới hạn độ dài từ khóa | `GET /api/events?search=` kèm 500 ký tự | 200, từ khóa bị cắt còn 120 ký tự, không lỗi | Trung bình |
| TC-API-11 | Chi tiết sự kiện | `GET /api/events/chien-thang-bach-dang-938` | 200, có nội dung hai ngôn ngữ, tọa độ, danh sách liên quan | Cao |
| TC-API-12 | Sự kiện không tồn tại | `GET /api/events/khong-co` | 404, thân lỗi chuẩn, không có ngăn xếp lỗi | Cao |
| TC-API-13 | Khóa đường dẫn chữ hoa | `GET /api/events/CHIEN-THANG-BACH-DANG-938` | 200, khóa được chuẩn hóa trước khi tra cứu | Trung bình |
| TC-API-14 | Danh mục thời kỳ | `GET /api/events/eras` | 200, đúng 4 phần tử theo thứ tự Cổ đại đến Hiện đại | Trung bình |
| TC-API-15 | Tóm tắt tham khảo | `GET /api/events/chien-thang-bach-dang-938/external?language=vi` | 200 nếu có dữ liệu, 204 nếu không; không lỗi khi mạng ngoài chậm | Thấp |
| TC-API-16 | Ngôn ngữ không hỗ trợ | `GET /api/events/chien-thang-bach-dang-938/external?language=fr` | 400, lỗi gắn với khóa `language` | Trung bình |
| TC-API-17 | Gửi đóng góp hợp lệ | `POST /api/contributions` với dữ liệu đúng | 202, thân có `id` dạng mã định danh | Cao |
| TC-API-18 | Gửi đóng góp thiếu trường | Bỏ trống họ tên và nội dung | 400, danh sách lỗi có `fullName` và `message` | Cao |
| TC-API-19 | Bẫy tự động gửi | Gửi kèm trường `website` có dữ liệu | 400, không tạo bản ghi | Cao |
| TC-API-20 | Nội dung quá dài | Gửi nội dung 5001 ký tự | 400, lỗi gắn với khóa `message` | Trung bình |
| TC-API-21 | Đăng nhập thành công | `POST /api/auth/login` với tài khoản đúng | 200, có mã truy cập, thời điểm hết hạn, tên đăng nhập, vai trò | Cao |
| TC-API-22 | Đăng nhập sai | `POST /api/auth/login` với mật khẩu sai | 401, thông báo chung không tiết lộ tài khoản có tồn tại | Cao |
| TC-API-23 | Lấy danh sách đóng góp | `GET /api/contributions` kèm mã quản trị | 200, thư điện tử đã giải mã, trạng thái dạng chữ thường | Cao |
| TC-API-24 | Duyệt đóng góp | `PATCH /api/contributions/{id}/status` với `approved` | 200, trạng thái mới, có người duyệt và thời điểm duyệt | Trung bình |
| TC-API-25 | Trạng thái duyệt sai | Gửi `status` là `dang-xem-xet` | 400, lỗi gắn với khóa `status` | Trung bình |
| TC-API-26 | Duyệt mã không tồn tại | Gửi mã định danh ngẫu nhiên | 404 | Trung bình |
| TC-API-27 | Cấu trúc lỗi thống nhất | Gây lỗi 400 và 404, đọc thân phản hồi | Có `status`, `title`, `detail`, `instance`, `traceId`; kiểu nội dung là `application/problem+json` | Cao |
| TC-API-28 | Giảm dung lượng danh sách | So sánh thân danh sách và thân chi tiết | Danh sách không có trường nội dung đầy đủ, không có danh sách liên quan | Cao |
| TC-API-29 | Tên trường dạng lạc đà | Đọc thân phản hồi | Tên trường là `startYear`, `titleVi`, `dateLabelEn`, không phải dạng viết hoa chữ đầu | Trung bình |
| TC-API-30 | Chia sẻ tài nguyên giữa các nguồn | Gọi từ tên miền giao diện được phép và từ tên miền lạ | Nguồn được phép nhận tiêu đề cho phép; nguồn lạ bị trình duyệt chặn | Cao |
| TC-API-31 | Tài liệu giao diện lập trình | Mở `/swagger` ở môi trường phát triển và môi trường thật | Chỉ có ở môi trường phát triển | Trung bình |
| TC-API-32 | Dự phòng khi máy chủ tắt | Tắt máy chủ dữ liệu, mở trang chủ, dòng thời gian, chi tiết | Cả ba trang vẫn hiển thị nội dung từ bộ dữ liệu mẫu | Cao |
| TC-API-33 | Dự phòng khi máy chủ chậm | Chặn phản hồi máy chủ dữ liệu quá 6 giây | Giao diện chuyển sang dữ liệu mẫu, không treo quá lâu | Trung bình |
| TC-API-34 | Bộ nhớ đệm | Gọi lại cùng một trang trong vòng 5 phút | Máy chủ dữ liệu không bị gọi lại cho mỗi lần tải, thời gian phản hồi nhanh hơn | Thấp |
| TC-API-35 | Giới hạn tần suất chung | Gửi hơn 300 yêu cầu trong một phút từ cùng địa chỉ | Nhận 429 kèm `Retry-After`, không làm sập dịch vụ | Thấp |
| TC-API-36 | Chặn công cụ tự động khi ghi | Gửi `POST /api/contributions` bằng `curl.exe` với thân JSON hợp lệ | Nhận 403 theo cấu trúc lỗi chuẩn, không tạo bản ghi | Cao |
| TC-API-37 | Đường dẫn quét trả 404 | Gọi `GET /.env` và `GET /.git/config` | Nhận 404, không lộ nội dung tệp | Cao |
| TC-API-38 | Định dạng thân không được chấp nhận | Gửi `POST /api/contributions` với `Content-Type: text/plain` từ trình duyệt | Nhận 415, không chuyển vào nghiệp vụ | Cao |
| TC-API-39 | Máy chủ giao diện gọi nội bộ | Gửi đóng góp qua website, quan sát nhật ký máy chủ dữ liệu | Yêu cầu mang tác nhân `node` hoặc `undici` được chấp nhận, trả 202 khi dữ liệu hợp lệ | Cao |
| TC-API-40 | Một yêu cầu tải trọn kho dữ liệu | Chạy `curl.exe "http://localhost:5080/api/events?pageSize=200"` rồi đếm bằng tay hoặc bằng công cụ phân tích phản hồi | Mã 200; trường tổng số bằng 149; số phần tử bằng 149; liệt kê quốc gia trong các phần tử cho ra đúng 51 tên khác nhau; mọi phần tử có đường dẫn ảnh bắt đầu bằng `/images/events/`; không phần tử nào thiếu tiêu đề, tóm tắt hoặc tọa độ ở cả hai ngôn ngữ | Cao |
| TC-API-41 | Sự kiện mới trả đủ trường hai ngôn ngữ | Gọi `curl.exe "http://localhost:5080/api/events/van-hoa-dong-son-700-tcn"`, rồi gọi tiếp `/event/quan-dot-terracotta-210-tcn` và `/event/diet-chung-rwanda-1994` | Mỗi phản hồi có tiêu đề, tóm tắt, nhiều đoạn nội dung, nhãn, địa điểm và chú thích ảnh cho cả tiếng Việt lẫn tiếng Anh; danh mục nguồn gồm liên kết `https`; tọa độ nằm trong giới hạn bản đồ; khóa lọc theo thời kỳ khớp với năm bắt đầu của sự kiện | Cao |
| TC-API-42 | Giao diện dự phòng khớp máy chủ về số lượng | Tắt máy chủ 5080, mở trang chủ và `/timeline`, ghi lại bộ đếm; bật lại máy chủ và tải lại | Ở cả hai trạng thái, danh sách vẫn đủ 149 sự kiện, bộ đếm quốc gia vẫn là 51, không trang nào báo lỗi; ảnh vẫn tải từ chính máy chủ giao diện; khi máy chủ trở lại, người đọc không phải xóa bộ nhớ trình duyệt | Cao |
| TC-API-43 | Tóm tắt tham chiếu trả đúng ngôn ngữ được hỏi | Với `/api/events/kenh-dao-panama-1914/external?language=vi` và cùng đường dẫn `language=en`, rồi làm lại với `chien-thang-bach-dang-938`; gọi thêm `language=xx` và `language=` trống | Hai lời gọi hợp lệ trả mã 200 kèm đoạn tóm tắt, phần chữ của bản `en` là tiếng Anh, của bản `vi` là tiếng Việt, địa chỉ nguồn trong phản hồi thuộc đúng máy chủ của ngôn ngữ đó; `language=xx` và giá trị trống trả mã 204 hoặc 400 có mô tả lỗi, không chuyển thành lời gọi bên ngoài; khi nguồn không có bài, máy trả 204 và giao diện ẩn khối, không hiển thị đoạn của ngôn ngữ khác | Cao |

## 4. Lệnh kiểm tra nhanh

```powershell
# Danh sách mặc định
curl.exe -s "http://localhost:5080/api/events?page=1&pageSize=12"

# Thời kỳ không hợp lệ
curl.exe -s -o NUL -w "%{http_code}`n" "http://localhost:5080/api/events?era=abc"

# Chi tiết và trường hợp không tồn tại
curl.exe -s -o NUL -w "%{http_code}`n" "http://localhost:5080/api/events/chien-thang-bach-dang-938"
curl.exe -s -o NUL -w "%{http_code}`n" "http://localhost:5080/api/events/khong-co"

# Đóng góp thiếu trường
curl.exe -s -X POST "http://localhost:5080/api/contributions" -H "Content-Type: application/json" -d "{\"fullName\":\"\",\"email\":\"sai\",\"message\":\"ngan\"}"

# Chặn công cụ tự động và định dạng thân sai
curl.exe -s -o NUL -w "%{http_code}`n" -X POST "http://localhost:5080/api/contributions" -H "Content-Type: application/json" -d "{}"
curl.exe -s -o NUL -w "%{http_code}`n" -X POST "http://localhost:5080/api/contributions" -A "Mozilla/5.0" -H "Content-Type: text/plain" -d "a"
```

## 5. Ghi nhận kết quả

| Mã | Người thực hiện | Ngày | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| TC-API-01 |  |  |  |  |
| TC-API-02 |  |  |  |  |

Khi một phản hồi sai hợp đồng, ghi lại mã trạng thái, thân phản hồi rút gọn và thời điểm để người phát triển đối chiếu nhật ký máy chủ.
