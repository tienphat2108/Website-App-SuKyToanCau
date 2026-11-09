# Đặc tả tính năng

## 1. Mục đích và cách đọc

Tài liệu này mô tả từng tính năng của website bách khoa lịch sử để người phát triển, người kiểm thử và người quản lý sản phẩm cùng hiểu giống nhau về phạm vi và điều kiện hoàn thành. Mỗi tính năng có mã riêng, dùng lại mã đó khi tạo phiếu trên Jira và khi ghi kết quả kiểm thử.

Quy ước mã:

- `FE-xx`: mã tính năng, dùng làm tiền tố cho tên phiếu.
- `TC-CN-xx`: kịch bản kiểm thử chức năng chính.
- `TC-BM-xx`: kịch bản kiểm thử bảo mật.
- `TC-SEO-xx`: kịch bản kiểm thử tối ưu công cụ tìm kiếm.
- `TC-NN-xx`: kịch bản kiểm thử đa ngôn ngữ.
- `TC-API-xx`: kịch bản kiểm thử gọi dữ liệu.
- `TC-TN-xx`: kịch bản kiểm thử trợ năng.

Mỗi tính năng gồm bốn phần: mục tiêu, phạm vi, luồng sử dụng và điều kiện chấp nhận. Điều kiện chấp nhận viết dưới dạng câu khẳng định, kiểm tra được, không dùng từ mơ hồ như "nhanh" hay "đẹp".

## 2. Bảng tổng hợp

| Mã | Tính năng | Người dùng chính | Phiên bản |
| --- | --- | --- | --- |
| FE-01 | Khung trang, điều hướng và chân trang | Người đọc | 0.1.0 |
| FE-02 | Giao diện sáng tối | Người đọc | 0.1.0 |
| FE-03 | Đa ngôn ngữ Việt Anh | Người đọc | 0.1.0 |
| FE-04 | Trang chủ | Người đọc | 0.2.0 |
| FE-05 | Dòng thời gian và bộ lọc | Người đọc | 0.2.0 |
| FE-06 | Tìm kiếm | Người đọc | 0.2.0 |
| FE-07 | Bản đồ lịch sử | Người đọc | 0.3.0 |
| FE-08 | Chi tiết sự kiện | Người đọc | 0.2.0 |
| FE-09 | Yêu thích và chia sẻ | Người đọc | 0.2.0 |
| FE-10 | Gửi đóng góp | Người đọc | 0.3.0 |
| FE-11 | Duyệt đóng góp | Quản trị viên | 0.3.0 |
| FE-12 | Trang thông tin và trợ giúp | Người đọc | 0.3.0 |
| FE-13 | Trạng thái tải và trang lỗi | Người đọc | 0.3.0 |
| FE-14 | Tối ưu công cụ tìm kiếm | Người đọc, máy tìm kiếm | 0.3.0 |
| FE-15 | Bảo mật và quyền riêng tư | Toàn hệ thống | 0.3.0 |
| FE-16 | Máy chủ dữ liệu | Giao diện, quản trị viên | 0.1.0 |
| FE-17 | Đồng bộ dữ liệu dùng chung | Nhóm phát triển | 0.1.0 |
| FE-18 | Đo lường và đồng ý phân tích | Người đọc, quản trị viên | 0.3.0 |
| FE-19 | Đóng gói triển khai | Nhóm vận hành | 1.0.0 |
| FE-20 | Hồ sơ đáng đọc | Người đọc | 1.1.0 |
| FE-21 | Quốc gia ưu tiên | Người đọc | 1.2.0 |
| FE-22 | Phản hồi chuyển động cho thành phần tương tác | Người đọc | 1.3.0 |
| FE-23 | Trợ năng cho trình đọc màn hình | Người đọc | 1.4.0 |
| FE-24 | Trắc nghiệm ôn tập trên trang sự kiện | Người đọc | 1.5.0 |
| FE-25 | Tuân thủ pháp lý Việt Nam về dữ liệu cá nhân | Người đọc, người gửi đóng góp | 1.6.0 |
| FE-26 | Ngày này năm xưa | Người đọc | 1.7.0 |
| FE-27 | Chủ đề tuyến bài học | Người đọc | 1.7.0 |
| FE-28 | Thanh trượt thời gian trên bản đồ | Người đọc | 1.7.0 |
| FE-29 | Lưu sự kiện và trang ôn tập | Người đọc | 1.7.0 |
| FE-30 | Đọc tiếp theo và chuỗi nhân quả | Người đọc | 1.7.0 |
| FE-31 | In bài và nguồn cấp RSS | Người đọc, máy đọc tin | 1.7.0 |

## 3. Đặc tả chi tiết

### FE-01. Khung trang, điều hướng và chân trang

**Mục tiêu:** người đọc luôn biết mình đang ở đâu và tới được mọi khu vực chính bằng tối đa hai lần bấm.

**Phạm vi:** thanh điều hướng trên cùng, menu di động, liên kết bỏ qua điều hướng, chân trang, thanh hành động dính đáy trên điện thoại.

**Luồng sử dụng:**

1. Người đọc mở bất kỳ trang nào.
2. Thanh điều hướng hiện tên thương hiệu, năm mục chính và nút đổi ngôn ngữ, nút đổi giao diện.
3. Trên màn hình hẹp, các mục chính gom vào menu mở bằng nút có biểu tượng.
4. Chân trang lặp lại liên kết chính, trang thông tin và ghi chú bản quyền.

**Điều kiện chấp nhận:**

- [ ] Thanh điều hướng hiện trên mọi trang, kể cả trang lỗi.
- [ ] Mục đang mở được đánh dấu bằng thuộc tính trạng thái, không chỉ bằng màu.
- [ ] Menu di động mở và đóng được bằng chuột, phím Enter, phím Esc; tiêu điểm trở về nút mở sau khi đóng.
- [ ] Liên kết bỏ qua điều hướng là phần tử đầu tiên nhận tiêu điểm khi nhấn Tab.
- [ ] Thanh dính đáy chỉ hiện trên màn hình hẹp, không che nội dung cuối trang.
- [ ] Mọi liên kết trong chân trang trỏ tới đường dẫn tồn tại.
- [ ] Dải số liệu ở mép trên thanh điều hướng lấy số trực tiếp từ kho dữ liệu: thêm hoặc bớt sự kiện thì hai con số thay đổi theo, không có con số nào viết cứng trong tệp ngôn ngữ.

**Kịch bản liên quan:** TC-CN-02, TC-CN-03, TC-CN-04, TC-CN-29, TC-CN-30, TC-CN-66, TC-NN-05.

### FE-02. Giao diện sáng tối

**Mục tiêu:** người đọc chọn được giao diện phù hợp điều kiện ánh sáng và giữ lựa chọn giữa các lần truy cập.

**Phạm vi:** nút đổi giao diện ba trạng thái gồm sáng, tối và theo hệ điều hành; lưu lựa chọn trong bộ nhớ cục bộ; chống nhấp nháy nền khi tải trang.

**Luồng sử dụng:**

1. Lần đầu truy cập, giao diện theo thiết lập hệ điều hành.
2. Người đọc bấm nút đổi giao diện, màu nền và màu chữ đổi ngay.
3. Lựa chọn được lưu; lần sau mở lại trang áp dụng đúng lựa chọn trước khi vẽ nội dung.

**Điều kiện chấp nhận:**

- [ ] Ba trạng thái chọn được và hiển thị rõ trạng thái đang dùng.
- [ ] Đổi giao diện không tải lại trang, không mất dữ liệu biểu mẫu đang nhập.
- [ ] Lựa chọn tồn tại sau khi tải lại và sau khi mở tab mới.
- [ ] Khi chọn theo hệ điều hành, đổi thiết lập màu của hệ điều hành làm giao diện đổi theo.
- [ ] Không có nhấp nháy nền sáng khi người dùng đang dùng giao diện tối.
- [ ] Mọi cặp màu chữ và nền đạt mức tương phản tối thiểu 4,5 trên 1.

**Kịch bản liên quan:** TC-CN-05, TC-CN-06, TC-BM-24.

### FE-03. Đa ngôn ngữ Việt Anh

**Mục tiêu:** người đọc đọc toàn bộ nội dung bằng tiếng Việt hoặc tiếng Anh, chuyển đổi không mất ngữ cảnh.

**Phạm vi:** từ điển hai ngôn ngữ, tiền tố đường dẫn `/en`, ghi nhớ ngôn ngữ bằng cookie, thẻ liên kết ngôn ngữ trong siêu dữ liệu.

**Luồng sử dụng:**

1. Mặc định website dùng tiếng Việt ở đường dẫn gốc.
2. Bấm nút đổi ngôn ngữ, website chuyển sang đường dẫn tương ứng có tiền tố `/en`.
3. Nội dung, nhãn giao diện, định dạng ngày tháng và số đổi theo ngôn ngữ.

**Điều kiện chấp nhận:**

- [ ] Mọi trang công khai tồn tại ở cả hai ngôn ngữ.
- [ ] Chuyển ngôn ngữ giữ nguyên trang đang đọc, không đưa về trang chủ.
- [ ] Không còn chuỗi tiếng Việt lẫn trong giao diện tiếng Anh và ngược lại, trừ tên riêng.
- [ ] Thẻ `html lang` đúng với ngôn ngữ đang hiển thị.
- [ ] Mỗi trang có thẻ liên kết ngôn ngữ và đường dẫn chuẩn trỏ đúng phiên bản.
- [ ] Ngôn ngữ đã chọn được ghi nhớ cho lần truy cập sau.

**Kịch bản liên quan:** toàn bộ nhóm TC-NN.

### FE-04. Trang chủ

**Mục tiêu:** trong màn hình đầu, người đọc hiểu website là gì và có đường vào nội dung ngay.

**Phạm vi:** khối mở đầu, hai nút hành động chính, bốn số liệu, sáu sự kiện nổi bật, bốn thẻ thời kỳ, khối bản đồ thu gọn, ba bài mới nhất, ba bước phương pháp biên soạn, khối mời đóng góp và khối “Lịch sử {quốc gia}” khi người đọc đã chọn quốc gia.

**Luồng sử dụng:**

1. Người đọc mở trang chủ.
2. Đọc phần mở đầu, bấm xem dòng thời gian hoặc gửi đóng góp.
3. Cuộn xuống xem sự kiện nổi bật, thời kỳ, bản đồ và bài mới.

**Điều kiện chấp nhận:**

- [ ] Hai nút hành động chính nằm trong màn hình đầu trên điện thoại rộng 375 điểm ảnh.
- [ ] Bốn số liệu khớp dữ liệu máy chủ: số sự kiện, số thời kỳ, số quốc gia, số ngôn ngữ.
- [ ] Sáu sự kiện nổi bật đúng thứ tự ưu tiên và mỗi thẻ có ảnh, tiêu đề, tóm tắt, liên kết.
- [ ] Khi đã chọn quốc gia, khối “Lịch sử {quốc gia}” hiện trước khối nổi bật và sự kiện nổi bật của quốc gia đó đứng đầu.
- [ ] Thẻ thời kỳ hiện số sự kiện và trỏ tới dòng thời gian đã lọc sẵn.
- [ ] Mỗi khối có tiêu đề cấp hai đúng thứ bậc, không nhảy cấp tiêu đề.
- [ ] Trang chủ vẫn có nội dung khi máy chủ dữ liệu không phản hồi.

**Kịch bản liên quan:** TC-CN-01, TC-CN-02, TC-API-12, TC-API-13.

### FE-05. Dòng thời gian và bộ lọc

**Mục tiêu:** người đọc duyệt 187 sự kiện theo trục thời gian và thu hẹp danh sách theo nhu cầu.

**Phạm vi:** danh sách sự kiện sắp theo năm, bộ lọc thời kỳ, quốc gia và khoảng năm, nút xóa bộ lọc, trạng thái rỗng, chuyển chế độ xem danh sách và bản đồ.

**Luồng sử dụng:**

1. Mở trang dòng thời gian, thấy toàn bộ sự kiện theo thứ tự năm tăng dần.
2. Chọn một hoặc nhiều bộ lọc; danh sách và số lượng cập nhật ngay.
3. Bấm xóa bộ lọc để trở về danh sách đầy đủ.
4. Chuyển sang chế độ bản đồ, bộ lọc hiện tại được giữ.

**Điều kiện chấp nhận:**

