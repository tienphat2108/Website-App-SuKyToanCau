# Kịch bản kiểm thử trợ năng

## 1. Phạm vi

Bộ kịch bản này kiểm tra website dùng được hay không với trình đọc màn hình, với bàn phím và với người không phân biệt được màu: liên kết bỏ qua điều hướng, tên vùng, trật tự đề mục, vòng tiêu điểm, nhãn của nút và ảnh, bản thay thế bằng chữ của bản đồ, thông báo lỗi biểu mẫu, tương phản chữ và việc chặn mềm công cụ kiểm tra không gây phiền cho thao tác hợp lệ. Cách triển khai mô tả trong `docs_and_qa/trợ_năng.md`. Bảo mật, đa ngôn ngữ, tối ưu công cụ tìm kiếm và gọi dữ liệu có bộ kịch bản riêng.

**Không có công tắc “chế độ đọc”.** Mọi kịch bản chạy trên giao diện thường, bật sẵn trình đọc màn hình của hệ điều hành hoặc công cụ kiểm tra cây trợ năng. Nếu một kịch bản đòi phải bật cái gì đó trước khi dùng, đó là lỗi thiết kế, không phải kết quả không đạt.

## 2. Điều kiện chung

- Giao diện chạy tại `http://localhost:3000` (bản dựng) hoặc `http://localhost:3001` (chế độ phát triển); hai tập lệnh kiểm tra tự động nhận cổng làm tham số.
- Máy chủ dữ liệu chạy tại `http://localhost:5080` và đã nạp 149 sự kiện; nếu máy chủ dữ liệu tắt, bản dự phòng trong `shared/history-events.json` vẫn đủ 149 sự kiện nên số đếm trong kịch bản không đổi.
- Chrome hoặc Edge bản mới; bật `about:flags` không cần thiết. Trình đọc màn hình thật: NVDA (Windows) hoặc VoiceOver (macOS, iOS).
- Một bàn phím thật, một thiết bị chạm, và cửa sổ thử ở bốn bề rộng 320, 390, 768, 1440 điểm ảnh.
- Bật sẵn thiết lập “giảm chuyển động” của hệ điều hành cho các kịch bản TC-TN-03, TC-TN-04 và TC-TN-30, vì khối định kiểu rút gọn chuyển màu đường viền trong 150 mili giây và dễ gây đọc sai kết quả đo.
- Ngôn ngữ tiếng Việt cho phần lớn kịch bản; các kịch bản ghi rõ khi nào phải làm lại ở bản tiếng Anh.

## 3. Danh sách kịch bản

