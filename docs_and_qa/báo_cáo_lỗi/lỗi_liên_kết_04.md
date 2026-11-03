# Báo cáo lỗi 04: Một tên bài dùng cho hai ngôn ngữ khiến liên kết Wikipedia ở bản tiếng Anh hỏng hàng loạt

## 1. Thông tin phiếu

| Mục | Nội dung |
| --- | --- |
| Tóm tắt | Trang sự kiện bản tiếng Anh nối tới Wikipedia tiếng Anh bằng tên bài tiếng Việt, nên hai phần ba số bài mở ra trang “không tồn tại” |
| Mã báo cáo | BUG-004 |
| Loại vấn đề | Lỗi chức năng |
| Mức độ | Nghiêm trọng |
| Ưu tiên | Trung bình |
| Trạng thái | Mở, chờ quyết định của người quản lý sản phẩm |
| Môi trường | Hệ điều hành Windows, mọi trình duyệt; giao diện tại `http://localhost:3000`, máy chủ dữ liệu tại `http://localhost:5080`; kho dữ liệu phiên bản 6 |
| Tài khoản | Không cần đăng nhập |
| Điều kiện đầu | Kho đã nạp 149 sự kiện; 148 sự kiện có trường tên bài Wikipedia; bộ đếm kiểm toán lấy từ hai công cụ trong thư mục làm nháp |
| Các bước tái hiện | Xem mục 4 |
| Kết quả mong đợi | Xem mục 5 |
| Kết quả thực tế | Xem mục 6 |
| Tần suất | Luôn luôn, với đúng 103 sự kiện nêu dưới |
| Ảnh hưởng | Người đọc tiếng Anh bấm nút “Đọc thêm” và gặp trang báo lỗi của Wikipedia; khối tóm tắt tham chiếu biến mất ở bản tiếng Anh |
| Bằng chứng | Mục 9 |
| Nguyên nhân | Mục 10 |
| Cách khắc phục đề xuất | Mục 11, cần quyết định |
| Kiểm thử hồi quy | Mục 12 |
| Nhãn | `đa-ngôn-ngữ`, `dữ-liệu`, `gọi-dữ-liệu` |

## 2. Mô tả

Mỗi sự kiện chỉ lưu một trường tên bài Wikipedia. Giao diện lại đổi máy chủ theo ngôn ngữ đang xem: bản tiếng Việt mở `vi.wikipedia.org`, bản tiếng Anh mở `en.wikipedia.org`, vẫn dùng đúng một chuỗi tên bài đã lưu. Với 103 sự kiện, tên bài đang lưu là tên tiếng Việt, không tồn tại trên Wikipedia tiếng Anh, nên liên kết ở bản tiếng Anh mở ra trang báo không có bài.

Máy chủ dữ liệu cũng dùng cùng cách: thành phần gọi bên ngoài ghép tên bài vào địa chỉ của ngôn ngữ được yêu cầu. Khi bản tiếng Anh hỏi, tên tiếng Việt không có bài tương ứng nên lời đáp rỗng, kéo theo khối tóm tắt tham chiếu không hiển thị trên trang tiếng Anh.

Lỗi này có trước đợt bổ sung năm mươi sự kiện, thuộc về cách thiết kế trường dữ liệu, không phải do nội dung mới soạn sai. Đợt kiểm tra lần này đo được quy mô đầy đủ của nó.

## 3. Số liệu kiểm toán

| Chỉ số | Kết quả |
| --- | --- |
| Sự kiện có tên bài Wikipedia | 148 trên 149 |
| Tên bài tồn tại trên Wikipedia tiếng Việt | 148 trên 148, trong đó 19 tên là trang chuyển hướng, liên kết vẫn mở được bài |
| Tên bài thiếu trên Wikipedia tiếng Anh | 103 sự kiện |
| Tên bài là trang chuyển hướng trên Wikipedia tiếng Anh | 13 sự kiện, liên kết vẫn mở được bài |
| Tên bài sạch trên cả hai ngôn ngữ | 26 sự kiện |
| Sự kiện không có tên bài, giao diện ẩn liên kết | 1 sự kiện |

Ba sự kiện minh họa cho nhóm hỏng: `/en/event/chien-thang-bach-dang-938`, `/en/event/the-chien-thu-hai`, `/en/event/hiep-dinh-paris-khi-hau-2015`.

## 4. Các bước tái hiện

1. Mở `/en/event/chien-thang-bach-dang-938`.
2. Cuộn xuống khối “Đọc thêm” cuối bài, kiểm tra địa chỉ của nút.
3. Bấm nút đó.
4. Làm lại bước 1 đến 3 với `/en/event/the-chien-thu-hai`.
5. Gọi `http://localhost:5080/api/events/chien-thang-bach-dang-938/external?language=en`.
6. Gọi cùng đường dẫn với `language=vi` để đối chiếu.

## 5. Kết quả mong đợi

- Nút ở bản tiếng Anh mở một bài tiếng Anh có thật; nếu chưa có bài tiếng Anh thì giao diện không hiện nút, hoặc hiện nút mở bài tiếng Việt kèm nhãn nói rõ ngôn ngữ.
- Lời gọi tóm tắt theo ngôn ngữ trả về nội dung cho cả hai ngôn ngữ khi nguồn có bài.

## 6. Kết quả thực tế

- Địa chỉ của nút là `https://en.wikipedia.org/wiki/Tr%E1%BA%ADn_B%E1%BA%A1ch_%C4%90%E1%BA%B1ng_(938)`, trình duyệt nhận trang “Wikipedia chưa có bài này”.
- Cùng sự kiện ở bản tiếng Việt mở đúng bài, không lỗi.
- Lời gọi `external?language=en` trả mã 204, không có nội dung; lời gọi `language=vi` trả đoạn tóm tắt đầy đủ.

