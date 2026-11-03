# Giao diện đáp ứng yêu cầu

Tài liệu này mô tả hệ thống giao diện của website Bách khoa Lịch sử Thế giới: bảng màu, kiểu chữ, bố cục, các thành phần dùng lại, cách hiển thị trên nhiều kích thước màn hình và các điểm đã được kiểm tra. Nội dung được viết cho cả người thiết kế, người phát triển và người kiểm thử.

## 1. Mục tiêu thiết kế

Website là một bách khoa toàn thư, không phải trang bán hàng. Vì vậy giao diện đặt nội dung lên trước và giữ cho việc đọc lâu không mỏi mắt:

- Ưu tiên tiếng Việt, bố cục chừa chỗ cho câu dài và dấu tiếng Việt.
- Tạo cảm giác của giấy in và mực: nền ấm, chữ đậm, đường kẻ mảnh.
- Mỗi trang chỉ có một việc chính. Trang chủ dẫn vào dòng thời gian, trang sự kiện dẫn sang sự kiện liên quan, trang đóng góp dẫn tới lời cảm ơn.
- Mọi thao tác quan trọng đều dùng được bằng bàn phím và có nhãn đọc cho trình đọc màn hình.
- Nội dung phải đọc được khi mạng chậm: khung chờ giữ đúng bố cục để trang không nhảy.

## 2. Bảng màu

Màu được khai báo bằng biến CSS trong `frontend/src/app/globals.css`, sau đó ánh xạ sang lớp tiện ích của Tailwind trong `frontend/tailwind.config.js`. Nhờ vậy đổi nhận diện thương hiệu chỉ cần sửa một tệp.

| Biến | Sắc sáng | Sắc tối | Dùng cho |
| --- | --- | --- | --- |
| `--color-background` | 248 245 239 | 17 22 29 | Nền toàn trang |
| `--color-surface` | 255 253 249 | 23 30 39 | Thẻ, thanh điều hướng, biểu mẫu |
| `--color-raised` | 241 235 224 | 30 39 51 | Khung chờ, nền nhấn nhẹ |
| `--color-ink` | 27 36 48 | 242 237 227 | Chữ chính |
| `--color-muted` | 95 107 122 | 167 176 188 | Chữ phụ, chú thích |
| `--color-accent` | 157 47 47 | 224 97 90 | Nút chính, liên kết nhấn |
| `--color-accent-strong` | 124 32 32 | 240 138 132 | Trạng thái rê chuột |
| `--color-gold` | 184 134 43 | 217 176 92 | Nhãn thời kỳ, điểm nhấn trang trí |
| `--color-line` | 226 217 201 | 43 53 66 | Đường viền, đường kẻ |
| `--color-inverse` | 248 245 239 | 17 22 29 | Chữ trên nền tối cố định |

Quy tắc sử dụng:

- Màu đỏ chỉ dành cho hành động chính và liên kết cần chú ý. Không dùng đỏ cho văn bản dài.
- Màu vàng là màu phụ, dùng cho nhãn thời kỳ và chi tiết trang trí, không dùng cho nút chính.
- Mọi cặp màu chữ và nền đều đạt tỉ lệ tương phản tối thiểu 4,5:1 cho chữ thường và 3:1 cho chữ lớn.
- Không truyền tải thông tin chỉ bằng màu. Trạng thái yêu thích có cả biểu tượng và nhãn chữ.

## 3. Kiểu chữ

| Vai trò | Phông | Ghi chú |
| --- | --- | --- |
| Tiêu đề hiển thị | Merriweather | Nạp qua `next/font`, tự lưu trữ, có tập ký tự tiếng Việt |
| Thân bài | Source Serif 4 | Chữ có chân cho nội dung dài, cỡ 18 điểm ảnh |
| Giao diện | Be Vietnam Pro | Menu, nút, nhãn biểu mẫu, thẻ lọc và bảng thông tin |
| Mã và số liệu | Consolas, Courier New | Dùng cho mã đóng góp, khóa đường dẫn |

- Tiêu đề trang dùng `text-wrap: balance` để không còn một từ lẻ loi ở dòng cuối.
- Đoạn văn dùng `text-wrap: pretty` và chiều cao dòng 1,75 cho nội dung lịch sử dài.
- Cỡ chữ thân bài là 18 điểm ảnh trên mọi kích thước màn hình, không nhỏ hơn, để trình duyệt không tự phóng to.
- Phần điều khiển dùng chữ không chân để nhãn ngắn rõ ràng; tiêu đề và thân bài giữ chữ có chân.
- Không dùng chữ in hoa cho đoạn dài; chữ in hoa chỉ dùng cho nhãn nhỏ có giãn chữ.

## 4. Bố cục

