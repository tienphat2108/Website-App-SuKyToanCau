# Đồng bộ dữ liệu

Tài liệu này mô tả nguồn dữ liệu duy nhất của website, cách dữ liệu đi từ tệp dùng chung tới máy chủ và giao diện, cùng quy trình thêm hoặc sửa một sự kiện lịch sử mà không làm lệch hai bên.

## 1. Nguyên tắc một nguồn

Toàn bộ nội dung lịch sử mẫu nằm trong một tệp duy nhất:

```
shared/history-events.json
```

Tệp này vừa được nhúng vào máy chủ để nạp cơ sở dữ liệu, vừa được giao diện nhập trực tiếp lúc dựng trang. Nhờ vậy:

- Không có hai bản dữ liệu khác nhau giữa máy chủ và giao diện.
- Khi máy chủ dữ liệu không phản hồi, giao diện vẫn có đủ nội dung để hiển thị.
- Sơ đồ trang vẫn tạo được đầy đủ đường dẫn ngay cả khi máy chủ dữ liệu đang khởi động.

## 2. Cấu trúc tệp dùng chung

Tệp có một đối tượng gốc chứa mảng `events`. Mỗi phần tử gồm các trường sau:

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `slug` | chuỗi | Có | Khóa đường dẫn, chữ thường, không dấu, chỉ gồm chữ, số và dấu gạch nối |
| `era` | chuỗi | Có | Một trong bốn mã: `co-dai`, `trung-dai`, `can-dai`, `hien-dai` |
| `country` | chuỗi | Có | Tên quốc gia hoặc khu vực bằng tiếng Việt |
| `countryEn` | chuỗi | Có | Tên quốc gia hoặc khu vực bằng tiếng Anh |
| `startYear` | số nguyên | Có | Năm bắt đầu, số âm là trước Công nguyên |
| `endYear` | số nguyên hoặc rỗng | Không | Năm kết thúc nếu sự kiện kéo dài |
| `dateLabelVi` | chuỗi | Có | Nhãn thời gian đã biên tập, không tự sinh |
| `dateLabelEn` | chuỗi | Có | Nhãn thời gian tiếng Anh |
| `titleVi`, `titleEn` | chuỗi | Có | Tiêu đề hai ngôn ngữ |
| `summaryVi`, `summaryEn` | chuỗi | Có | Tóm tắt ngắn dùng cho thẻ và mô tả tìm kiếm |
| `contentVi`, `contentEn` | mảng chuỗi | Có | Mỗi phần tử là một đoạn văn |
| `locationVi`, `locationEn` | chuỗi | Có | Địa điểm hai ngôn ngữ |
| `latitude`, `longitude` | số thực | Có | Tọa độ điểm đánh dấu trên bản đồ |
| `image` | chuỗi | Có | Đường dẫn ảnh nội bộ, ví dụ `/images/events/chien-thang-bach-dang-938.jpg` |
| `imageAltVi`, `imageAltEn` | chuỗi | Có | Văn bản thay thế ảnh |
| `tagsVi`, `tagsEn` | mảng chuỗi | Có | Tối đa tám nhãn mỗi ngôn ngữ |
| `wikiTitle` | chuỗi | Không | Tiêu đề trang tham khảo, dùng để lấy đoạn tóm tắt bổ sung |
| `featured` | đúng hoặc sai | Có | Đánh dấu sự kiện nổi bật trên trang chủ |
| `related` | mảng chuỗi | Có | Tối đa ba khóa sự kiện liên quan, không trùng và không trỏ vào chính nó |

Quy ước nội dung:

- Mỗi đoạn văn là một phần tử riêng, không dùng ký tự xuống dòng trong phần tử.
- Không đặt thẻ siêu văn bản trong bất kỳ trường nào. Máy chủ làm sạch lại lần nữa khi nạp.
- Câu tiếng Việt dùng dấu đầy đủ. Câu tiếng Anh không chép nguyên văn bản tiếng Việt.
- Tệp phải lưu bằng bảng mã UTF-8 không có ký tự đánh dấu đầu tệp.
- Hai mảng `tagsVi` và `tagsEn` nên cùng độ dài và cùng thứ tự để giao diện hiển thị nhất quán.

## 3. Đường đi của dữ liệu

### 3.1. Vào máy chủ

