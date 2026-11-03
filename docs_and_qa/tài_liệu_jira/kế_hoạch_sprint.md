# Kế hoạch chu kỳ phát triển

## 1. Cách tổ chức

Dự án chia thành bốn chu kỳ, mỗi chu kỳ hai tuần. Bảng Jira dùng Kanban nên không bật tính năng Sprint; mỗi chu kỳ tương ứng một Epic và một phiên bản phát hành. Ngày bắt đầu và ngày kết thúc ghi trong mô tả Epic.

Ước lượng dùng ba mức S, M, L ghi trong mô tả phiếu:

- S: dưới nửa ngày.
- M: từ nửa ngày đến một ngày rưỡi.
- L: từ hai đến ba ngày, nên tách nhỏ trước khi nhận việc.

Nhóm tham chiếu gồm một người phát triển giao diện, một người phát triển máy chủ, một người kiểm thử và một người quản lý sản phẩm. Người phát triển có thể kiêm nhiệm.

## 2. Chu kỳ 1: Nền tảng và dữ liệu

**Mục tiêu:** có bộ khung chạy được, dữ liệu lịch sử nằm trong một nguồn duy nhất, giao diện dựng được trang đầu tiên bằng hai ngôn ngữ.

**Phiên bản:** 0.1.0

| Loại | Công việc | Thành phần | Mức |
| --- | --- | --- | --- |
| Story | Dựng khung ứng dụng giao diện với bố cục, thanh điều hướng, chân trang | Giao diện | L |
| Task | Thiết lập bảng màu, kiểu chữ, thành phần cơ bản | Giao diện | M |
| Task | Thiết lập định tuyến ngôn ngữ và từ điển hai ngôn ngữ | Giao diện | M |
| Story | Dựng máy chủ dữ liệu theo kiến trúc phân tầng | Máy chủ dữ liệu | L |
| Task | Tạo mô hình sự kiện, thời kỳ và cấu hình cơ sở dữ liệu | Cơ sở dữ liệu | M |
| Task | Nạp 149 sự kiện mẫu từ tệp dùng chung | Cơ sở dữ liệu | M |
| Story | Cung cấp điểm cuối đọc danh sách, chi tiết, thời kỳ, số liệu | Máy chủ dữ liệu | L |
| Task | Dựng bộ dữ liệu dự phòng phía giao diện | Gọi dữ liệu | S |
| Task | Viết bài kiểm thử đầu tiên cho mô hình và từ điển | Kiểm thử | M |

**Điều kiện kết thúc:**

- Máy chủ dữ liệu trả 200 cho danh sách 149 sự kiện và trạng thái hoạt động.
- Trang chủ dựng được ở `/` và `/en`.
- Đổi ngôn ngữ giữ đúng đường dẫn.
- Bộ dữ liệu dự phòng cho ra cùng số sự kiện với máy chủ.

**Rủi ro:** chưa thống nhất cấu trúc tệp dùng chung sẽ phải sửa cả hai phía. Giảm thiểu bằng cách chốt cấu trúc ngay trong tuần đầu và viết bộ chuyển đổi ở một chỗ.

## 3. Chu kỳ 2: Trải nghiệm đọc

**Mục tiêu:** người đọc xem được toàn bộ nội dung, lọc, tìm kiếm, xem bản đồ và đọc chi tiết trên mọi kích thước màn hình.

**Phiên bản:** 0.2.0