- [ ] Danh sách mặc định có đủ 187 sự kiện, sắp theo năm bắt đầu tăng dần.
- [ ] Kết hợp nhiều bộ lọc cho kết quả thỏa tất cả điều kiện.
- [ ] Số lượng hiển thị khớp số thẻ thực tế sau lọc.
- [ ] Không có kết quả thì hiện thông báo rõ và nút xóa bộ lọc, không để vùng trắng.
- [ ] Bộ lọc giữ nguyên khi đổi chế độ xem danh sách và bản đồ.
- [ ] Khi đã chọn quốc gia, sự kiện của quốc gia đó đứng đầu mỗi nhóm thời kỳ và có dải nhắc kèm nút bỏ ưu tiên.
- [ ] Địa chỉ trang không đổi khi lọc, tránh tạo vô số địa chỉ trùng nội dung.

**Kịch bản liên quan:** TC-CN-07, TC-CN-08, TC-CN-11, TC-CN-12, TC-CN-13, TC-CN-14.

### FE-06. Tìm kiếm

**Mục tiêu:** người đọc tìm được sự kiện theo từ khóa trong tiêu đề, tóm tắt, nội dung và nhãn, ở cả hai ngôn ngữ.

**Phạm vi:** ô tìm kiếm trên trang dòng thời gian, so khớp không phân biệt chữ hoa chữ thường, bỏ qua dấu tiếng Việt khi so khớp, tìm trong dữ liệu đã tải.

**Luồng sử dụng:**

1. Nhập từ khóa vào ô tìm kiếm.
2. Danh sách thu hẹp theo từng ký tự.
3. Kết hợp thêm bộ lọc thời kỳ hoặc khoảng năm nếu cần.

**Điều kiện chấp nhận:**

- [ ] Tìm "Bạch Đằng" ra sự kiện có chữ Bạch Đằng.
- [ ] Tìm "bach dang" không dấu vẫn ra kết quả tương ứng.
- [ ] Tìm bằng tiếng Anh ra sự kiện có nội dung tiếng Anh khớp.
- [ ] Từ khóa không tồn tại hiện trạng thái rỗng, không lỗi.
- [ ] Tìm kiếm không gửi từ khóa lên máy chủ dưới dạng không kiểm soát.
- [ ] Xóa từ khóa trả lại danh sách theo bộ lọc đang chọn.

**Kịch bản liên quan:** TC-CN-09, TC-CN-10, TC-CN-11, TC-CN-12, TC-CN-13.

### FE-07. Bản đồ lịch sử

**Mục tiêu:** người đọc thấy phân bố địa lý của sự kiện và mở được chi tiết từ bản đồ.

**Phạm vi:** nền bản đồ do dự án tự vẽ từ bộ dữ liệu đường bờ biển và biên giới trên bộ phạm vi công cộng, kèm bộ tên địa danh biển, đảo và quốc gia do dự án chọn, lưới kinh vĩ tuyến mờ dưới vùng biển trống và nét bờ biển mảnh phân cách đất với nước; điểm đánh dấu theo tọa độ sự kiện, tự gom thành cụm ghi số lượng khi nhìn ở mức khái quát và tách thành từng điểm có số thứ tự khi phóng đủ gần; bong bóng thông tin có tiêu đề, thời gian, thời kỳ và liên kết; tải muộn để không làm chậm trang.

**Luồng sử dụng:**

1. Chuyển sang chế độ bản đồ hoặc cuộn tới khối bản đồ ở trang chủ.
2. Bản đồ hiện các điểm đánh dấu tương ứng sự kiện đang lọc; ở mức nhìn cả thế giới, những sự kiện sát nhau được gom vào một vòng tròn ghi số sự kiện trong vùng đó.
3. Bấm vòng cụm để phóng tới đúng mức cụm tách ra; bấm điểm đánh dấu, bong bóng mở; bấm liên kết để đọc chi tiết.
4. Thu phóng để đọc dần tên biển, tên đảo rồi tên quốc gia; hai quần đảo Hoàng Sa và Trường Sa luôn mang tên tiếng Việt và có chấm đỏ đánh dấu ở mọi mức thu phóng.
5. Muốn xem địa thế thật của vùng đang nhìn, người đọc bấm “Mở Google Maps” ở góc trên bên phải bản đồ; vùng đó mở ở thẻ mới.

**Điều kiện chấp nhận:**

- [ ] Bản đồ chỉ tải khi người dùng mở chế độ bản đồ hoặc cuộn tới khối bản đồ.
- [ ] Tổng số ghi trên các vòng cụm cộng với số điểm lẻ đúng bằng số sự kiện đang hiển thị; không sự kiện nào bị ẩn khỏi bản đồ.
- [ ] Bấm một cụm phóng tới mức gần nhất khiến cụm đó tách thành ít nhất hai nhóm; cụm không bao giờ tách thì đưa tới mức thu phóng lớn nhất.
- [ ] Điều hướng được bằng bàn phím: Tab tới vòng cụm rồi Enter hoặc phím cách cho kết quả như bấm chuột; Tab tới điểm đánh dấu rồi Enter mở bong bóng.
- [ ] Mỗi vòng cụm và mỗi điểm đánh dấu đều có nhãn đọc màn hình; nhãn vòng cụm nêu số sự kiện trong vùng và cách mở rộng, có bản tiếng Việt và bản tiếng Anh.
- [ ] Vòng cụm đặt tại tâm ô lưới gom điểm, đường kính nhỏ hơn cạnh ô, nên hai cụm cạnh nhau không đè lên nhau ở bất kỳ cỡ màn hình nào.
- [ ] Điểm lẻ chỉ hiện số thứ tự từ mức vẽ riêng từng sự kiện; ở mức khái quát chỉ là chấm nhỏ để chín chục điểm không chồng thành khối đặc.
- [ ] Mỗi bong bóng có tiêu đề, thời gian và liên kết tới trang chi tiết đúng ngôn ngữ.
- [ ] Bản đồ có nhãn thay thế cho trình đọc màn hình.
- [ ] Khi bản đồ không tải được, danh sách văn bản vẫn dùng được bình thường.
- [ ] Không tải mã bản đồ từ máy chủ bên ngoài khi người dùng chưa mở bản đồ.
- [ ] Mọi khung bản đồ không phát sinh yêu cầu nào tới máy chủ ảnh của bên thứ ba; dòng ghi nguồn dưới góc phải nêu rõ dữ liệu bờ biển và biên giới lấy từ Natural Earth.
- [ ] Tên Hoàng Sa và Trường Sa giữ nguyên tiếng Việt ở cả bản tiếng Việt và bản tiếng Anh; không có nhãn nào bằng chữ nước ngoài.
- [ ] Không có đường biên giới hay đất liền nào được vẽ ở vùng biển trống giữa Biển Đông.
- [ ] Nhãn địa danh chỉ hiện khi nằm trọn trong khung, không bị cắt một nửa ở mép; hai nhãn quần đảo nằm trên điểm đánh dấu nhưng không chặn thao tác bấm.
- [ ] Mỗi khung bản đồ chỉ hiện một thế giới, không lặp lục địa sang hai bên; phần nền còn trống lấy đúng màu biển của bản đồ, không thành dải xám.
- [ ] Kéo bản đồ chỉ dừng ở biên thế giới và hai cực, không lộ nền trắng bên trong khung; nút thu nhỏ vẫn dùng được tới mức nhỏ nhất.
- [ ] Đất liền có nét bờ biển mảnh phân cách với nước, vùng biển trống có lưới kinh vĩ tuyến mờ; cả hai đổi theo giao diện sáng tối và không tải thêm tệp ảnh nào.
- [ ] Khung bản đồ giữ đúng chiều cao thiết kế ở cả ba nơi dùng: 34 rem ở dòng thời gian, 27 rem ở trang chủ trên màn hình rộng, 22 rem ở trang sự kiện; không khung nào bị co về chiều cao tối thiểu của chính nó.
- [ ] Bong bóng thông tin rộng tối thiểu 210 điểm ảnh; tiêu đề dài vẫn thành vài dòng cân đối, không bị dồn thành một cột chữ hẹp.
- [ ] Ở khung bản đồ hẹp, dòng ghi nguồn xuống dòng thay vì bị cắt, vẫn nêu đủ nguồn Natural Earth; khối nút thu phóng bo góc nằm gọn trong khung và không đè dòng ghi nguồn.
- [ ] Góc trên bên phải mọi khung bản đồ có liên kết “Mở Google Maps” trỏ đúng tọa độ tâm đang xem và tự cập nhật sau khi kéo; liên kết mở thẻ mới, mang `rel="noopener noreferrer"`, bấm được bằng bàn phím.
- [ ] Trước khi người đọc bấm liên kết đó, không có tài nguyên nào của Google được tải; định kiểu nguồn vẫn đóng với máy chủ ảnh bản đồ của bên thứ ba.
- [ ] Liên kết không thay nội dung bản đồ đang hiển thị: tên “Hoàng Sa”, “Trường Sa” trên bản đồ của dự án vẫn là tiếng Việt và vẫn do dự án kiểm soát.

**Kịch bản liên quan:** TC-CN-14, TC-CN-15, TC-CN-40, TC-CN-41, TC-CN-42, TC-CN-43, TC-CN-45, TC-CN-46, TC-CN-47, TC-CN-48, TC-CN-56, TC-CN-57, TC-CN-58, TC-CN-59, TC-CN-60, TC-NN-26, TC-NN-33, TC-NN-34, TC-BM-26, TC-BM-45, TC-SEO-16.

### FE-08. Chi tiết sự kiện

**Mục tiêu:** người đọc đọc trọn một sự kiện với đầy đủ bối cảnh và đường dẫn tới nội dung liên quan.

**Phạm vi:** tiêu đề, thời gian, địa điểm, thời kỳ, ảnh có văn bản thay thế, nội dung nhiều đoạn, nhãn, khối sự kiện quốc tế cùng năm, nguồn tham khảo, tối đa ba sự kiện liên quan, breadcrumb, liên kết chỉ đường dưới bản đồ.

**Luồng sử dụng:**

1. Từ dòng thời gian, bản đồ hoặc trang chủ, bấm một sự kiện.
2. Trang chi tiết mở đúng đường dẫn theo mã định danh thân thiện.
3. Cuộn cuối trang xem sự kiện liên quan hoặc quay lại dòng thời gian bằng breadcrumb.

**Điều kiện chấp nhận:**

- [ ] Mỗi sự kiện có đường dẫn riêng, không trùng, không đổi theo ngôn ngữ khác ngoài tiền tố.
- [ ] Nội dung hiện đủ các đoạn, giữ xuống dòng giữa đoạn.
- [ ] Ảnh có văn bản thay thế mô tả đúng nội dung ảnh.
- [ ] Sự kiện liên quan không trùng nhau và không trỏ về chính bài đang đọc.
- [ ] Khối “Cùng năm, thế giới có gì?” chỉ hiện sự kiện ở quốc gia khác, tối đa ba, ưu tiên trùng năm bắt đầu và liên kết mở đúng bài.
- [ ] Breadcrumb hiện đúng cấp và bấm được.
- [ ] Dưới bản đồ có liên kết chỉ đường mở thẻ mới và đúng tọa độ; góc trên bên phải bản đồ có thêm liên kết “Mở Google Maps”. Cả hai chỉ dẫn ra trang khác, không có liên kết nào tải ảnh bản đồ từ máy chủ bên thứ ba.
- [ ] Dữ liệu có cấu trúc của bài viết có tên địa điểm, quốc gia và tọa độ.
- [ ] Đường dẫn không tồn tại trả trang lỗi 404, không trả trang trắng.

**Kịch bản liên quan:** TC-CN-16, TC-CN-17, TC-CN-31, TC-CN-35, TC-SEO-05, TC-SEO-18, TC-SEO-31, TC-API-09.

### FE-09. Yêu thích và chia sẻ

**Mục tiêu:** người đọc lưu sự kiện quan tâm và gửi liên kết cho người khác.

**Phạm vi:** nút lưu và bỏ lưu trên thẻ và trang chi tiết, danh sách đã lưu giữ trong bộ nhớ cục bộ, nút sao chép liên kết, nút chia sẻ tới mạng xã hội.

**Luồng sử dụng:**

1. Bấm nút lưu trên một sự kiện; biểu tượng đổi trạng thái.
2. Tải lại trang, trạng thái lưu vẫn còn.
3. Bấm nút sao chép liên kết, nhận thông báo xác nhận.