### A. Điều hướng bằng bàn phím và cấu trúc trang

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-TN-01 | Điểm tiêu điểm đầu tiên là liên kết bỏ qua điều hướng | Mở trang chủ, chưa bấm gì, gõ một lần phím Tab. Kiểm tra bằng `node .tmp/verify-a11y-2.mjs` | Liên kết được tiêu điểm có chữ “Bỏ qua và tới nội dung chính”, `href="#main-content"`, hiện ra ở góc trên trái với vòng sáng; nó không còn là chữ ẩn sau khi nhận tiêu điểm | Cao |
| TC-TN-02 | Kích hoạt liên kết bỏ qua tới đúng khối nội dung | Từ TC-TN-01, gõ Enter | Địa chỉ trang thành `#main-content`, trang cuộn xuống khối nội dung, phần tử `<main>` có `tabindex="-1"` nên con trỏ của trình đọc dừng ở đầu bài thay vì đọc lại thanh điều hướng | Cao |
| TC-TN-03 | Vòng tiêu điểm thấy được ở ô tìm kiếm dạng viên thuốc | Ở khối mở đầu trang chủ, trang 404 và ô tìm trên thanh điều hướng máy tính: bấm Tab tới ô, làm lại ở 320, 768 và 1440 điểm ảnh, cả bản sáng lẫn bản tối | Vòng sáng màu nhấn dày 2 điểm ảnh, lệch ra ngoài 2 điểm ảnh, bao quanh cả khung viên thuốc chứ không mất hẳn vì bản thân `<input>` ẩn đường viền; vòng sáng vẫn thấy khi bật giảm chuyển động | Cao |
| TC-TN-04 | Vòng tiêu điểm thấy được ở mọi trường biểu mẫu | Mở `/contribute`, Tab lần lượt qua ô chọn quốc gia, họ tên, thư điện tử, chủ đề, nội dung và nút gửi; làm lại ở trang dòng thời gian với ô `#timeline-search` và bảng điều hướng di động | Mọi trường nhận tiêu điểm đều hiện vòng sáng màu nhấn nhìn rõ trên cả bản sáng và bản tối; không trường nào chỉ đổi màu viền rất nhẹ | Cao |
| TC-TN-05 | Vùng nội dung có tên phân biệt được | Mở công cụ kiểm tra, xem cây trợ năng của trang chủ, bảng điều hướng di động và khối đường dẫn chỉ vị trí | Các vùng xuất hiện với tên tiếng Việt: “Điều hướng chính”, “Điều hướng trên thiết bị di động”, “Đường dẫn điều hướng”, “Tìm kiếm sự kiện lịch sử”; không có vùng vô danh khiến trình đọc chỉ đọc “vùng” | Trung bình |
| TC-TN-06 | Trật tự đề mục không nhảy bậc | Chạy `node .tmp/verify-a11y-2.mjs` hoặc tự đếm trên năm trang `/`, `/timeline`, `/event/magna-carta-1215`, `/contribute`, `/stories` | Mỗi trang có đúng một `h1`; không có bước nhảy từ `h2` xuống `h4`; người dùng trình đọc chuyển nhanh giữa các khối bằng phím tắt đề mục được | Trung bình |

