# Trợ năng cho trình đọc màn hình

Tài liệu này mô tả cách website bảo đảm người dùng trình đọc màn hình, người dùng bàn phím và người dùng không phân biệt được màu vẫn đọc và dùng được toàn bộ nội dung. Kịch bản kiểm thử thủ công đi kèm nằm ở `kịch_bản_kiểm_thử/trợ_năng.md`.

## 1. Nguyên tắc

- **Không có “chế độ đọc” bật tắt được.** Trợ năng là mặc định của trang, luôn bật, không ai phải tìm công tắc hay tải thêm bảng chữ. Vì vậy không tồn tại nút chuyển chế độ nào trên giao diện.
- **Dùng cơ chế chuẩn, không tự chế.** Nhãn ARIA, đề mục, landmark, liên kết bỏ qua điều hướng, thuộc tính `aria-describedby` và `aria-invalid` là những thứ trình đọc màn hình đã hiểu. Không lớp phủ riêng, không khuông chữ riêng, không bảng chữ giả lập.
- **Không lấy màu làm dấu hiệu duy nhất.** Trường bắt buộc có dấu `*` kèm chú giải; trường lỗi có `aria-invalid`, có chữ mô tả và có biểu tượng, viền đỏ chỉ là phần phụ.
- **Mọi nhãn đọc được lấy từ từ điển.** Không để chuỗi tiếng Anh cứng trong trang tiếng Việt, kể cả các nhãn do thư viện bản đồ sinh ra.
- **Nội dung đồ họa phải có bản bằng chữ.** Bản đồ, ảnh và biểu tượng đều có chữ tương đương mà người không nhìn vẫn đọc được.
- **Không làm suy giảm bảo mật hay hiệu năng để đổi lấy trợ năng.** Các sửa đổi nằm trong lớp định kiểu có sẵn và thuộc tính trên phần tử đang tồn tại.

## 2. Cách triển khai

### 2.1. Landmark và liên kết bỏ qua điều hướng

`frontend/src/app/layout.tsx` đặt một liên kết `href="#main-content"` làm điểm nhận tiêu điểm đầu tiên của trang; nhãn lấy từ `common.skipToContent` (“Bỏ qua và tới nội dung chính”). Phần tử `<main id="main-content">` mang `tabIndex={-1}` nên trình đọc dừng đúng vào khối nội dung thay vì đọc lại thanh điều hướng.

Các vùng được đặt tên bằng `aria-label` trong từ điển `a11y`: `mainNav` cho điều hướng desktop, `mobileNav` cho bảng điều hướng di động, `breadcrumb` cho đường dẫn chỉ vị trí, `search` cho ô tìm kiếm, `logo` cho liên kết về trang chủ, `map` cho khung bản đồ. Khóa `a11y.timeline` hiện không dùng ở đâu; giữ lại chỉ là dữ liệu từ điển thừa, không ảnh hưởng nội dung đọc được.

### 2.2. Trật tự đề mục

Mỗi trang có đúng một `h1`; các khối con xuống `h2`, chi tiết trong khối xuống `h3`, không nhảy bậc. Trang có nhiều đề mục cùng cấp (dòng thời gian theo thời kỳ, danh sách sự kiện liên quan) giữ nguyên cấp `h2`/`h3` thay vì lồng sâu để “đẹp mã”.

### 2.3. Vòng tiêu điểm bàn phím

Bốn ô tìm kiếm của dự án chia làm hai kiểu. Ba ô dạng viên thuốc (khối mở đầu trang chủ, trang lỗi 404 và ô trên thanh điều hướng máy tính) đặt `outline-none` trên bản thân `<input>` vì ô nằm lọt trong khung bo tròn; nếu không có gì thay thế, người dùng bàn phím không còn nhìn thấy vị trí tiêu điểm. Hai ô còn lại (`#timeline-search`, `#mobile-search`) đã dùng lớp `field` nên nhận quy định chung. Hai quy định lớp thành phần trong `frontend/src/app/globals.css` bao trùm cả hai nhóm:

```css
.search-pill:focus-within { outline: 2px solid rgb(var(--color-accent)); outline-offset: 2px; }
.field:focus-visible { outline: 2px solid rgb(var(--color-accent)); outline-offset: 2px; }
```

Vòng sáng lấy màu nhấn nên đọc được ở cả bản sáng lẫn bản tối, và nằm ngoài biên phần tử nên không bị khung viên thuốc che. Khối tổng hợp lỗi của biểu mẫu đóng góp cũng có `focus-visible:outline-2 focus-visible:outline-offset-2` vì nó nhận tiêu điểm sau khi gửi thất bại.

### 2.4. Trạng thái của nút đổi giao diện

`frontend/src/components/ui/theme-toggle.tsx` giữ một tham chiếu tới nút và đồng bộ `aria-pressed` mỗi lần trạng thái đổi, bao gồm cả lần đọc đầu tiên từ lớp `dark` đã có trên thẻ `<html>` khi máy chủ dựng trang. Người dùng trình đọc màn hình vì thế biết đang ở giao diện tối hay sáng, không chỉ đoán qua biểu tượng.

### 2.5. Biểu mẫu đóng góp

`frontend/src/components/contribute/contribution-form.tsx` áp năm điểm:

1. **Chú giải dấu bắt buộc.** Dòng `requiredLegend` (“Dấu * đánh dấu thông tin bắt buộc.”) đặt cuối biểu mẫu, sát nút gửi, nên người đọc thấy quy ước trước khi gặp trường lỗi.
2. **Dấu `*` không dính vào tên.** Hoa thị là phần tử `aria-hidden="true"`, nhờ đó tên trường đọc là “Họ và tên” chứ không phải “Họ và tên *”. Màu đỏ của hoa thị không còn là dấu hiệu duy nhất.
3. **Mô tả luôn hiện diện.** Mỗi trường có `aria-describedby` trỏ tới phần mô tả (`email-hint`) và, khi có lỗi, tới cả dòng lỗi (`email-error`), nên trình đọc đọc đủ “gợi ý + lỗi” một mạch.
4. **Khối tổng hợp lỗi khi gửi thất bại.** Theo kiểu của trụ sở chính phủ Anh: khối `<div role="group" aria-labelledby>` đứng đầu biểu mẫu, có tiêu đề, danh sách từng trường kèm lý do, biểu tượng cảnh báo `aria-hidden` (biểu tượng chỉ minh họa, chữ mới là nội dung).
5. **Con trỏ được đưa về khối lỗi.** Sau mỗi lần gửi thất bại, `useEffect` gọi `focus()` lên khối qua `useRef`. Nếu không, người dùng bàn phím bị bỏ lại tại nút gửi vừa mất tác dụng.

Ba điểm phụ tránh lỗi thường gặp:

- **Không dùng `role="alert"` cho khối tổng hợp.** `role="alert"` tự thông báo ngay khi xuất hiện và sẽ đọc chồng lên phần mô tả của từng trường; khối này dùng `role="group"` và được tiêu điểm chủ động nên chỉ đọc một lần.
- **Bỏ `key={state.attempt}` trên `<form>`.** Trước đây mỗi lần gửi lại làm mới cây nội dung của biểu mẫu khiến toàn bộ trường mất tiêu điểm và mất trạng thái. Việc giữ cây cũng giúp tên trường không bị đọc lại từ đầu.
- **`noValidate` không được bật.** Trình duyệt vẫn kiểm dữ liệu thiếu ở lớp đầu, máy chủ kiểm lại toàn bộ; hai lớp này bổ sung cho nhau, không thay thế nhau.