| Loại | Công việc | Thành phần | Mức |
| --- | --- | --- | --- |
| Story | Trang chủ đầy đủ các khối giới thiệu, số liệu, sự kiện nổi bật | Giao diện | L |
| Story | Trang dòng thời gian có lọc theo thời kỳ, quốc gia, khoảng năm | Giao diện | L |
| Story | Tìm kiếm theo tiêu đề, tóm tắt, nội dung, nhãn ở cả hai ngôn ngữ | Giao diện | M |
| Story | Chế độ xem bản đồ với điểm đánh dấu và bong bóng thông tin | Giao diện | L |
| Story | Trang chi tiết sự kiện có nội dung nhiều đoạn và sự kiện liên quan | Giao diện | L |
| Story | Lưu yêu thích và chia sẻ liên kết | Giao diện | M |
| Task | Sinh ảnh minh họa thời kỳ, ảnh chia sẻ, biểu tượng ứng dụng | Giao diện | M |
| Task | Viết bài kiểm thử dịch vụ dữ liệu, mô hình, kho lưu trạng thái | Kiểm thử | M |
| Task | Kiểm tra giao diện trên điện thoại, máy tính bảng, máy tính | Kiểm thử | M |

**Điều kiện kết thúc:**

- 149 sự kiện hiện đủ trên dòng thời gian và bản đồ.
- Bộ lọc kết hợp cho kết quả đúng, có trạng thái rỗng rõ ràng.
- Trang chi tiết hiện đủ nội dung, ảnh có văn bản thay thế, liên quan không trùng.
- 42 bài kiểm thử giao diện đạt, bản dựng thành công.

**Rủi ro:** bản đồ tải chậm trên mạng yếu. Giảm thiểu bằng cách tải bản đồ muộn, chỉ khi người dùng mở chế độ bản đồ, và giữ danh sách văn bản làm phương án thay thế.

## 4. Chu kỳ 3: Đóng góp, bảo mật và tìm kiếm

**Mục tiêu:** người đọc gửi được đóng góp, quản trị viên duyệt được, hệ thống đạt các yêu cầu bảo mật và mỗi trang có siêu dữ liệu riêng.

**Phiên bản:** 0.3.0

| Loại | Công việc | Thành phần | Mức |
| --- | --- | --- | --- |
| Story | Biểu mẫu đóng góp có kiểm tra tại chỗ và trang cảm ơn | Giao diện | L |
| Story | Tiếp nhận đóng góp, mã hóa thư điện tử, băm địa chỉ mạng | Máy chủ dữ liệu | L |
| Story | Đăng nhập quản trị và duyệt đóng góp | Máy chủ dữ liệu | L |
| Task | Giới hạn tần suất, bẫy tự động gửi, giới hạn kích thước yêu cầu | Bảo mật | M |
| Task | Áp dụng chính sách bảo mật cấp dòng cho PostgreSQL | Cơ sở dữ liệu | M |
| Task | Bổ sung tiêu đề bảo mật cho giao diện và máy chủ dữ liệu | Bảo mật | M |
| Story | Siêu dữ liệu riêng, đường dẫn chuẩn, liên kết ngôn ngữ cho từng trang | Tối ưu tìm kiếm | L |
| Story | Sơ đồ trang, tệp robots, dữ liệu có cấu trúc | Tối ưu tìm kiếm | M |
| Task | Trang giới thiệu, câu hỏi thường gặp, chính sách bảo mật, trang lỗi | Giao diện | M |
| Task | Quản lý đồng ý phân tích và chỉ tải mã khi được đồng ý | Tối ưu tìm kiếm | S |

**Điều kiện kết thúc:**

- Gửi đóng góp hợp lệ nhận 202 và tạo bản ghi đã mã hóa thư điện tử.
- Gửi sai nhận 400 với lỗi từng trường; gửi quá giới hạn nhận 429.
- Truy cập danh sách đóng góp không có mã nhận 401.
- Mỗi trang có tiêu đề, mô tả, đường dẫn chuẩn riêng.
- Sơ đồ trang có 52 địa chỉ, không chứa trang cảm ơn.
- Bộ kịch bản bảo mật và tối ưu tìm kiếm chạy xong, không còn lỗi chặn phát hành.

**Rủi ro:** cấu hình bí mật sai làm máy chủ không khởi động. Giảm thiểu bằng tệp mẫu biến môi trường và bước kiểm tra ngay khi khởi động.

## 5. Chu kỳ 4: Gia cố và phát hành