1. Tệp `shared/history-events.json` được nhúng vào thư viện hạ tầng với tên tài nguyên `WorldHistory.Infrastructure.Seed.history-events.json`.
2. Khi ứng dụng khởi động, `DatabaseInitializer` đếm số sự kiện hiện có.
3. Nếu kho dữ liệu đã có ít nhất một sự kiện, bước nạp mẫu bị bỏ qua. Dữ liệu đang vận hành không bị ghi đè.
4. Nếu kho dữ liệu trống, từng sự kiện được kiểm tra khóa đường dẫn và mã thời kỳ. Bản ghi sai bị bỏ qua và ghi nhật ký.
5. Các trường văn bản được làm sạch, mảng đoạn văn được nối bằng hai ký tự xuống dòng trước khi lưu.
6. Quá trình nạp tạm thời bật quyền quản trị để vượt qua chính sách bảo mật cấp dòng, sau đó tắt ngay trong khối `finally`.

### 3.2. Ra giao diện

1. `frontend/src/data/seed.ts` nhập trực tiếp tệp dùng chung lúc dựng trang.
2. Bộ chuyển đổi đổi tên `image` thành `imagePath` và `related` thành `relatedSlugs` để khớp mô hình.
3. `HistoricalService` gọi máy chủ dữ liệu trước. Nếu thành công, dữ liệu từ máy chủ được dùng.
4. Nếu gọi lỗi hoặc quá thời gian chờ, dịch vụ ghi nhật ký và quay về bộ dữ liệu mẫu. Trang vẫn hiển thị đầy đủ.
5. Kết quả được lưu đệm theo thẻ và làm mới sau 300 giây.

### 3.3. Định dạng trả về

Máy chủ trả về tên trường dạng lạc đà, ví dụ:

```json
{
  "slug": "chien-thang-bach-dang-938",
  "era": "trung-dai",
  "eraNameVi": "Trung đại",
  "eraNameEn": "Medieval",
  "titleVi": "Chiến thắng Bạch Đằng năm 938",
  "titleEn": "The Battle of Bach Dang, 938",
  "startYear": 938,
  "contentVi": ["Đoạn thứ nhất.", "Đoạn thứ hai."]
}
```

Danh sách trả về dùng cấu trúc tóm tắt, không có nội dung đầy đủ, để giảm dung lượng. Chi tiết một sự kiện mới có nội dung và danh sách liên quan.

## 4. Thêm hoặc sửa một sự kiện

1. Mở `shared/history-events.json`, thêm một phần tử vào mảng `events`.
2. Chọn `slug` chưa tồn tại. Kiểm tra bằng lệnh tìm kiếm trong tệp.
3. Điền đủ cả hai ngôn ngữ, kể cả văn bản thay thế ảnh.
4. Chọn tối đa ba `related`, chỉ trỏ tới khóa đã tồn tại và không trỏ vào chính nó.
5. Kiểm tra tọa độ nằm trong khoảng hợp lệ: vĩ độ từ âm 90 đến 90, kinh độ từ âm 180 đến 180.
6. Lưu tệp bằng UTF-8 không có ký tự đánh dấu đầu tệp.
7. Dựng lại máy chủ để tài nguyên nhúng được cập nhật.
8. Nếu cơ sở dữ liệu đã có dữ liệu, xóa tệp cơ sở dữ liệu phát triển hoặc thêm bản ghi qua công cụ quản trị. Bước nạp mẫu không tự chạy lại.
9. Dựng lại giao diện để bộ dữ liệu dự phòng được cập nhật.
10. Chạy bài kiểm thử giao diện và kiểm thử máy chủ.

Lưu ý: sửa tệp dùng chung không làm thay đổi cơ sở dữ liệu đang chạy. Đây là chủ ý để tránh ghi đè nội dung đã được biên tập trên môi trường thật.

## 5. Kiểm tra tính nhất quán

Trước khi phát hành, chạy các kiểm tra sau:

