# Thiết lập Jira cho dự án

Tài liệu này hướng dẫn tạo và cấu hình không gian làm việc Jira cho dự án Bách khoa Lịch sử Thế giới, chỉ dùng các tính năng có trong gói miễn phí. Không có bước nào yêu cầu gói trả phí, tiện ích mở rộng hay trường tùy chỉnh nâng cao.

## 1. Nguyên tắc sử dụng

- Một dự án duy nhất cho toàn bộ website và máy chủ dữ liệu.
- Dùng bảng Kanban, không bật bảng Scrum, để không phụ thuộc vào báo cáo chỉ có ở gói cao hơn.
- Công việc chia theo chu kỳ hai tuần bằng ngày bắt đầu và ngày kết thúc trên phiếu, không dùng tính năng Sprint.
- Phân loại bằng nhãn và thành phần, không tạo trường tùy chỉnh.
- Mọi nội dung phiếu viết bằng tiếng Việt, không chèn chú thích tiếng Anh trong ngoặc.

## 2. Tạo dự án

1. Đăng nhập Jira bằng tài khoản quản trị.
2. Chọn Tạo dự án, sau đó chọn mẫu Kanban.
3. Đặt tên: `Bách khoa Lịch sử Thế giới`.
4. Đặt khóa dự án: `LS`.
5. Chọn loại dự án nhóm, để mọi thành viên tự cấu hình được mà không cần quản trị viên hệ thống.
6. Bỏ chọn các mẫu có sẵn như mẫu quản lý công việc phức tạp; chỉ giữ bảng Kanban trống.

Sau khi tạo, địa chỉ phiếu có dạng `LS-12`. Không đổi khóa dự án sau khi đã có phiếu vì sẽ làm hỏng liên kết trong tài liệu.

## 3. Cấu hình bảng

### 3.1. Cột trạng thái

Chỉ dùng bốn cột:

| Cột | Ý nghĩa | Ai chuyển vào |
| --- | --- | --- |
| Cần làm | Phiếu đã được xác nhận, chưa có người nhận | Người quản lý sản phẩm |
| Đang làm | Đang được xử lý | Người phát triển |
| Chờ kiểm tra | Đã có bản sửa trên môi trường thử nghiệm | Người phát triển |
| Hoàn thành | Đã kiểm thử lại và đạt | Người kiểm thử |

Bật giới hạn công việc đang làm cho cột Đang làm bằng số thành viên phát triển. Ví dụ nhóm có hai người phát triển thì giới hạn là hai. Cách này giúp lộ ra việc tồn đọng sớm.

### 3.2. Loại phiếu

Chỉ dùng các loại có sẵn:

| Loại | Dùng cho |
| --- | --- |
| Epic | Nhóm tính năng lớn, ví dụ Trải nghiệm đọc |
| Story | Tính năng người dùng nhìn thấy |
| Task | Việc kỹ thuật, tài liệu, cấu hình |
| Bug | Lỗi cần sửa |
| Subtask | Việc nhỏ nằm trong một phiếu cha |

Kịch bản kiểm thử không dùng loại phiếu riêng. Mỗi bộ kịch bản là một Task có nhãn `kiểm-thử`, phần mô tả chứa bảng kịch bản hoặc liên kết tới tệp trong kho mã nguồn.

### 3.3. Thành phần

Tạo các thành phần sau để lọc nhanh:

- Giao diện
- Máy chủ dữ liệu
- Cơ sở dữ liệu
- Hạ tầng
- Tài liệu

Mỗi phiếu chọn đúng một thành phần. Nếu một việc chạm nhiều phần, chọn phần chịu trách nhiệm chính và ghi phần còn lại trong mô tả.

### 3.4. Nhãn

| Nhãn | Dùng khi |
| --- | --- |
| `bảo-mật` | Việc liên quan tới bảo vệ dữ liệu, xác thực, phân quyền |
| `giao-diện` | Bố cục, màu sắc, thành phần hiển thị |
| `dữ-liệu` | Mô hình dữ liệu, nạp dữ liệu, đồng bộ |
| `đa-ngôn-ngữ` | Chuỗi dịch, đường dẫn ngôn ngữ, định dạng |
| `tối-ưu-tìm-kiếm` | Siêu dữ liệu, sơ đồ trang, tệp robots |
| `gọi-dữ-liệu` | Hợp đồng giữa giao diện và máy chủ dữ liệu |
| `kiểm-thử` | Kịch bản kiểm thử, kiểm thử hồi quy |
| `tài-liệu` | Tài liệu kỹ thuật, hướng dẫn |
| `hạ-tầng` | Đóng gói, triển khai, giám sát |