Dưới biểu mẫu, thẻ “Gửi trực tiếp qua thư điện tử” có liên kết `mailto:sukytoancau@gmail.com` với `aria-label` gồm cả tên thẻ và địa chỉ thư, nên trình đọc không chỉ đọc trơ “liên kết”. Liên kết dùng vùng chạm cao từ 24 điểm ảnh, có viền tiêu điểm riêng và cho phép `break-all` để địa chỉ không tràn ngang ở 320 điểm ảnh.

### 2.6. Bản đồ: bản thay thế bằng chữ và nhãn điều khiển

Bản đồ Leaflet là nội dung đồ họa; người dùng trình đọc màn hình chỉ đi lại được trong khung chứa nếu có nội dung bằng chữ. `frontend/src/components/timeline/timeline-explorer.tsx` dựng một `<details>` ngay dưới khung bản đồ:

- Tiêu đề `<summary>` là `timeline.mapListSummary` với số lượng được nội suy: “Danh sách địa điểm của {count} sự kiện đang hiển thị”.
- Bên trong là `<ol>` một mục mỗi địa điểm: số thứ tự (`aria-hidden`), tên sự kiện là liên kết mở bài viết, dấu phân cách `·` (`aria-hidden`) và mô tả ngắn.
- Danh sách dựng từ đúng mảng `mapMarkers` mà bản đồ vẽ, nên **số trong danh sách là số trên ghim**; hai bên không thể lệch nhau.
- Khi bật bộ lọc hay đổi ngôn ngữ, danh sách rút gọn và đổi nhãn theo cùng dữ liệu.

`frontend/src/components/map/historical-map.tsx` Việt hóa ba thứ Leaflet để lại bằng tiếng Anh:

```tsx
L.control.zoom({ position: 'topleft', zoomInTitle: labels.zoomIn, zoomOutTitle: labels.zoomOut })
map.on('popupopen', (event) => { /* ghi aria-label cho nút đóng bong bóng */ });
map.attributionControl.setPrefix('...<span class="sr-only"> · mở trong tab mới</span>');
```

Nút đóng bong bóng mang nhãn tiếng Anh cứng trong mã nguồn Leaflet nên phải ghi lại sau mỗi lần mở bong bóng. Mỗi ghim cũng được gắn `aria-label` là tên sự kiện ngay khi Leaflet vẽ nó (`leafletMarker.on('add', ...)`), vì Leaflet bỏ qua thuộc tính `alt` của `divIcon`.

### 2.7. Liên kết mở ở thẻ mới

WCAG 2.4.4 yêu cầu mục đích liên kết suy ra được từ chính nhãn. Mọi liên kết `target="_blank"` của dự án (Wikipedia, OpenStreetMap, Google Maps, Wikimedia Commons, dòng giấy phép ảnh, nút chia sẻ, dòng ghi nguồn của Leaflet) đều mang thêm một đoạn chữ `sr-only` chứa `a11y.externalLink` (“Mở trong tab mới”). Nút chia sẻ ghép nhãn riêng của mình: `aria-label="Facebook · Mở trong tab mới"`.

Dự án không đặt nhãn cho liên kết tự mở cùng thẻ, vì thêm “mở trong tab mới” vào nơi không có sẽ khiến người dùng tìm tab không tồn tại.

### 2.8. Chú thích ảnh

Mỗi sự kiện có `imageAltVi` và `imageAltEn` riêng, dựng từ nội dung thật của ảnh; trang chi tiết chọn theo ngôn ngữ hiện hành. Ảnh trang trí (biểu tượng, minh họa khối) dùng `alt=""` để trình đọc bỏ qua. Không có ảnh nào thiếu thuộc tính `alt`, kể cả ảnh suy dụng.

### 2.9. Khối trắc nghiệm ôn tập