- Mọi `slug` là duy nhất, chỉ gồm chữ thường không dấu, số và dấu gạch nối.
- Mọi `era` thuộc bốn mã hợp lệ.
- Mọi `related` trỏ tới `slug` có thật, không trùng, không tự trỏ.
- Hai ngôn ngữ có cùng số đoạn văn và cùng số nhãn.
- `startYear` nhỏ hơn hoặc bằng `endYear` khi có `endYear`.
- `image` trỏ tới tệp có thật trong `frontend/public/images`.
- Tệp không có ký tự đánh dấu đầu tệp và không có ký tự điều khiển.
- Mỗi `sources.url` mở được trang có nội dung. Chạy `node .tmp/audit-source-urls.mjs` để gọi thật toàn bộ địa chỉ và đọc `.tmp/source-urls.json`; địa chỉ trả 403 vì chặn robot phải mở lại bằng trình duyệt thật trước khi kết luận.
- Địa chỉ nguồn dẫn tới bài viết cụ thể, không dừng ở trang chủ nhà xuất bản. Chạy `node .tmp/count-homepage-sources.mjs` để đếm các địa chỉ chỉ có tên miền (còn 172 lượt, xem BUG-005).
- `wikiTitle` tồn tại trên Wikipedia của ngôn ngữ đang xem. Chạy `node .tmp/verify-wiki-live.mjs` để đối chiếu cả hai máy chủ; hiện 103 sự kiện chỉ có bài tiếng Việt (xem BUG-004).

Có thể kiểm tra nhanh bằng đoạn mã sau, chạy tại thư mục gốc dự án:

```powershell
node -e "const d=require('./shared/history-events.json');const s=new Set();for(const e of d.events){if(s.has(e.slug))throw new Error('trùng khóa '+e.slug);s.add(e.slug)}for(const e of d.events){for(const r of e.related){if(!s.has(r))throw new Error('khóa liên quan không tồn tại '+r)}}console.log('Hợp lệ:',d.events.length,'sự kiện')"
```

## 6. Đồng bộ với cơ sở dữ liệu thật

- Môi trường phát triển dùng SQLite với tệp `backend/API/worldhistory.db`.
- Môi trường thật dùng PostgreSQL. Chuỗi kết nối và nhà cung cấp được đặt trong `ConnectionStrings:Default` và `Database:Provider`.
- Chính sách bảo mật cấp dòng chỉ được áp dụng khi nhà cung cấp là PostgreSQL và tùy chọn `Database:ApplyRowLevelSecurity` bật.
- Khi chuyển sang PostgreSQL lần đầu, để kho dữ liệu trống để bước nạp mẫu chạy, hoặc nhập dữ liệu bằng công cụ quản trị.
- Không chạy bước nạp mẫu trên môi trường thật đã có nội dung biên tập.

## 7. Xử lý sự cố thường gặp

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| Giao diện hiện dữ liệu cũ sau khi sửa tệp | Bộ nhớ đệm 300 giây hoặc chưa dựng lại | Dựng lại giao diện, xóa bộ nhớ đệm .next |
| Máy chủ vẫn trả dữ liệu cũ | Cơ sở dữ liệu đã có bản ghi nên bỏ qua nạp mẫu | Xóa tệp cơ sở dữ liệu phát triển hoặc cập nhật bản ghi |
| Chữ tiếng Việt bị lỗi dấu | Tệp lưu sai bảng mã | Lưu lại bằng UTF-8 không có ký tự đánh dấu đầu tệp |
| Một sự kiện không xuất hiện | Khóa thời kỳ sai hoặc khóa đường dẫn không hợp lệ | Xem nhật ký máy chủ, sửa trường tương ứng |
| Thẻ liên quan bị lặp | Dữ liệu `related` có khóa trùng | Máy chủ đã loại trùng, nhưng nên sửa tệp nguồn cho sạch |
| Trang chủ trống khi máy chủ dữ liệu tắt | Bộ dữ liệu mẫu không nhập được | Kiểm tra đường dẫn tương đối trong `seed.ts` và dựng lại |

## 8. Giới hạn đã biết

- Chưa có giao diện quản trị để sửa sự kiện. Việc biên tập hiện thực hiện qua tệp và cơ sở dữ liệu.
- Tệp `shared/history-events.json` chưa có bước kiểm tra tự động, các kiểm tra ở mục 5 vẫn thực hiện thủ công. Riêng tệp khu cập nhật nguồn mở đã có bộ kiểm thử tự động `frontend/tests/recent-updates.test.ts`.
- Đoạn tóm tắt tham khảo từ bách khoa toàn thư mở chỉ hiển thị khi có dữ liệu, không được lưu vào cơ sở dữ liệu.

## 9. Khu cập nhật từ nguồn mở