### B. Nội dung đọc được bằng trình đọc màn hình

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-TN-07 | Nút đổi giao diện báo trạng thái | Bấm Tab tới nút “Đổi giao diện sáng tối”, đọc thuộc tính `aria-pressed` trước và sau khi bấm, tải lại trang khi đang ở bản tối | `aria-pressed="false"` ở bản sáng, `"true"` ở bản tối; tải lại trang trong bản tối thì giá trị đúng ngay từ lần đọc đầu tiên, không phải sau một nhịp; nhãn không đổi, chỉ trạng thái đổi | Cao |
| TC-TN-08 | Nút lưu và bỏ lưu sự kiện đổi cả nhãn lẫn trạng thái | Mở một trang sự kiện, đọc `aria-label` và `aria-pressed` của nút yêu thích, bấm một lần rồi đọc lại; làm lại ở bản tiếng Anh | Trước khi bấm: “Lưu sự kiện” với `aria-pressed="false"`; sau khi bấm: “Bỏ lưu sự kiện” với `aria-pressed="true"`; hai giá trị luôn đi cặp, không có trạng thái nhãn một đằng trạng thái một nẻo; bản tiếng Anh dùng “Save event” / “Remove saved event” | Trung bình |
| TC-TN-09 | Chú thích ảnh mô tả đúng ảnh và theo ngôn ngữ | Mở năm sự kiện khác loại nội dung ảnh (chân dung, bản đồ, bia, máy móc, ảnh đường phố); đọc thuộc tính `alt` của ảnh lớn; đối chiếu bản tiếng Việt và tiếng Anh của cùng sự kiện | Không ảnh nào thiếu `alt` hoặc để trống; chuỗi chú thích khác nhau giữa các sự kiện, mô tả vật thể trong ảnh chứ không kể lại nội dung bài; bản tiếng Việt là tiếng Việt, bản tiếng Anh là tiếng Anh | Cao |
| TC-TN-10 | Ảnh trang trí được bỏ qua | Xem cây trợ năng của biểu tượng kính lúp, ngôi sao thời kỳ và minh họa khối trống | Những hình này có `alt=""` hoặc `aria-hidden="true"`; trình đọc không đọc lời thoại trang trí, không phát tiếng “ảnh” vô nghĩa | Thấp |
| TC-TN-11 | Bản đồ có bản thay thế bằng chữ | Mở `/timeline?view=map`, đọc khối ngay dưới khung bản đồ; mở tiếp `/timeline?view=map&era=can-dai` | Khối có tiêu đề “Danh sách địa điểm của 149 sự kiện đang hiển thị”; thu gọn theo mặc định và mở bằng một phím Enter; khi lọc Cận đại, tiêu đề thành “Danh sách địa điểm của 40 sự kiện đang hiển thị” và danh sách đúng 40 mục, khớp số ghim trên bản đồ | Cao |
| TC-TN-12 | Số trong danh sách khớp số trên ghim | Ở `/timeline?view=map`, chạy `node .tmp/verify-a11y-2.mjs`; hoặc mở danh sách và so ba địa điểm bất kỳ với ghim cùng số trên bản đồ | Mỗi mục bắt đầu bằng số thứ tự từ 1 liên tục; số ghi trên ghim là số của cùng địa điểm đó trong danh sách; nhãn của ghim đọc đúng tên sự kiện; không có mục ngoài phạm vi đếm | Cao |
| TC-TN-13 | Danh sách địa điểm dùng để mở bài được | Mở khối danh sách, Tab tới hai liên kết đầu và bấm Enter; thử trên cửa sổ 375 điểm ảnh | Mỗi tên sự kiện là liên kết thật, mở được bài của nó ở đúng ngôn ngữ; ở 375 điểm ảnh danh sách một cột, không tràn ngang; ở 1280 điểm ảnh hai cột | Cao |
| TC-TN-14 | Nút thu phóng của bản đồ nói tiếng Việt | Mở `/timeline?view=map`, Tab vào hai nút thu phóng, đọc `aria-label`; chạy `node .tmp/verify-a11y-2.mjs` | Hai nút đọc là “Phóng to bản đồ” và “Thu nhỏ bản đồ”; bản tiếng Anh đọc “Zoom in the map” và “Zoom out the map”; không còn chuỗi “Zoom in”/“Zoom out” tiếng Anh lẫn trong trang tiếng Việt | Trung bình |
| TC-TN-15 | Nút đóng bong bóng nói tiếng Việt | Mở `/event/magna-carta-1215`, bấm ghim để mở bong bóng, Tab tới nút đóng và đọc nhãn; mở thêm một bong bóng khác | Nút đóng có `aria-label="Đóng thông tin sự kiện"`, không phải chữ “×” vô nghĩa; nhãn đúng sau mỗi lần mở bong bóng mới, kể cả khi mở ba bong bóng liên tiếp | Trung bình |
| TC-TN-16 | Ghim đơn có nhãn là tên sự kiện | Ở `/timeline?view=map`, phóng tới mức thấy từng ghim (không phải cụm), đọc `aria-label` của ba ghim | Mỗi ghim có nhãn là tên sự kiện, `role` là nút hoặc liên kết nên bấm và Enter được; không có ghim nào đọc là “img” hay “div” | Cao |
| TC-TN-17 | Điểm cụm cho biết có bao nhiêu sự kiện | Thu nhỏ bản đồ tới mức các ghim gom thành cụm, bấm vào một cụm | Trên cụm hiện con số; nội dung bong bóng hoặc hành vi phóng cho biết số sự kiện trong khu vực; không có cụm nào hiện số mà danh sách bằng chữ lại không có mục tương ứng | Trung bình |
| TC-TN-18 | Mọi liên kết mở thẻ mới tự nói rõ | Mở `/event/magna-carta-1215`, chạy `node .tmp/verify-a11y.mjs` hoặc đọc tên từng liên kết trong cây trợ năng | Chín trên chín liên kết mở thẻ mới đều có thêm đoạn chữ chỉ trình đọc nghe thấy: “Mở trong tab mới”; bản tiếng Anh là “Opens in a new tab”; không có mục tiêu nào nằm trong danh sách thiếu | Cao |
| TC-TN-19 | Dòng ghi nguồn và liên kết giấy phép cũng nói rõ | Mở khối nguồn ở cuối bài, đọc nhãn liên kết “Wikimedia Commons”, liên kết giấy phép và dòng ghi nguồn nhỏ của Leaflet | Ba liên kết này mở thẻ mới và có đoạn “Mở trong tab mới” chỉ dành cho trình đọc; phần nhìn bằng mắt không thêm chữ thừa | Trung bình |
| TC-TN-20 | Nút chia sẻ có nhãn ghép đủ nghĩa | Mở khối chia sẻ của một sự kiện, đọc `aria-label` của nút Facebook và nút X | Nhãn là “Facebook · Mở trong tab mới” và “X · Mở trong tab mới”; không còn nút chỉ có biểu tượng không tên | Trung bình |
| TC-TN-21 | Ô tìm kiếm bằng biểu tượng trên di động có tên | Thu cửa sổ xuống 390 điểm ảnh, Tab tới nút kính lúp trên thanh điều hướng mở bảng di động | Nút không chỉ đọc “biểu tượng”; ô tìm kiếm trong bảng có nhãn “Tìm kiếm sự kiện lịch sử” và mô tả ngắn đi kèm | Trung bình |

