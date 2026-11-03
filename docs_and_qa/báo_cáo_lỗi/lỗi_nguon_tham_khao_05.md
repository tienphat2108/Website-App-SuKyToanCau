# Báo cáo lỗi 05: Bốn mươi ba phần trăm nguồn tham khảo chỉ trỏ về trang chủ nhà xuất bản

## 1. Thông tin phiếu

| Mục | Nội dung |
| --- | --- |
| Tóm tắt | 172 trên 400 lượt nguồn chỉ ghi tên miền, không dẫn tới bài viết cụ thể, liên quan 81 trên 149 sự kiện |
| Mã báo cáo | BUG-005 |
| Loại vấn đề | Lỗi nội dung |
| Mức độ | Nhẹ |
| Ưu tiên | Thấp |
| Trạng thái | Mở, chờ quyết định của người quản lý sản phẩm |
| Môi trường | Hệ điều hành Windows, mọi trình duyệt; giao diện tại `http://localhost:3000`, máy chủ dữ liệu tại `http://localhost:5080`; kho dữ liệu phiên bản 6 |
| Tài khoản | Không cần đăng nhập |
| Điều kiện đầu | Kho đã nạp 149 sự kiện, tổng 400 lượt nguồn tham khảo |
| Các bước tái hiện | Xem mục 4 |
| Kết quả mong đợi | Xem mục 5 |
| Kết quả thực tế | Xem mục 6 |
| Tần suất | Luôn luôn, với 81 sự kiện nêu dưới |
| Ảnh hưởng | Người đọc bấm nguồn tham khảo để kiểm chứng thì nhận về một trang chủ, phải tự tìm bài viết; độ tin cậy của khối nguồn giảm |
| Bằng chứng | Mục 9 |
| Nguyên nhân | Mục 10 |
| Cách khắc phục đề xuất | Mục 11, cần quyết định |
| Kiểm thử hồi quy | Mục 12 |
| Nhãn | `dữ-liệu`, `nguồn-tham-khảo`, `nội-dung` |

## 2. Mô tả

Mỗi sự kiện có hai hoặc ba nguồn tham khảo, mỗi nguồn gồm tiêu đề, nhà xuất bản, địa chỉ và ngôn ngữ. Kiểm toán toàn bộ 264 địa chỉ khác nhau cho thấy 37 địa chỉ chỉ có tên miền, không có đường dẫn tới bài viết. Các nguồn này hiển thị trong khối «Nguồn tham khảo» ở cuối bài như những bài viết có thật, nhưng khi bấm vào, trình duyệt mở trang chủ của nhà xuất bản.

Ví dụ: `https://baotanglichsu.vn` đứng sau nhãn «Di sản và tư liệu lịch sử Việt Nam» của sự kiện Chiến thắng Bạch Đằng năm 938, và `https://www.worldhistory.org` đứng sau nhãn «Pyramids of Giza» của sự kiện Kim tự tháp Giza.

## 3. Số liệu kiểm toán

| Chỉ số | Kết quả |
| --- | --- |
| Tổng lượt nguồn trong kho | 400 |
| Địa chỉ chỉ có tên miền | 37 địa chỉ, dùng 172 lượt |
| Sự kiện bị ảnh hưởng | 81 trên 149 |
| Số nguồn mỗi sự kiện | 47 sự kiện có hai nguồn, 102 sự kiện có ba nguồn, không sự kiện nào chỉ có một nguồn |

Bốn địa chỉ chiếm nhiều lượt nhất: `https://baotanglichsu.vn` (31 lượt), `https://chinhphu.vn` (17), `https://vietnamplus.vn` (17), `https://nhandan.vn` (14). Các địa chỉ còn lại gồm `https://dangcongsan.vn` (14), `https://www.worldhistory.org` (15), `https://www.loc.gov` (9), `https://www.britannica.com` (8), `https://www.archives.gov` (6) và 28 địa chỉ khác dùng từ một đến bốn lượt.

## 4. Các bước tái hiện

1. Mở `/event/chien-thang-bach-dang-938`.
2. Cuộn tới khối «Nguồn tham khảo» cuối bài.
3. Bấm nguồn «Di sản và tư liệu lịch sử Việt Nam».
4. Làm lại bước 1 đến 3 với `/event/kenh-dao-panama-1914` và `/en/event/kim-tu-thap-giza-2560-tcn`.
5. Chạy `node .tmp/count-homepage-sources.mjs` để liệt kê toàn bộ lượt nguồn chỉ có tên miền.

## 5. Kết quả mong đợi

Mỗi nguồn tham khảo mở đúng bài viết được nêu tên, hoặc giao diện ghi rõ rằng đó là trang chủ của nhà xuất bản chứ không phải bài viết.

## 6. Kết quả thực tế

Trình duyệt mở trang chủ nhà xuất bản, không có bài viết nào mang tiêu đề đã ghi. Không có lỗi 404, nên bộ kiểm tra liên kết trước đây xếp nhóm này là đạt.

## 7. Tần suất

Luôn luôn, với 81 sự kiện có ít nhất một nguồn chỉ ghi tên miền.

## 8. Ảnh hưởng

Không hỏng chức năng, không mất dữ liệu. Người đọc muốn kiểm chứng phải tự tìm bài trên trang chủ, nên giá trị của khối nguồn tham khảo — vốn là căn cứ để dự án tự phân biệt với nội dung tổng hợp — bị giảm. Tập trung nhiều ở các sự kiện Việt Nam, nơi nguồn lấy từ Bảo tàng Lịch sử Quốc gia, Báo Nhân Dân, Thông tấn xã Việt Nam, Cổng Thông tin điện tử Chính phủ và Đảng Cộng sản Việt Nam.