Khu riêng tại trang `/updates` (bản tiếng Anh `/en/updates`) trưng bày các sự kiện mới do cộng đồng Wikidata và Wikipedia cập nhật liên tục. Khu này tách hẳn kho 187 sự kiện đã biên tập: dữ liệu không vào cơ sở dữ liệu, không đụng tới `shared/history-events.json`, và được ghi rõ nhãn "sưu tầm tự động từ nguồn mở" cùng giấy phép CC BY-SA 4.0 (văn bản Wikipedia) và CC0 1.0 (Wikidata).

### 9.1. Nguồn và cách lọc

- Mốc sự kiện lấy từ Wikidata qua thuộc tính P585, quét theo cửa sổ sáu tháng để tránh quá tải truy vấn.
- Chỉ giữ mục có bài ở cả Wikipedia tiếng Việt lẫn tiếng Anh và có từ 20 ngôn ngữ trở lên (ngưỡng mặc định, đổi được bằng `--min-links`).
- Loại trang không phải bài viết: `Thể loại:`, `Bản mẫu:`, `Wikipedia:`, `Cổng:`, `Danh sách`, `List of`, và các trang "Tháng ... năm ...".
- Loại mục trùng tiêu đề với kho biên tập bằng cách bỏ dấu và so không phân biệt hoa thường.
- Tóm tắt hai ngôn ngữ lấy từ đoạn mở đầu bài Wikipedia qua REST `page/summary`, chỉ giữ bài có đoạn mở đầu từ 200 ký tự trở lên.

### 9.2. Cách nạp dữ liệu: tự động hằng tuần, không tốn lượt dựng Netlify

Khu này tự cập nhật bằng GitHub Actions (`.github/workflows/scan-recent-events.yml`):

- 03:00 UTC thứ Hai hằng tuần, bộ quét chạy trên máy của GitHub và nếu có mục mới thì tự commit, tự đẩy tệp `shared/recent-events.json` lên nhánh `main` rồi làm tươi CDN jsDelivr.
- Trang `/updates` đọc tệp trực tiếp từ CDN khi người xem mở trang, nên dữ liệu mới hiện ra **không cần dựng lại website**. Netlify có quy tắc bỏ dựng (mục `ignore` trong `netlify.toml`) khi lượt đẩy chỉ thay đổi tệp dữ liệu — phút dựng miễn phí chỉ dùng cho lượt đẩy mã code thật.
- Nếu CDN không đọc được (mất mạng, kho chưa có tệp), trang quay về tệp cục bộ trong bản dựng; không bao giờ trắng trang.
- Muốn chạy tay ngay: mở thẻ Actions trên GitHub, chọn "Cap nhat su kien tu nguon mo" rồi bấm Run workflow. Hoặc chạy tại máy:

```powershell
cd frontend
npm run history:scan                  # mặc định 24 tháng, ngưỡng 20 ngôn ngữ, giữ 40 mục
npm run history:scan -- --dry-run     # xem trước, không ghi tệp phát hành
```

- Khi chạy thử tại máy mà muốn trang đọc đúng tệp vừa quét (thay vì bản trên CDN), chạy máy chủ với `UPDATES_FEED_URL="local"`.

Đầu ra:

| Tệp | Ý nghĩa |
| --- | --- |
| `shared/recent-events.json` | Tệp phát hành, đẩy lên GitHub và trang `/updates` đọc qua CDN |
| `frontend/.tmp/ung-vien-lich-su.json` | Toàn bộ ứng viên kèm lý do loại, để đối chiếu |

Bộ nạp dữ liệu nằm ở `frontend/src/data/recent-updates.ts`: ưu tiên đọc CDN (đổi địa chỉ bằng biến môi trường `UPDATES_FEED_URL`), kiểm tra hình dạng dữ liệu từ xa trước khi hiển thị, rồi mới quay về tệp cục bộ. Nếu tệp chưa được quét lần nào, trang vẫn mở bình thường với thông báo chưa có dữ liệu.

### 9.3. Kiểm tra trước khi đưa tệp lên kho

- Chạy `npm test` trong `frontend`: bộ `tests/recent-updates.test.ts` kiểm khóa không trùng, ngày không ở tương lai, đủ hai ngôn ngữ, ngưỡng ngôn ngữ, nguồn trỏ thẳng bài viết (không phải trang chủ), tọa độ hợp lệ và giấy phép mở.
- Kiểm tra trang `/updates` và `/en/updates` ở 320–1440 px trước khi báo hoàn tất.
- Nếu mục bị loại bất thường, mở `frontend/.tmp/ung-vien-lich-su.json` để xem lý do ở trường `lyDo`.