### C. Biểu mẫu đóng góp

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-TN-22 | Chú giải dấu bắt buộc hiện diện | Mở `/contribute`, đọc dòng dưới ô nội dung, trước nút gửi; làm lại ở bản tiếng Anh | Có dòng “Dấu * đánh dấu thông tin bắt buộc.”, tương phản với nền đạt 4.5:1; bản tiếng Anh “Items marked with * are required.” | Cao |
| TC-TN-23 | Tên trường không dính hoa thị | Đọc **tên truy cập được** của bốn trường bắt buộc trong cây trợ năng (tab Accessibility của công cụ kiểm tra, hoặc NVDA), không đọc `textContent` của nhãn | Tên đọc là “Họ và tên”, “Thư điện tử”, “Nội dung đóng góp”, không có “*” hay “sao” trong tên; dấu hoa thị chỉ nhìn thấy bằng mắt và mang `aria-hidden="true"`. Lưu ý: `label.textContent` vẫn trả “Họ và tên *” vì nó tính cả phần tử ẩn, nên đo bằng `textContent` sẽ báo sai | Cao |
| TC-TN-24 | Mô tả và lỗi liên kết đúng trường | Đọc `aria-describedby` của ô thư điện tử khi chưa gửi và sau khi gửi sai định dạng | Chưa lỗi: trỏ vào `email-hint`; có lỗi: trỏ vào `email-hint email-error`, trình đọc đọc liền mạch gợi ý rồi tới lỗi; tên trường không bị đổi sau khi có lỗi | Cao |
| TC-TN-25 | Khối tổng hợp lỗi sau khi gửi thất bại | Mở `/contribute`, điền họ tên ngắn, thư điện tử sai, nội dung dưới 20 ký tự rồi bấm Gửi; chạy `node .tmp/verify-a11y.mjs` | Khối lỗi hiện ở đầu biểu mẫu với tiêu đề “Vui lòng kiểm tra lại các trường được đánh dấu.” và mục “Vui lòng sửa các mục sau:” liệt kê đúng ba trường kèm lý do; `role="group"` có `aria-labelledby`, không dùng `role="alert"` để tránh đọc trùng | Cao |
| TC-TN-26 | Con trỏ được đưa về khối lỗi | Ngay sau TC-TN-25, quan sát phần tử nhận tiêu điểm; sau đó gõ một lần Tab | Tiêu điểm nằm trong khối lỗi (phần tử nhận `tabindex="-1"`), người dùng bàn phím không bị bỏ lại ở nút gửi; một lần Tab rời khỏi khối và tới đúng trường đầu tiên của biểu mẫu theo thứ tự đọc (“Họ và tên”), khối không nhốt tiêu điểm | Cao |
| TC-TN-27 | Lỗi không chỉ báo bằng màu | Ở trạng thái có lỗi, đọc `aria-invalid` của ba trường, kiểm tra khối lỗi có cả biểu tượng và chữ; chuyển màn hình sang thang xám và đọc lại | Mỗi trường lỗi có `aria-invalid="true"`; khối lỗi có biểu tượng cảnh báo đi kèm chữ nên người mù màu vẫn phân biệt được; danh sách lý do lỗi bằng chữ, không phải chấm đỏ | Cao |
| TC-TN-28 | Gửi lại lần hai không đọc lại cả biểu mẫu | Sau TC-TN-25, sửa họ tên cho đúng rồi bấm Gửi lần nữa | Chỉ khối lỗi cập nhật; các trường đã nhập không bị xóa, không bị đọc lại từ đầu vì cây biểu mẫu không bị dựng lại; số lần thử tăng đúng một | Trung bình |
| TC-TN-29 | Đường gửi thành công không bị chặn bởi trợ năng | Điền biểu mẫu đúng chuẩn bằng bàn phím (không dùng chuột), Enter ở ô cuối hoặc Tab tới nút Gửi rồi Enter | Gửi được bằng phím, chuyển tới trang cảm ơn `/thank-you`; không có bẫy nào giữ tiêu điểm trong biểu mẫu sau khi thành công | Cao |
| TC-TN-42 | Ô đồng ý đọc và bấm được bằng bàn phím | Mở `/contribute`, dùng trình đọc màn hình đọc nhãn của ô `#consent`; Tab tới ô và gõ phím cách; đo vùng chạm bằng `node .tmp/verify-legal.mjs 3000 --skip-send`; sau đó gửi khi ô chưa tích và đọc phần tử nhận lỗi | Nhãn gắn `htmlFor="consent"` nên tên truy cập đọc trọn câu “Tôi đồng ý để trang lưu họ tên và thư điện tử của tôi nhằm liên hệ về đóng góp này.” kèm “Đọc Chính sách riêng tư”, không có chuỗi tiếng Anh hay biến `{owner}` sót lại; ô báo “nhập chưa được chọn” và đổi sang “đã chọn” sau phím cách, không cần nhắm vào ô nhỏ; vùng chạm đo được 24×24 điểm ảnh trở lên, liên kết trong nhãn vẫn Tab tới được và có viền tiêu điểm; khi thiếu ô đồng ý, khối lỗi liệt kê “Ô đồng ý lưu dữ liệu”, ô nhận `aria-invalid="true"` và `aria-describedby="consent-error"`, tiêu điểm được đưa về khối lỗi chứ không bỏ lại ở nút Gửi | Cao |

