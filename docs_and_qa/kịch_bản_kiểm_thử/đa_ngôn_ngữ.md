# Kịch bản kiểm thử đa ngôn ngữ

## 1. Phạm vi

Bộ kịch bản này kiểm tra đường dẫn ngôn ngữ, nội dung song ngữ, từ điển giao diện, định dạng số và năm, siêu dữ liệu ngôn ngữ và các trường hợp chuyển đổi qua lại giữa tiếng Việt và tiếng Anh.

## 2. Điều kiện chung

- Giao diện chạy tại `http://localhost:3000`.
- Trình duyệt mới, chưa có cookie `NEXT_LOCALE`.
- Có ít nhất một sự kiện đã được biên tập đủ hai ngôn ngữ.
- Biết đường dẫn của một sự kiện để kiểm tra cặp trang, ví dụ `/event/chien-thang-bach-dang-938` và `/en/event/chien-thang-bach-dang-938`.

## 3. Danh sách kịch bản

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-NN-01 | Ngôn ngữ mặc định | Mở `/` khi chưa có cookie | Toàn bộ giao diện tiếng Việt, `html lang="vi-VN"` | Cao |
| TC-NN-02 | Trang tiếng Anh | Mở `/en` | Toàn bộ giao diện tiếng Anh, `html lang="en"` | Cao |
| TC-NN-03 | Chuyển hướng tiền tố tiếng Việt | Gọi `curl.exe -sI http://localhost:3000/vi/timeline` | Trả 308 về `/timeline`, không phải 301 hay 302 | Cao |
| TC-NN-04 | Chuyển hướng trang chủ tiếng Việt | Gọi `curl.exe -sI http://localhost:3000/vi` | Trả 308 về `/` | Trung bình |
| TC-NN-05 | Nút chuyển ngôn ngữ | Đang ở `/timeline`, bấm chuyển sang tiếng Anh | Mở `/en/timeline`, không quay về trang chủ | Cao |
| TC-NN-06 | Giữ bộ lọc khi đổi ngôn ngữ | Đang ở `/timeline?era=trung-dai`, chuyển ngôn ngữ | Mở `/en/timeline?era=trung-dai`, bộ lọc được giữ | Cao |
| TC-NN-07 | Nội dung sự kiện hai ngôn ngữ | Mở cùng một sự kiện ở hai ngôn ngữ | Tiêu đề, tóm tắt, đoạn nội dung, địa điểm, nhãn thời gian và văn bản thay thế ảnh đều đổi ngôn ngữ | Cao |
| TC-NN-08 | Tên thời kỳ | Xem thẻ thời kỳ ở hai ngôn ngữ | Tiếng Việt là Cổ đại, Trung đại, Cận đại, Hiện đại; tiếng Anh là Ancient, Medieval, Early modern, Modern | Cao |
| TC-NN-09 | Định dạng số | Xem khối số liệu ở hai ngôn ngữ | Tiếng Việt dùng dấu chấm phân cách nghìn, tiếng Anh dùng dấu phẩy | Trung bình |
| TC-NN-10 | Định dạng năm trước Công nguyên | Xem sự kiện Văn Lang ở hai ngôn ngữ | Tiếng Việt hiện "trước Công nguyên", tiếng Anh hiện "BCE" | Trung bình |
| TC-NN-11 | Từ điển đủ khóa | Chạy `npm test` trong thư mục giao diện | Bài kiểm thử từ điển đạt, hai tệp có cùng danh sách khóa | Cao |
| TC-NN-12 | Chữ trên giao diện không lẫn ngôn ngữ | Đi qua tất cả trang ở bản tiếng Anh | Không còn câu tiếng Việt trên giao diện, trừ tên riêng và khóa đường dẫn | Cao |
| TC-NN-13 | Thông báo lỗi biểu mẫu | Gửi biểu mẫu thiếu trường ở bản tiếng Anh | Thông báo lỗi bằng tiếng Anh, đúng trường | Cao |
| TC-NN-14 | Trang cảm ơn | Gửi đóng góp thành công ở bản tiếng Anh | Trang cảm ơn tiếng Anh, đường dẫn `/en/thank-you` | Trung bình |
| TC-NN-15 | Đường dẫn chuẩn theo ngôn ngữ | So sánh thẻ canonical của hai bản | Bản Việt trỏ đường dẫn không tiền tố, bản Anh trỏ đường dẫn có `/en` | Cao |
| TC-NN-16 | Liên kết ngôn ngữ thay thế | Kiểm tra thẻ `alternate` ở cả hai bản | Cả hai bản khai báo cùng cặp địa chỉ cho `vi` và `en` | Cao |
| TC-NN-17 | Cookie ngôn ngữ | Chuyển sang tiếng Anh, kiểm tra cookie `NEXT_LOCALE` | Giá trị là `en`, có `SameSite=Lax`, có `HttpOnly`, đường dẫn gốc | Trung bình |
| TC-NN-18 | Ghi nhớ ngôn ngữ | Chuyển sang tiếng Anh, đóng trình duyệt, mở lại trang chủ | Vẫn ở bản tiếng Anh nhờ cookie | Trung bình |
| TC-NN-19 | Chống giả mạo tiêu đề ngôn ngữ | Gửi yêu cầu tới `/` kèm tiêu đề `x-locale: en` tự đặt | Trang vẫn tiếng Việt vì tiêu đề bị ghi đè | Cao |
| TC-NN-20 | Chống giả mạo đường dẫn | Gửi yêu cầu tới `/` kèm tiêu đề `x-pathname: /en/timeline` | Đường dẫn chuẩn vẫn là trang chủ tiếng Việt | Trung bình |
| TC-NN-21 | Sơ đồ trang hai ngôn ngữ | Kiểm tra sơ đồ trang | Mỗi trang và mỗi sự kiện xuất hiện hai lần, mỗi lần một ngôn ngữ | Cao |
| TC-NN-22 | Thẻ chia sẻ theo ngôn ngữ | Kiểm tra `og:locale` ở hai bản | Bản Việt là `vi_VN`, bản Anh là `en_US`, kèm ngôn ngữ thay thế | Trung bình |
| TC-NN-23 | Trang không tồn tại ở bản tiếng Anh | Mở `/en/khong-ton-tai` | Trả 404, giao diện tiếng Anh, liên kết điều hướng đúng tiền tố | Trung bình |
| TC-NN-24 | Tìm kiếm xuyên ngôn ngữ | Ở bản tiếng Việt, tìm từ khóa tiếng Anh | Tìm được sự kiện nhờ chỉ mục gộp hai ngôn ngữ | Thấp |
| TC-NN-25 | Trang hồ sơ đáng đọc hai ngôn ngữ | So sánh `/stories` và `/en/stories` khi chưa chọn quốc gia | Bản Việt có “Hồ sơ đáng đọc”, “Vì sao đáng đọc”; bản Anh có “Stories worth reading”, “Why it matters”; cùng bốn sự kiện của Việt Nam | Cao |
| TC-NN-26 | Nhãn chỉ đường và nhãn mở Google Maps | Mở cùng một sự kiện ở hai ngôn ngữ, cuộn tới khối bản đồ | Bản Việt ghi “Chỉ đường” và “Mở Google Maps”; bản Anh ghi “Directions” và “Open Google Maps”; hai liên kết mở thẻ mới; phần ghi nguồn và tên địa danh trên bản đồ vẫn do trang kiểm soát, không đổi sang nhãn của bên thứ ba | Trung bình |
| TC-NN-27 | Cam kết phản hồi hai ngôn ngữ | Mở `/contribute` và `/en/contribute` | Bản Việt có “Cam kết phản hồi”, bản Anh có “Response promise”, nội dung thời hạn tương ứng | Trung bình |
| TC-NN-28 | Liên kết hồ sơ trong điều hướng | Kiểm tra thanh điều hướng và chân trang ở hai ngôn ngữ | Bản Việt trỏ `/stories`, bản Anh trỏ `/en/stories`, nhãn lần lượt là “Hồ sơ” và “Stories” | Cao |
| TC-NN-29 | Nhãn bộ chọn quốc gia | Để nguyên trạng thái chưa chọn quốc gia, mở thanh điều hướng ở hai ngôn ngữ | Bản Việt ghi “Chọn quốc gia”, danh sách tên quốc gia bằng tiếng Việt; bản Anh ghi “Choose a country”, tên quốc gia bằng tiếng Anh; nhãn không bị cắt chữ. Sau khi chọn một quốc gia, dòng hướng dẫn đó biến mất và nút “Bỏ ưu tiên” / “Clear preference” hiện bên cạnh ô chọn, không tràn ngang ở 320 điểm ảnh | Cao |
| TC-NN-30 | Lựa chọn quốc gia không phụ thuộc ngôn ngữ | Chọn “Việt Nam” ở bản tiếng Việt, chuyển sang `/en` | Bộ chọn vẫn giữ Việt Nam, khối ưu tiên hiện “Vietnam in history” và sự kiện của Việt Nam vẫn đứng trước | Cao |
| TC-NN-31 | Khối ưu tiên theo ngôn ngữ | Chọn “Hoa Kỳ” rồi so sánh trang chủ hai ngôn ngữ | Bản Việt hiện “Lịch sử Hoa Kỳ”, bản Anh hiện “United States in history”, cùng ba sự kiện | Trung bình |
| TC-NN-32 | Đổi ngôn ngữ cập nhật toàn trang | Ở bản tiếng Anh, cuộn xuống giữa trang rồi bấm “VI”, sau đó bấm “EN” để quay lại; làm lại trên trang sự kiện, mở khối trắc nghiệm, chọn “10 câu” rồi mới đổi ngôn ngữ | Trang không tải lại, giữ nguyên vị trí cuộn; thanh điều hướng, chân trang, ô tìm kiếm, tiêu đề trang và thuộc tính ngôn ngữ đổi đúng ngay sau khi bấm; tiêu đề bài viết, từng đoạn nội dung, chú thích ảnh và câu hỏi trắc nghiệm do máy chủ dựng cũng đổi theo, không còn cảnh nửa Việt nửa Anh; khối trắc nghiệm đóng sẵn, trở về trạng thái chưa chấm và về mặc định “5 câu”/“5 questions” sau khi đổi, nhãn “Số câu hỏi”/“Questions” và hai lựa chọn số câu cũng đổi ngôn ngữ | Cao |
| TC-NN-33 | Tên hai quần đảo không đổi theo ngôn ngữ | Mở `/timeline?view=map` rồi bấm “+” tới mức nhìn rõ Biển Đông, so sánh bản tiếng Việt và bản tiếng Anh | Bản Việt hiện “Biển Đông”, “Hoàng Sa”, “Trường Sa”, “Việt Nam”; bản Anh hiện “East Sea”, “Vietnam” nhưng hai quần đảo vẫn là “Hoàng Sa” và “Trường Sa”; không có tên nào bằng chữ nước ngoài | Cao |
| TC-NN-34 | Ghi nguồn nền bản đồ ở hai ngôn ngữ | Kiểm tra dòng ghi nguồn dưới góc phải mọi khung bản đồ | Bản Việt ghi “Đường bờ biển và biên giới: Natural Earth (phạm vi công cộng)”; bản Anh ghi “Coastlines and land borders: Natural Earth (public domain)” | Thấp |
| TC-NN-35 | Cặp trang của năm mươi sự kiện mới đều tồn tại | Với mỗi sự kiện mới, mở cả `/event/<đường-dẫn>` lẫn `/en/event/<đường-dẫn>`; thử với `/event/thu-viet-hinh-nem-sumer-3200-tcn`, `/event/chu-cai-hangul-1443`, `/event/khung-hoang-suez-1956`, `/event/hiep-dinh-paris-khi-hau-2015` | Hai trang đều trả về nội dung đầy đủ, không trang nào báo lỗi hay chuyển về trang chủ; bản Việt hiện tiêu đề, tóm tắt, chú thích ảnh và nhãn tiếng Việt; bản Anh hiện bản dịch tương ứng; không bản nào hiển thị nguyên văn câu của bản kia; liên kết đổi ngôn ngữ ở thanh điều hướng đưa đúng về trang song ngữ của cùng sự kiện | Cao |
| TC-NN-36 | Bài tiếng Việt của sự kiện mới không lẫn tiếng Anh | Mở mười bài thuộc năm mươi sự kiện mới, đọc tiêu đề, tóm tắt, từng đoạn nội dung, chú thích ảnh và nhãn; đối chiếu bản Anh của cùng mười bài | Ngoài tên riêng và tên quốc gia giữ nguyên dạng quốc tế (Iraq, Ireland, New Zealand, Panama, Peru, Rwanda, Terracotta) và tên tác giả trong dòng ghi nguồn, không có câu tiếng Anh nào lọt vào phần chữ tiếng Việt; bản Anh dịch hết nhãn giao diện, hiển thị “Public domain” cho ảnh phạm vi công cộng và có câu chú thích tiếng Anh mô tả đúng vật thể trong ảnh, tương ứng với chú thích tiếng Việt | Cao |
| TC-NN-37 | Liên kết bách khoa toàn thư mở chạy được ở cả hai bản | Mở `/event/chien-thang-bach-dang-938` và `/en/event/chien-thang-bach-dang-938`, rồi làm lại với `/event/kenh-dao-panama-1914` và `/event/hiep-dinh-paris-khi-hau-2015`; ghi lại địa chỉ của nút trong khối “Đọc thêm” rồi gọi `curl.exe -s -o NUL -w "%{http_code}"` cho từng địa chỉ | Bản tiếng Việt mở bài trên máy chủ Wikipedia tiếng Việt, bản tiếng Anh mở bài trên máy chủ Wikipedia tiếng Anh; mọi địa chỉ đều trả mã 200, không địa chỉ nào mở trang “chưa có bài”; nếu Wikipedia tiếng Anh chưa có bài tương ứng, bản tiếng Anh phải ẩn nút hoặc hiển thị nút mở bài tiếng Việt kèm nhãn nói rõ ngôn ngữ; đoạn tóm tắt tham chiếu xuất hiện ở bản nào thì nguồn của đoạn đó cũng thuộc ngôn ngữ đó | Cao |
| TC-NN-38 | Trắc nghiệm ôn tập đổi trọn ngôn ngữ | Mở `/event/magna-carta-1215` và `/event/van-hoa-dong-son-700-tcn`, bấm dòng tiêu đề để mở khối, chọn “10 câu” rồi chép lại câu hỏi, đáp án, giải thích và nhãn số câu; mở bản `/en/…` tương ứng và bấm dòng tiêu đề “Memory quiz”; bấm đổi ngôn ngữ ngay trong bài khi khối đang mở và đã chấm dở rồi làm lại | Khối đổi trọn: “Trắc nghiệm ghi nhớ” thành “Memory quiz”, “Chấm điểm” thành “Check answers”, “Số câu hỏi”/“5 câu”/“10 câu” thành “Questions”/“5 questions”/“10 questions”, câu hỏi dùng “In what year…”, “Which era…”, “Which event began earliest…”; quốc gia và địa điểm hiện tên tiếng Anh, thời kỳ hiện “Ancient/Medieval/Early modern/Modern”, năm âm lịch hiện “BCE” thay cho “TCN”; không còn câu tiếng Việt nào trong bản Anh và ngược lại; đổi ngôn ngữ giữa chừng thì khối dựng lại ở ngôn ngữ mới với bộ câu ngẫu nhiên mới, đóng sẵn, về mặc định “5 questions” và trở về trạng thái chưa chấm | Cao |