## 7. Tần suất

Luôn luôn, với 103 trong tổng số 149 sự kiện, ở mọi trình duyệt và mọi kích thước màn hình. 46 sự kiện còn lại mở được bài ở cả hai ngôn ngữ.

## 8. Ảnh hưởng

Người đọc dùng bản tiếng Anh — đối tượng mà dự án cam kết phục vụ song song với bản tiếng Việt — bấm vào nguồn tham chiếu và gặp trang lỗi. Khối tóm tắt tham chiếu, tính năng đã ghi trong đặc tả, coi như không tồn tại trên hai phần ba số bài tiếng Anh. Bản tiếng Việt không bị ảnh hưởng. Không mất dữ liệu, không lộ thông tin cá nhân.

## 9. Bằng chứng

- Công cụ `.tmp/verify-wiki-live.mjs` gọi một lượt cho cả hai ngôn ngữ với toàn bộ tên bài trong kho, xuất báo cáo `.tmp/wiki-live-audit.json` và bảng tổng kết ở mục 3.
- Công cụ `.tmp/probe-en-titles.mjs` và `.tmp/retry-en-titles.mjs` lấy tên bài tiếng Anh tương ứng từ liên kết ngôn ngữ của chính bài tiếng Việt, xuất `.tmp/en-title-coverage.json` đủ 103 dòng. Kết quả: 100 trên 103 sự kiện hỏng có tên bài tiếng Anh thật, chỉ 3 sự kiện không có bài tương ứng, gồm «Luật Hồng Đức», «Hải đội Hoàng Sa» và «Chiến dịch Hồ Chí Minh».
- Danh mục nguồn tham khảo hiện có sẵn địa chỉ bài tiếng Anh cho 49 trên 149 sự kiện, trong đó 35 sự kiện thuộc nhóm hỏng, nên một phần tên tiếng Anh có thể lấy ngay từ dữ liệu đang có.
- Mã trả về đo trực tiếp ngày 3 tháng 11 năm 2026: `https://en.wikipedia.org/wiki/Trận_Bạch_Đằng_(938)`, `.../Kênh_đào_Panamá` và `.../Cách_mạng_Pháp` đều trả 404; `http://localhost:5080/api/events/chien-thang-bach-dang-938/external?language=en` và cùng đường dẫn với `kenh-dao-panama-1914` trả 204, trong khi `language=vi` của hai sự kiện này trả 200 kèm đoạn tóm tắt.

## 10. Nguyên nhân

Mô hình dữ liệu chỉ có một trường tên bài, xem `frontend/src/core/models/HistoricalEvent.ts:68` và `backend/Infrastructure/Persistence/Configurations/HistoricalEventConfiguration.cs:141`. Giao diện đổi máy chủ theo ngôn ngữ tại `frontend/src/app/event/[slug]/page.tsx:217`. Máy chủ dữ liệu đổi máy chủ theo ngôn ngữ tại `backend/Infrastructure/External/WikipediaHistoryClient.cs:72`. Ba chỗ này cùng giả định tên bài dùng được cho cả hai ngôn ngữ, giả định chỉ đúng với 26 sự kiện.

## 11. Cách khắc phục đề xuất — cần quyết định, không sửa âm thầm

- Hướng một, thêm trường tên bài tiếng Anh cạnh trường hiện có. Ưu điểm: đúng bản chất song ngữ, liên kết và khối tóm tắt đều chạy ở cả hai ngôn ngữ; 100 trên 103 sự kiện đã lấy được tên, trong đó 35 sự kiện đã có sẵn trong danh mục nguồn. Nhược điểm: thêm một cột vào cơ sở dữ liệu và một trường vào mô hình, phải cập nhật tệp dùng chung, bộ nạp, máy chủ, giao diện, tài liệu và kịch bản kiểm thử; 3 sự kiện vẫn phải ẩn nút ở bản tiếng Anh.
- Hướng hai, luôn mở bài tiếng Việt ở cả hai ngôn ngữ và đổi nhãn nút ở bản tiếng Anh thành “Đọc thêm trên Wikipedia tiếng Việt”. Ưu điểm: sửa một dòng ở giao diện, hết lỗi ngay, không đụng dữ liệu. Nhược điểm: người đọc tiếng Anh nhận văn bản tiếng Việt, trái mục tiêu song ngữ của dự án.
- Hướng ba, chỉ hiện nút khi tên bài đã kiểm chứng là tồn tại ở ngôn ngữ đang xem, tức ẩn trên 103 bài tiếng Anh. Ưu điểm: không bao giờ mở trang lỗi, không sửa dữ liệu. Nhược điểm: mất liên kết nguồn ở phần lớn bài tiếng Anh, coi như thu hẹp tính năng.

Gợi ý: hướng một, vì dự án đã cam kết hai ngôn ngữ ngang nhau và phần lớn tên tiếng Anh đã lấy được tự động. Nếu chưa muốn đụng cơ sở dữ liệu ở thời điểm này, dùng tạm hướng hai như một chỉnh sửa một dòng, rồi làm hướng một sau.

## 12. Kiểm thử hồi quy

Chạy lại TC-NN-37 mới bổ sung, TC-CN-62, TC-API-40 và bộ kiểm thử tự động của giao diện. Nếu chọn hướng một, chạy thêm TC-API-43, cập nhật mục mô tả trường trong `docs_and_qa/đồng_bộ_dữ_liệu.md` và đặc tả tính năng FE tương ứng.

## 13. Nhãn

`đa-ngôn-ngữ`, `dữ-liệu`, `gọi-dữ-liệu`
