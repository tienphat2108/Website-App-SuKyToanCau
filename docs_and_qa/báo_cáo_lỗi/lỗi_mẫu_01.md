# Báo cáo lỗi mẫu 01: Thẻ sự kiện liên quan bị lặp

## 1. Thông tin phiếu

| Mục | Nội dung |
| --- | --- |
| Tóm tắt | Trang chi tiết hiện lặp cùng một sự kiện liên quan khi dữ liệu biên tập có khóa trùng |
| Mã báo cáo | BUG-001 |
| Loại vấn đề | Lỗi chức năng |
| Mức độ | Trung bình |
| Ưu tiên | Trung bình |
| Trạng thái | Hoàn thành |
| Nhãn | `dữ-liệu`, `gọi-dữ-liệu` |
| Người phát hiện | Nhóm kiểm thử |
| Ngày phát hiện | 27/10/2026 |

## 2. Môi trường

- Máy chủ dữ liệu chạy tại `http://localhost:5080`, cơ sở dữ liệu SQLite.
- Dữ liệu thử nghiệm có một sự kiện với danh sách liên quan chứa khóa trùng.
- Kiểm tra bằng bài kiểm thử tự động của tầng ứng dụng.

## 3. Điều kiện đầu

Một sự kiện có trường `related` gồm bốn khóa, trong đó khóa thứ nhất lặp lại và một khóa trỏ về chính sự kiện:

```
related: ["phu-1", "phu-2", "phu-1", "goc"]
```

## 4. Các bước tái hiện

1. Chuẩn bị dữ liệu như mô tả ở mục 3.
2. Gọi `GET /api/events/goc`.
3. Đọc trường `related` trong phản hồi.
4. Mở trang chi tiết tương ứng trên giao diện.

## 5. Kết quả mong đợi

Danh sách liên quan có tối đa ba phần tử, không trùng khóa, không chứa chính sự kiện đang xem. Ví dụ: `phu-1`, `phu-2`, `cung-thoi-ky`.

## 6. Kết quả thực tế

Danh sách trả về ba phần tử nhưng phần tử thứ ba lặp lại phần tử thứ nhất: `phu-1`, `phu-2`, `phu-1`. Giao diện hiện hai thẻ giống nhau.

## 7. Tần suất

Luôn luôn, khi dữ liệu có khóa trùng.

## 8. Ảnh hưởng

Người đọc thấy nội dung lặp, giảm độ tin cậy của phần gợi ý. Không ảnh hưởng tới dữ liệu gốc và không gây lỗi máy chủ.

## 9. Nguyên nhân

Trong `EventService.LoadRelatedAsync`, danh sách khóa được loại trùng khi tải từ kho dữ liệu, nhưng vòng lặp duyệt vẫn đi qua mảng gốc có khóa trùng và thêm cùng một sự kiện nhiều lần. Phần bổ sung sự kiện cùng thời kỳ có kiểm tra trùng, còn phần ưu tiên khóa biên tập thì không.

## 10. Cách khắc phục

Thêm một tập hợp các khóa đã dùng, khởi tạo bằng khóa của sự kiện đang xem, rồi kiểm tra trước khi thêm vào danh sách. Áp dụng cùng tập hợp cho cả phần bổ sung sự kiện cùng thời kỳ để thống nhất quy tắc.

Tệp đã sửa: `backend/Application/Services/EventService.cs`.

## 11. Kiểm thử hồi quy

- Bài kiểm thử `GetBySlugAsync_BuildsRelatedListWithoutDuplicates` trong `backend/Tests/Services/EventServiceTests.cs`.
- Chạy toàn bộ bài kiểm thử máy chủ: 66 bài đạt.
- Kiểm tra thủ công: mở một sự kiện có hai khóa liên quan, xác nhận không có thẻ trùng.

## 12. Ghi chú

Lỗi được phát hiện nhờ bài kiểm thử viết trước khi sửa, không phải qua thao tác trên giao diện. Dữ liệu mẫu hiện tại không có khóa trùng nên người dùng chưa gặp lỗi, nhưng dữ liệu biên tập trong tương lai có thể tạo ra.