Không tạo nhãn trùng nghĩa. Nếu một việc cần ba nhãn trở lên, cân nhắc tách phiếu.

## 4. Mức độ và ưu tiên

Jira miễn phí có sẵn trường ưu tiên. Dùng đúng bốn mức: Cao nhất, Cao, Trung bình, Thấp. Mức độ nghiêm trọng ghi ở dòng đầu phần mô tả theo mẫu báo cáo lỗi, không tạo trường mới.

Quy ước:

- Cao nhất: chặn phát hành hoặc lỗ hổng bảo mật.
- Cao: chức năng chính sai, ảnh hưởng nhiều người.
- Trung bình: sai một phần, có cách vòng tránh.
- Thấp: lỗi trình bày, việc dọn dẹp.

## 5. Phiên bản và mốc

Tạo phiên bản cho từng lần phát hành:

- `0.1.0` Nền tảng
- `0.2.0` Trải nghiệm đọc
- `0.3.0` Đóng góp và bảo mật
- `1.0.0` Phát hành chính thức

Gắn phiếu vào phiên bản tương ứng. Không tạo mốc thời gian phức tạp; dùng ngày bắt đầu và ngày kết thúc của chu kỳ ghi trong mô tả Epic.

## 6. Bộ lọc dùng chung

Tạo ba bộ lọc, lưu cho toàn nhóm:

1. `Lỗi đang mở`: loại phiếu là Bug, trạng thái khác Hoàn thành.
2. `Việc của tôi trong chu kỳ`: người nhận là tôi, trạng thái khác Hoàn thành.
3. `Chờ kiểm tra`: trạng thái là Chờ kiểm tra, sắp xếp theo ngày cập nhật tăng dần.

Bộ lọc dùng cú pháp có sẵn, không cần ứng dụng bổ sung.

## 7. Thông báo

- Bật thông báo khi phiếu được giao cho mình và khi có bình luận mới.
- Tắt thông báo cho mọi thay đổi trạng thái của phiếu mình không theo dõi.
- Mỗi ngày chỉ nhận một bản tổng hợp vào buổi sáng.

## 8. Quyền

| Vai trò | Quyền |
| --- | --- |
| Quản trị dự án | Tạo phiếu, đổi trạng thái, quản lý phiên bản, quản lý thành viên |
| Thành viên | Tạo phiếu, bình luận, chuyển trạng thái phiếu được giao |
| Người xem | Chỉ đọc, không bình luận |

Nhóm nhỏ có thể để mọi người là thành viên. Vẫn giữ ít nhất một người có quyền quản trị để đổi cấu hình khi cần.

## 9. Dữ liệu mẫu cần tạo ngay sau khi thiết lập

1. Bốn Epic tương ứng bốn chu kỳ.
2. Một Story mẫu cho trang chủ, có tiêu chí chấp nhận rõ ràng.
3. Một Bug mẫu từ tệp `lỗi_mẫu_01.md` để cả nhóm thấy cách viết.
4. Một Task mẫu cho bộ kịch bản kiểm thử bảo mật.
5. Bốn phiên bản phát hành.

Sau khi tạo xong, kiểm tra bằng cách mở bảng Kanban và ba bộ lọc đã lưu. Nếu một bộ lọc không hiện đúng, sửa lại điều kiện trước khi mời cả nhóm vào làm việc.

## 10. Việc không làm

- Không dùng tính năng lộ trình nâng cao.
- Không dùng báo cáo chỉ có ở gói trả phí.
- Không tạo trường tùy chỉnh cho mức độ, môi trường hay nhãn.
- Không dùng quy trình nhiều bước có phê duyệt.
- Không tạo dự án riêng cho giao diện và máy chủ dữ liệu.