**Điều kiện chấp nhận:**

- [ ] Trạng thái lưu giữ sau khi tải lại và sau khi mở tab mới.
- [ ] Bấm lần nữa bỏ lưu đúng sự kiện, không ảnh hưởng sự kiện khác.
- [ ] Sao chép liên kết cho ra đúng địa chỉ tuyệt đối của trang đang đọc.
- [ ] Nút chia sẻ mở đúng địa chỉ mạng xã hội với liên kết đã mã hóa.
- [ ] Không gửi dữ liệu yêu thích lên máy chủ.
- [ ] Nút có nhãn đọc được bằng trình đọc màn hình.

**Kịch bản liên quan:** TC-CN-18, TC-CN-19, TC-BM-24.

### FE-10. Gửi đóng góp

**Mục tiêu:** người đọc gửi được thông tin bổ sung hoặc chỉnh sửa nội dung cho ban biên tập.

**Phạm vi:** biểu mẫu họ tên, thư điện tử, chủ đề, nội dung; kiểm tra tại chỗ; bẫy tự động gửi; chặn tác nhân tự động; giới hạn tần suất; cam kết thời gian phản hồi; liên kết thư trực tiếp dưới biểu mẫu; trang cảm ơn sau khi gửi thành công.

**Luồng sử dụng:**

1. Mở trang đóng góp.
2. Nhập các trường bắt buộc, đọc ghi chú về cách dùng dữ liệu; có thể chọn gửi thẳng tới hộp thư biên tập thay vì dùng biểu mẫu.
3. Bấm gửi; nếu hợp lệ, đóng góp được lưu rồi chuyển tới trang cảm ơn; nếu sai, thấy lỗi ngay dưới từng trường.

**Điều kiện chấp nhận:**

- [ ] Trường bắt buộc để trống thì biểu mẫu không gửi và có lỗi riêng từng trường.
- [ ] Thư điện tử sai định dạng bị chặn trước khi gửi.
- [ ] Nội dung dưới 20 ký tự bị chặn kèm thông báo độ dài tối thiểu.
- [ ] Gửi hợp lệ nhận mã 202 và chuyển tới trang cảm ơn.
- [ ] Máy chủ dữ liệu lỗi thì hiện thông báo, giữ nguyên dữ liệu đã nhập.
- [ ] Gửi quá số lần cho phép nhận thông báo thử lại sau, không lộ chi tiết kỹ thuật.
- [ ] Yêu cầu từ công cụ tự động bị chặn trước khi kiểm tra dữ liệu, còn yêu cầu nội bộ từ máy chủ giao diện vẫn được chấp nhận.
- [ ] Dưới biểu mẫu có thẻ cam kết thời gian phản hồi bằng ngôn ngữ đang đọc.
- [ ] Dưới biểu mẫu có liên kết soạn thư tới `sukytoancau@gmail.com`, tiêu đề điền sẵn theo ngôn ngữ; biểu mẫu cũ vẫn giữ nguyên.
- [ ] Dữ liệu nhập được làm sạch trước khi lưu và hiển thị.

**Kịch bản liên quan:** TC-CN-20, TC-CN-21, TC-CN-22, TC-CN-23, TC-CN-24, TC-CN-34, TC-CN-78, TC-BM-14, TC-BM-15, TC-BM-33, TC-BM-35, TC-BM-36, TC-BM-41, TC-API-20, TC-API-21, TC-API-36, TC-API-38, TC-API-39.

### FE-11. Duyệt đóng góp

**Mục tiêu:** quản trị viên xem danh sách đóng góp và chuyển trạng thái duyệt.

**Phạm vi:** đăng nhập quản trị, danh sách đóng góp chờ duyệt, đổi trạng thái, khóa tạm sau nhiều lần đăng nhập sai. Hiện chưa có giao diện quản trị; tính năng dùng qua điểm cuối máy chủ dữ liệu.

**Luồng sử dụng:**

1. Gọi điểm cuối đăng nhập bằng thông tin quản trị.
2. Nhận mã truy cập có thời hạn, gửi kèm khi gọi danh sách đóng góp.
3. Đổi trạng thái một đóng góp sang đã duyệt hoặc từ chối.

**Điều kiện chấp nhận:**

- [ ] Không có mã truy cập thì danh sách và thao tác duyệt trả 401.
- [ ] Mã truy cập hết hạn bị từ chối.
- [ ] Sai mật khẩu năm lần liên tiếp khóa tài khoản mười lăm phút.
- [ ] Thời gian phản hồi khi sai tài khoản và sai mật khẩu tương đương nhau.
- [ ] Đổi trạng thái chỉ chấp nhận giá trị trong danh sách cho phép.
- [ ] Thư điện tử người gửi không trả về nguyên văn trong danh sách.

**Kịch bản liên quan:** TC-BM-16, TC-BM-17, TC-BM-18, TC-BM-19, TC-API-22, TC-API-23, TC-API-24, TC-API-25.

### FE-12. Trang thông tin và trợ giúp

**Mục tiêu:** người đọc hiểu về đơn vị biên soạn, cách làm việc và quyền của mình.

**Phạm vi:** trang giới thiệu có người phụ trách, trang câu hỏi thường gặp năm câu, trang chính sách bảo mật, trang cảm ơn.

**Luồng sử dụng:**

1. Mở trang giới thiệu để xem mục tiêu, phương pháp và người phụ trách.
2. Mở trang câu hỏi thường gặp, mở từng câu để đọc.
3. Mở trang chính sách bảo mật để biết dữ liệu nào được thu thập.

**Điều kiện chấp nhận:**

- [ ] Trang giới thiệu có mục tiêu, phương pháp biên soạn và một người phụ trách (Đỗ Tiến Phát) với chân dung, vai trò, tiểu sử và các phần việc phụ trách.
- [ ] Trang câu hỏi có đúng năm câu, mở đóng được, câu trả lời đọc được bằng trình đọc màn hình.
- [ ] Trang chính sách nêu dữ liệu thu thập, mục đích, thời gian lưu, quyền người dùng và cách liên hệ.
- [ ] Trang cảm ơn không nằm trong sơ đồ trang và không được lập chỉ mục.
- [ ] Các trang này có trong chân trang và menu phụ.

**Kịch bản liên quan:** TC-CN-25, TC-CN-26, TC-CN-27, TC-SEO-11, TC-SEO-21.

### FE-13. Trạng thái tải và trang lỗi

**Mục tiêu:** người đọc không gặp màn hình trắng khi dữ liệu chậm hoặc đường dẫn sai.

**Phạm vi:** khung chờ khi tải trang, trang lỗi 404 tùy chỉnh, trang lỗi máy chủ, thông báo khi một khối dữ liệu không tải được.

**Luồng sử dụng:**

1. Mở trang cần tải dữ liệu; khung chờ hiện thay cho nội dung.
2. Nếu đường dẫn sai, trang lỗi 404 hiện lời nhắn và hai liên kết thoát.
3. Nếu một khối lỗi, các khối còn lại vẫn hiện bình thường.

**Điều kiện chấp nhận:**

- [ ] Đường dẫn không tồn tại trả mã 404 thật, không phải chuyển hướng.
- [ ] Trang 404 có liên kết về trang chủ và dòng thời gian.
- [ ] Khung chờ có kích thước ổn định, không làm nội dung nhảy khi tải xong.
- [ ] Lỗi máy chủ hiện trang thân thiện, không lộ vết lỗi hay đường dẫn tệp.
- [ ] Trang lỗi dùng đúng ngôn ngữ đang đọc.

**Kịch bản liên quan:** TC-CN-28, TC-SEO-14, TC-NN-12, TC-API-14.

### FE-14. Tối ưu công cụ tìm kiếm

**Mục tiêu:** mỗi trang được máy tìm kiếm hiểu đúng và chia sẻ lên mạng xã hội có ảnh xem trước.

**Phạm vi:** tiêu đề và mô tả riêng, đường dẫn chuẩn, thẻ liên kết ngôn ngữ, sơ đồ trang, tệp robots, dữ liệu có cấu trúc, ảnh chia sẻ, breadcrumb.

**Luồng sử dụng:**

1. Máy tìm kiếm đọc tệp robots, lấy sơ đồ trang.
2. Thu thập từng trang cùng siêu dữ liệu và dữ liệu có cấu trúc.
3. Người dùng chia sẻ liên kết, mạng xã hội hiện ảnh và mô tả đúng.

**Điều kiện chấp nhận:**

- [ ] Mỗi trang có tiêu đề và mô tả riêng, không trùng giữa các trang.
- [ ] Mỗi trang có đường dẫn chuẩn đúng ngôn ngữ.
- [ ] Hai phiên bản ngôn ngữ trỏ về nhau bằng thẻ liên kết ngôn ngữ.
- [ ] Sơ đồ trang có 122 địa chỉ, không chứa trang cảm ơn và trang quản trị.
- [ ] Tệp robots chặn thư mục máy chủ dữ liệu và trang cảm ơn.
- [ ] Trang hồ sơ đáng đọc có tiêu đề, mô tả riêng và có mặt trong sơ đồ trang ở cả hai ngôn ngữ.
- [ ] Trang chi tiết có dữ liệu có cấu trúc loại bài viết kèm ngày và ảnh.
- [ ] Ảnh chia sẻ hiện đúng chữ tiếng Việt có dấu.

**Kịch bản liên quan:** toàn bộ nhóm TC-SEO.

### FE-15. Bảo mật và quyền riêng tư

**Mục tiêu:** hệ thống bảo vệ dữ liệu người gửi, chống lạm dụng và không lộ thông tin nội bộ.

**Phạm vi:** băm mật khẩu, mã hóa thư điện tử, băm địa chỉ mạng, giới hạn tần suất, giới hạn kích thước yêu cầu, tiêu đề bảo mật, kiểm tra đầu vào, chính sách bảo mật cấp dòng, quản lý bí mật, chặn tác nhân tự động và đường dẫn bị quét, quét bí mật và quét phụ thuộc, rào mềm công cụ kiểm tra của trình duyệt.

**Điều kiện chấp nhận:**

- [ ] Không có mật khẩu, khóa hay chuỗi kết nối trong mã nguồn hay tệp được chia sẻ.
- [ ] Mật khẩu quản trị lưu dưới dạng băm, không thể đảo ngược.
- [ ] Thư điện tử người gửi được mã hóa khi lưu; địa chỉ mạng được băm.
- [ ] Mọi truy vấn dữ liệu dùng tham số, không nối chuỗi.
- [ ] Yêu cầu vượt giới hạn tần suất nhận 429 kèm thời gian thử lại.
- [ ] Yêu cầu vượt kích thước cho phép bị từ chối trước khi đọc toàn bộ thân yêu cầu.
- [ ] Phản hồi có tiêu đề bảo mật: chính sách nội dung, khung nhúng, loại nội dung, chuyển hướng an toàn.
- [ ] Nội dung người dùng nhập được làm sạch trước khi hiển thị.
- [ ] Yêu cầu ghi từ công cụ tự động bị chặn; đường dẫn bị quét phổ biến trả 404; thân không phải JSON bị từ chối khi ghi dữ liệu.
- [ ] Cookie ngôn ngữ có `HttpOnly`, `SameSite=Lax` và `Secure` ở bản phát hành.
- [ ] Bản phát hành chuyển hướng giao thức thường sang giao thức bảo mật ở cả máy chủ dữ liệu và giao diện.
- [ ] Quét bí mật trong mã nguồn và quét lỗ hổng phụ thuộc không còn cảnh báo mức cao.
- [ ] PostgreSQL bật chính sách bảo mật cấp dòng và buộc áp dụng cho chủ sở hữu bảng.
- [ ] Nhật ký không ghi thư điện tử, mật khẩu hay mã truy cập.
- [ ] Rào mềm công cụ kiểm tra của trình duyệt chỉ làm khó, không phải biên an toàn: không kiểm tra máy chủ nào được phép phụ thuộc vào nó, giới hạn tần suất và chặn tác nhân tự động vẫn chạy độc lập; tắt phần chặn này không làm thay đổi kết quả của bất kỳ kịch bản TC-BM nào khác.

**Kịch bản liên quan:** toàn bộ nhóm TC-BM.

### FE-16. Máy chủ dữ liệu

**Mục tiêu:** cung cấp dữ liệu sự kiện, thời kỳ, số liệu, đóng góp và xác thực qua giao diện lập trình ổn định.