Mỗi khối là một `<details>` đóng sẵn; dòng tiêu đề là `<summary>` nằm trong thứ tự Tab, Enter hoặc phím cách mở khối, và khi đóng thì câu hỏi không còn trong thứ tự đọc. Mục “Trắc nghiệm” trong mục lục trỏ tới `#trac-nghiem`; một hiệu ứng nhỏ mở khối khi địa chỉ mang đúng dấu này để liên kết trong trang không dẫn tới một khung đóng. Nhóm “Số câu hỏi” là một `<fieldset>` có `<legend>` và hai nút radio “5 câu”/“10 câu”; đổi số câu thì bộ đề được chọn lại ngẫu nhiên và mọi lựa chọn cũ bị xóa. Mỗi câu là một `<fieldset>` có `<legend>` chứa số thứ tự và câu hỏi, bốn phương án là nút radio cùng `name` nên phím mũi tên đổi lựa chọn trong nhóm. Bộ đề 10–14 câu dựng sẵn trên máy chủ; trình duyệt chọn ngẫu nhiên bằng `crypto.getRandomValues` sau khi hydrate trong lúc khối còn đóng, còn lần dựng đầu dùng hạt cố định để HTML máy chủ khớp với lần render đầu. Tải lại trang hoặc rời bài rồi quay lại cũng chọn bộ mới, còn “Làm lại” giữ nguyên bộ đang làm. Sau khi chấm, dòng kết quả là `aria-live="polite"` và nhận tiêu điểm để trình đọc đọc ngay; phản hồi từng câu dùng chữ "Chính xác." hoặc "Chưa đúng." kèm "Đáp án đúng: …", không dựa vào màu. Khi chấm thiếu câu, thông báo nằm trong `role="alert"` và tiêu điểm nhảy vào `fieldset` còn thiếu; nút "Làm lại" đưa tiêu điểm về câu một. Khối ẩn hẳn nếu bài không đủ dữ liệu để dựng bộ đề.

## 3. Bảng nhãn dùng chung

| Khóa từ điển | Tiếng Việt | Tiếng Anh | Nơi dùng |
| --- | --- | --- | --- |
| `common.skipToContent` | Bỏ qua và tới nội dung chính | Skip to main content | Liên kết bỏ qua điều hướng |
| `a11y.mainNav` | Điều hướng chính | Main navigation | `<nav>` desktop |
| `a11y.mobileNav` | Điều hướng trên thiết bị di động | Navigation on mobile | Bảng điều hướng di động |
| `a11y.breadcrumb` | Đường dẫn điều hướng | Breadcrumb | Khối chỉ vị trí |
| `a11y.search` | Tìm kiếm sự kiện lịch sử | Search historical events | Ô tìm kiếm |
| `a11y.map` | Bản đồ các sự kiện lịch sử | Map of historical events | Khung bản đồ |
| `a11y.searchOnTimeline` | Mở ô tìm kiếm ở trang Dòng thời gian | Open the search box on the Timeline page | Nút biểu tượng kính lúp trên di động |
| `a11y.toggleTheme` | Đổi giao diện sáng tối | Toggle light and dark theme | Nút đổi giao diện |
| `a11y.externalLink` | Mở trong tab mới | Opens in a new tab | Mọi liên kết mở thẻ mới |
| `a11y.zoomIn` / `a11y.zoomOut` | Phóng to bản đồ / Thu nhỏ bản đồ | Zoom in the map / Zoom out the map | Nút thu phóng Leaflet |
| `a11y.closePopup` | Đóng thông tin sự kiện | Close event details | Nút đóng bong bóng |
| `a11y.favorite` / `a11y.unfavorite` | Lưu sự kiện / Bỏ lưu sự kiện | Save event / Remove saved event | Nút yêu thích |
| `timeline.mapListSummary` | Danh sách địa điểm của {count} sự kiện đang hiển thị | List of the {count} event locations shown | Bản chữ thay thế bản đồ |
| `contribute.requiredLegend` | Dấu * đánh dấu thông tin bắt buộc. | Items marked with * are required. | Chú giải biểu mẫu |
| `contribute.errorFieldsTitle` | Vui lòng sửa các mục sau: | Please fix these items: | Khối tổng hợp lỗi |
| `event.quizTitle` | Trắc nghiệm ghi nhớ | Memory quiz | Tên khối, nằm trong `summary` và vẫn là đề mục `h2` |
| `event.quizIntro` | Chọn 5 hoặc 10 câu lấy trực tiếp từ bài viết này. Bộ câu hỏi đổi ngẫu nhiên mỗi lần mở trang; chọn đáp án rồi chấm điểm để biết mình đã nhớ được gì. | Choose 5 or 10 questions taken straight from this article. The set changes at random each time the page opens; pick your answers, then check the score to see what stuck. | Lời dẫn đầu khối |
| `event.quizCountLegend` / `event.quizCountOption` | Số câu hỏi / {count} câu | Questions / {count} questions | Nhóm `fieldset` chọn 5 hoặc 10 câu |
| `event.quizQuestionYear` … `event.quizQuestionLatest` | “{title}” bắt đầu năm nào? … Sự kiện nào bắt đầu muộn nhất trong các lựa chọn sau? | In what year did “{title}” begin? … Which event began latest among the options below? | Đề bài hỏi xuôi, hỏi ngược và xếp thứ tự thời gian |
| `event.quizScore` / `event.quizPerfect` | Bạn trả lời đúng {score}/{total} câu. / Đúng cả {total} câu. Bạn đã nắm được các mốc chính của bài này. | You answered {score} of {total} correctly. / All {total} correct. You know the key facts in this article. | Vùng `aria-live` báo kết quả sau khi chấm |
| `event.quizCorrect` / `event.quizIncorrect` / `event.quizCorrectAnswer` | Chính xác. / Chưa đúng. / Đáp án đúng: {answer}. | Correct. / Not quite. / Correct answer: {answer}. | Phản hồi từng câu, luôn đi kèm biểu tượng chứ không chỉ màu |
| `event.quizNeedAll` | Hãy chọn đáp án cho cả {total} câu trước khi chấm. | Choose an answer for all {total} questions before checking. | Thông báo `role="alert"` khi chấm thiếu câu |

