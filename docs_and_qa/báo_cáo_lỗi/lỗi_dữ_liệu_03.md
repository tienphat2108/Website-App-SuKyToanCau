# Báo cáo lỗi 03: Mười sự kiện có năm bắt đầu nằm ngoài khoảng thời kỳ đã khai báo

## 1. Thông tin phiếu

| Mục | Nội dung |
| --- | --- |
| Tóm tắt | Dòng thời gian và trang chi tiết gán mười sự kiện vào thời kỳ có khoảng năm không chứa năm bắt đầu của chính sự kiện đó |
| Mã báo cáo | BUG-003 |
| Loại vấn đề | Lỗi nội dung |
| Mức độ | Trung bình |
| Ưu tiên | Trung bình |
| Trạng thái | Mở, chờ quyết định của người quản lý sản phẩm |
| Môi trường | Hệ điều hành Windows, mọi trình duyệt; giao diện chạy tại `http://localhost:3000`, máy chủ dữ liệu tại `http://localhost:5080` |
| Tài khoản | Không cần đăng nhập |
| Điều kiện đầu | Kho dữ liệu phiên bản 6 đã nạp đủ 149 sự kiện; bộ lọc thời kỳ đang bật |

## 2. Mô tả

Bảng khai báo thời kỳ trong mã nguồn quy định: Cổ đại từ năm 3000 trước Công nguyên đến năm 999, Trung đại từ 1000 đến 1801, Cận đại từ 1802 đến 1944, Hiện đại từ 1945 đến 2100. Mười sự kiện mang nhãn một thời kỳ nhưng có năm bắt đầu rơi ra ngoài khoảng của thời kỳ ấy. Người đọc bấm vào một mốc ở Cận đại lại thấy sự kiện thuộc thế kỷ XVIII trong khi mốc gần nhất của Cận đại bắt đầu từ 1802, nên dòng thời gian xuất hiện khoảng trống cạnh các mốc bị lệch.

## 3. Danh sách sự kiện lệch

| Sự kiện | Năm bắt đầu | Thời kỳ đang gán | Khoảng của thời kỳ đó |
| --- | --- | --- | --- |
| Chiến thắng Bạch Đằng năm 938 | 938 | Trung đại | 1000 đến 1801 |
| Lê Đại Hành kháng chiến chống Tống | 981 | Trung đại | 1000 đến 1801 |
| Cách mạng Công nghiệp tại Anh | 1760 | Cận đại | 1802 đến 1944 |
| Cách mạng Mỹ và Tuyên ngôn Độc lập | 1776 | Cận đại | 1802 đến 1944 |
| Cách mạng Pháp | 1789 | Cận đại | 1802 đến 1944 |
| Vua Quang Trung đại phá quân Thanh | 1789 | Cận đại | 1802 đến 1944 |
| Cách mạng Haiti | 1791 | Cận đại | 1802 đến 1944 |
| Nguyễn Tất Thành ra đi tìm đường cứu nước | 1911 | Hiện đại | 1945 đến 2100 |
| Cách mạng Tháng Mười Nga | 1917 | Hiện đại | 1945 đến 2100 |
| Chiến tranh thế giới thứ hai | 1939 | Hiện đại | 1945 đến 2100 |

## 4. Các bước tái hiện

1. Mở `/timeline`.
2. Bỏ mọi bộ lọc, đặt ô tìm kiếm trống.
3. Bấm bộ lọc thời kỳ ở mức Cận đại.
4. Cuộn tới các mốc 1760, 1776, 1789 và 1791.
5. Lặp lại bước 3 và 4 với Trung đại (các mốc 938, 981) và Hiện đại (các mốc 1911, 1917, 1939).
6. Mở bảng khai báo thời kỳ trong mã nguồn và đối chiếu khoảng năm với năm bắt đầu của từng sự kiện vừa thấy.

## 5. Kết quả mong đợi

