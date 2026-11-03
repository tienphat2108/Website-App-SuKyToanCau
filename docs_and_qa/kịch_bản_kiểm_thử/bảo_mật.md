# Kịch bản kiểm thử bảo mật

## 1. Phạm vi

Bộ kịch bản này kiểm tra các biện pháp bảo vệ đã triển khai: tiêu đề bảo mật, chống chèn mã, chống chèn câu lệnh, giới hạn tần suất, bảo vệ biểu mẫu, kiểm tra ô đồng ý ở máy chủ (TC-BM-53), xác thực quản trị, mã hóa dữ liệu cá nhân, bảo mật cấp dòng, chặn công cụ tự động, quản lý bí mật, quét phụ thuộc và rào mềm công cụ kiểm tra của trình duyệt (từ TC-BM-49; phần này chỉ làm khó, không phải biên an toàn). Mỗi kịch bản chỉ thực hiện trên môi trường phát triển hoặc môi trường thử nghiệm do nhóm sở hữu.

## 2. Điều kiện chung

- Giao diện tại `http://localhost:3000`, máy chủ dữ liệu tại `http://localhost:5080`.
- Có quyền đọc tệp cấu hình và cơ sở dữ liệu phát triển.
- Đã đặt biến môi trường cho khóa bí mật khi kiểm tra môi trường thật.
- Dùng `curl.exe` trong PowerShell để xem tiêu đề phản hồi.