## 4. Việc chủ ý không làm

- **Không thêm nút “chế độ đọc”, không thêm bảng chữ, không nhân bản nội dung sang một trang thân thiện giả.** Những cách này tạo nội dung second-class, mau lệch so với bản chính và buộc người dùng phải biết nó tồn tại.
- **Không đổi tên các khối `<section>`/`<aside>` chưa có nhãn.** Đổi hàng loạt nhãn vùng sẽ làm nhiễu cây tài liệu mà người dùng đã quen; chỉ đặt tên cho landmark và liên kết.
- **Không chặn phím vì “an toàn”.** Kịch bản chặn phím chỉ được kiểm tra kèm điều kiện *không* làm phiền thao tác hợp lệ: xem `kịch_bản_kiểm_thử/trợ_năng.md` mã TC-TN-24, TC-TN-33, TC-TN-34 và `bảo_mật.md` mã TC-BM-49 đến TC-BM-52.
- **Vì mục tiêu chống mở nhầm công cụ kiểm tra, menu chuột phải bị tắt trên toàn trang.** Đây là mất mát đã cân nhắc: không còn chuột phải để sao chép, lưu ảnh hay mở liên kết ở thẻ mới. Các đường tương đương vẫn còn: bôi đen rồi Ctrl+C, Tab/Enter để mở liên kết, chuột giữa để mở thẻ mới. Quyết định này không được dùng để chặn thêm phím soạn thảo hay Ctrl+A/Ctrl+C.

## 5. Giới hạn đã biết