### D. Tương phản và hiển thị

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-TN-30 | Tương phản chữ đạt ngưỡng | Chạy `node .tmp/verify-a11y-2.mjs` ở cả hai bản; hoặc đo màu chữ của chú giải, mô tả trường, khối lỗi và nhãn nút | Chữ nhỏ nhất (0.8125 rem) đạt 4.5:1 so với nền thật của nó; đo được 6.98:1 bản sáng và 8.53:1 bản tối cho chú giải; khối lỗi 6.86:1; vòng tiêu điểm phân biệt được với cả nền và viền ô | Cao |
| TC-TN-31 | Nội dung không phụ thuộc hover | Trên máy tính có chuột và trên thiết bị chạm, mở một trang sự kiện mà không rê chuột vào bất cứ đâu | Toàn bộ tiêu đề, ngày, quốc gia, mô tả ngắn, nguồn tham khảo và bản đồ đều hiển thị mà không cần rê chuột; thông tin không chỉ hiện trong công cụ thu nhỏ khi rê | Trung bình |
| TC-TN-32 | Bản tiếng Anh không lẫn nhãn tiếng Việt | Chạy `node .tmp/verify-a11y-2.mjs` phần hai trang tiếng Anh; mở `/en/timeline?view=map` và `/en/contribute` | Nhãn thu phóng, khối danh sách địa điểm, chú giải biểu mẫu và khối lỗi đều là tiếng Anh; không có chuỗi “Phóng to”, “Thu nhỏ”, “Danh sách” hay “Dấu *” sót trong cây trợ năng | Trung bình |