## 3. Danh sách kịch bản

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-BM-01 | Tiêu đề bảo mật của giao diện | `curl.exe -I http://localhost:3000/` | Có `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` | Cao |
| TC-BM-02 | Tiêu đề bảo mật của máy chủ dữ liệu | `curl.exe -I http://localhost:5080/api/health` | Có `Content-Security-Policy` dạng chặn toàn bộ, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `X-Permitted-Cross-Domain-Policies: none` | Cao |
| TC-BM-03 | Không lộ thông tin máy chủ | Xem tiêu đề phản hồi của cả hai dịch vụ | Không có `Server`, không có `X-Powered-By`, không có phiên bản khung phần mềm | Cao |
| TC-BM-04 | Chính sách nội dung chặn mã ngoài | Mở công cụ phát triển, xem lỗi bảng điều khiển khi tải trang | Không có mã từ tên miền lạ bị chặn; chỉ tên miền nội bộ và máy chủ phân tích đã khai báo được phép; quyền tải ảnh không còn cho phép máy chủ ô bản đồ nào | Cao |
| TC-BM-05 | Chống chèn câu lệnh qua bộ lọc | Gọi `GET /api/events?search=%27%20OR%201%3D1--` | Trả danh sách bình thường hoặc rỗng, không trả toàn bộ dữ liệu ngoài ý muốn, không có lỗi cơ sở dữ liệu | Cao |
| TC-BM-06 | Chống chèn câu lệnh qua thời kỳ | Gọi `GET /api/events?era=co-dai%27%20OR%20%271%27%3D%271` | Trả mã 400 với thông báo thời kỳ không hợp lệ | Cao |
| TC-BM-07 | Chống chèn mã qua tìm kiếm | Nhập `<img src=x onerror=alert(1)>` vào ô tìm kiếm | Chuỗi hiện dưới dạng văn bản, không có hộp thoại, không có thẻ ảnh được tạo | Cao |
| TC-BM-08 | Chống chèn mã qua đóng góp | Gửi đóng góp có nội dung chứa thẻ `script` | Máy chủ lưu văn bản đã làm sạch, thẻ bị loại bỏ; trang quản trị không thực thi mã | Cao |
| TC-BM-09 | An toàn bong bóng bản đồ | Mở bản đồ, kiểm tra mã dựng bong bóng | Tiêu đề và mô tả được gán bằng văn bản thuần, không dùng cách chèn chuỗi siêu văn bản | Cao |
| TC-BM-10 | Giới hạn gửi đóng góp | Gửi bốn đóng góp hợp lệ trong một giờ từ cùng địa chỉ | Ba yêu cầu đầu nhận 202, yêu cầu thứ tư nhận 429 kèm tiêu đề `Retry-After` | Cao |
| TC-BM-11 | Giới hạn đăng nhập | Gọi đăng nhập sai sáu lần trong một phút | Năm lần đầu nhận 401, lần thứ sáu nhận 429 | Cao |
| TC-BM-12 | Khóa tạm thời sau nhiều lần sai | Đăng nhập sai năm lần liên tiếp với tài khoản có thật, sau đó thử mật khẩu đúng | Tài khoản bị khóa 15 phút, thông báo chung không tiết lộ tài khoản có tồn tại | Cao |
| TC-BM-13 | Cân bằng thời gian phản hồi | Đăng nhập với tài khoản không tồn tại và với tài khoản có thật nhưng sai mật khẩu | Thời gian phản hồi tương đương, không lộ tài khoản nào tồn tại | Trung bình |
| TC-BM-14 | Bẫy tự động gửi | Gửi đóng góp có trường ẩn `website` chứa dữ liệu | Nhận 400, không lưu bản ghi | Cao |
| TC-BM-15 | Giới hạn kích thước yêu cầu | Gửi yêu cầu tới `/api/contributions` có thân lớn hơn 32 KB | Nhận 413 hoặc 400, không treo máy chủ | Cao |
| TC-BM-16 | Giới hạn kích thước toàn máy chủ | Gửi yêu cầu lớn hơn 256 KB tới bất kỳ điểm cuối | Bị từ chối trước khi vào nghiệp vụ | Trung bình |
| TC-BM-17 | Danh sách đóng góp không có mã | Gọi `GET /api/contributions` không kèm tiêu đề `Authorization` | Nhận 401 theo cấu trúc lỗi chuẩn, không lộ dữ liệu | Cao |
| TC-BM-18 | Mã truy cập sai chữ ký | Gọi cùng điểm cuối với mã bị sửa một ký tự | Nhận 401 | Cao |
| TC-BM-19 | Mã truy cập hết hạn | Chờ quá 30 phút rồi gọi lại | Nhận 401, thông báo yêu cầu đăng nhập lại | Cao |
| TC-BM-20 | Phân quyền quản trị | Dùng mã hợp lệ nhưng vai trò không phải quản trị | Nhận 403 với thông báo không có quyền | Cao |
| TC-BM-21 | Mật khẩu lưu dạng băm | Mở bảng tài khoản quản trị trong cơ sở dữ liệu | Cột mật khẩu chứa chuỗi băm BCrypt, không có mật khẩu gốc | Cao |
| TC-BM-22 | Thư điện tử được mã hóa | Mở bảng đóng góp | Cột thư điện tử chứa chuỗi đã mã hóa, không đọc được nếu không có khóa | Cao |
| TC-BM-23 | Địa chỉ mạng không lưu gốc | Gửi một đóng góp, mở bản ghi | Chỉ có mã băm của địa chỉ mạng, không có địa chỉ gốc | Trung bình |
| TC-BM-24 | Bí mật không nằm trong mã nguồn | Tìm trong kho mã nguồn các chuỗi khóa, mật khẩu, chuỗi kết nối thật | Không tìm thấy; cấu hình chỉ đọc từ biến môi trường | Cao |
| TC-BM-25 | Khởi động thiếu bí mật ở môi trường thật | Chạy máy chủ ở môi trường thật mà không đặt khóa | Ứng dụng dừng ngay với thông báo thiếu cấu hình, không dùng khóa mặc định | Cao |
| TC-BM-26 | Cookie ngôn ngữ | Kiểm tra cookie `NEXT_LOCALE` | Chỉ chứa mã ngôn ngữ, có `SameSite=Lax`, có `Secure` khi chạy bản phát hành, có `HttpOnly` để mã trong trang không đọc được, không chứa dữ liệu cá nhân | Trung bình |
| TC-BM-27 | Bảo mật cấp dòng trên PostgreSQL | Chạy môi trường PostgreSQL, truy vấn bảng đóng góp bằng vai trò thường | Chỉ thấy bản ghi được phép; khi đặt biến phiên quản trị mới thấy toàn bộ | Cao |
| TC-BM-28 | Thông báo lỗi không lộ chi tiết | Gây lỗi máy chủ có kiểm soát | Phản hồi có mã truy vết và thông báo chung, không có ngăn xếp lỗi, không có đường dẫn tệp | Cao |
| TC-BM-29 | Quét phụ thuộc giao diện | Chạy `npm audit` trong thư mục giao diện, gồm cả gói phát triển | Không có lỗ hổng mức cao hoặc nghiêm trọng chưa xử lý | Cao |
| TC-BM-30 | Quét phụ thuộc máy chủ | Chạy `dotnet list package --vulnerable --include-transitive` | Không có gói bị cảnh báo chưa xử lý | Cao |
| TC-BM-31 | Chuyển hướng bảo mật ở môi trường thật | Gọi địa chỉ giao thức thường | Chuyển sang giao thức bảo mật, có tiêu đề `Strict-Transport-Security` | Cao |
| TC-BM-32 | Chặn khung nhúng | Nhúng trang trong một khung từ tên miền khác | Trình duyệt chặn do `frame-ancestors 'none'` và `X-Frame-Options` | Trung bình |
| TC-BM-33 | Chặn công cụ tự động khi ghi dữ liệu | Gửi `POST /api/contributions` bằng `curl.exe` với thân JSON hợp lệ | Nhận 403, thân lỗi chuẩn, không tạo bản ghi | Cao |
| TC-BM-34 | Chặn đường dẫn bị quét phổ biến | Gọi lần lượt `/.env`, `/.git/config`, `/wp-admin`, `/phpmyadmin` | Mọi đường dẫn trả 404, không lộ tệp cấu hình hay trang quản trị giả | Cao |
| TC-BM-35 | Bắt buộc định dạng JSON khi ghi | Gửi `POST /api/contributions` với `Content-Type: application/x-www-form-urlencoded` từ trình duyệt | Nhận 415, không chuyển vào nghiệp vụ | Cao |
| TC-BM-36 | Máy chủ giao diện vẫn gửi đóng góp được | Gửi đóng góp hợp lệ qua biểu mẫu của website | Yêu cầu nội bộ mang tác nhân `node` hoặc `undici` được chấp nhận và trả 202 | Cao |
| TC-BM-37 | Giới hạn phương thức và tiêu đề khi chia sẻ nguồn | Gửi yêu cầu mở đầu `OPTIONS` tới `/api/contributions` | Chỉ cho `GET,POST,PATCH,OPTIONS` và `Content-Type,Authorization,X-Requested-With`; thời gian nhớ tối đa 3600 giây | Cao |
| TC-BM-38 | Tiêu đề bảo mật bổ sung của giao diện | `curl.exe -I http://localhost:3000/` | Có `X-Download-Options: noopen`, `X-Permitted-Cross-Domain-Policies: none`, `Strict-Transport-Security` ở bản phát hành | Trung bình |
| TC-BM-39 | Quét bí mật trong mã nguồn | Chạy `npm run audit:secrets` trong thư mục giao diện | Quét toàn bộ tệp văn bản, không phát hiện khóa cá nhân, mã truy cập đám mây hay mã thanh toán, mã thoát bằng 0 | Cao |
| TC-BM-40 | Quét phụ thuộc đầy đủ | Chạy `npm audit` và `dotnet list package --vulnerable --include-transitive` | Không còn lỗ hổng mức cao hoặc nghiêm trọng ở cả hai phía | Cao |
| TC-BM-41 | Chặn ghi dữ liệu khi thiếu tác nhân | Gửi `POST /api/contributions` không có tiêu đề tác nhân người dùng | Nhận 403, không tạo bản ghi | Trung bình |
| TC-BM-42 | Chuyển hướng giao thức ở bản phát hành | Chạy giao diện với `NEXT_PUBLIC_SITE_URL` là địa chỉ bảo mật, gọi bằng giao thức thường qua máy chủ đảo ngược | Trả 308 sang địa chỉ bảo mật, giữ nguyên đường dẫn và tham số | Cao |
| TC-BM-43 | Cookie ưu tiên quốc gia bị sửa thủ công | Đặt cookie `wh-country` thành chuỗi ngoài danh mục, ví dụ `../etc/passwd`, rồi mở trang chủ | Máy chủ bỏ qua giá trị, không thay đổi thứ tự hiển thị, không có lỗi máy chủ, không lộ dữ liệu | Cao |
| TC-BM-44 | Cookie ưu tiên quốc gia không chứa dữ liệu cá nhân | Chọn một quốc gia, kiểm tra cookie `wh-country` | Chỉ chứa khóa quốc gia dạng văn bản, có `SameSite=Lax`, không chứa tên người, địa chỉ mạng hay mã định danh | Trung bình |
| TC-BM-45 | Bản đồ không gọi máy chủ bên ngoài | Mở `/timeline?view=map`, bấm thu phóng và kéo bản đồ, xem tab Mạng của công cụ phát triển | Không có yêu cầu tải ảnh hay tệp bản đồ nào tới tên miền ngoài; toàn bộ đường bờ biển, biên giới và tên địa danh đến từ tệp của chính dự án; địa chỉ mạng của người xem không lộ cho dịch vụ bản đồ nào | Cao |
| TC-BM-46 | Ảnh sự kiện không gọi máy chủ bên ngoài | Mở ba trang sự kiện bất kỳ, bật tab Mạng của công cụ phát triển, tải lại và lọc theo từ khóa `images` | Mọi ảnh tư liệu tải từ `/images/events/…` của chính máy chủ; không có yêu cầu ảnh nào gửi tới tên miền ngoài; không có tài nguyên nào bị chính sách an toàn nội dung chặn | Cao |
| TC-BM-47 | Liên kết giấy phép và trang nguồn không lộ thông tin người xem | Mở dòng ghi nguồn dưới ảnh ở một sự kiện, bấm liên kết giấy phép rồi bấm liên kết “Wikimedia Commons”; kiểm tra thuộc tính của hai liên kết trong mã nguồn | Hai liên kết mở ở thẻ mới, mang thuộc tính `rel="noopener noreferrer"`; thẻ mới không truy cập được cửa sổ gốc; trình duyệt không gửi địa chỉ trang gốc của dự án cho bên thứ ba; không có liên kết nào trỏ tới giao thức không bảo mật | Cao |
| TC-BM-48 | Ảnh mới vẫn nằm trong chính sách an toàn nội dung | Mở bảng điều khiển trình duyệt ở thẻ mạng, tải lại ba trang thuộc năm mươi sự kiện mới, lọc theo từ khóa “images”; chạy `curl.exe -I http://localhost:3000/event/doi-hoang-sa-1700` và đọc tiêu đề phản hồi; thử chèn mã vào ô tìm kiếm bằng chuỗi `<img src=x onerror=alert(1)>` | Mọi yêu cầu ảnh chỉ hướng tới `localhost:3000/images/events/…` hoặc `/_next/image`; không có ảnh nào gọi tên miền bên thứ ba; tiêu đề ghi `default-src 'self'`, `img-src 'self' data: blob:`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` và `upgrade-insecure-requests`; bảng điều khiển không có dòng nào báo bị chính sách chặn; chuỗi chèn mã chỉ bị coi là văn bản, không tạo thẻ ảnh và không chạy hộp thoại | Cao |

| TC-BM-49 | Chặn phím tắt gọi công cụ kiểm tra của trình duyệt | Mở bất kỳ trang nào của giao diện, lần lượt bấm F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U; trên macOS thử Cmd+Option+I | Các phím tắt đó không mở được công cụ kiểm tra từ trong trang; không có lỗi bảng điều khiển, trang không mất tiêu điểm và không bị cuộn; `node .tmp/verify-a11y.mjs` báo bốn tổ hợp bị chặn và `plainI` không bị chặn | Trung bình |
| TC-BM-50 | Không chặn thao tác soạn thảo thông thường | Mở `/contribute`, gõ tiếng Việt có dấu vào ô nội dung, bấm Ctrl+A, Ctrl+C, Ctrl+V, rồi gõ các chữ cái thường `i`, `j`, `c` ngoài tổ hợp | Gõ, chọn tất cả, sao chép và dán đều hoạt động bình thường; chỉ tổ hợp có Ctrl+Shift (hoặc Cmd+Option) đi kèm `i`/`j`/`c`, cùng F12 và Ctrl+U, bị đánh chặn | Cao |
| TC-BM-51 | Tắt menu chuột phải trên toàn trang | Chuột phải lần lượt vào: nền trang, một khối nội dung, một liên kết, một ảnh, một ô nhập, một mục danh sách và một đoạn chữ đang bôi đen | Không vị trí nào hiện menu của trình duyệt; `node .tmp/verify-a11y.mjs` báo `menuBody`, `menuSection`, `menuLink`, `menuInput`, `menuImg`, `menuItem` và `menuSelection` đều bị chặn. Đổi lại, bôi đen rồi Ctrl+C, Tab/Enter và chuột giữa vẫn dùng được; đây là mất mát đã chấp nhận để tránh mở nhầm công cụ kiểm tra | Cao |
| TC-BM-52 | Phần chặn chỉ là rào mềm, không phải biên an toàn | Thử mở công cụ kiểm tra bằng menu của trình duyệt, bằng một cửa sổ khác, hoặc tắt mã của trang trong công cụ | Công cụ kiểm tra vẫn mở được. Đây là giới hạn đã chấp nhận và ghi rõ trong mã nguồn: không được coi phần chặn này là một biện pháp bảo vệ. Mọi kiểm tra dữ liệu, giới hạn tần suất, chặn tác nhân tự động và phân quyền vẫn phải chạy ở máy chủ và phải đạt các mã TC-BM-10, TC-BM-14, TC-BM-33, TC-BM-35, TC-BM-41 | Cao |

| TC-BM-53 | Máy chủ tự kiểm ô đồng ý, không tin trình duyệt | Mở `/contribute`, dùng công cụ kiểm tra gỡ thuộc tính `required` khỏi mọi trường, điền đủ dữ liệu hợp lệ rồi gửi mà không tích ô đồng ý; lặp lại bằng cách gọi thẳng hành động máy chủ qua `curl.exe` với thân thiếu trường `consent`; sau đó kiểm tra số bản ghi đóng góp trong cơ sở dữ liệu phát triển và đọc nhật ký máy chủ | Cả hai đường đều bị chặn ở máy chủ: trả trạng thái lỗi kiểm tra dữ liệu, hiện “Bạn cần tích ô đồng ý trước khi gửi.”, không tạo bản ghi, không đi vào dịch vụ đóng góp; phản hồi không lộ chuỗi ngăn xếp hay chi tiết hệ thống; thư điện tử và địa chỉ mạng không xuất hiện trong nhật ký; các kiểm tra độ dài, định dạng, bẫy `website` và giới hạn tần suất vẫn chạy nguyên vẹn | Cao |

## 4. Lệnh kiểm tra nhanh

```powershell
# Tiêu đề giao diện
curl.exe -sI http://localhost:3000/ | Select-String -Pattern "content-security|x-frame|x-content|referrer|permissions|cross-origin"