**Phạm vi:** các điểm cuối đọc công khai, điểm cuối đóng góp, điểm cuối xác thực và quản trị, kiểm tra trạng thái, tài liệu giao diện.

**Điều kiện chấp nhận:**

- [ ] Danh sách sự kiện trả 200 với đủ 20 bản ghi và siêu dữ liệu phân trang.
- [ ] Kích thước trang được kẹp trong khoảng 1 tới 200, đủ tải trọn bộ 187 sự kiện trong một yêu cầu.
- [ ] Chi tiết theo mã định danh trả 200 hoặc 404, không trả 500.
- [ ] Danh sách thời kỳ và số liệu khớp dữ liệu sự kiện.
- [ ] Điểm cuối kiểm tra trạng thái trả 200 khi cơ sở dữ liệu sẵn sàng.
- [ ] Mọi lỗi trả cấu trúc thống nhất gồm mã lỗi và thông điệp đọc được.
- [ ] Phản hồi chỉ chứa trường cần thiết, không trả toàn bộ thực thể.
- [ ] Tài liệu giao diện mở được ở môi trường phát triển.

**Kịch bản liên quan:** toàn bộ nhóm TC-API.

### FE-17. Đồng bộ dữ liệu dùng chung

**Mục tiêu:** một tệp dữ liệu duy nhất nuôi cả máy chủ và giao diện, tránh lệch nội dung.

**Phạm vi:** tệp dữ liệu dùng chung 187 sự kiện hai ngôn ngữ, nhúng vào máy chủ lúc biên dịch, nhập vào giao diện làm dự phòng, bộ chuyển đổi dùng chung quy tắc.

**Điều kiện chấp nhận:**

- [ ] Sửa tệp dùng chung thì cả hai phía dùng nội dung mới sau khi dựng lại.
- [ ] Số sự kiện ở máy chủ và bộ dự phòng bằng nhau.
- [ ] Tệp dùng chung lưu bằng mã hóa UTF-8 không có ký tự đánh dấu đầu tệp.
- [ ] Thiếu trường bắt buộc trong tệp làm bước dựng thất bại, không âm thầm bỏ qua.
- [ ] Mã định danh sự kiện không trùng và không đổi sau khi đã phát hành.

**Kịch bản liên quan:** TC-API-29, TC-API-30, TC-API-31, TC-API-32.

### FE-18. Đo lường và đồng ý phân tích

**Mục tiêu:** thu thập số liệu truy cập tối thiểu, chỉ khi người đọc đồng ý.

**Phạm vi:** thông báo đồng ý, lưu lựa chọn, chỉ tải mã đo lường sau khi đồng ý, nút thay đổi lựa chọn.

**Điều kiện chấp nhận:**

- [ ] Trước khi đồng ý, không có yêu cầu nào tới máy chủ đo lường.
- [ ] Lựa chọn đồng ý hoặc từ chối được lưu và áp dụng cho lần sau.
- [ ] Có đường mở lại thông báo để đổi lựa chọn.
- [ ] Từ chối đồng ý không làm hỏng bất kỳ chức năng nào.
- [ ] Trang chính sách bảo mật mô tả đúng dữ liệu đo lường thu thập.

**Kịch bản liên quan:** TC-SEO-24, TC-SEO-25, TC-BM-28.

### FE-19. Đóng gói triển khai

**Mục tiêu:** dựng được toàn hệ thống trên máy mới bằng tài liệu và tệp cấu hình kèm theo.

**Phạm vi:** tệp dựng cho giao diện và máy chủ dữ liệu, tệp điều phối dịch vụ, cấu hình máy chủ đảo ngược, tệp mẫu biến môi trường.

**Điều kiện chấp nhận:**

- [ ] Tệp mẫu biến môi trường liệt kê đủ biến bắt buộc, không chứa giá trị thật.
- [ ] Tệp dựng giao diện và máy chủ dựng thành công ở chế độ phát hành.
- [ ] Tệp điều phối khai báo cơ sở dữ liệu, máy chủ dữ liệu, giao diện và máy chủ đảo ngược.
- [ ] Máy chủ đảo ngược chuyển hướng toàn bộ lưu lượng sang giao thức bảo mật.
- [ ] Các dịch vụ chỉ mở cổng cần thiết; cơ sở dữ liệu không lộ ra ngoài.
- [ ] Tệp đọc trước hướng dẫn chạy trên máy sạch theo từng bước.

**Kịch bản liên quan:** TC-BM-31, TC-BM-32, TC-API-35.

### FE-20. Hồ sơ đáng đọc

**Mục tiêu:** người đọc có một lối vào riêng cho những bài phân tích dài, giúp hiểu bối cảnh và hệ quả của sự kiện thay vì chỉ đọc tóm tắt; khi đã chọn quốc gia ưu tiên, hồ sơ của quốc gia đó được đẩy lên đầu.

**Phạm vi:** trang `/stories` và `/en/stories`, bốn hồ sơ mặc định của Việt Nam (Cách mạng Tháng Tám, Chiến dịch Điện Biên Phủ, Xe tăng tiến vào Dinh Độc Lập, Đổi mới), ưu tiên theo cookie `wh-country` (khi đã chọn quốc gia thì chỉ hiển thị sự kiện của quốc gia đó, tối đa ba hồ sơ, không trộn với hồ sơ Việt Nam), dòng ghi chú, lý do đáng đọc riêng, hai đoạn mở đầu, nguồn tham khảo, liên kết tới bài đầy đủ, breadcrumb và dữ liệu có cấu trúc.

**Luồng sử dụng:**

1. Từ thanh điều hướng hoặc chân trang, mở mục Hồ sơ.
2. Đọc phần giới thiệu và lý do đáng đọc của từng hồ sơ.
3. Khi đã chọn quốc gia ở bộ chọn, trang hiển thị dòng ghi chú và chỉ còn hồ sơ của quốc gia đó.
4. Bấm nút đọc bài để mở trang chi tiết đầy đủ, hoặc mở nguồn tham khảo ở thẻ mới.

**Điều kiện chấp nhận:**

- [ ] Chưa chọn quốc gia: trang có đúng bốn hồ sơ của Việt Nam theo thứ tự đã định, không lặp và không thiếu khi máy chủ dữ liệu tắt.
- [ ] Đã chọn quốc gia có sự kiện: dòng ghi chú hiện kèm tên quốc gia; chỉ hiển thị sự kiện của quốc gia đó, tối đa ba hồ sơ, nổi bật trước rồi theo năm tăng dần, không còn hồ sơ Việt Nam.
- [ ] Mỗi hồ sơ có ảnh, ngày tháng, địa điểm, lý do đáng đọc, hai đoạn nội dung đầu và hai nguồn tham khảo.
- [ ] Nguồn tham khảo mở ở thẻ mới và có thuộc tính an toàn.
- [ ] Trang có tiêu đề, mô tả, breadcrumb và dữ liệu có cấu trúc danh sách riêng.
- [ ] Bản tiếng Anh hiển thị đúng nhãn và nội dung tiếng Anh; liên kết điều hướng trỏ đúng tiền tố ngôn ngữ.

**Kịch bản liên quan:** TC-CN-32, TC-CN-33, TC-CN-87, TC-CN-88, TC-CN-89, TC-NN-25, TC-NN-28, TC-NN-41, TC-SEO-29, TC-SEO-30, TC-SEO-32.

### FE-21. Quốc gia ưu tiên

**Mục tiêu:** người đọc ở bất kỳ quốc gia nào cũng thấy lịch sử của nước mình trước tiên, sau đó mới khám phá phần còn lại của thế giới.

**Phạm vi:** bộ chọn quốc gia hoặc khu vực gồm 57 mục trong thanh điều hướng và menu di động, lưu lựa chọn trong cookie `wh-country`, đẩy sự kiện của quốc gia đã chọn lên đầu trang chủ và đầu mỗi nhóm thời kỳ, dòng hướng dẫn chỉ hiện khi chưa chọn, nút bỏ ưu tiên đặt cạnh bộ chọn và trong dải nhắc, nhãn song ngữ.

**Luồng sử dụng:**

1. Người đọc chọn quốc gia hoặc khu vực của mình ở thanh điều hướng hoặc menu di động. Khi chưa chọn, ô chọn hiển thị dòng “Chọn quốc gia”; sau khi chọn, dòng này biến mất và danh sách chỉ còn tên các quốc gia.
2. Website ghi nhớ lựa chọn và tải lại nội dung do máy chủ dựng.
3. Trang chủ hiện khối “Lịch sử {quốc gia}” trước khối nổi bật; trang dòng thời gian đưa sự kiện của quốc gia đó lên đầu từng nhóm thời kỳ.
4. Người đọc bấm “Bỏ ưu tiên” cạnh ô chọn hoặc trong dải nhắc để trở về thứ tự thời gian mặc định; ô chọn quay lại dòng “Chọn quốc gia”.

**Điều kiện chấp nhận:**

- [ ] Danh mục quốc gia phủ đủ mọi quốc gia và khu vực có trong kho dữ liệu, khóa duy nhất, sắp theo tên tiếng Việt.
- [ ] Lựa chọn chỉ được chấp nhận khi khớp danh mục; cookie bị sửa thủ công không làm thay đổi thứ tự hay gây lỗi.
- [ ] Sự kiện của quốc gia đã chọn đứng trước nhưng vẫn giữ thứ tự thời gian tương đối với các sự kiện còn lại.
- [ ] Lựa chọn không phụ thuộc ngôn ngữ: đổi sang tiếng Anh vẫn giữ đúng quốc gia và hiện đúng nhãn tiếng Anh.
- [ ] Cookie `wh-country` chỉ chứa khóa quốc gia, có `SameSite=Lax`, không chứa dữ liệu cá nhân.
- [ ] Bộ chọn dùng được bằng bàn phím, có nhãn đọc cho trình đọc màn hình, không tràn ngang trên màn hình 375 điểm ảnh.
- [ ] Dòng “Chọn quốc gia” chỉ xuất hiện khi chưa chọn nước nào; đã chọn thì danh sách không còn dòng đó và cũng không chọn lại được.
- [ ] Sau khi đã chọn, luôn có nút “Bỏ ưu tiên” ngay cạnh bộ chọn; trang dòng thời gian còn thêm nút này trong dải nhắc.

**Kịch bản liên quan:** TC-CN-36, TC-CN-37, TC-CN-38, TC-CN-39, TC-CN-44, TC-CN-52, TC-NN-29, TC-NN-30, TC-NN-31, TC-BM-43, TC-BM-44, TC-API-04.

### FE-22. Phản hồi chuyển động cho thành phần tương tác

**Mục tiêu:** mỗi thao tác bấm, chạm hoặc chọn đều được trả lời ngay bằng một phản hồi ngắn, để người đọc chắc chắn giao diện đã nhận yêu cầu mà không phải chờ hay nhìn lại chỗ vừa bấm.

**Phạm vi:** nút chính, nút phụ, nút không viền, nút vàng; nút biểu tượng ở thanh điều hướng, nút đổi giao diện, nút chia sẻ, thanh dính đáy; thẻ lọc thời kỳ và thẻ lọc dạng nhỏ; hai nút chuyển chế độ xem; thẻ sự kiện kèm ảnh trong thẻ; ô chọn quốc gia ưu tiên, ô chọn thời kỳ và quốc gia ở trang dòng thời gian, nút bỏ ưu tiên, nút đổi ngôn ngữ. Không gồm: bảng tùy chọn do hệ điều hành vẽ, bản đồ cùng điểm đánh dấu của bản đồ, hiệu ứng xuất hiện khi cuộn trang.

**Luồng sử dụng:**

1. Người đọc rê chuột lên thẻ sự kiện: viền chuyển sang sắc vàng nhạt, thẻ nâng 2 điểm ảnh, ảnh trong thẻ phóng 1,05 lần trong khung bị cắt của thẻ.
2. Người đọc giữ tay trên một nút hoặc một thẻ: phần tử thu nhẹ rồi bật lại ngay khi thả, kể cả khi thả ra ngoài phần tử.
3. Người đọc chạm trên điện thoại: phản hồi thu vẫn chạy như với chuột, nhưng sau khi nhấc tay không còn trạng thái rê dở nào.
4. Người đọc đổi quốc gia trong ô chọn: viền ô phát một vòng sáng ngắn báo lựa chọn đã được ghi, sau đó trang tải lại nội dung đã sắp xếp lại.