### E. Không gây phiền cho người dùng hợp lệ

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-TN-33 | Phím soạn thảo và sao chép còn nguyên | Mở `/contribute`, gõ tiếng Việt có dấu bình thường vào ô nội dung, bấm Ctrl+A rồi Ctrl+C, thử Ctrl+Shift+V; sau đó bấm F12 | Gõ, bôi đen, chọn tất cả và sao chép hoạt động như mọi trang web; chỉ các phím gọi công cụ kiểm tra bị chặn; không có cảnh báo, không có hộp thoại, không có trang trắng | Cao |
| TC-TN-34 | Tắt menu chuột phải vẫn còn đường thay thế | Chuột phải vào: nền trang, một khối nội dung, một liên kết, một ảnh, một ô nhập, một mục danh sách và một đoạn chữ đã bôi đen; sau đó bôi đen một câu rồi bấm Ctrl+C, Tab tới một liên kết rồi bấm Enter, và bấm chuột giữa vào một liên kết | Không vị trí nào hiện menu của trình duyệt; sao chép bằng Ctrl+C, mở liên kết bằng Enter hoặc chuột giữa vẫn chạy. Đây là mất mát đã chấp nhận: không còn chuột phải để lưu ảnh, sao chép nhanh hay mở liên kết ở thẻ mới | Cao |
| TC-TN-35 | Trợ năng không bị suy giảm vì phần chặn | Lặp lại TC-TN-01, TC-TN-03, TC-TN-04 và TC-TN-26 trên trang có phần chặn mềm | Liên kết bỏ qua, vòng tiêu điểm, danh sách lỗi và việc đưa con trỏ về khối lỗi vẫn đúng; phần chặn không bắt tiêu điểm, không nuốt sự kiện bàn phím ngoài danh sách phím công cụ kiểm tra; menu chuột phải bị tắt nhưng Ctrl+C, Tab/Enter và chuột giữa vẫn thay thế được | Cao |