Năm bắt đầu của mọi sự kiện nằm trong khoảng năm của thời kỳ được gán, nên số sự kiện trong mỗi bộ lọc thời kỳ đúng bằng số mốc xuất hiện trên trục.

## 6. Kết quả thực tế

Mười sự kiện có năm bắt đầu ngoài khoảng của thời kỳ đang gán. Bộ đếm vẫn đếm theo nhãn, không theo khoảng năm, nên trục thời gian có mốc nằm chen vào vùng của thời kỳ bên cạnh.

## 7. Tần suất

Luôn luôn, với đúng mười sự kiện nêu trên. Một trăm ba mươi chín sự kiện còn lại đều khớp.

## 8. Ảnh hưởng

Người đọc dùng bộ lọc thời kỳ để học theo giai đoạn sẽ thấy mốc bị lệch giai đoạn, đồng thời giáo viên dựa vào mốc phân kỳ có thể giảng sai ranh giới. Không ảnh hưởng chức năng nào khác: bài viết, ảnh, bản đồ và tìm kiếm vẫn dùng được.

## 9. Bằng chứng

Chạy tệp kiểm tra dữ liệu trong thư mục làm nháp của dự án ở chế độ duyệt kho đã hợp nhất, phần in ra chỉ liệt kê đúng mười dòng nêu trên, các mục kiểm khác đều đạt.

## 10. Nguyên nhân

Kho dữ liệu lớn dần qua bốn đợt bổ sung. Mỗi đợt gán thời kỳ theo thói quen biên soạn của người viết, còn bảng khai báo khoảng năm trong mã nguồn giữ nguyên từ đợt đầu, nên hai bên lệch nhau.

## 11. Cách khắc phục đề xuất — cần quyết định, không sửa âm thầm

Hai hướng, chỉ chọn một vì kéo theo cả mã nguồn, máy chủ, tài liệu và kịch bản kiểm thử:

- Hướng một, chỉnh khoảng thời kỳ cho khớp cách biên soạn đang dùng: Trung đại bắt đầu từ khoảng năm 905 hoặc 938 theo cách phân kỳ phổ biến trong sách giáo lịch sử Việt Nam; Cận đại bắt đầu sớm hơn, ví dụ từ 1750 hoặc từ 1500; Hiện đại bắt đầu từ 1900 hoặc 1918. Ưu điểm: giữ nguyên nhãn của mười sự kiện, chỉ đổi bốn dòng khai báo. Nhược điểm: phải xét lại toàn bộ 149 sự kiện xem mốc ranh giới mới có đẩy sự kiện khác sang thời kỳ khác không, và phải cập nhật số lượng từng thời kỳ trong tài liệu.
- Hướng hai, chuyển mười sự kiện về thời kỳ đúng khoảng hiện hành: bốn sự kiện 1760 đến 1791 sang Trung đại, ba sự kiện 1911 đến 1939 sang Cận đại, hai sự kiện 938 và 981 sang Cổ đại. Ưu điểm: không đụng bảng khai báo, tổng số mỗi thời kỳ thay đổi ít. Nhược điểm: Chiến thắng Bạch Đằng 938 xếp vào Cổ đại sẽ trái với cách hiểu phổ biến ở Việt Nam, còn Cách mạng Pháp 1789 xếp vào Trung đại thì ngược với thông lệ quốc tế.

Gợi ý: hướng một, chỉnh Trung đại bắt đầu từ 938 và Hiện đại bắt đầu từ 1900, riêng Cận đại cân nhắc mốc 1750, vì phù hợp cách phân kỳ trong sách giáo khoa Việt Nam và không phải di chuyển sự kiện nào.

## 12. Kiểm thử hồi quy

Chạy lại TC-CN-07, TC-CN-67, TC-API-40 và bộ kiểm thử tự động của giao diện; cập nhật số lượng theo thời kỳ trong đặc tả tính năng, kế hoạch sprint và README nếu chọn hướng một.

## 13. Nhãn

`dữ-liệu`
