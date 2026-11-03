# Báo cáo lỗi mẫu 02: Khung chờ còn nguyên khi cửa sổ trình duyệt không hiển thị

## 1. Thông tin phiếu

| Mục | Nội dung |
| --- | --- |
| Tóm tắt | Trang chủ chỉ hiện khung chờ khi cửa sổ trình duyệt bị che hoặc thu nhỏ |
| Mã báo cáo | BUG-002 |
| Loại vấn đề | Lỗi giao diện |
| Mức độ | Nhẹ |
| Ưu tiên | Thấp |
| Trạng thái | Đóng, không sửa |
| Nhãn | `giao-diện` |
| Người phát hiện | Nhóm kiểm thử |
| Ngày phát hiện | 27/10/2026 |

## 2. Môi trường

- Giao diện dựng ở chế độ sản xuất, chạy tại `http://localhost:3000`.
- Trình duyệt được điều khiển từ xa, cửa sổ không hiển thị trên màn hình.
- Trang chủ có dữ liệu máy chủ nên được dựng theo cơ chế gửi dần của Next.js.

## 3. Điều kiện đầu

Cửa sổ trình duyệt bị che hoàn toàn, không có tiêu điểm. Trang chủ chưa được tải trước đó.

## 4. Các bước tái hiện

1. Đưa cửa sổ trình duyệt ra sau một cửa sổ khác hoặc thu nhỏ.
2. Mở `http://localhost:3000`.
3. Chờ mười giây.
4. Đưa cửa sổ trình duyệt lên trước.

## 5. Kết quả mong đợi

Sau khi trang tải xong, khung chờ được thay bằng nội dung thật, kể cả khi cửa sổ chưa được nhìn thấy.

## 6. Kết quả thực tế

Khung chờ còn nguyên khi cửa sổ bị che. Khi đưa cửa sổ lên trước, nội dung xuất hiện ngay sau khung hình kế tiếp. Không có lỗi trong bảng điều khiển.

## 7. Tần suất

Luôn luôn trong điều kiện cửa sổ không hiển thị. Không xảy ra khi cửa sổ đang hiển thị bình thường.

## 8. Ảnh hưởng

Chỉ ảnh hưởng tới trải nghiệm nhìn thấy trong lúc cửa sổ bị che. Nội dung vẫn nằm trong mã nguồn trang, công cụ tìm kiếm vẫn đọc được, không mất dữ liệu. Người dùng thật mở tab ở nền có thể thấy khung chờ cho tới khi quay lại tab.

## 9. Nguyên nhân

Next.js dùng cơ chế gửi dần: phần nội dung đã dựng xong được đặt trong một khối ẩn, sau đó một đoạn mã nhỏ thay khung chờ bằng nội dung thật. Đoạn mã này được lên lịch bằng `requestAnimationFrame`. Trình duyệt tạm dừng khung hình khi cửa sổ bị che, nên việc thay thế chỉ xảy ra khi cửa sổ hiển thị trở lại.

Đây là hành vi có chủ đích của trình duyệt và của Next.js, không phải lỗi trong mã nguồn dự án. Đã kiểm tra: khi gọi hàm thay thế thủ công, nội dung hiện đầy đủ, chứng tỏ dữ liệu và bố cục đều đúng.

## 10. Quyết định

Không sửa. Lý do:

- Sửa sẽ phải can thiệp vào cơ chế gửi dần của khung, dễ gây lỗi khó lường khi nâng cấp.
- Không ảnh hưởng tới nội dung, tốc độ tải thực tế hay công cụ tìm kiếm.
- Người dùng chỉ gặp trong tích tắc khi quay lại tab.

Đã ghi chú giới hạn này trong `docs_and_qa/giao_diện_đáp_ứng.md` để người kiểm thử biết cách nhận biết.

## 11. Biện pháp giảm thiểu

- Khi kiểm thử giao diện, giữ cửa sổ trình duyệt hiển thị.
- Khi chụp màn hình tự động, dùng chế độ chụp toàn trang sau khi cửa sổ được kích hoạt.
- Không dùng ảnh chụp từ cửa sổ ẩn để kết luận trang bị lỗi.

## 12. Kiểm thử hồi quy

Không cần. Khi nâng cấp Next.js, chạy lại kịch bản `TC-CN-01` với cửa sổ hiển thị để xác nhận nội dung vẫn được thay đúng.