### F. Nghe thật bằng trình đọc màn hình

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-TN-36 | Một vòng đọc trang chủ bằng NVDA | Bật NVDA, mở trang chủ, đọc từ đầu tới cuối bằng phím mũi xuống, không dùng chuột | Không có mục nào chỉ đọc “nhấp để biết thêm thông tin”, “liên kết” không tên hay “hình ảnh” không chú thích; các khối có đề mục để nhảy; ô tìm kiếm được đọc kèm nhãn của nó | Cao |
| TC-TN-37 | Đọc bản đồ và khối danh sách bằng NVDA | Vào `/timeline?view=map`, Enter mở khối “Danh sách địa điểm…”, đọc ba mục đầu rồi Tab vào khung bản đồ | Người dùng biết có bao nhiêu địa điểm, mở được từng bài từ danh sách; điều khiển thu phóng được đọc bằng nhãn tiếng Việt; không có chuỗi phần tử rỗng vô hạn khi Tab trong khung bản đồ | Cao |
| TC-TN-38 | Một vòng sửa lỗi biểu mẫu bằng NVDA | Gửi biểu mẫu thiếu dữ liệu khi NVDA đang bật | NVDA đọc một lần: tiêu đề khối lỗi, danh sách trường, rồi tới từng trường kèm lý do; không đọc hai lần cùng một nội dung; sửa xong, gửi lại chỉ nghe phần thay đổi | Cao |
| TC-TN-39 | VoiceOver trên iOS với kích thước chữ hệ thống | Mở iPhone, bật VoiceOver, tăng cỡ chữ lớn nhất, đọc trang chủ và mở một sự kiện | Nội dung không bị cắt, không có chữ nào chồng lên khối khác; nút vẫn chạm được trong vùng 24 điểm ảnh trở lên; liên kết bỏ qua không xuất hiện lệch khung nhìn | Cao |
| TC-TN-40 | Làm trắc nghiệm chỉ bằng bàn phím và trình đọc màn hình | Mở `/event/magna-carta-1215`, Tab tới dòng tiêu đề "Trắc nghiệm ghi nhớ" và mở bằng Enter, dùng Tab và phím mũi tên chọn đáp án ở cả năm câu, Enter để chấm, rồi bấm "Làm lại"; chuyển "Số câu hỏi" sang "10 câu" bằng phím mũi tên và chấm khi còn câu trống; thử đóng mở lại bằng phím cách; lặp lại với NVDA đang bật | Khối đóng sẵn và dòng tiêu đề nằm trong thứ tự Tab, đọc được cả nhãn "Ôn tập nhanh", tên "Trắc nghiệm ghi nhớ" lẫn trạng thái mở/đóng; Enter hoặc phím cách mở khối, khi đóng thì câu hỏi không còn trong thứ tự đọc; nhóm "Số câu hỏi" là một `fieldset` có `legend` và hai nút radio "5 câu"/"10 câu", chuyển bằng phím mũi tên và đọc được số câu đang chọn; mỗi câu là một `fieldset` có `legend` nêu số thứ tự và câu hỏi; mỗi phương án là nút radio có tên đọc được gồm cả nhãn phương án, điều hướng bằng phím mũi tên trong nhóm; sau khi chấm, tiêu điểm nằm ở dòng kết quả và trình đọc đọc "Bạn trả lời đúng N/5 câu." hoặc "Đúng cả 5 câu. Bạn đã nắm được các mốc chính của bài này.", chọn "10 câu" thì đọc "N/10" và "cả 10 câu"; câu sai được đọc cả chữ "Chưa đúng." lẫn "Đáp án đúng: …", không chỉ dựa vào màu; chấm khi còn câu trống thì nghe thông báo lỗi và tiêu điểm nhảy vào câu còn thiếu; "Làm lại" đưa tiêu điểm về câu một | Cao |
| TC-TN-41 | Liên kết thư trực tiếp đọc và bấm được | Mở `/contribute` ở 320 điểm ảnh, Tab tới liên kết `sukytoancau@gmail.com`, dùng trình đọc màn hình đọc tên liên kết; bấm Enter để mở ứng dụng thư rồi quay lại; lặp lại ở bản `/en/contribute` | Liên kết nằm trong thứ tự Tab sau biểu mẫu, tên đọc được gồm cả tiêu đề thẻ và địa chỉ thư, không chỉ đọc “liên kết”; có viền tiêu điểm rõ khi nhận tiêu điểm bàn phím; vùng chạm cao từ 24 điểm ảnh và không tràn ngang ở 320 điểm ảnh; kích hoạt bằng Enter mở đúng ứng dụng thư với tiêu đề soạn sẵn theo ngôn ngữ; bản tiếng Anh đọc tên và tiêu đề bằng tiếng Anh | Trung bình |

## 4. Lệnh kiểm tra nhanh

