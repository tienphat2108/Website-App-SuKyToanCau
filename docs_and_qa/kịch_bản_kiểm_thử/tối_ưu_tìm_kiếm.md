# Kịch bản kiểm thử tối ưu công cụ tìm kiếm

## 1. Phạm vi

Bộ kịch bản này kiểm tra siêu dữ liệu, đường dẫn chuẩn, liên kết ngôn ngữ, sơ đồ trang, tệp robots, thẻ chia sẻ, dữ liệu có cấu trúc và các yếu tố ảnh hưởng tới thứ hạng tìm kiếm.

## 2. Điều kiện chung

- Trang đã dựng ở chế độ sản xuất, chạy tại `http://localhost:3000`.
- Biến `NEXT_PUBLIC_SITE_URL` được đặt đúng tên miền thử nghiệm.
- Dùng chế độ xem mã nguồn trang để đọc thẻ trong phần đầu tệp.
- Có công cụ kiểm tra dữ liệu có cấu trúc và công cụ xem trước khi chia sẻ.

## 3. Danh sách kịch bản

| Mã | Tên | Cách thực hiện | Kết quả mong đợi | Mức |
| --- | --- | --- | --- | --- |
| TC-SEO-01 | Tiêu đề duy nhất | Mở lần lượt sáu trang tĩnh và ba trang sự kiện, đọc thẻ `title` | Mỗi trang có tiêu đề riêng, không trùng nhau, có tên website ở cuối | Cao |
| TC-SEO-02 | Mô tả riêng | Đọc thẻ `meta name="description"` của các trang trên | Mỗi trang có mô tả riêng, dài từ 70 đến 165 ký tự, đúng ngôn ngữ | Cao |
| TC-SEO-03 | Đường dẫn chuẩn bản tiếng Việt | Mở `/timeline` | Có `link rel="canonical"` trỏ đúng địa chỉ tuyệt đối không có tham số truy vấn | Cao |
| TC-SEO-04 | Đường dẫn chuẩn bản tiếng Anh | Mở `/en/timeline` | Đường dẫn chuẩn trỏ tới `/en/timeline`, không trỏ về bản tiếng Việt | Cao |
| TC-SEO-05 | Liên kết ngôn ngữ thay thế | Kiểm tra ba thẻ `link rel="alternate"` | Có đủ `vi`, `en`, `x-default`; `x-default` trỏ bản tiếng Việt | Cao |
| TC-SEO-06 | Không trùng nội dung giữa hai ngôn ngữ | So sánh cặp trang Việt và Anh | Hai bên trỏ về hai đường dẫn chuẩn khác nhau, không cùng một địa chỉ | Cao |
| TC-SEO-07 | Tệp robots | Mở `/robots.txt` | Cho phép đọc toàn bộ, chặn `/api/`, `/thank-you`, `/en/thank-you`, có dòng trỏ tới sơ đồ trang và tên máy chủ | Cao |
| TC-SEO-08 | Sơ đồ trang | Mở `/sitemap.xml` | Có 122 địa chỉ: 14 trang tĩnh và 108 trang sự kiện cho hai ngôn ngữ; mỗi mục có liên kết thay thế | Cao |
| TC-SEO-09 | Loại trang cảm ơn khỏi sơ đồ | Tìm `thank-you` trong sơ đồ trang | Không xuất hiện | Cao |
| TC-SEO-10 | Ảnh chia sẻ | Đọc `og:image` ở trang chủ và trang sự kiện | Trỏ tới ảnh 1200 nhân 630, có địa chỉ tuyệt đối, có mô tả thay thế | Cao |
| TC-SEO-11 | Thẻ chia sẻ mạng xã hội | Kiểm tra `og:title`, `og:description`, `og:type`, `og:locale`, `twitter:card` | Đúng ngôn ngữ, `og:type` là `article` ở trang sự kiện, thẻ Twitter là ảnh lớn | Trung bình |
| TC-SEO-12 | Văn bản thay thế ảnh | Kiểm tra mọi thẻ `img` ở trang chủ, dòng thời gian, chi tiết và giới thiệu | Không có ảnh nội dung thiếu `alt`; ảnh trang trí có `aria-hidden` | Cao |
| TC-SEO-13 | Trang không tồn tại trả mã 404 | Gọi `curl.exe -o NUL -w "%{http_code}" http://localhost:3000/khong-ton-tai` | Trả 404, không phải 200; trang lỗi có liên kết điều hướng | Cao |
| TC-SEO-14 | Trang cảm ơn không lập chỉ mục | Mở `/thank-you` | Có `meta name="robots"` với `noindex`, không có trong sơ đồ trang | Cao |
| TC-SEO-15 | Dữ liệu có cấu trúc website | Đọc mã nguồn trang chủ | Có khối `WebSite` kèm hành động tìm kiếm nội bộ | Trung bình |
| TC-SEO-16 | Dữ liệu có cấu trúc danh sách | Trang chủ | Có khối `CollectionPage` chứa danh sách bài viết | Trung bình |
| TC-SEO-17 | Dữ liệu có cấu trúc bài viết | Trang chi tiết sự kiện | Có khối `Article` với tiêu đề, mô tả, ảnh, ngày cập nhật và đơn vị xuất bản | Cao |
| TC-SEO-18 | Dữ liệu có cấu trúc câu hỏi | Trang `/faq` | Có khối `FAQPage` với đúng năm câu hỏi và câu trả lời | Trung bình |
| TC-SEO-19 | Dữ liệu có cấu trúc giới thiệu | Trang `/about` | Có khối `AboutPage` chứa `Organization` và thành viên | Thấp |
| TC-SEO-20 | Đường dẫn phân cấp | Mở trang chi tiết sự kiện | Hiện đường dẫn Trang chủ, Dòng thời gian, tên sự kiện; có khối `BreadcrumbList` khớp | Trung bình |
| TC-SEO-21 | Ngôn ngữ tài liệu | Mở `/` và `/en` | Thuộc tính `lang` lần lượt là `vi-VN` và `en` | Cao |
| TC-SEO-22 | Khung nhìn di động | Kiểm tra thẻ `viewport` | Có `width=device-width`, `initial-scale=1`, không chặn phóng to | Cao |
| TC-SEO-23 | Liên kết nội bộ | Kiểm tra trang chủ và trang chi tiết | Có liên kết tới dòng thời gian, thời kỳ, sự kiện liên quan, đóng góp và câu hỏi thường gặp | Trung bình |
| TC-SEO-24 | Đồng ý phân tích | Xóa bộ nhớ cục bộ, mở trang | Không có mã phân tích nào được tải trước khi người dùng đồng ý | Cao |
| TC-SEO-25 | Sau khi đồng ý phân tích | Bấm đồng ý | Mã phân tích được tải một lần, không tải lại khi chuyển trang | Trung bình |
| TC-SEO-26 | Từ chối phân tích | Bấm từ chối | Không có yêu cầu nào tới máy chủ phân tích trong toàn bộ phiên | Cao |
| TC-SEO-27 | Tiêu đề thẻ chia sẻ tiếng Việt | Xem trước liên kết bằng công cụ chia sẻ | Tiêu đề và mô tả hiện đúng dấu tiếng Việt, không bị lỗi bảng mã | Trung bình |
| TC-SEO-28 | Tốc độ hiển thị phần đầu | Đo bằng công cụ phát triển | Ảnh lớn ở trang chủ được tải ưu tiên, không có hiện tượng nhảy bố cục | Trung bình |
| TC-SEO-29 | Hồ sơ chuyên sâu trong sơ đồ trang | Tìm `stories` trong `/sitemap.xml` | Có cả `/stories` và `/en/stories`, không trùng lặp | Cao |
| TC-SEO-30 | Siêu dữ liệu riêng cho hồ sơ | Mở `/stories`, đọc tiêu đề và mô tả | Tiêu đề và mô tả riêng, không trùng với dòng thời gian hay trang chủ, có từ khóa hồ sơ chuyên sâu | Cao |
| TC-SEO-31 | Dữ liệu có cấu trúc địa điểm | Đọc mã nguồn trang chi tiết sự kiện | Khối `Article` có `contentLocation` gồm tên địa điểm, quốc gia và tọa độ, cùng `spatialCoverage` | Trung bình |
| TC-SEO-32 | Đường dẫn phân cấp cho hồ sơ | Mở `/stories` | Hiện Trang chủ rồi Hồ sơ; có khối `BreadcrumbList` và `CollectionPage` khớp nội dung | Trung bình |
| TC-SEO-33 | Sơ đồ trang đủ cặp liên kết cho sự kiện mới | Chạy `curl.exe http://localhost:3000/sitemap.xml` rồi đếm; mở một sự kiện mới, xem khối dữ liệu có cấu trúc trong mã nguồn; đối chiếu `/robots.txt` | Sơ đồ trang có 312 địa chỉ, trong đó 298 địa chỉ bài viết tức 149 sự kiện nhân đôi cho hai ngôn ngữ; mỗi địa chỉ đều có nhãn ngày cập nhật và bộ liên kết thay thế tiếng Việt lẫn tiếng Anh trỏ đúng cặp; không có địa chỉ trùng hoặc thiếu phần ngôn ngữ; khối dữ liệu có cấu trúc của bài mới khai đúng tiêu đề, mô tả, ảnh và đường dẫn chuẩn; tệp chặn công cụ tự động không chặn đường dẫn bài viết | Cao |

## 4. Lệnh kiểm tra nhanh

```powershell
# Xem tiêu đề, mô tả, đường dẫn chuẩn và liên kết ngôn ngữ
curl.exe -s http://localhost:3000/timeline | Select-String -Pattern "canonical|alternate|description|<title>"

# Đếm số địa chỉ trong sơ đồ trang
([xml](curl.exe -s http://localhost:3000/sitemap.xml)).urlset.url.Count

# Kiểm tra mã trạng thái trang không tồn tại
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/khong-ton-tai
```

## 5. Ghi nhận kết quả

| Mã | Người thực hiện | Ngày | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| TC-SEO-01 |  |  |  |  |
| TC-SEO-02 |  |  |  |  |

Khi một trang thiếu siêu dữ liệu, ghi rõ đường dẫn và thẻ còn thiếu trong báo cáo lỗi để người phát triển sửa đúng tệp.
