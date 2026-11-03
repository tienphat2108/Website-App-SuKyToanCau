# Đa ngôn ngữ

Tài liệu này giải thích cách website phục vụ hai ngôn ngữ Việt và Anh, cách thêm ngôn ngữ mới, và những điểm cần kiểm tra để bản dịch không làm sai đường dẫn hay siêu dữ liệu.

## 1. Nguyên tắc

- Tiếng Việt là ngôn ngữ mặc định và nằm ở đường dẫn gốc. Ví dụ: `/`, `/timeline`, `/event/chien-thang-bach-dang-938`.
- Tiếng Anh nằm dưới tiền tố `/en`. Ví dụ: `/en`, `/en/timeline`, `/en/event/chien-thang-bach-dang-938`.
- Mã ngôn ngữ luôn là hai chữ cái thường: `vi`, `en`.
- Không dùng tham số truy vấn để đổi ngôn ngữ, vì như vậy sẽ tạo hai địa chỉ cho cùng một nội dung và làm loãng giá trị tìm kiếm.
- Đường dẫn `/vi` được chuyển vĩnh viễn về đường dẫn không tiền tố bằng mã 308.

## 2. Cách hoạt động

### 2.1. Trung gian chuyển hướng

Tệp `frontend/src/middleware.ts` là nơi duy nhất quyết định ngôn ngữ của một yêu cầu:

1. Nếu đường dẫn bắt đầu bằng `/vi`, chuyển hướng 308 về đường dẫn tương ứng không có tiền tố.
2. Nếu đường dẫn là `/en` hoặc bắt đầu bằng `/en/`, đặt ngôn ngữ là `en`; ngược lại là `vi`.
3. Ghi hai tiêu đề vào yêu cầu trước khi chuyển tiếp:
   - `x-locale`: mã ngôn ngữ đã xác định.
   - `x-pathname`: đường dẫn công khai đầy đủ, ví dụ `/en/timeline`.
4. Với tiếng Anh, viết lại đường dẫn về cây trang tiếng Việt. Trình duyệt vẫn thấy `/en/timeline` nhưng máy chủ dựng trang `app/timeline/page.tsx`.
5. Ghi cookie `NEXT_LOCALE` để lần sau trình duyệt gửi kèm lựa chọn, nhưng chỉ ghi khi giá trị thay đổi. Cookie đặt `HttpOnly`, `SameSite=Lax` và `Secure` ở bản phát hành; chỉ máy chủ đọc giá trị này nên mã trong trang không cần truy cập.

Hai tiêu đề `x-locale` và `x-pathname` luôn bị ghi đè, không tin giá trị do trình duyệt gửi lên. Đây là biện pháp chống giả mạo ngôn ngữ và chống làm sai đường dẫn chuẩn.

### 2.2. Đọc ngôn ngữ ở máy chủ

`frontend/src/core/i18n/server.ts` cung cấp hai hàm:

- `getLocale()`: đọc `x-locale`, nếu không có thì đọc cookie, cuối cùng quay về `vi`.
- `getI18n()`: trả về cả ngôn ngữ và từ điển trong một lần gọi.

Mọi trang và khung gốc đều dùng `getI18n()`. Không có thành phần nào tự đoán ngôn ngữ từ chuỗi đường dẫn, tránh trường hợp trang tiếng Anh lại hiện chữ Việt.

### 2.3. Từ điển

- `frontend/src/locales/vi.json` và `frontend/src/locales/en.json` chứa toàn bộ chữ trên giao diện.
- Hai tệp có cùng cấu trúc khóa. Bài kiểm thử `tests/i18n.test.ts` so sánh danh sách khóa và báo lỗi ngay khi một bên thiếu khóa.
- Từ điển được nhập tĩnh, không tải qua mạng, nên không có trạng thái nhấp nháy chữ khi đổi ngôn ngữ.
- Chuỗi có tham số dùng dấu ngoặc nhọn, ví dụ `"Xem thêm {count} sự kiện"`, và được thay bằng hàm định dạng số theo ngôn ngữ.

### 2.4. Nội dung song ngữ

Mỗi sự kiện lịch sử lưu song song hai bản:

| Trường | Tiếng Việt | Tiếng Anh |
| --- | --- | --- |
| Tiêu đề | `titleVi` | `titleEn` |
| Tóm tắt | `summaryVi` | `summaryEn` |
| Nội dung | `contentVi` | `contentEn` |
| Nhãn thời gian | `dateLabelVi` | `dateLabelEn` |
| Địa điểm | `locationVi` | `locationEn` |
| Văn bản thay thế ảnh | `imageAltVi` | `imageAltEn` |
| Thẻ | `tagsVi` | `tagsEn` |
| Quốc gia | `country` | `countryEn` |

Lớp `HistoricalEvent` trong `frontend/src/core/models/HistoricalEvent.ts` có các phương thức `title(locale)`, `summary(locale)`, `content(locale)`, `href(locale)`. Nhờ vậy phần giao diện không cần câu lệnh điều kiện theo ngôn ngữ.

Tên thời kỳ lấy từ danh mục chung `ERAS`, mỗi thời kỳ có `nameVi` và `nameEn`. Mã thời kỳ như `trung-dai` không đổi theo ngôn ngữ vì được dùng trong bộ lọc và đường dẫn.

### 2.5. Định dạng số và năm

- Số lượng sự kiện dùng `Intl.NumberFormat` với mã `vi-VN` hoặc `en`.
- Năm trước Công nguyên hiển thị theo quy ước từng ngôn ngữ: "trước CN" và "BCE".
- Khoảng năm dùng dấu gạch ngang dài, không dùng hai gạch nối liền nhau.
- Thời gian đọc bài được tính từ độ dài nội dung và làm tròn lên.