| TC-NN-39 | Nội dung pháp lý về dữ liệu cá nhân đổi trọn ngôn ngữ | Mở `/privacy`, đếm số mục chính sách, chép tiêu đề mục đầu, thời hạn phản hồi và dòng chủ quản ở chân trang; mở `/contribute` và chép nhãn ô đồng ý cùng liên kết trong nhãn; làm lại toàn bộ ở `/en/privacy` và `/en/contribute`; chạy `npm test --prefix frontend` | Bản tiếng Việt có chín mục, mục đầu “Chủ quản và đầu mối dữ liệu” nêu tên chủ quản và hộp thư `sukytoancau@gmail.com`, mục cuối “Liên hệ và thời hạn phản hồi” trích “Điều 5 Nghị định 356/2025/NĐ-CP”, không còn chuỗi `{owner}` thô và không còn cam kết “30 ngày làm việc”; ô đồng ý hiện “Tôi đồng ý để trang lưu họ tên và thư điện tử của tôi nhằm liên hệ về đóng góp này.” kèm liên kết “Đọc Chính sách riêng tư” tới `/privacy`; bản tiếng Anh tương ứng là “Data controller and contact point”, “Contact and response deadlines” trích “Article 5 of Decree 356/2025/ND-CP”, “I agree that this site may store my name and email address…”, liên kết “Read the Privacy Policy” trỏ `/en/privacy`, chân trang ghi “Managed by World History Archive · Personal data contact: sukytoancau@gmail.com”, không sót cụm “30 working days”; hai bản dùng cùng bộ neo `#chu-quan` đến `#lien-he`; bộ kiểm tra từ điển báo hai tệp khóa khớp nhau, không khóa nào thừa hoặc thiếu | Cao |
| TC-NN-40 | Khu cập nhật đổi trọn ngôn ngữ theo đường dẫn | Mở `/updates`, chép tiêu đề trang, khối ghi chú, tiêu đề thẻ đầu tiên, tóm tắt, nhãn “ngôn ngữ”, “Sửa gần nhất”, “Nguồn bài viết” và nút “Đọc bài gốc”; mở `/en/updates` và lặp lại; bấm nút đổi ngôn ngữ để đi qua lại giữa hai bản; chạy `npm test --prefix frontend` | Bản tiếng Việt hiện “Sự kiện mới từ nguồn mở”, “Sưu tầm tự động từ nguồn mở” và đầy đủ nhãn tiếng Việt; bản tiếng Anh hiện “New events from open sources”, “Collected automatically from open sources” và đầy đủ nhãn tiếng Anh, không sót chuỗi ngôn ngữ kia; tiêu đề và tóm tắt của từng mục đổi theo ngôn ngữ đang xem; nút “Đọc bài gốc” trỏ bài Wikipedia tiếng Việt ở bản tiếng Việt và tiếng Anh ở bản tiếng Anh; mục “Cập nhật”/“Updates” trong điều hướng và chân trang đổi nhãn theo ngôn ngữ; bộ kiểm tra từ điển báo hai tệp khóa khớp nhau | Cao |
| TC-NN-41 | Ghi chú quốc gia ở trang hồ sơ đổi theo ngôn ngữ | Chọn “Hoa Kỳ” rồi mở `/stories` và `/en/stories` | Bản Việt ghi “Các mốc lịch sử quan trọng của Hoa Kỳ.”; bản Anh ghi “Key moments from the United States.”; tên quốc gia trong ghi chú đổi theo ngôn ngữ đang xem, lý do đáng đọc của từng hồ sơ cũng đổi trọn ngôn ngữ | Cao |

## 4. Lệnh kiểm tra nhanh

```powershell
# Mã chuyển hướng của tiền tố tiếng Việt
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" http://localhost:3000/vi/timeline

# Kiểm tra ngôn ngữ tài liệu
curl.exe -s http://localhost:3000/en | Select-String -Pattern "<html lang"

# Kiểm tra từ điển
npm test --prefix frontend
```

## 5. Ghi nhận kết quả

| Mã | Người thực hiện | Ngày | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| TC-NN-01 |  |  |  |  |
| TC-NN-02 |  |  |  |  |

Khi phát hiện chuỗi chưa dịch, ghi rõ tệp từ điển và khóa còn thiếu để người phát triển bổ sung đúng chỗ.