**Điều kiện chấp nhận:**

- [ ] Mọi thời lượng, đường cong và mức thu lấy từ biến CSS khai báo một lần ở định kiểu toàn cục; không thành phần nào tự đặt số đo riêng cho mình.
- [ ] Phản hồi nhấn dài nhất 130 mili giây; hiệu ứng dài nhất toàn hệ 400 mili giây và chỉ dành cho vòng sáng báo đã đổi ưu tiên.
- [ ] Không phóng to nút hay thẻ chỉ vì con trỏ đi qua; khác biệt khi rê chuột chỉ nằm ở màu, viền, bóng và mức nâng tối đa 2 điểm ảnh.
- [ ] Ảnh trong thẻ sự kiện không bị phóng sẵn ở trạng thái thường; phần phóng luôn bị khung thẻ cắt lại, không tràn sang thẻ bên cạnh.
- [ ] Trên thiết bị chạm, sau khi nhấc tay, không có thẻ, nút hay ảnh nào còn giữ trạng thái khi rê chuột.
- [ ] Ô chọn quốc gia vẫn là danh sách chuẩn của trình duyệt: mở được bằng phím, đủ 57 mục, không bị thay bằng danh sách tự vẽ; phần phản hồi chuyển sang viền ô chọn và nút bỏ ưu tiên.
- [ ] Bật thiết lập giảm chuyển động của hệ điều hành: bỏ hết thu, nâng, phóng, trượt; đổi màu, viền, bóng và pha mờ vẫn chạy ở 150 mili giây; viền tiêu điểm bàn phím vẫn rõ.
- [ ] Khi đang giảm chuyển động, bản đồ vẫn đủ 187 sự kiện (tổng số ghi trên các cụm cộng số điểm lẻ bằng 187), kéo và thu phóng được, hai tên “Hoàng Sa” và “Trường Sa” vẫn bằng tiếng Việt.
- [ ] Không có hiệu ứng lặp vô hạn; mọi hiệu ứng tự kết thúc và trả phần tử về trạng thái thường, gồm cả vòng sáng báo đổi ưu tiên và nút bỏ ưu tiên hiện ra sau đó.
- [ ] Không thêm thư viện hoạt ảnh nào vào dự án; toàn bộ nằm trong định kiểu toàn cục và các tên lớp dùng lại được.

**Kịch bản liên quan:** TC-CN-29, TC-CN-49 đến TC-CN-55.

### FE-23. Trợ năng cho trình đọc màn hình

**Mục tiêu:** người dùng trình đọc màn hình, người dùng bàn phím và người không phân biệt được màu đọc được toàn bộ nội dung và dùng được hết chức năng, không phải bật công tắc nào và không phải dùng bản rút gọn second-class.

**Phạm vi:** liên kết bỏ qua điều hướng, tên vùng, trật tự đề mục, vòng tiêu điểm bàn phím của ô tìm kiếm và trường biểu mẫu, trạng thái của nút đổi giao diện và nút yêu thích, chú thích ảnh, bản thay thế bằng chữ của bản đồ, nhãn Việt hóa các điều khiển Leaflet, thông báo “mở trong tab mới” cho liên kết mở thẻ mới, khối tổng hợp lỗi và quản lý tiêu điểm của biểu mẫu đóng góp, tương phản chữ. Không gồm: chế độ tương phản cao, bảng chữ riêng, phóng chữ do website tự quản (đã có trong trình duyệt), khuông chữ cho người khiếm thị, giao diện quản trị FE-11.

**Luồng sử dụng:**

1. Người dùng mở trang, gõ Tab một lần: liên kết “Bỏ qua và tới nội dung chính” hiện ra ở góc trên trái; Enter nhảy thẳng vào khối bài, không phải nghe lại thanh điều hướng.
2. Người dùng tab qua ô tìm kiếm dạng viên thuốc: vòng sáng màu nhấn ôm theo khung tròn, nhìn thấy được ở cả bản sáng lẫn bản tối.
3. Người dùng đọc bản đồ: khối “Danh sách địa điểm của N sự kiện đang hiển thị” nằm ngay dưới khung bản đồ, mỗi mục là một liên kết mở bài, số thứ tự trùng số trên ghim.
4. Người dùng gửi biểu mẫu thiếu dữ liệu: tiêu điểm tự nhảy vào khối tổng hợp lỗi, khối đọc tên từng trường kèm lý do, mỗi trường lỗi có `aria-invalid` và dòng lỗi được liên kết bằng `aria-describedby`.
5. Người dùng gặp liên kết mở thẻ mới: trình đọc nói “Mở trong tab mới” dù mắt thường không thấy chữ thừa nào.

**Điều kiện chấp nhận:**

- [ ] Không có nút, công tắc hay trang “chế độ đọc” nào; trợ năng là mặc định luôn bật.
- [ ] Mỗi trang có đúng một `h1`, không nhảy bậc đề mục.
- [ ] Liên kết bỏ qua điều hướng là điểm tiêu điểm đầu tiên và trỏ tới `<main>` có `tabindex="-1"`.
- [ ] Mọi phần tử tương tác có nhãn đọc được, lấy từ từ điển và đúng ngôn ngữ đang hiển thị; mọi ảnh tư liệu có chú thích riêng theo ngôn ngữ, ảnh trang trí có `alt=""`.
- [ ] Hoa thị bắt buộc mang `aria-hidden="true"`, có chú giải bằng chữ ở cuối biểu mẫu; tên trường trong cây trợ năng không chứa “*”.
- [ ] Lỗi biểu mẫu không báo bằng màu đơn thuần: có `aria-invalid`, có biểu tượng đi kèm chữ, có khối tổng hợp; không dùng `role="alert"` cho khối tổng hợp.
- [ ] Sau lần gửi thất bại, tiêu điểm nằm trong khối lỗi và cây biểu mẫu không bị dựng lại, nên nội dung đã nhập không mất.
- [ ] Bản đồ có bản thay thế bằng chữ dựng từ cùng một mảng dữ liệu với ghim; đổi bộ lọc thì cả hai đổi theo; điều khiển thu phóng, nút đóng bong bóng và nhãn ghim đều nói tiếng Việt ở trang tiếng Việt.
- [ ] Mọi liên kết `target="_blank"` có đoạn chữ chỉ trình đọc nghe thấy “Mở trong tab mới”; liên kết mở cùng thẻ không bị gán nhãn sai.
- [ ] Nút đổi giao diện báo `aria-pressed` đúng ngay từ lần đọc đầu tiên, kể cả khi tải lại trang ở bản tối.
- [ ] Tương phản chữ nhỏ nhất đạt 4.5:1 ở cả bản sáng và bản tối; vòng tiêu điểm đạt ngưỡng phân biệt với nền.
- [ ] Rào mềm công cụ kiểm tra không làm suy giảm điều hướng: không chặn phím soạn thảo, không chặn Ctrl+A/Ctrl+C, vẫn mở liên kết bằng Tab/Enter và chuột giữa; menu chuột phải bị tắt trên toàn trang (mất lưu ảnh và sao chép nhanh bằng chuột phải là mất mát đã chấp nhận).
- [ ] Không thêm thư viện trợ năng hay thư viện hoạt ảnh nào; chỉ dùng thuộc tính chuẩn và lớp định kiểu có sẵn.
- [ ] Hai tập lệnh `node .tmp/verify-a11y.mjs` và `node .tmp/verify-a11y-2.mjs` đạt 31/31; chưa tính một lượt nghe thật bằng NVDA hoặc VoiceOver, vốn là việc còn mở.

**Kịch bản liên quan:** TC-TN-01 đến TC-TN-39; TC-BM-49 đến TC-BM-52.

### FE-24. Trắc nghiệm ôn tập trên trang sự kiện

**Mục tiêu:** người đọc vừa đọc xong một bài lịch sử có thể tự kiểm tra mức ghi nhớ ngay tại chỗ, không phải rời trang, không cần đăng nhập và không phải tin vào câu hỏi do máy tự bịa.

**Phạm vi:** khối “Trắc nghiệm ghi nhớ” nằm trong trang chi tiết sự kiện, ngay dưới phần từ khóa và trên khối “Cùng năm, thế giới có gì?”. Khối đóng sẵn, chỉ hiện dòng tiêu đề cho tới khi người đọc bấm vào dòng đó hoặc mục “Trắc nghiệm” trong mục lục. Máy chủ dựng sẵn một bộ đề 10–14 mục từ dữ liệu của chính bài: 5 câu hỏi xuôi về năm bắt đầu, thời kỳ, quốc gia hoặc khu vực, địa điểm và ngày; 5 câu hỏi ngược tìm sự kiện theo năm, thời kỳ, quốc gia hoặc khu vực, địa điểm và ngày; tối đa 4 câu xếp thứ tự thời gian (sớm nhất/muộn nhất, gần/xa). Người đọc chọn “5 câu” hoặc “10 câu”, mặc định 5 câu; mỗi lần mở trang, quay lại bài hoặc đổi số câu, trình duyệt chọn ngẫu nhiên một bộ mới từ bộ đề và xáo cả thứ tự câu lẫn thứ tự phương án. Chấm điểm, phản hồi từng câu và nút làm lại chạy hoàn toàn trong trình duyệt. Không gồm: lưu điểm, bảng xếp hạng, tài khoản, câu hỏi do mô hình ngôn ngữ sinh, ngân hàng câu hỏi riêng hay bài kiểm tra nhiều sự kiện.

**Luồng sử dụng:**

1. Người đọc cuộn tới dòng tiêu đề “Trắc nghiệm ghi nhớ” và bấm để mở khối, hoặc bấm mục “Trắc nghiệm” trong mục lục của bài để trang cuộn tới và mở sẵn.
2. Chọn “5 câu” hoặc “10 câu” ở nhóm “Số câu hỏi”; mỗi lần đổi số câu, bộ đề mới được chọn ngẫu nhiên và mọi lựa chọn cũ bị xóa.
3. Chọn một trong bốn phương án ở mỗi câu, rồi bấm “Chấm điểm”.
4. Dòng kết quả hiện số câu đúng; mỗi câu hiện “Chính xác.” hoặc “Chưa đúng.”, câu sai kèm đáp án đúng và một câu giải thích lấy từ dữ liệu bài.
5. Bấm “Làm lại” để xóa lựa chọn và thử lại với đúng bộ đề đang làm; tải lại trang hoặc rời bài rồi quay lại thì nhận bộ đề ngẫu nhiên mới. Không có dữ liệu nào được gửi đi hay lưu lại.

**Điều kiện chấp nhận:**