1. **Không có trình đọc màn hình thật trong môi trường phát triển.** Toàn bộ xác minh hiện tại dựa vào cây trợ năng của Chrome, định kiểu tính toán và mô phỏng phím. Cần một lượt nghe thật bằng NVDA hoặc VoiceOver trước khi phát hành; hai mục hay lộ vấn đề ở lượt này là thứ tự thông báo của khối lỗi và cách đọc danh sách địa điểm dài 149 mục.
2. **Trình đọc màn hình chỉ đọc được những gì có trong cây tài liệu.** Nội dung ảnh tư liệu mà chú thích chưa mô tả đủ thì vẫn phải viết lại `imageAltVi`/`imageAltEn`; không cơ chế tự động nào thay được.
3. **Bản đồ vẫn là nội dung đồ họa.** Danh sách bằng chữ cho phép biết và mở từng địa điểm, nhưng trải nghiệm “đọc bản đồ” không thể tương đương với nhìn bản đồ.
4. **Danh sách địa điểm 149 mục là khối dài.** Nó nằm trong `<details>` đóng nên không chặn người dùng bàn phím khi vừa mở trang; người thật sự cần vẫn mở được bằng một phím Enter.
5. **Tiêu điểm bàn phím trong bản đồ do Leaflet quyết định.** Các nút thu phóng, cụm và ghim nhận tiêu điểm theo cách Leaflet dựng phần tử; dự án chỉ gắn nhãn, không đổi thứ tự tab trong khung bản đồ.

## 6. Chạy lại kiểm tra tự động

```bash
node .tmp/verify-a11y.mjs 3001    # 15 kiểm tra: vòng tiêu điểm, aria-pressed, bản chữ thay thế,
                                  # nhãn Leaflet, 9/9 liên kết thẻ mới, khối lỗi + tiêu điểm, chặn phím
node .tmp/verify-a11y-2.mjs 3001  # 16 kiểm tra: liên kết bỏ qua, trật tự đề mục 5 trang, chú thích ảnh,
                                  # tương phản 4.5:1 hai bản sáng tối, aria-invalid, số thứ tự khớp ghim
node .tmp/verify-quiz.mjs 3001    # 24 kiểm tra: đóng sẵn, mở bằng tiêu đề và mục lục,
                                  # 5 fieldset/20 radio mặc định + 2 radio chọn 5/10 câu,
                                  # tên radio, nhóm số câu, chấm thiếu câu, tiêu điểm vào kết quả, làm lại,
                                  # chế độ 10 câu (10 fieldset/40 radio), không tràn ngang ở 320/375/768/1440,
                                  # đổi sang tiếng Anh thì dựng lại, tải lại/quay lại thì đổi đề, giữ vị trí cuộn, không tải lại trang
```

Ba tập lệnh mở Chrome ở chế độ không đầu, tự dựng cây trợ năng và đo định kiểu tính toán. Tập lệnh thứ nhất ghi đè tác nhân người dùng thành một trình duyệt thật, vì máy chủ chặn tác nhân tự động theo đúng hai mươi hạng mục bảo mật bắt buộc.

## 7. Danh sách kiểm tra khi thêm tính năng mới

- Có `<h1>` duy nhất và không nhảy bậc đề mục.
- Phần tử tương tác mới có nhãn đọc được; nhãn nằm trong từ điển cả hai ngôn ngữ.
- Nếu mở thẻ mới: thêm đoạn chữ `sr-only` “Mở trong tab mới”.
- Nếu thêm trường biểu mẫu: chú giải bắt buộc, `aria-describedby` cho mô tả và lỗi, `aria-invalid` khi lỗi.
- Nếu thông báo trạng thái: khối có chữ, không chỉ đổi màu; đưa tiêu điểm tới khối khi hành vi phụ thuộc vị trí đọc.
- Nếu thêm nội dung đồ họa: bản thay thế bằng chữ lấy từ cùng một mảng dữ liệu.
- Chạy `node .tmp/verify-a11y.mjs`, `node .tmp/verify-a11y-2.mjs` và `node .tmp/verify-quiz.mjs`, bấm thử bằng phím ở 320, 768 và 1440 điểm ảnh.