## 9. Bằng chứng

- Công cụ `.tmp/count-homepage-sources.mjs` quét 400 lượt nguồn trong `shared/history-events.json`, đếm theo địa chỉ và theo sự kiện, xuất bảng ở mục 3.
- Công cụ `.tmp/audit-source-urls.mjs` gọi thật 264 địa chỉ khác nhau, xuất `.tmp/source-urls.json`: 124 địa chỉ trả mã 2xx hoặc 3xx, 131 địa chỉ trả 403 vì chặn robot, 6 địa chỉ trả 404, một địa chỉ trả 522 và hai địa không kết nối được.
- Nhóm 403 không phải liên kết hỏng. Đã mở `https://www.britannica.com/place/Srivijaya-empire` bằng trình duyệt thật, bài hiện đầy đủ, tiêu đề đúng «Srivijaya empire».
- Chín liên kết hỏng thật đã được sửa trong cùng đợt kiểm tra, mỗi liên kết thay bằng địa chỉ cụ thể trả 200, chi tiết ở mục 13.

## 10. Nguyên nhân

Khi soạn nguồn tham khảo, người viết ghi tên miền thay vì địa chỉ bài viết vì chưa tìm bài tương ứng. Đặc tả tính năng chỉ buộc có tiêu đề, nhà xuất bản, địa chỉ và ngôn ngữ, không buộc địa chỉ phải dẫn tới trang có nội dung, nên dữ liệu vẫn hợp lệ khi kiểm tra cấu trúc.

## 11. Cách khắc phục đề xuất — cần quyết định, không sửa âm thầm

- Hướng một, bổ sung địa chỉ bài viết cụ thể cho 172 lượt nguồn. Ưu điểm: đúng mục tiêu kiểm chứng của khối nguồn. Nhược điểm: khối lượng lớn, chỉ người soạn nội dung mới xác định được bài nào tương ứng; không được đoán địa chỉ, vì đoán sai còn hại hơn trang chủ.
- Hướng hai, gắn nhãn «Trang chủ nhà xuất bản» cho nguồn chỉ có tên miền. Ưu điểm: sửa một chỗ hiển thị ở giao diện, người đọc không bị hiểu lầm. Nhược điểm: vẫn không dẫn tới bài viết.
- Hướng ba, loại nguồn chỉ có tên miền khỏi dữ liệu, giữ tối thiểu hai nguồn cụ thể cho mỗi sự kiện. Ưu điểm: danh mục gọn và đáng tin. Nhược điểm: nhiều sự kiện Việt Nam sẽ mất hẳn nguồn trong nước, trái định hướng ưu tiên tư liệu tiếng Việt.

Gợi ý: hướng hai làm ngay vì chi phí nhỏ và trung thực, sau đó làm hướng một theo đợt, ưu tiên 81 sự kiện bị ảnh hưởng nhiều nhất.

## 12. Kiểm thử hồi quy

Chạy lại TC-CN-33, TC-CN-70 mới bổ sung và bộ kiểm thử tự động của giao diện. Nếu sửa dữ liệu, chạy lại `.tmp/audit-source-urls.mjs` để bảo toàn không còn địa chỉ 404.

## 13. Việc đã làm trong cùng đợt kiểm tra

Chín nguồn hỏng đã thay bằng địa chỉ cụ thể, tất cả trả 200 khi đo lại. Tệp backup: `shared/history-events.json.bak-dead-sources`; công cụ: `.tmp/fix-dead-sources.mjs`.

| Sự kiện | Địa chỉ cũ (kết quả đo) | Địa chỉ mới |
| --- | --- | --- |
| srivijaya-683 | `worldhistory.org/Srivijaya/` (404) | `newworldencyclopedia.org/entry/Srivijaya` |
| magna-carta-1215 | `bl.uk/magna-carta` (404) | `bl.uk/subjects/magna-carta` |
| cong-nghiep-hoa-anh-1760 | `bl.uk/georgian-britain/articles/the-industrial-revolution` (404) | `bl.uk/romantics-and-victorians/articles/the-industrial-revolution` |
| opium-war-1839 | `nam.ac.uk/explore/opium-war` (404) | `nam.ac.uk/explore/first-china-war-1839-1842` |
| australia-lien-bang-1901 | `nla.gov.au/digital-classroom/year-9/federation` (404, Thư viện Quốc gia Úc đã chuyển sang `library.gov.au`) | `library.gov.au/research/guides-and-resources/guides-selected-collections/federation-australia` |
| world-wide-web-1991 | `home.cern/science/computing/birth-web` (404) | `home.cern/science/computing/the-birth-of-the-web/` |
| world-wide-web-1991 | `worldhistory.org` (nguồn mang nhãn «World Wide Web» nhưng chỉ là trang chủ) | `info.cern.ch/` |
| canada-lien-bang-1867 | `bac-lac.gc.ca/...confederation.aspx` (không kết nối được từ mạng thử nghiệm; tên miền `canada.ca` cũng không kết nối được, nên chưa xác định là liên kết hỏng hay bị chặn theo khu vực) | `historymuseum.ca/teachers-zone/stories-of-confederation/` |
| siam-cach-mang-1932 | `virtualmuseum.finearts.go.th` (không kết nối được) | `en.wikipedia.org/wiki/Siamese_revolution_of_1932` |

## 14. Nhãn

`dữ-liệu`, `nguồn-tham-khảo`, `nội-dung`