**Mục tiêu:** bổ sung kiểm thử tự động cho máy chủ, hoàn thiện tài liệu, đóng gói triển khai và phát hành bản đầu tiên.

**Phiên bản:** 1.0.0

| Loại | Công việc | Thành phần | Mức |
| --- | --- | --- | --- |
| Task | Viết bài kiểm thử làm sạch dữ liệu và kiểm tra đóng góp | Kiểm thử | M |
| Task | Viết bài kiểm thử nghiệp vụ sự kiện và nghiệp vụ đóng góp | Kiểm thử | L |
| Task | Viết bài kiểm thử ánh xạ và tách đoạn nội dung | Kiểm thử | S |
| Task | Hoàn thiện tài liệu thiết kế, đa ngôn ngữ, đồng bộ dữ liệu | Tài liệu | M |
| Task | Hoàn thiện bốn bộ kịch bản kiểm thử và mẫu báo cáo lỗi | Kiểm thử | L |
| Task | Viết tệp đóng gói cho giao diện, máy chủ dữ liệu, cơ sở dữ liệu | Hạ tầng | L |
| Task | Cấu hình máy chủ đảo ngược và chứng chỉ bảo mật | Hạ tầng | M |
| Task | Quét phụ thuộc và xử lý cảnh báo | Bảo mật | M |
| Task | Chạy kiểm thử hồi quy toàn bộ và lập biên bản phát hành | Kiểm thử | M |

**Điều kiện kết thúc:**

- 66 bài kiểm thử máy chủ và 42 bài kiểm thử giao diện đạt.
- Bản dựng giao diện thành công, không có cảnh báo kiểu dữ liệu.
- Không còn lỗ hổng mức cao hoặc nghiêm trọng trong phụ thuộc.
- Bộ tệp triển khai chạy được bằng một lệnh.
- Biên bản phát hành ghi rõ phiên bản, thay đổi, việc còn tồn và người phê duyệt.

**Rủi ro:** môi trường phát triển không có Docker nên phần đóng gói chưa được chạy thử đầy đủ. Giảm thiểu bằng cách kiểm tra cú pháp tệp, chạy thử trên máy có Docker trước khi phát hành chính thức và ghi rõ giới hạn trong biên bản.

## 6. Lịch sinh hoạt

| Hoạt động | Thời điểm | Thời lượng |
| --- | --- | --- |
| Rà soát kế hoạch chu kỳ | Thứ hai đầu chu kỳ | 45 phút |
| Đứng trao đổi hằng ngày | Mỗi sáng làm việc | 10 phút |
| Rà soát giữa chu kỳ | Thứ tư tuần thứ hai | 30 phút |
| Trình diễn kết quả | Thứ sáu cuối chu kỳ | 30 phút |
| Nhìn lại chu kỳ | Sau trình diễn | 30 phút |

## 7. Tiêu chí hoàn thành chung

Một phiếu chỉ được chuyển sang Hoàn thành khi:

1. Mã nguồn đã được rà soát bởi người khác.
2. Có ít nhất một bài kiểm thử tự động hoặc một kịch bản kiểm thử thủ công đi kèm.
3. Chạy được trên máy sạch theo hướng dẫn trong tệp đọc trước.
4. Không làm hỏng chức năng lân cận.
5. Tài liệu liên quan được cập nhật nếu hành vi thay đổi.
6. Không có thông tin bí mật trong mã nguồn hay ảnh chụp.

## 8. Theo dõi tiến độ

Không dùng báo cáo nâng cao. Mỗi cuối tuần, đếm số phiếu theo trạng thái trên bảng Kanban và ghi vào một bình luận trong Epic của chu kỳ:

```
Tuần 1: 12 hoàn thành, 4 đang làm, 6 cần làm.
Chặn: chờ xác nhận nội dung ba sự kiện mới.
```

Cách này đủ để cả nhóm thấy tiến độ mà không cần thêm công cụ.