- Khung nội dung rộng tối đa 78 rem, canh giữa, lề ngang 20 điểm ảnh trên điện thoại và 32 điểm ảnh từ máy tính bảng.
- Khoảng cách dọc giữa các khối lớn là 64 đến 80 điểm ảnh, giúp người đọc nghỉ mắt giữa các phần.
- Trang chủ có thứ tự cố định: phần mở đầu, số liệu, sự kiện nổi bật, bốn thời kỳ, bản đồ, bài mới, phương pháp biên soạn, lời mời đóng góp.
- Trang sự kiện dùng bố cục hai cột trên màn hình lớn: cột nội dung chính và cột thông tin phụ gồm thời gian, địa điểm, thẻ, sự kiện liên quan.
- Trang dòng thời gian dùng bộ lọc dính phía trên khi cuộn, nhưng không che mất tiêu đề trên điện thoại.

## 5. Thành phần dùng lại

| Thành phần | Tệp | Mô tả |
| --- | --- | --- |
| Nút | `globals.css` | Ba biến thể: chính, phụ, không viền. Chiều cao tối thiểu 44 điểm ảnh |
| Thẻ sự kiện | `components/events/event-card.tsx` | Ảnh, nhãn thời kỳ, tiêu đề, tóm tắt, liên kết đọc tiếp |
| Thẻ thời kỳ | `components/events/era-card.tsx` | Minh họa, khoảng năm, số sự kiện |
| Tiêu đề khối | `components/ui/section-heading.tsx` | Nhãn nhỏ, tiêu đề, mô tả, chỗ đặt hành động |
| Đường dẫn phân cấp | `components/ui/breadcrumbs.tsx` | Hiển thị vị trí trang và sinh dữ liệu có cấu trúc |
| Bản đồ | `components/map/historical-map.tsx` | Bản đồ mở, điểm đánh dấu tự gom thành cụm ghi số lượng khi nhìn khái quát, bong bóng thông tin an toàn, liên kết mở vùng đang xem bằng Google Maps |
| Khung chờ | `app/(home)/loading.tsx` | Chỉ dùng cho trang chủ, giữ bố cục trong lúc máy chủ chuẩn bị dữ liệu |
| Thông báo lỗi | `app/error.tsx` | Nút thử lại và liên kết về trang chủ |
| Trang không tồn tại | `app/not-found.tsx` | Gợi ý các trang có nội dung |

Mọi thành phần đều nhận dữ liệu qua thuộc tính, không tự gọi mạng. Cách này cho phép dùng lại trên ứng dụng di động sau này và giúp kiểm thử độc lập.

## 6. Nút kêu gọi hành động

- Trên màn hình đầu trang chủ có hai nút: xem dòng thời gian và gửi đóng góp. Nút chính nằm trong vùng nhìn thấy ngay khi mở trang trên điện thoại.
- Thanh dính đáy chỉ hiện trên điện thoại, sau khi người đọc cuộn qua phần mở đầu, và ẩn khi bàn phím ảo mở.
- Thanh dính đáy không che nội dung: phần thân trang được chừa khoảng trống dưới cùng.
- Trang đóng góp có nút gửi ở cuối biểu mẫu và nút quay lại đầu trang khi biểu mẫu dài.

## 7. Chế độ tối

- Chế độ tối bật bằng cách thêm lớp `dark` vào thẻ gốc, không dùng hai bộ tệp định kiểu riêng.
- Lựa chọn được lưu trong bộ nhớ cục bộ dưới khóa `wh-theme` với ba giá trị: `light`, `dark`, `system`.
- Một đoạn mã nhỏ chạy trước khi vẽ trang để áp dụng lựa chọn, tránh hiện tượng nhấp nháy nền sáng rồi chuyển sang tối.
- Khi chọn `system`, giao diện theo thiết lập của hệ điều hành và tự đổi khi hệ điều hành đổi.
- Biểu tượng nút đổi giao diện có nhãn đọc mô tả trạng thái hiện tại.

## 8. Đáp ứng thiết bị

| Kích thước | Điểm ngắt | Thay đổi chính |
| --- | --- | --- |
| Điện thoại nhỏ | dưới 640 điểm ảnh | Một cột, thanh dính đáy, menu thu gọn |
| Điện thoại lớn | từ 640 đến 767 | Một cột, thẻ rộng hơn |
| Máy tính bảng | từ 768 đến 1023 | Hai cột cho thẻ sự kiện, bản đồ cao 26 rem |
| Máy tính | từ 1024 trở lên | Ba cột, phần mở đầu hai cột, bộ lọc ngang |

Nguyên tắc kiểm tra:

- Không có cuộn ngang ở bất kỳ kích thước nào.
- Chữ không bị cắt khi phóng to 200 phần trăm.
- Vùng chạm tối thiểu 44 nhân 44 điểm ảnh.
- Bản đồ không chiếm toàn bộ chiều cao màn hình trên điện thoại.
- Menu thu gọn đóng được bằng phím Esc và trả tiêu điểm về nút mở.