- [ ] Khối đóng sẵn ở mọi lần tải, chỉ hiện dòng tiêu đề kèm mũi tên; bấm dòng tiêu đề hoặc bấm mục “Trắc nghiệm” trong mục lục thì khối mở ra và câu hỏi mới vào thứ tự đọc; đóng lại bằng phím cách hoặc Enter trên dòng tiêu đề.
- [ ] Nhóm “Số câu hỏi” là `fieldset` có `legend` và hai nút radio “5 câu”/“10 câu”, mặc định chọn “5 câu”; khối hiện đúng số câu đã chọn (5 câu/20 phương án hoặc 10 câu/40 phương án), mỗi câu bốn phương án và đúng một đáp án đúng.
- [ ] Máy chủ dựng bộ đề 10–14 mục gồm 5 câu xuôi, 5 câu ngược và tối đa 4 câu xếp thứ tự thời gian; mọi bài trong kho đều đủ 10 mục nên lựa chọn “10 câu” luôn dùng được. Mỗi lần tải lại, quay lại bài hoặc đổi số câu, trình duyệt chọn ngẫu nhiên bộ mới bằng `crypto.getRandomValues` và xáo cả thứ tự câu lẫn phương án; HTML máy chủ dùng hạt cố định để không lệch thủy hợp, việc ngẫu nhiên hóa chạy sau khi hydrate trong lúc khối còn đóng.
- [ ] Bộ 10 câu không có hai câu trùng nội dung: mỗi họ “sớm nhất”/“muộn nhất” chỉ lấy một biến thể, thứ tự câu và phương án khác nhau giữa các lần mở.
- [ ] Đáp án đúng và câu giải thích lấy trực tiếp từ trường dữ liệu của bài (`startYear`, `era`, `country`, `location`, ngày hiển thị); câu ngược và câu xếp thứ tự cũng lấy dữ liệu sự kiện thật; ba phương án nhiễu lấy từ sự kiện thật khác, không trùng đáp án đúng, không có phương án bịa. Không gọi dịch vụ AI hay nguồn ngoài; cùng một hạt ngẫu nhiên cho ra cùng bộ câu và cùng thứ tự phương án.
- [ ] Năm âm lịch hiển thị “TCN” ở bản tiếng Việt và “BCE” ở bản tiếng Anh; câu hỏi, nút và phản hồi đổi trọn theo ngôn ngữ đang đọc.
- [ ] Chấm khi còn câu trống thì không hiện điểm, báo “Hãy chọn đáp án cho cả 5 câu trước khi chấm.” (hoặc “cả 10 câu” khi chọn 10) và đưa tiêu điểm vào câu còn thiếu; “Làm lại” xóa lựa chọn, ẩn phản hồi, giữ nguyên bộ đề đang làm và đưa tiêu điểm về câu một.
- [ ] Đúng sai không chỉ báo bằng màu: mỗi phương án đã chấm có biểu tượng kèm chữ, và dòng kết quả là vùng `aria-live` nhận tiêu điểm sau khi chấm.
- [ ] Không lưu điểm, không gửi dữ liệu lên máy chủ, không thêm cookie hay khóa lưu trữ nào; tải lại trang là trở về trạng thái chưa chấm với bộ câu mới.
- [ ] Bài không dựng được bộ đề thì ẩn hẳn khối và mục lục tương ứng; câu không gom đủ hai phương án khác nhau bị bỏ thay vì hiện phương án trùng; câu xếp thứ tự thiếu ba mốc so sánh cũng bị bỏ.
- [ ] Ở 320 và 375 điểm ảnh hai lựa chọn số câu nằm gọn một hàng, các phương án xếp một cột, không tràn ngang; ở 1280 và 1440 điểm ảnh khối nằm gọn trong cột nội dung.
- [ ] `npx vitest run tests/event-quiz.test.ts` đạt 14/14 và `node .tmp/verify-quiz.mjs` đạt 24/24.

**Kịch bản liên quan:** TC-CN-72 đến TC-CN-77; TC-NN-32; TC-NN-38; TC-TN-40.

### FE-25. Tuân thủ pháp lý Việt Nam về dữ liệu cá nhân

**Mục tiêu:** người gửi đóng góp biết rõ trang lưu gì, vì sao lưu, liên hệ ai và trong bao lâu thì được trả lời; việc đồng ý là một hành động riêng của họ, không suy ra từ việc bấm nút Gửi.

**Phạm vi:** ô đồng ý trong biểu mẫu đóng góp, trang Chính sách riêng tư và dòng chủ quản ở chân trang. Tên chủ quản lấy từ một khóa duy nhất trong từ điển mỗi ngôn ngữ (`privacy.ownerName`) nên đổi tên thật chỉ cần sửa một chỗ cho mỗi bản. Không gồm: cổng điện tử tiếp nhận quyền riêng tư, lưu bằng chứng đồng ý, hạn chế dữ liệu theo độ tuổi, đánh giá tác động xử lý dữ liệu hay hồ sơ khai báo với cơ quan có thẩm quyền — những mục này còn mở và ghi ở mục 7.

**Luồng sử dụng:**

1. Người đọc mở `/contribute`, điền họ tên, thư điện tử và nội dung; ô “Ô đồng ý lưu dữ liệu” để nguyên trạng thái chưa tích nếu họ đồng ý.
2. Người đọc tích ô đồng ý rồi bấm “Gửi đóng góp”; máy chủ kiểm lại ô này trước khi ghi bất cứ dữ liệu nào.
3. Nếu quên tích, biểu mẫu quay lại kèm khối lỗi liệt kê “Ô đồng ý lưu dữ liệu: Bạn cần tích ô đồng ý trước khi gửi.” và giữ toàn bộ nội dung đã nhập.
4. Người đọc muốn rút yêu cầu, sửa hoặc xóa dữ liệu thì mở `/privacy`, đọc mục “Liên hệ và thời hạn phản hồi” và gửi yêu cầu qua trang đóng góp; thời hạn trả lời ghi theo Điều 5 Nghị định 356/2025/NĐ-CP.

**Điều kiện chấp nhận:**

- [ ] Biểu mẫu có ô đồng ý `name="consent"` đặt riêng, không tích sẵn, nằm dưới các trường nội dung và trên nút Gửi; nhãn nêu rõ mục đích lưu họ tên và thư điện tử là để liên hệ về chính đóng góp đó, kèm liên kết “Đọc Chính sách riêng tư” tới `/privacy` (bản tiếng Anh: `/en/privacy`).
- [ ] Không còn câu gộp kiểu “Bằng việc gửi, bạn đồng ý với Chính sách riêng tư”; đồng ý xử lý dữ liệu chỉ có thể hiện bằng thao tác tích ô.
- [ ] Máy chủ chặn yêu cầu thiếu ô đồng ý: `submitContribution` kiểm `formData.get('consent') === 'on'` và trả mã `VALIDATION` với thông báo đã bản địa hóa, trước cả khi gọi dịch vụ đóng góp. Gỡ thuộc tính `required` trong trình duyệt thì máy chủ vẫn chặn.
- [ ] Sau lần gửi bị chặn, nội dung đã nhập vẫn còn, ô đồng ý vẫn chưa tích, khối lỗi (`role="group"`, `tabIndex={-1}` nên nhận được tiêu điểm) liệt kê “Ô đồng ý lưu dữ liệu: Bạn cần tích ô đồng ý trước khi gửi.”; ô tích được `aria-invalid="true"` và `aria-describedby` trỏ vào `consent-error`.
- [ ] Trang `/privacy` có chín mục, mục đầu là “Chủ quản và đầu mối dữ liệu”: nêu tên chủ quản, hộp thư đầu mối `sukytoancau@gmail.com` và cách gửi yêu cầu; tên chủ quản thay vào biến `{owner}` trong mọi đoạn chính sách, không còn chuỗi `{owner}` thô trên trang.
- [ ] Mỗi mục chính sách có neo khai báo trong từ điển (`chu-quan`, `du-lieu`, `muc-dich`, `bao-mat`, `luu-tru`, `ben-thu-ba`, `cookie`, `quyen`, `lien-he`); mục lục và liên kết chân trang trỏ đúng neo, liên kết cũ `#bao-mat` vẫn tới mục “Cách chúng tôi bảo vệ dữ liệu” dù thứ tự mục thay đổi.
- [ ] Thời hạn phản hồi nêu theo Điều 5 Nghị định 356/2025/NĐ-CP: xác nhận hai ngày làm việc, 10/15 và 15/20 ngày cho hai loại yêu cầu, 20 ngày với yêu cầu xóa và 30 ngày làm giới hạn chung; không còn cam kết “30 ngày làm việc” hay “30 working days”.
- [ ] Chân trang hiển thị dòng “Chủ quản: {tên} · Đầu mối dữ liệu cá nhân: sukytoancau@gmail.com” ở cả hai ngôn ngữ, dùng cùng khóa `privacy.ownerName` với trang chính sách.
- [ ] Bản tiếng Anh phản chiếu đủ các thay đổi: ô đồng ý, mục “Data controller and contact point”, trích dẫn “Article 5 of Decree 356/2025/ND-CP”, dòng “Managed by {owner} …”; bộ kiểm tra từ điển vẫn báo hai tệp khóa khớp nhau.
- [ ] Vùng chạm của ô đồng ý đạt 24×24 điểm ảnh, nhãn gắn `htmlFor="consent"` để bấm vào chữ vẫn tích được; ở 320, 375 và 1440 điểm ảnh biểu mẫu không tràn ngang và ô đồng ý nằm phía trên nút Gửi.
- [ ] `npx vitest run` đạt 82/82 và `node .tmp/verify-legal.mjs 3000 --skip-send` đạt 27/27; phần gửi thật chạy bằng `node .tmp/verify-legal.mjs 3000` (mỗi lần gửi thật tiêu tốn một lượt trong giới hạn tần suất một giờ).

**Kịch bản liên quan:** TC-CN-79 đến TC-CN-81; TC-NN-39; TC-BM-53; TC-TN-42.

### FE-26. Ngày này năm xưa

**Mục tiêu:** người đọc mở trang chủ là thấy ngay những sự kiện trong kho từng diễn ra đúng ngày hôm nay, kèm số năm đã trôi qua, và có trang riêng để xem trọn ngày cùng các kỷ niệm sắp tới.

**Phạm vi:** dải “Ngày này năm xưa” trên trang chủ, trang `/on-this-day` (bản tiếng Anh `/en/on-this-day`), mục “Ngày này” trong thanh điều hướng. Dữ liệu lấy từ trường ngày của 187 sự kiện trong kho, so với ngày hiện tại tính theo giờ Việt Nam; không gọi dịch vụ ngoài. Không gồm: lịch chọn ngày bất kỳ, nhắc hẹn qua thư.

**Luồng sử dụng:**

1. Người đọc mở trang chủ: dải “Ngày này năm xưa” hiện dưới phần mở đầu với tối đa ba sự kiện trùng ngày hôm nay, mỗi thẻ ghi “Cách đây {n} năm”; sự kiện đúng năm nay ghi “Năm nay”.
2. Bấm “Xem tất cả” hoặc mục “Ngày này” trong thanh điều hướng: mở trang riêng có khối “Hôm nay” liệt kê mọi sự kiện trùng ngày và khối “Sắp tới trong 60 ngày” liệt kê các kỷ niệm sắp đến.
3. Ngày hôm nay không trùng sự kiện nào: trang riêng hiện dòng “Hôm nay không có sự kiện nào được ghi ngày”, khối sắp tới vẫn hiện.
4. Bấm thẻ bất kỳ để mở bài sự kiện tương ứng.

**Điều kiện chấp nhận:**

- [ ] Dải trang chủ hiện tối đa ba sự kiện trùng ngày hôm nay, ghi đủ năm và “Cách đây {n} năm” hoặc “Năm nay”; mỗi thẻ mở đúng bài.
- [ ] Trang riêng có đủ hai khối “Hôm nay” và “Sắp tới trong 60 ngày”; khối sắp tới chỉ gồm sự kiện trong 60 ngày tới, sắp theo ngày gần trước, mỗi mục ghi “Kỷ niệm: {title}”.
- [ ] Ngày không có sự kiện trùng vẫn trả trang hợp lệ với dòng “Hôm nay không có sự kiện nào được ghi ngày”, không khung trống, không lỗi.
- [ ] Kết quả tính theo ngày hệ thống và không đổi khi đổi ngôn ngữ; bản `/en/on-this-day` dùng trọn chuỗi tiếng Anh, không sót chuỗi tiếng Việt.
- [ ] Mục “Ngày này” trong thanh điều hướng và menu di động trỏ đúng trang theo ngôn ngữ; ở 320, 375 và 1440 điểm ảnh dải trang chủ và trang riêng không tràn ngang.

**Kịch bản liên quan:** TC-CN-93 đến TC-CN-95.

### FE-27. Chủ đề tuyến bài học

**Mục tiêu:** người đọc muốn học lịch sử theo mạch có thể theo một tuyến đọc được biên tập sẵn, nối các sự kiện đã có trong kho thành hành trình có thứ tự, thay vì tự nhặt bài rời rạc.

**Phạm vi:** trang `/collections` liệt kê sáu tuyến, trang chi tiết mỗi tuyến tại `/collections/{slug}` với lời dẫn song ngữ và danh sách bước có thứ tự, mục “Chủ đề” trong thanh điều hướng. Mỗi tuyến trỏ tới các bài sự kiện đã có trong kho, không tạo nội dung mới. Không gồm: đánh dấu tiến độ tuyến, đề kiểm tra cuối tuyến.

**Luồng sử dụng:**

1. Người đọc mở “Chủ đề” từ thanh điều hướng: thấy sáu thẻ tuyến, mỗi thẻ ghi tên, lời dẫn, số bước và năm khởi đầu.
2. Bấm một thẻ: mở trang tuyến có khối tóm tắt ghi “Tuyến đọc này gồm:” kèm số bước và thời lượng đọc ước tính, rồi danh sách các bước theo thứ tự.
3. Bấm “Bắt đầu tuyến” hoặc bấm một bước: mở bài sự kiện tương ứng.
4. Bấm “Về danh sách chủ đề” để quay lại trang tuyến; bấm “Khám phá dòng thời gian” để sang dòng thời gian.