```bash
# 15 kiem tra: vong tieu diem, aria-pressed, ban thay the, nhan Leaflet,
# lien ket the moi, khoi loi + tieu diem, chan phim mem
node .tmp/verify-a11y.mjs 3000

# 16 kiem tra: lien ket bo qua, trat tu de muc 5 trang, chu thay the anh,
# tuong phan 4.5:1 hai ban, aria-invalid, so thu tu khop so ghim
node .tmp/verify-a11y-2.mjs 3000

# 24 kiem tra: khoi dong san va chi mo khi bam, muc luc mo khoi, 5 fieldset/20 radio
# mac dinh + 2 radio "5 cau"/"10 cau", ten radio, nhom so cau, canh bao khi bo trong,
# tieu diem vao ket qua, lam lai, che do 10 cau (10 fieldset/40 radio),
# khong tran ngang o 320/375/768/1440, doi sang tieng Anh thi khoi dung lai,
# tai lai va quay lai bai thi doi de, giu vi tri cuon va khong tai lai
node .tmp/verify-quiz.mjs 3000

# Kiem tra ty le khoa tu dien giua hai ngon ngu
npx vitest run tests/i18n.test.ts
```

Ba tập lệnh cần Chrome ở đường dẫn `C:\Program Files\Google Chrome\Application\chrome.exe` và cổng ứng dụng đang chạy. Tập lệnh thứ nhất giả mạo tác nhân người dùng thành trình duyệt thật, vì máy chủ chặn tác nhân tự động theo hai mươi hạng mục bảo mật bắt buộc; nếu bỏ bước này, biểu mẫu trả lỗi chung thay vì lỗi từng trường và kịch bản TC-TN-25 sẽ cho kết quả sai. Tập lệnh thứ ba kiểm tra khối trắc nghiệm trên trang sự kiện, gồm trạng thái đóng sẵn, cách mở bằng dòng tiêu đề và bằng mục lục, nhóm "Số câu hỏi" với hai lựa chọn "5 câu"/"10 câu", cấu trúc nhóm câu hỏi, tên đọc được của từng phương án, thông báo khi chấm thiếu câu, tiêu điểm sau khi chấm và việc đổi đề khi tải lại hoặc quay lại bài.

## 5. Ghi nhận kết quả

| Mã | Người thực hiện | Ngày | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| TC-TN-01 |  |  |  |  |
| TC-TN-03 |  |  |  |  |
| TC-TN-11 |  |  |  |  |
| TC-TN-25 |  |  |  |  |
| TC-TN-36 |  |  |  |  |
| TC-TN-40 |  |  |  |  |
| TC-TN-41 |  |  |  |  |
| TC-TN-42 |  |  |  |  |

Quy ước kết quả: Đạt, Không đạt, Bỏ qua. Khi không đạt, tạo báo cáo lỗi theo mẫu trong thư mục `báo_cáo_lỗi`, đặt tên tệp `loi_tro_nang_<số>.md` và mô tả theo trình tự: trang nào, làm gì, trình đọc màn hình đọc ra sao, đọc đúng thì phải ra sao. Không sửa âm thầm dữ liệu hay nhãn khi chưa có phiếu.

## 6. Những mục đã kiểm và chủ ý để nguyên

Bốn điểm sau được rà trong đợt kiểm kê và ghi lại để người sau không hiểu nhầm là còn thiếu:

- Hai khối `<section>` và `<aside>` chưa đặt tên vẫn nằm nguyên như cũ. Đặt tên hàng loạt sẽ thêm vùng vô nghĩa vào cây tài liệu; chỉ landmark và phần tử tương tác cần tên.
- Hai vùng tìm kiếm trùng tên không xuất hiện cùng lúc trong cây trợ năng vì một vùng bị ẩn theo bề rộng màn hình, nên người dùng không nghe thấy hai lần.
- Mục lục của trang hồ sơ chuyên sâu chưa dùng `aria-current`; đây là việc thẩm mỹ điều hướng, không chặn đọc nội dung.
- Khung chờ và khối đổi chế độ xem chưa báo bằng vùng nội dung động. Người dùng bàn phím vẫn theo được vì trang tải lại toàn khối; khi nào thêm tìm kiếm không tải lại trang mới cần vùng động.