## 9. Khả năng tiếp cận

- Liên kết bỏ qua điều hướng nằm ở đầu trang, chỉ hiện khi nhận tiêu điểm.
- Mọi vùng đất dùng thẻ đất ngữ nghĩa: `header`, `nav`, `main`, `footer`, `article`, `section`.
- Tiêu điểm bàn phím có viền rõ, không bị tắt bằng `outline: none` mà không thay thế.
- Biểu mẫu đóng góp gắn nhãn với trường nhập, mô tả lỗi bằng `aria-describedby`, và thông báo lỗi có `aria-live`.
- Hình minh họa đều có văn bản thay thế; hình trang trí có `aria-hidden`.
- Bản đồ có nhãn đọc và danh sách điểm đánh dấu dạng văn bản để người dùng trình đọc màn hình vẫn tiếp cận được.
- Chuyển động chỉ dùng làm phản hồi, luôn kết thúc và không tự lặp; chi tiết ở mục 12.

## 10. Trạng thái rỗng, đang tải và lỗi

- Đang tải: khung chờ có `role="status"` và dòng chữ ẩn cho trình đọc màn hình.
- Danh sách rỗng sau khi lọc: hiện câu giải thích và nút xóa bộ lọc, không để trống trang.
- Lỗi máy chủ: trang lỗi có nút thử lại và liên kết về trang chủ, không hiện chi tiết kỹ thuật.
- Không tìm thấy: trả mã 404 thật và gợi ý ba trang liên quan.
- Biểu mẫu gửi thành công: chuyển tới trang cảm ơn, trang này không được lập chỉ mục.

## 11. Hình ảnh

- Ảnh minh họa là tệp véc tơ nội bộ, không phụ thuộc dịch vụ bên ngoài.
- Ảnh chia sẻ mạng xã hội kích thước 1200 nhân 630, có chữ tiếng Việt đúng dấu.
- Biểu tượng ứng dụng có hai kích thước 192 và 512, kèm một tệp véc tơ cho trình duyệt.
- Mọi ảnh nội dung đều có văn bản thay thế riêng theo ngôn ngữ, không dùng lại tiêu đề một cách máy móc.

## 12. Chuyển động mức nhẹ

Chuyển động chỉ đóng vai trò phản hồi: người đọc bấm thì thấy nút nhận cú bấm, rê chuột thì thấy thẻ được chọn, đổi quốc gia thì thấy lựa chọn đã được ghi. Không có hiệu ứng trang trí tự chạy. Toàn bộ viết bằng định kiểu trong `frontend/src/app/globals.css`, không thêm thư viện hoạt ảnh nào.

### 12.1. Giá trị dùng chung

Khai báo một lần trong biến CSS ở `:root`, mọi thành phần làm cùng một việc phải lấy đúng các giá trị này:

| Biến | Giá trị | Dùng cho |
| --- | --- | --- |
| `--dur-press` | 130 mili giây | Thu khi nhấn nút, thẻ, thẻ lọc nhỏ |
| `--dur-color` | 200 mili giây | Màu, viền, bóng đổi sắc |
| `--dur-surface` | 220 mili giây | Thẻ nâng lên khi rê chuột |
| `--dur-swap` | 150 mili giây | Một phần tử mới hiện ra tại chỗ của phần tử cũ |
| `--dur-note` | 400 mili giây | Vòng sáng báo đã đổi ưu tiên quốc gia |
| `--ease-move` | đường cong `0.23, 1, 0.32, 1` | Cái vào và cái ra |
| `--ease-surface` | đường cong `0.215, 0.61, 0.355, 1` | Mặt phẳng mở ra, vòng sáng |
| `--ease-color` | đường cong `0.25, 0.1, 0.25, 1` | Màu, viền, bóng |
| `--scale-press` | 0,97 | Nút, thẻ lọc nhỏ, ô chọn, nút biểu tượng |
| `--scale-choice` | 0,985 | Thẻ sự kiện |
| `--scale-action` | 0,9 | Điểm khởi đầu của phần tử mới hiện |

### 12.2. Quy tắc áp dụng

