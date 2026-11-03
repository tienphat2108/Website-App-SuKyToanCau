# Quy trình xử lý lỗi

## 1. Mục tiêu

Thống nhất cách phát hiện, ghi nhận, phân loại, sửa và xác nhận lỗi để không bỏ sót vấn đề và không sửa chồng lên nhau. Quy trình chỉ dùng các tính năng có sẵn trong gói miễn phí của Jira: bảng Kanban, nhãn, loại phiếu gốc và các trường mặc định.

## 2. Sơ đồ trạng thái

```
Cần làm  →  Đang làm  →  Chờ kiểm tra  →  Hoàn thành
                  ↑            |
                  └── Cần sửa ─┘
```

- Cần làm: phiếu mới, chưa có người nhận.
- Đang làm: đã có người nhận và đang sửa.
- Chờ kiểm tra: đã có bản sửa trên môi trường thử nghiệm.
- Cần sửa: kiểm thử lại không đạt, quay về người phát triển.
- Hoàn thành: kiểm thử lại đạt và đã ghi kết quả.

Không dùng thêm trạng thái để giữ bảng Kanban gọn. Nếu cần phân biệt mức ưu tiên, dùng nhãn thay vì thêm cột.

## 3. Vai trò

| Vai trò | Trách nhiệm |
| --- | --- |
| Người kiểm thử | Phát hiện, viết phiếu, xác nhận bản sửa, chạy kiểm thử hồi quy |
| Người phát triển | Xác nhận nguyên nhân, sửa, ghi chú kỹ thuật, tự kiểm tra trước khi chuyển |
| Người quản lý sản phẩm | Xác nhận mức độ, ưu tiên, quyết định hoãn hay chặn phát hành |
| Người phụ trách bảo mật | Xử lý riêng các lỗi bảo mật, quyết định công bố |

Một người có thể giữ nhiều vai trò trong nhóm nhỏ, nhưng không tự kiểm thử và tự đóng phiếu do chính mình sửa nếu có người khác trong nhóm.

## 4. Các bước xử lý

### Bước 1: Ghi nhận

Người kiểm thử tạo phiếu theo mẫu trong `mẫu_báo_cáo_lỗi.md`. Phiếu phải có các bước tái hiện, kết quả mong đợi, kết quả thực tế và bằng chứng. Phiếu thiếu bước tái hiện bị trả lại, không đưa vào cột Cần làm.

### Bước 2: Phân loại

Trong vòng một ngày làm việc, người quản lý sản phẩm:

1. Kiểm tra phiếu có trùng với phiếu đã có hay không.
2. Gán mức độ và ưu tiên.
3. Gán nhãn theo khu vực.
4. Quyết định đưa vào chu kỳ hiện tại hay đưa vào danh sách chờ.

### Bước 3: Sửa

Người phát triển:

1. Chuyển phiếu sang Đang làm và nhận phiếu.
2. Ghi nguyên nhân vào phần bình luận.
3. Viết hoặc cập nhật bài kiểm thử tự động nếu lỗi có thể tái hiện bằng mã.
4. Sửa mã nguồn, chạy kiểm thử tự động và kiểm tra thủ công trên máy.
5. Ghi rõ tệp đã sửa và cách kiểm tra.
6. Chuyển sang Chờ kiểm tra.

### Bước 4: Kiểm thử lại

Người kiểm thử:

1. Chạy lại đúng các bước trong phiếu trên môi trường thử nghiệm.
2. Chạy các kịch bản hồi quy liên quan.
3. Nếu đạt, ghi kết quả và chuyển sang Hoàn thành.
4. Nếu không đạt, ghi rõ hiện tượng còn lại, chuyển sang Cần sửa và gắn lại cho người phát triển.

### Bước 5: Đóng phiếu

Chỉ đóng khi:

- Kịch bản gốc đạt.
- Không phát sinh lỗi mới ở khu vực lân cận.
- Đã cập nhật tài liệu nếu hành vi thay đổi.
- Đã ghi mã kịch bản kiểm thử hồi quy vào phiếu.

## 5. Quy tắc ưu tiên

| Tình huống | Cách xử lý |
| --- | --- |
| Lỗi chặn phát hành | Dừng phát hành, sửa ngay trong chu kỳ hiện tại |
| Lỗi bảo mật nghiêm trọng | Chuyển riêng cho người phụ trách bảo mật, không bình luận công khai |
| Lỗi nghiêm trọng nhưng có cách vòng tránh | Sửa trong chu kỳ hiện tại hoặc chu kỳ kế tiếp |
| Lỗi trung bình | Đưa vào danh sách chờ, sửa trong hai chu kỳ tới |
| Lỗi nhẹ | Gom vào đợt dọn giao diện, không chen ngang chu kỳ đang chạy |

## 6. Kiểm thử hồi quy

Mỗi lỗi đã sửa phải để lại ít nhất một trong hai thứ:

- Một bài kiểm thử tự động tái hiện đúng lỗi.
- Một dòng trong danh sách kiểm thử hồi quy của khu vực đó.

Ví dụ: lỗi trùng thẻ sự kiện liên quan đã được sửa và thêm bài kiểm thử `GetBySlugAsync_BuildsRelatedListWithoutDuplicates`. Lần sau ai sửa phần này, bài kiểm thử sẽ báo ngay.

## 7. Thống kê và cải tiến

Cuối mỗi chu kỳ, ghi lại:

- Số lỗi phát hiện, số lỗi đã sửa, số lỗi còn mở.
- Tỉ lệ lỗi quay lại trạng thái Cần sửa.
- Thời gian trung bình từ lúc báo đến lúc đóng.
- Khu vực có nhiều lỗi nhất.

Nếu một khu vực có từ ba lỗi trở lên trong hai chu kỳ liền nhau, nhóm dành một buổi rà soát nguyên nhân gốc thay vì chỉ sửa từng lỗi.

## 8. Lưu trữ

- Phiếu đã đóng được giữ lại, không xóa, để tra cứu khi có lỗi tương tự.
- Ảnh chụp và tệp bằng chứng được đính kèm trực tiếp vào phiếu.
- Không lưu mật khẩu, mã truy cập, thư điện tử thật trong phiếu.
- Sau mỗi chu kỳ, xuất danh sách lỗi đã đóng để lưu cùng tài liệu phát hành.