# Tiêu đề máy chủ dữ liệu
curl.exe -sI http://localhost:5080/api/health | Select-String -Pattern "content-security|x-frame|referrer|permitted"

# Đóng góp thiếu mã xác thực
curl.exe -s -o NUL -w "%{http_code}" http://localhost:5080/api/contributions

# Tìm kiếm có ký tự đặc biệt
curl.exe -s "http://localhost:5080/api/events?search=%27%20OR%201%3D1--"

# Chặn công cụ tự động và đường dẫn bị quét
curl.exe -s -o NUL -w "%{http_code}`n" -X POST http://localhost:5080/api/contributions -H "Content-Type: application/json" -d "{}"
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:5080/.env

# Quét bí mật và phụ thuộc
npm run audit:secrets --prefix frontend
npm audit --prefix frontend
dotnet list package --vulnerable --include-transitive --project backend/API
```

## 5. Ghi nhận kết quả

| Mã | Người thực hiện | Ngày | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| TC-BM-01 |  |  |  |  |
| TC-BM-02 |  |  |  |  |

Khi phát hiện lỗ hổng, không ghi chi tiết khai thác vào kênh công khai. Tạo báo cáo lỗi ở chế độ riêng tư, gắn nhãn `bảo-mật` và mức ưu tiên cao nhất.