- Phản hồi nhấn dùng thu nhẹ, không dùng nâng: giữ thì thu, thả thì bật lại trong 130 mili giây.
- Rê chuột chỉ đổi màu, viền, bóng và nâng tối đa 2 điểm ảnh. Không phóng to một nút hay một thẻ chỉ vì con trỏ đi qua.
- Ảnh trong thẻ sự kiện phóng 1,05 lần, nhưng chỉ khi con trỏ thật đang nằm trên thẻ và ảnh bị cắt bởi khung thẻ nên không tràn ra ngoài.
- Toàn bộ hiệu ứng rê chuột đặt trong điều kiện “thiết bị có chuột chính xác”, nên trên máy chạm không bao giờ còn trạng thái rê dở sau khi chạm.
- Ô chọn quốc gia vẫn là danh sách chuẩn của trình duyệt. Vì bảng tùy chọn do hệ điều hành vẽ thì không can thiệp được, phần báo hiệu chuyển sang một vòng sáng ngắn quanh viền ô chọn sau khi đổi lựa chọn.
- Bàn phím và bàn phím ảo được phản hồi như chuột: tiêu điểm vẫn thấy rõ, thu khi nhấn vẫn chạy.
- Không có hiệu ứng lặp vô hạn; mọi hiệu ứng kết thúc và trả phần tử về trạng thái thường.

### 12.3. Khi người đọc yêu cầu giảm chuyển động

Bật thiết lập “giảm chuyển động” của hệ điều hành, giao diện giữ phần báo hiệu và bỏ phần di chuyển:

- Thu khi nhấn, nâng khi rê, phóng ảnh và trượt đều tắt.
- Đổi màu, viền, bóng và pha mờ vẫn chạy, với thời lượng cố định 150 mili giây, đủ để người đọc biết thao tác đã được nhận.
- Vòng sáng báo đã đổi ưu tiên về gần như tức thì nhưng vẫn kết thúc đúng quy trình, nên nút “Bỏ ưu tiên” hiện ra sạch sẽ và nằm lại cho tới khi người đọc bỏ ưu tiên.
- Bản đồ không bị ảnh hưởng: vẫn đủ 149 sự kiện (tổng số ghi trên các vòng cụm cộng số điểm lẻ bằng 149), kéo và thu phóng được, hai tên “Hoàng Sa” và “Trường Sa” vẫn hiển thị bằng tiếng Việt.

## 13. Danh sách kiểm tra giao diện

1. Mở trang chủ trên điện thoại: nút chính nằm trong màn hình đầu, không phải cuộn.
2. Đổi sang chế độ tối, tải lại trang: giao diện tối được giữ, không nhấp nháy.
3. Phóng to trình duyệt 200 phần trăm: không mất nội dung, không cuộn ngang.
4. Dùng phím Tab đi hết trang chủ: mọi liên kết và nút đều nhận tiêu điểm.
5. Mở menu trên điện thoại, nhấn Esc: menu đóng, tiêu điểm về nút mở.
6. Lọc dòng thời gian tới khi không còn kết quả: hiện thông báo và nút xóa lọc.
7. Mở trang sự kiện không tồn tại: hiện trang 404 tùy chỉnh.
8. Tắt mạng rồi mở trang chủ: vẫn có nội dung từ bộ dữ liệu mẫu.
9. Bật chế độ giảm chuyển động: mọi hiệu ứng thu, nâng, phóng biến mất; chỉ còn đổi màu và pha mờ 150 mili giây.
10. Kiểm tra bản đồ bằng bàn phím: điểm đánh dấu và vòng cụm nhận tiêu điểm, mở được bong bóng hoặc phóng tới cụm.
11. Giữ chặt rồi thả một nút, một thẻ: phần tử thu nhẹ khi giữ và về trạng thái cũ ngay khi thả, không giữ lại trạng thái dở.
12. Tắt chuột, chỉ dùng tay: chạm thẻ xong nhấc tay thì thẻ không còn bị nâng hay sáng viền; ảnh trong thẻ không bị phóng sẵn.
13. Đổi quốc gia ở ô chọn: vòng sáng báo hiệu chạy một lần rồi tắt hẳn, ô chọn không bị giữ màu hay viền khác đi.

## 14. Giới hạn đã biết

- Bản đồ tự vẽ từ dữ liệu bờ biển và biên giới phạm vi công cộng đi kèm trang, nên không phụ thuộc máy chủ ảnh bên thứ ba; đổi lại độ chính xác chỉ tới mức bản đồ thế giới thu nhỏ và không có địa hình, đường phố.
- Khi nhìn cả thế giới, những sự kiện nằm sát nhau được gom thành một vòng ghi số lượng thay vì vẽ chồng lên nhau; muốn đọc từng sự kiện thì phóng tới mức cụm tách ra. Bấm vào vòng cụm luôn đưa tới mức đó, không cần bấm nhiều lần.
- Phông hiển thị dựa vào phông có sẵn của hệ điều hành, nên Windows và macOS có nét chữ hơi khác nhau.
- Trong môi trường kiểm thử tự động không có cửa sổ trình duyệt hiển thị, trình duyệt tạm dừng khung hình chờ của Next.js nên ảnh chụp màn hình có thể chỉ thấy khung chờ. Đây là giới hạn của môi trường, không phải lỗi của website.