**Điều kiện chấp nhận:**

- [ ] Trang `/collections` hiện đúng sáu tuyến: Nguồn cội quốc gia, Đại Việt: một nghìn năm độc lập, Những cuộc cách mạng làm thay đổi thế giới, Chiến tranh Lạnh: từ Thế chiến II đến bức tường sụp đổ, Việt Nam từ độc lập đến hội nhập, Những phát minh định hình thế giới.
- [ ] Mỗi thẻ tuyến ghi số bước khớp danh sách bên trong; mỗi bước trỏ tới một bài sự kiện có thật trong kho và mở được.
- [ ] Các bước trong một tuyến sắp theo năm bắt đầu tăng dần, không lặp bài trong cùng tuyến; dòng ghi chú “Đọc theo thứ tự từ trên xuống để theo mạch câu chuyện.” hiện trước danh sách.
- [ ] Trang tuyến ở bản tiếng Anh `/en/collections/{slug}` dùng trọn tên, lời dẫn và nhãn tiếng Anh; số bước và thứ tự hai ngôn ngữ giống nhau.
- [ ] Ở 320, 375 và 1440 điểm ảnh thẻ tuyến và danh sách bước không tràn ngang; mục “Chủ đề” trong menu di động trỏ đúng trang theo ngôn ngữ.

**Kịch bản liên quan:** TC-CN-96 đến TC-CN-98.

### FE-28. Thanh trượt thời gian trên bản đồ

**Mục tiêu:** người đọc nhìn bản đồ có thể kéo một thanh trượt để chỉ xem các sự kiện tính tới một năm chặn trên, quan sát lịch sử trải ra theo không gian lẫn thời gian mà không phải dựng lại trang.

**Phạm vi:** thanh trượt nằm dưới khung bản đồ trên trang chủ và trong chế độ bản đồ của trang dòng thời gian. Kéo thanh chỉ lọc điểm đánh dấu theo năm bắt đầu, không dựng lại bản đồ; bỏ lọc đưa về toàn thời gian. Không gồm: hoạt ảnh trượt điểm, thanh trượt khoảng năm hai đầu.

**Luồng sử dụng:**

1. Người đọc mở chế độ bản đồ của trang dòng thời gian: dưới khung bản đồ có thẻ “Thanh trượt thời gian” ghi năm đang chọn.
2. Kéo thanh sang trái: chỉ còn điểm của sự kiện có năm bắt đầu nhỏ hơn hoặc bằng năm chọn, dòng năm cập nhật theo tay; kéo về hết bên phải nghĩa là “Toàn thời gian”.
3. Bấm “Bỏ lọc năm” để trở về toàn bộ điểm.
4. Trên trang chủ, thanh trượt của bản đồ hoạt động độc lập trong khung đó, không ảnh hưởng bộ lọc dòng thời gian.

**Điều kiện chấp nhận:**

- [ ] Thanh trượt hiện khi bản đồ có ít nhất hai mốc năm khác nhau; giá trị chạy từ năm nhỏ nhất tới năm lớn nhất của các điểm đang hiển thị, bước 1.
- [ ] Kéo thanh lọc điểm ngay theo năm chọn: điểm có năm bắt đầu lớn hơn năm chọn biến mất, số cụm và danh sách địa điểm bên dưới cập nhật cùng một mảng dữ liệu; không tải lại trang, không dựng lại bản đồ.
- [ ] Dòng năm hiện “Năm {year}” khi đang lọc và “Toàn thời gian” khi kéo về hết bên phải; nút “Bỏ lọc năm” chỉ hiện khi đang lọc và bấm một lần là về toàn thời gian.
- [ ] Thanh trượt trên trang dòng thời gian và bản đồ trang chủ không ảnh hưởng lẫn nhau; bộ lọc thời kỳ, quốc gia và từ khóa vẫn hoạt động bình thường khi đang lọc năm.
- [ ] Nhãn, dòng năm và nút bỏ lọc dùng chuỗi từ điển đúng ngôn ngữ; ở 320 và 390 điểm ảnh thanh trượt cao không dưới 44 điểm ảnh, bấm kéo được bằng ngón tay, không tràn ngang.
- [ ] Khi đang giảm chuyển động, thanh trượt vẫn dùng được và bản đồ vẫn đủ 187 sự kiện ở mức toàn thời gian.

**Kịch bản liên quan:** TC-CN-99, TC-CN-100.

### FE-29. Lưu sự kiện và trang ôn tập

**Mục tiêu:** người đọc gặp bài hay có thể lưu lại để đọc sau, và xem lại được tiến độ trắc nghiệm của mình ở một nơi tập trung, không cần tài khoản.

**Phạm vi:** nút lưu trên trang sự kiện, mục “Ôn tập” (biểu tượng trái tim) trong thanh điều hướng và menu di động, trang `/study` (bản tiếng Anh `/en/study`) gồm khối “Sự kiện đã lưu” và khối “Tiến độ ôn tập trắc nghiệm”. Danh sách lưu, kết quả trắc nghiệm và lựa chọn chế độ xem nằm trong bộ nhớ cục bộ của trình duyệt, không gửi lên máy chủ. Kết quả trắc nghiệm ghi từ lần nộp của FE-24: tỉ lệ đúng cao nhất, số lần làm, điểm lần gần nhất và ngày nộp. Không gồm: tài khoản, đồng bộ nhiều thiết bị, danh sách lưu chia thư mục.

**Luồng sử dụng:**

1. Người đọc bấm nút lưu trên trang sự kiện: nút chuyển sang trạng thái đã lưu; bấm lần nữa để bỏ lưu.
2. Bấm biểu tượng trái tim trên thanh điều hướng: mở `/study` với khối “Sự kiện đã lưu” liệt kê các bài đã lưu kèm nút “Bỏ lưu”.
3. Làm một bài trắc nghiệm ở FE-24 rồi quay lại `/study`: khối “Tiến độ ôn tập trắc nghiệm” liệt kê từng bài đã làm với ba nhãn “Cao nhất: {percent}%”, “{count} lần làm” và “Gần nhất: {date}”, sắp theo lần nộp gần nhất trước.
4. Xóa bộ nhớ trình duyệt thì cả hai khối trở về trống; dữ liệu không hề rời khỏi máy.

**Điều kiện chấp nhận:**

- [ ] Nút lưu có nhãn đọc màn hình “Lưu sự kiện”/“Bỏ lưu sự kiện” đúng trạng thái, giữ nguyên sau khi tải lại trang; bấm lại thì bỏ lưu.
- [ ] Trang `/study` chỉ hiển thị dữ liệu sau khi gắn kết ở trình duyệt, không lệch giữa bản dựng máy chủ và bản chạy thật; khi chưa có dữ liệu, mỗi khối hiện dòng trống kèm nút dẫn tới dòng thời gian hoặc một bài viết.
- [ ] Khối “Sự kiện đã lưu” giữ thứ tự lưu, không hiện bài trùng, mỗi thẻ mở đúng bài và nút “Bỏ lưu” gỡ ngay khỏi danh sách.
- [ ] Khối “Tiến độ ôn tập trắc nghiệm” ghi đúng tỉ lệ cao nhất (so được giữa đề 5 câu và 10 câu), số lần làm, điểm và ngày lần gần nhất; danh sách sắp theo lần nộp gần nhất trước.
- [ ] Mọi dữ liệu chỉ nằm trong kho lưu trữ cục bộ `wh-history-preferences`; bảng điều khiển mạng không ghi yêu cầu nào gửi lên máy chủ từ trang này.
- [ ] Bản `/en/study` dùng trọn chuỗi tiếng Anh; ở 320, 375 và 1440 điểm ảnh hai khối không tràn ngang, nút “Bỏ lưu” bấm được bằng ngón tay.
- [ ] `npx vitest run tests/store.test.ts` đạt 9/9 và `npx vitest run` đạt 121/121.

**Kịch bản liên quan:** TC-CN-101 đến TC-CN-103.

### FE-30. Đọc tiếp theo và chuỗi nhân quả

**Mục tiêu:** người đọc đọc xong một bài có ngay các bài gần gũi để đọc tiếp, và với các mốc nằm trong chuỗi biên tập thì theo được mạch nguyên nhân – hệ quả từ bước trước tới bước sau.

**Phạm vi:** khối “Sự kiện liên quan” ở cuối trang sự kiện được bổ sung gợi ý tính từ dữ liệu (cùng thời kỳ, cùng quốc gia, cùng chủ đề, gần về thời gian) khi bài không đủ ba liên kết biên tập; khối “Chuỗi nhân quả” hiện giữa khối cùng năm và khối nguồn khi bài nằm trong một trong ba chuỗi: “Từ Bắc thuộc đến độc lập”, “Bức tường Berlin trong Chiến tranh Lạnh”, “Chạy đua vũ trụ”. Mỗi bước trong chuỗi là một bài có nguồn kiểm chứng riêng. Không gồm: lịch sử đọc cá nhân hóa, theo dõi hành vi.

**Luồng sử dụng:**

1. Người đọc cuộn cuối bài: khối “Sự kiện liên quan” hiện tối đa ba bài; bài do biên tập chọn hiện trước, chỗ thiếu được lấp bằng bài gợi ý tính từ dữ liệu kèm nhãn lý do như “Cùng thời kỳ”, “Cùng quốc gia”, “Cùng chủ đề”, “Gần về thời gian”.
2. Bài nằm trong chuỗi: khối “Chuỗi nhân quả” hiện dưới khối cùng năm, liệt kê các bước theo thứ tự thời gian; bước đang đọc được đánh dấu “Sự kiện hiện tại”, các bước còn lại là liên kết.
3. Bấm mục “Chuỗi liên quan” trong mục lục để cuộn tới khối.
4. Bấm một bước bất kỳ để mở bài của bước đó.

**Điều kiện chấp nhận:**

- [ ] Khối “Sự kiện liên quan” luôn đủ ba bài khi kho còn ứng viên, không trùng nhau, không trỏ về chính bài đang đọc và không trùng bài đã hiện ở khối “Cùng năm”.
- [ ] Bài gợi ý tính từ dữ liệu mang đúng một nhãn lý do; thứ tự ưu tiên: biên tập chọn trước, rồi theo điểm tương đồng (cùng thời kỳ, cùng quốc gia, cùng chủ đề, gần về thời gian), điểm bằng nhau thì ưu tiên năm gần hơn.
- [ ] Khối “Chuỗi nhân quả” chỉ hiện ở bài thuộc chuỗi; các bước sắp theo năm tăng dần, bước đang đọc đánh dấu `aria-current="step"` và ghi “Sự kiện hiện tại”, các bước khác mở đúng bài.
- [ ] Mục lục chỉ thêm mục “Chuỗi liên quan” khi bài có chuỗi; bấm mục này trang cuộn tới khối; nhãn “Bước {n}” của từng liên kết chỉ trình đọc màn hình nghe thấy.
- [ ] Mọi chuỗi dùng dữ liệu song ngữ; bản tiếng Anh dùng trọn chuỗi tiếng Anh và các bước vẫn trỏ đúng bài ở `/en/event/…`.
- [ ] `npx vitest run tests/related-events.test.ts` đạt 6/6 và `npx vitest run tests/history-chains.test.ts` đạt 6/6.

**Kịch bản liên quan:** TC-CN-104, TC-CN-105.

### FE-31. In bài và nguồn cấp RSS

**Mục tiêu:** người đọc muốn giữ bài dưới dạng giấy hoặc tệp có thể in bài gọn gàng; người dùng trình đọc tin theo dõi được kho sự kiện qua một nguồn cấp RSS hợp lệ.

**Phạm vi:** nút “In bài viết” trên trang sự kiện (gọi lệnh in của trình duyệt), định kiểu in ẩn thanh điều hướng, chân trang và các khối tương tác (trắc nghiệm, bản đồ, chia sẻ, kêu gọi, trước/sau), nguồn cấp `/feed.xml` và liên kết “Nguồn cấp RSS” ở chân trang, khai báo `application/rss+xml` trong đầu trang. Không gồm: xuất EPUB hay PDF dựng sẵn, bản tin qua thư.

**Luồng sử dụng:**