### 2.6. Chuyển ngôn ngữ trên giao diện

Nút chuyển ngôn ngữ nằm trên thanh điều hướng. Khi bấm:

1. Lấy đường dẫn hiện tại từ `x-pathname` do máy chủ truyền xuống.
2. Bỏ tiền tố `/en` nếu có.
3. Ghép lại tiền tố theo ngôn ngữ đích.
4. Điều hướng tới địa chỉ mới, giữ nguyên phần truy vấn như `?era=trung-dai`.

Nhờ giữ nguyên truy vấn, người đọc đang lọc theo thời kỳ sẽ không bị mất bộ lọc khi đổi ngôn ngữ.

## 3. Siêu dữ liệu và công cụ tìm kiếm

- `frontend/src/lib/seo.ts` tạo đường dẫn chuẩn, liên kết ngôn ngữ thay thế và thẻ chia sẻ cho từng trang.
- Đường dẫn chuẩn của bản tiếng Việt là địa chỉ không tiền tố; của bản tiếng Anh là địa chỉ có `/en`.
- Mỗi trang khai báo ba liên kết ngôn ngữ: `vi`, `en`, `x-default`. `x-default` trỏ về bản tiếng Việt.
- Tiêu đề và mô tả được dịch riêng, không lấy tiêu đề tiếng Việt cho trang tiếng Anh.
- Sơ đồ trang liệt kê cả hai ngôn ngữ và kèm liên kết thay thế cho từng mục.
- Thẻ `og:locale` là `vi_VN` hoặc `en_US`; `og:locale:alternate` là ngôn ngữ còn lại.
- Thẻ `html lang` là `vi-VN` hoặc `en`.

## 4. Thêm ngôn ngữ mới

Ví dụ thêm tiếng Pháp với mã `fr`:

1. Thêm `fr` vào mảng `locales` trong `frontend/src/core/i18n/config.ts`.
2. Bổ sung nhãn hiển thị trong `localeLabels` và mã trong `htmlLang`.
3. Tạo tệp `frontend/src/locales/fr.json` với đầy đủ khóa như hai tệp hiện có.
4. Cập nhật `getDictionary` để nhận tệp mới.
5. Trong `middleware.ts`, mở rộng danh sách tiền tố được hỗ trợ và cách bỏ tiền tố.
6. Trong `seo.ts`, mở rộng `localizedPath` và danh sách liên kết ngôn ngữ thay thế.
7. Trong `sitemap.ts`, thêm `fr` vào vòng lặp ngôn ngữ.
8. Bổ sung trường nội dung tiếng Pháp cho mô hình sự kiện, hoặc quy định rõ ngôn ngữ dự phòng.
9. Cập nhật bài kiểm thử đa ngôn ngữ để so khóa của ba tệp.
10. Kiểm tra lại đường dẫn chuẩn, sơ đồ trang và nút chuyển ngôn ngữ.

Không nên dùng cách thay chữ trực tiếp trong thành phần. Mọi chữ phải đi qua từ điển để bài kiểm thử khóa có thể phát hiện thiếu sót.

## 5. Quy ước viết bản dịch

- Tiếng Việt dùng dấu đầy đủ, không viết tắt tùy tiện.
- Tiếng Anh dùng câu ngắn, tránh dịch sát từng chữ.
- Không để lẫn tiếng Anh trong câu tiếng Việt, trừ tên riêng và mã kỹ thuật.
- Không dùng ngoặc đơn để chú thích bản dịch tiếng Anh trong tài liệu và giao diện.
- Giữ nguyên dấu câu cuối câu, không thêm dấu chấm vào nhãn nút.
- Với câu có số lượng, luôn dùng mẫu thay thế thay vì nối chuỗi.

## 6. Danh sách kiểm tra

1. Mở `/en`: giao diện tiếng Anh, thẻ `html lang="en"`, đường dẫn chuẩn kết thúc bằng `/en`.
2. Mở `/vi/timeline`: chuyển 308 về `/timeline`.
3. Bấm nút chuyển ngôn ngữ khi đang lọc `?era=trung-dai`: giữ nguyên bộ lọc.
4. Mở một sự kiện ở cả hai ngôn ngữ: tiêu đề, nội dung, địa điểm, văn bản thay thế ảnh đều đổi.
5. Kiểm tra thẻ `hreflang`: có đủ `vi`, `en`, `x-default`.
6. Kiểm tra sơ đồ trang: mỗi sự kiện xuất hiện hai lần, một lần cho mỗi ngôn ngữ.
7. Kiểm tra thẻ chia sẻ: `og:locale` đúng, tiêu đề và mô tả đúng ngôn ngữ.
8. Xóa cookie `NEXT_LOCALE`, mở trang gốc: hiện tiếng Việt.
9. Gửi biểu mẫu đóng góp ở bản tiếng Anh: thông báo lỗi hiện bằng tiếng Anh.
10. Chạy bài kiểm thử từ điển: không thiếu khóa ở bên nào.

## 7. Giới hạn đã biết

- Bản dịch tiếng Anh của một số bài viết do nhóm biên tập cung cấp, không phải bản dịch máy. Khi bổ sung sự kiện mới, cần cung cấp đủ cả hai ngôn ngữ ngay từ đầu.
- Mã đường dẫn của sự kiện giữ nguyên tiếng Việt không dấu cho cả hai ngôn ngữ. Cách này bảo đảm đường dẫn cũ không hỏng khi thêm ngôn ngữ, nhưng đường dẫn bản tiếng Anh vẫn chứa từ tiếng Việt.
- Chưa hỗ trợ ngôn ngữ viết từ phải sang trái. Nếu bổ sung, cần thêm thuộc tính `dir` và kiểm tra lại bố cục.
