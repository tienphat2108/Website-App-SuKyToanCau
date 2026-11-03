# Mẫu báo cáo lỗi

Mẫu này dùng chung cho mọi lỗi phát hiện trong quá trình kiểm thử. Mỗi mục tương ứng với một trường trên Jira để người kiểm thử có thể chép thẳng vào phiếu, không phải viết lại.

## 1. Thông tin bắt buộc

| Mục | Nội dung | Ghi chú |
| --- | --- | --- |
| Tóm tắt | Một câu nêu hiện tượng và nơi xảy ra | Không viết chung chung kiểu "trang bị lỗi" |
| Mã báo cáo | Theo mẫu `BUG-<số>` | Lấy số tự tăng trên Jira |
| Loại vấn đề | Lỗi chức năng, lỗi giao diện, lỗi bảo mật, lỗi hiệu năng, lỗi nội dung | Chọn một |
| Mức độ | Chặn phát hành, Nghiêm trọng, Trung bình, Nhẹ | Xem quy ước ở mục 3 |
| Ưu tiên | Cao nhất, Cao, Trung bình, Thấp | Có thể khác mức độ |
| Môi trường | Hệ điều hành, trình duyệt, kích thước màn hình, địa chỉ đang chạy, phiên bản | Ghi đủ để người khác tái hiện |
| Tài khoản | Vai trò và tên đăng nhập dùng để kiểm thử | Không ghi mật khẩu |
| Điều kiện đầu | Dữ liệu, cấu hình, bước chuẩn bị | Ví dụ đã nạp 149 sự kiện, đã xóa bộ nhớ cục bộ |
| Các bước tái hiện | Đánh số từng bước, bắt đầu từ thao tác đơn giản nhất | Tối đa 8 bước |
| Kết quả mong đợi | Hành vi đúng theo đặc tả | Trích dẫn đặc tả nếu có |
| Kết quả thực tế | Hành vi đang thấy | Kèm mã trạng thái hoặc thông báo lỗi nguyên văn |
| Tần suất | Luôn luôn, thường xuyên, thỉnh thoảng, một lần | Ghi số lần thử nếu thỉnh thoảng |
| Ảnh hưởng | Người dùng nào bị ảnh hưởng và ảnh hưởng ra sao | Dùng để xếp mức độ |
| Bằng chứng | Ảnh chụp, đoạn ghi màn hình, nhật ký, mã phản hồi | Đính kèm trực tiếp vào phiếu |
| Nguyên nhân | Nguyên nhân kỹ thuật nếu đã xác định | Có thể để trống khi mới báo |
| Cách khắc phục đề xuất | Hướng sửa, tệp liên quan | Không bắt buộc |
| Kiểm thử hồi quy | Kịch bản cần chạy lại sau khi sửa | Ghi mã kịch bản |
| Nhãn | `bảo-mật`, `giao-diện`, `dữ-liệu`, `đa-ngôn-ngữ`, `tối-ưu-tìm-kiếm`, `gọi-dữ-liệu` | Chọn một hoặc hai |

## 2. Khung phiếu

```
Tóm tắt: [Trang/Khu vực] Hiện tượng ngắn gọn
Mã báo cáo: BUG-
Loại vấn đề:
Mức độ:
Ưu tiên:
Môi trường:
Tài khoản:
Điều kiện đầu:
Các bước tái hiện:
  1.
  2.
  3.
Kết quả mong đợi:
Kết quả thực tế:
Tần suất:
Ảnh hưởng:
Bằng chứng:
Nguyên nhân:
Cách khắc phục đề xuất:
Kiểm thử hồi quy:
Nhãn:
```

## 3. Quy ước mức độ

| Mức độ | Định nghĩa | Ví dụ |
| --- | --- | --- |
| Chặn phát hành | Không thể dùng chức năng chính, mất dữ liệu, lộ dữ liệu cá nhân, lỗ hổng bảo mật nghiêm trọng | Không gửi được đóng góp, thư điện tử hiện công khai |
| Nghiêm trọng | Chức năng chính sai nhưng còn cách vòng tránh, ảnh hưởng nhiều người | Bộ lọc trả sai kết quả, trang chi tiết trả 500 |
| Trung bình | Sai một phần, có cách vòng tránh, ảnh hưởng một nhóm người dùng | Nhãn thời kỳ hiện sai tên, bản đồ lệch điểm |
| Nhẹ | Lỗi trình bày, câu chữ, khoảng cách, không ảnh hưởng chức năng | Dấu câu sai, ảnh hơi lệch |

Mức độ do người kiểm thử xác định. Ưu tiên do người quản lý sản phẩm quyết định dựa trên mức độ và kế hoạch phát hành. Một lỗi nhẹ ở trang chủ có thể có ưu tiên cao hơn một lỗi trung bình ở trang ít người xem.

## 4. Quy tắc viết

- Tiêu đề bắt đầu bằng tên trang hoặc khu vực, sau đó là hiện tượng.
- Không dùng từ đánh giá cảm tính như "xấu", "kỳ lạ". Mô tả điều nhìn thấy.
- Không gộp nhiều lỗi vào một phiếu. Một phiếu một hành vi sai.
- Dán nguyên văn thông báo lỗi và mã trạng thái, không diễn giải lại.
- Che thông tin cá nhân trong ảnh chụp: che thư điện tử, địa chỉ mạng, mã truy cập.
- Với lỗi bảo mật, không ghi cách khai thác chi tiết trong phiếu công khai. Gửi riêng cho người phụ trách.

## 5. Sau khi gửi

1. Gắn nhãn và liên kết tới kịch bản kiểm thử đã phát hiện lỗi.
2. Người quản lý xác nhận mức độ và ưu tiên trong vòng một ngày làm việc.
3. Người phát triển cập nhật nguyên nhân và cách sửa khi bắt đầu xử lý.
4. Người kiểm thử chạy lại kịch bản gốc và kịch bản hồi quy sau khi có bản sửa.
5. Chỉ đóng phiếu khi đã kiểm tra trên môi trường thử nghiệm và ghi lại kết quả.