1. Người đọc bấm nút máy in cạnh các nút chia sẻ: hộp thoại in của trình duyệt mở; bản in chỉ còn tiêu đề và nội dung bài, không có thanh điều hướng, chân trang hay các nút tương tác.
2. Người dùng trình đọc tin thêm `/feed.xml`: nhận 187 mục, mỗi mục trỏ tới một bài sự kiện, sắp từ sự kiện mới nhất trở về cũ.
3. Bấm “Nguồn cấp RSS” ở chân trang để mở nguồn cấp; máy đọc tin tự phát hiện qua thẻ `alternate` trong đầu trang.

**Điều kiện chấp nhận:**

- [ ] Nút in có nhãn “In bài viết”, vùng chạm đạt chuẩn, ẩn khỏi bản in; bấm gọi đúng lệnh in của trình duyệt.
- [ ] Bản in ẩn thanh điều hướng, chân trang, menu, khối trắc nghiệm, khối bản đồ, nút chia sẻ, khối kêu gọi và khối sự kiện trước/sau; nội dung bài in trên nền trắng, chữ tối, liên kết không gạch chân màu.
- [ ] `/feed.xml` trả mã 200 với kiểu `application/rss+xml`, đủ 187 mục, mỗi mục có `title`, `link`, `guid` và `pubDate`; sắp theo năm bắt đầu giảm dần; chữ `&`, `<`, `>` trong tiêu đề và tóm tắt được thoát đúng.
- [ ] Nguồn cấp chỉ có một bản tiếng Việt và không gắn tiền tố ngôn ngữ; liên kết “Nguồn cấp RSS” ở chân trang trỏ đúng `/feed.xml` ở cả hai bản ngôn ngữ; đầu trang khai báo `application/rss+xml`.
- [ ] Nguồn cấp không lộ thư điện tử hay bí mật nào; thẻ nguồn cấp không làm tăng dung lượng trang.
- [ ] `npx vitest run tests/rss-feed.test.ts` đạt 4/4.

**Kịch bản liên quan:** TC-CN-106, TC-CN-107.

## 4. Ma trận truy vết

| Tính năng | Phiên bản | Kịch bản kiểm thử |
| --- | --- | --- |
| FE-01 | 0.1.0 | TC-CN-02, TC-CN-03, TC-CN-04, TC-CN-29, TC-CN-30, TC-CN-66, TC-NN-05 |
| FE-02 | 0.1.0 | TC-CN-05, TC-CN-06, TC-BM-24 |
| FE-03 | 0.1.0 | TC-NN-01 đến TC-NN-36 |
| FE-04 | 0.2.0 | TC-CN-01, TC-CN-02, TC-CN-36, TC-API-12, TC-API-13 |
| FE-05 | 0.2.0 | TC-CN-07, TC-CN-08, TC-CN-11, TC-CN-12, TC-CN-13, TC-CN-14, TC-CN-37, TC-CN-38, TC-CN-67 |
| FE-06 | 0.2.0 | TC-CN-09, TC-CN-10, TC-CN-11, TC-CN-12, TC-CN-13 |
| FE-07 | 0.3.0 | TC-CN-14, TC-CN-15, TC-CN-40, TC-CN-41, TC-CN-42, TC-CN-43, TC-CN-45, TC-CN-46, TC-CN-47, TC-CN-48, TC-CN-56, TC-CN-57, TC-CN-58, TC-CN-59, TC-CN-60, TC-NN-26, TC-BM-26, TC-SEO-16 |
| FE-08 | 0.2.0 | TC-CN-16, TC-CN-17, TC-CN-31, TC-CN-35, TC-CN-61 đến TC-CN-69, TC-SEO-05, TC-SEO-18, TC-SEO-31, TC-API-09 |
| FE-09 | 0.2.0 | TC-CN-18, TC-CN-19, TC-BM-24 |
| FE-10 | 0.3.0 | TC-CN-20 đến TC-CN-24, TC-CN-34, TC-CN-78, TC-BM-14, TC-BM-15, TC-BM-33, TC-BM-35, TC-BM-36, TC-BM-41, TC-API-20, TC-API-21, TC-API-36, TC-API-38, TC-API-39 |
| FE-11 | 0.3.0 | TC-BM-16 đến TC-BM-19, TC-API-22 đến TC-API-25 |
| FE-12 | 0.3.0 | TC-CN-25, TC-CN-26, TC-CN-27, TC-SEO-11, TC-SEO-21 |
| FE-13 | 0.3.0 | TC-CN-28, TC-SEO-14, TC-NN-12, TC-API-14 |
| FE-14 | 0.3.0 | TC-SEO-01 đến TC-SEO-33 |
| FE-15 | 0.3.0 | TC-BM-01 đến TC-BM-52 |
| FE-16 | 0.1.0 | TC-API-01 đến TC-API-42 |
| FE-17 | 0.1.0 | TC-API-29 đến TC-API-32 |
| FE-18 | 0.3.0 | TC-SEO-24, TC-SEO-25, TC-BM-28 |
| FE-19 | 1.0.0 | TC-BM-31, TC-BM-32, TC-API-35 |
| FE-20 | 1.1.0 | TC-CN-32, TC-CN-33, TC-NN-25, TC-NN-28, TC-SEO-29, TC-SEO-30, TC-SEO-32 |
| FE-21 | 1.2.0 | TC-CN-36, TC-CN-37, TC-CN-38, TC-CN-39, TC-CN-44, TC-CN-52, TC-NN-29, TC-NN-30, TC-NN-31, TC-BM-43, TC-BM-44 |
| FE-22 | 1.3.0 | TC-CN-29, TC-CN-49, TC-CN-50, TC-CN-51, TC-CN-52, TC-CN-53, TC-CN-54, TC-CN-55 |
| FE-23 | 1.4.0 | TC-TN-01 đến TC-TN-39 |
| FE-24 | 1.5.0 | TC-CN-72 đến TC-CN-77, TC-NN-32, TC-NN-38, TC-TN-40 |
| FE-25 | 1.6.0 | TC-CN-79 đến TC-CN-81, TC-NN-39, TC-BM-53, TC-TN-42 |
| FE-26 | 1.7.0 | TC-CN-93 đến TC-CN-95 |
| FE-27 | 1.7.0 | TC-CN-96 đến TC-CN-98 |
| FE-28 | 1.7.0 | TC-CN-99, TC-CN-100 |
| FE-29 | 1.7.0 | TC-CN-101 đến TC-CN-103 |
| FE-30 | 1.7.0 | TC-CN-104, TC-CN-105 |
| FE-31 | 1.7.0 | TC-CN-106, TC-CN-107 |

## 5. Quy ước đặt tên phiếu

Tên phiếu theo mẫu: `[Mã tính năng] Động từ + đối tượng + ngữ cảnh`.

Ví dụ đúng:

- `[FE-05] Lọc dòng thời gian theo thời kỳ và khoảng năm`
- `[FE-10] Chặn gửi đóng góp khi nội dung dưới 20 ký tự`
- `[FE-14] Thêm thẻ liên kết ngôn ngữ cho trang chi tiết`

Ví dụ sai:

- `Sửa lỗi` — thiếu mã và đối tượng.
- `[FE-05] Làm bộ lọc` — không nói rõ kết quả mong đợi.
- `[FE-10] Gửi form` — dùng từ tiếng Anh.

Quy ước trường:

- **Tóm tắt:** một câu, tối đa 90 ký tự, bắt đầu bằng mã tính năng.
- **Mô tả:** mục tiêu, phạm vi, điều kiện chấp nhận lấy từ tài liệu này, thêm liên kết tới kịch bản kiểm thử.
- **Loại phiếu:** dùng bốn loại có sẵn là Câu chuyện, Công việc, Lỗi, Phụ.
- **Nhãn:** mỗi phiếu có một nhãn tính năng dạng `fe-05` và một nhãn loại việc như `giao-dien`, `may-chu`, `kiem-thu`, `tai-lieu`, `ha-tang`.
- **Thành phần:** chọn theo khu vực chịu trách nhiệm: Giao diện, Máy chủ dữ liệu, Cơ sở dữ liệu, Bảo mật, Kiểm thử, Hạ tầng.
- **Ước lượng:** chỉ dùng S, M, L ghi trong mô tả; không bật trường ước lượng theo giờ.
- **Liên kết:** phiếu lỗi phải liên kết tới phiếu tính năng gốc và tới báo cáo lỗi tương ứng trong thư mục `báo_cáo_lỗi`.

## 6. Điều kiện hoàn thành của một phiếu

Một phiếu chỉ chuyển sang Hoàn thành khi thỏa đủ sáu điểm sau:

1. Mã nguồn đã được người khác đọc lại.
2. Có ít nhất một bài kiểm thử tự động hoặc một kịch bản kiểm thử thủ công đi kèm.
3. Điều kiện chấp nhận trong tài liệu này được đánh dấu đã kiểm tra.
4. Không làm hỏng chức năng lân cận, đã chạy lại bộ kiểm thử liên quan.
5. Tài liệu hướng dẫn hoặc kịch bản kiểm thử được cập nhật nếu hành vi thay đổi.
6. Không có thông tin bí mật trong mã nguồn, nhật ký hay ảnh chụp màn hình.

## 7. Việc còn mở

- Chưa có giao diện quản trị cho FE-11; hiện chỉ dùng được qua giao diện lập trình. Khi bổ sung giao diện, cần thêm kịch bản kiểm thử riêng cho màn hình duyệt.
- Nền bản đồ do dự án tự vẽ từ dữ liệu phạm vi công cộng, độ chính xác đường bờ biển dừng ở mức bản đồ thế giới thu nhỏ. Nếu cần hiển thị địa hình hay đường phố, phải chọn nguồn có giấy phép phù hợp và vẫn giữ bộ tên địa danh tiếng Việt do dự án kiểm soát.
- Chưa có bản dựng thử bằng Docker trong môi trường phát triển hiện tại, nên FE-19 mới được kiểm tra cú pháp và cấu hình, chưa chạy trọn bộ.
- Hai phần của FE-22 còn để trống chủ ý: biểu tượng mặt trời và mặt trăng trong nút đổi giao diện vẫn hoán đổi tức thì (muốn làm mượt phải giữ cả hai biểu tượng trên cây nội dung), và danh sách sự kiện vẫn thay đổi thứ tự ngay khi chọn quốc gia (muốn các thẻ trượt sang chỗ mới phải thêm cơ chế đo vị trí cũ, dễ va chạm với phần giữ cuộn). Cả hai chỉ là việc thẩm mỹ, không ảnh hưởng chức năng.
- FE-23 mới được xác minh bằng cây trợ năng của Chrome, định kiểu tính toán và phím mô phỏng (TC-TN-01 đến TC-TN-35). Chưa có lượt nghe thật bằng NVDA hay VoiceOver, tức các mã TC-TN-36 đến TC-TN-39, nên chưa loại trừ được hai vấn đề chỉ lộ ra khi nghe: thứ tự và nhịp thông báo của khối lỗi, cách trình đọc đọc một danh sách 187 mục.
- Rào mềm công cụ kiểm tra của trình duyệt (TC-BM-49 đến TC-BM-52) chỉ chặn được phím tắt ở lớp sự kiện. Người dùng biết nghề vẫn mở được công cụ bằng menu của trình duyệt; đây là giới hạn của website nói chung, không phải lỗi cần sửa.
- FE-25 mới đóng ba mục ưu tiên cao trong báo cáo rà soát pháp lý `docs_and_qa/rà_soát_pháp_lý/rà_soát_pháp_lý_2026-11-03.md`. Tên chủ quản đang để là “Sử Ký Toàn Cầu”; trước khi công bố rộng phải thay bằng tên thật (cá nhân hoặc tổ chức đã đăng ký) trong khóa `privacy.ownerName` của `frontend/src/locales/vi.json` và `frontend/src/locales/en.json`.
- Bốn mục ưu tiên trung bình của FE-25 còn mở, xếp theo thứ tự nên làm: chưa có control để người gửi rút hoặc sửa đồng ý sau khi đã gửi; chưa lưu bằng chứng đồng ý (ai, lúc nào, nội dung nào được hiển thị); chưa có hạn chế tự động hai mươi tháng và điểm xóa dữ liệu theo yêu cầu; chính sách chưa tách riêng mục dữ liệu nhạy cảm cùng chi tiết quyền của người có dữ liệu.
- Nếu bật Google Analytics, việc chuyển dữ liệu ra ngoài Việt Nam cần ghi rõ và cập nhật mục “Bên thứ ba” trong chính sách; hiện mặc định chưa bật nên chưa phát sinh nghĩa vụ khai báo chuyển dữ liệu xuyên biên giới.
