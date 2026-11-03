# Bảo mật và chuẩn bị phát hành

Tài liệu này đối chiếu bốn mươi hạng mục bảo mật và chuẩn bị phát hành với tình trạng thực tế của website, ghi rõ hạng mục nào đã có từ trước, hạng mục nào được bổ sung trong đợt rà soát này, và cách kiểm chứng lại. Nội dung dành cho người phát triển, người kiểm thử và người vận hành.

## 1. Nguyên tắc

- Không lưu bí mật trong mã nguồn. Mọi khóa đọc từ biến môi trường.
- Không trả về dữ liệu nhiều hơn mức giao diện cần.
- Không tin dữ liệu từ trình duyệt. Kiểm tra ở máy chủ, làm sạch trước khi lưu.
- Mọi thay đổi bảo mật phải kiểm chứng được bằng lệnh hoặc bằng kịch bản kiểm thử, không chỉ bằng mô tả.
- Không tạo bằng chứng xã hội giả. Chỉ hiển thị nguồn tham khảo thật, kiểm chứng được.

## 2. Mười hai hạng mục bảo mật đã có từ trước

| Hạng mục | Cách triển khai | Nơi kiểm chứng |
| --- | --- | --- |
| Ẩn khóa giao diện lập trình | Không có khóa viết cứng trong mã nguồn; tệp môi trường bị bỏ qua khi đưa mã lên kho | `.gitignore`, `frontend/.env.local` chỉ còn giấy phép thư viện giao diện |
| Xóa bí mật khỏi kho mã | Tệp môi trường, khóa riêng, cơ sở dữ liệu và thư mục dựng đều bị bỏ qua; có công cụ quét bí mật | `.gitignore`, `frontend/scripts/security-audit.mjs` |
| Bảo vệ cơ sở dữ liệu | SQLite cho máy cục bộ, PostgreSQL cho triển khai; chuỗi kết nối đọc từ biến môi trường | `backend/API/appsettings.json`, `Database__Provider` |
| Bảo mật cấp dòng | Kịch bản chính sách cấp dòng cho PostgreSQL, gắn biến phiên quản trị qua bộ chặn kết nối | `backend/Infrastructure/Persistence/Security/rls.sql`, `RlsConnectionInterceptor.cs` |
| Mã hóa dữ liệu nhạy cảm | Thư điện tử trong đóng góp được mã hóa bằng khóa bảo vệ dữ liệu; địa chỉ mạng chỉ lưu dạng băm | `SensitiveDataProtector.cs`, `SecurityServices.cs` |
| Xác thực máy chủ | Mã truy cập có chữ ký, thời hạn 30 phút, kiểm tra vai trò ở điểm cuối quản trị | `Program.cs`, `AuthController.cs` |
| Kiểm tra đầu vào | Kiểm tra mô hình, cắt khoảng trắng, loại thẻ siêu văn bản và ký tự vô hình, kiểm tra thư điện tử | `InputSanitizer.cs`, `ContributionService.cs` |
| Khóa quyền truy cập bản ghi | Danh sách và duyệt đóng góp chỉ dành cho vai trò quản trị; PostgreSQL áp chính sách cấp dòng | `ContributionsController.cs`, `rls.sql` |
| Chặn sửa trường quan trọng | Yêu cầu duyệt chỉ nhận trạng thái, không nhận nội dung hay người gửi | `UpdateContributionStatusRequest` |
| Băm mật khẩu | BCrypt với hệ số công việc 12, không lưu mật khẩu gốc | `SecurityServices.cs` |
| Giới hạn đăng nhập | Năm lần mỗi phút cho đăng nhập, khóa tài khoản 15 phút sau năm lần sai | `Program.cs`, `AuthController.cs` |
| Tham số hóa truy vấn | Entity Framework sinh truy vấn có tham số; câu lệnh chính sách cấp dòng cũng dùng tham số | `backend/Infrastructure/Persistence` |

## 3. Chín hạng mục bảo mật được bổ sung trong đợt rà soát

| Hạng mục | Thay đổi | Nơi triển khai |
| --- | --- | --- |
| Bảo mật cookie | Cookie ngôn ngữ thêm `HttpOnly`, vẫn giữ `Secure` và `SameSite=Lax` ở bản phát hành | `frontend/src/middleware.ts` |
| Chặn công cụ tự động | Chặn tác nhân tự động và tác nhân rỗng khi ghi dữ liệu; chặn đường dẫn bị quét phổ biến; bắt buộc thân JSON khi ghi; vẫn cho máy chủ giao diện gọi nội bộ | `backend/API/Middleware/SecurityMiddleware.cs` |
| Chặn gửi tự động phía giao diện | Tác vụ đóng góp từ chối tác nhân tự động trước khi kiểm tra dữ liệu | `frontend/src/app/contribute/actions.ts`, `frontend/src/utils/request-guard.ts` |
| Bắt buộc giao thức bảo mật | Chuyển hướng 308 sang địa chỉ bảo mật khi chạy bản phát hành, bỏ qua máy cục bộ | `frontend/src/middleware.ts` |
| Thêm tiêu đề bảo mật | Bổ sung `X-Download-Options: noopen` và `X-Permitted-Cross-Domain-Policies: none` | `frontend/next.config.mjs` |
| Giới hạn yêu cầu máy chủ giao diện | Giới hạn thân tác vụ máy chủ 64 KB | `frontend/next.config.mjs` |
| Siết chia sẻ tài nguyên giữa các nguồn | Chỉ cho bốn phương thức đọc ghi cần thiết và ba tiêu đề, nhớ trước kiểm tra 1 giờ | `backend/API/Program.cs` |
| Quản lý phụ thuộc | Nâng gói máy chủ lên bản vá 9.0.22, SQLitePCLRaw 2.1.14; nâng PostCSS, Sharp, Vitest ở giao diện | `backend/*/*.csproj`, `frontend/package.json` |
| Rào mềm công cụ kiểm tra của trình duyệt | Chặn ở lớp sự kiện các phím tắt F12, Ctrl+Shift+I/J/C, Cmd+Option+I/J/C và Ctrl+U; tắt menu chuột phải trên toàn trang, kể cả trên liên kết, ảnh, ô nhập và đoạn chữ đã bôi đen. Bù lại, bôi đen rồi Ctrl+C, Tab/Enter và chuột giữa vẫn dùng bình thường. **Không phải biên an toàn**: người dùng biết nghề vẫn mở được công cụ kiểm tra qua menu của trình duyệt hoặc qua cửa sổ khác, nên không một kiểm tra dữ liệu, giới hạn tần suất hay phân quyền nào được phép trông chờ vào phần này | `frontend/src/components/security/devtools-guard.tsx`, `frontend/src/app/layout.tsx` |

## 4. Các hạng mục còn lại và cách đáp ứng

| Hạng mục | Cách đáp ứng |
| --- | --- |
| Giảm dữ liệu trả về | Danh sách dùng mô hình rút gọn, không có nội dung đầy đủ, nguồn tham khảo hay sự kiện liên quan; chỉ trang chi tiết trả đủ |
| Escape nội dung | React tự thoát chuỗi khi hiển thị; máy chủ loại thẻ siêu văn bản khỏi nội dung đóng góp |
| Giới hạn tệp tải lên | Website chưa có chức năng tải tệp; giới hạn thân yêu cầu 256 KB toàn máy chủ và 32 KB cho đóng góp vẫn áp dụng |
| Thêm tiêu đề bảo mật | Chính sách nội dung, chống nhúng khung, chống đoán kiểu nội dung, chính sách giới thiệu, quyền thiết bị và tiêu đề chuyển vận bảo mật đều được đặt ở cả hai phía |
| Bắt buộc giao thức bảo mật | Máy chủ dữ liệu chuyển hướng và gắn tiêu đề chuyển vận bảo mật; giao diện chuyển hướng ở bản phát hành |
| Quét phụ thuộc | Hai lệnh quét độc lập cho giao diện và máy chủ, chạy được trong quy trình kiểm thử |

## 5. Hai mươi hạng mục chuẩn bị phát hành

| Hạng mục | Tình trạng | Ghi chú |
| --- | --- | --- |
| Trang lỗi 404 riêng | Đã có | Có ô tìm kiếm và liên kết gợi ý |
| Nút kêu gọi hành động trong màn hình đầu | Đã có | Trang chủ đặt hai nút chính trước khi cuộn |
| Liên kết nội bộ | Đã có | Trang chủ, chi tiết, chân trang liên kết chéo |
| Trang cảm ơn | Đã có | `/thank-you` và `/en/thank-you`, không lập chỉ mục |
| Đường dẫn phân cấp | Đã có | Mọi trang chính và trang chi tiết |
| Hồ sơ chuyên sâu | Bổ sung | `/stories` với ba hồ sơ, lý do đáng đọc và nguồn kiểm chứng |
| Năm câu hỏi thường gặp | Đã có | Trang `/faq` kèm dữ liệu có cấu trúc |
| Cam kết thời gian phản hồi | Bổ sung | Thẻ cam kết dưới biểu mẫu đóng góp |
| Thanh hành động dính trên di động | Đã có | Hiện ở đáy màn hình, không che nội dung |
| Tệp robots | Đã có | Chặn thư mục giao diện lập trình và trang cảm ơn |
| Tiêu đề riêng từng trang | Đã có | Thêm tiêu đề và mô tả riêng cho hồ sơ chuyên sâu |
| Mô tả riêng từng trang | Đã có | Sinh theo ngôn ngữ hiện tại |
| Ảnh chia sẻ mạng xã hội | Đã có | Ảnh lớn 1200 nhân 630, địa chỉ tuyệt đối |
| Bản đồ và chỉ đường | Bổ sung | Hai liên kết ngoài đúng tọa độ; dữ liệu địa điểm trong khối bài viết |
| Đánh giá thật | Không thêm mới | Website là bách khoa, không bán hàng; thay bằng danh mục nguồn tham khảo chính thống kiểm chứng được, không tạo đánh giá giả |
| Văn bản thay thế cho ảnh | Đã có | Ảnh nội dung có mô tả, ảnh trang trí được ẩn với trình đọc màn hình |
| Dữ liệu có cấu trúc địa phương | Bổ sung | Bài viết có địa điểm, quốc gia, tọa độ; trang giới thiệu có tổ chức |
| Trang chính sách riêng tư | Đã có | Nêu dữ liệu thu thập, mục đích, thời hạn và quyền người đọc |
| Đo lường truy cập | Đã có | Chỉ tải sau khi người đọc đồng ý, kiểm tra mã hợp lệ |
| Ảnh đội ngũ | Đã có | Bốn chân dung minh họa kèm mô tả; không dùng ảnh nhóm giả |

## 6. Kết quả kiểm chứng

Thực hiện ngày 31 tháng 10 năm 2026 trên máy phát triển:

| Phép kiểm tra | Kết quả |
| --- | --- |
| `npm test` | 51 bài đạt, 7 tệp |
| `npm run typecheck` | Không có lỗi |
| `npm run build` | Dựng thành công 15 tuyến đường |
| `npm audit` | Không còn lỗ hổng |
| `npm run audit:secrets` | Quét 157 tệp, không phát hiện bí mật |
| `dotnet build` | Thành công, không cảnh báo |
| `dotnet test` | 66 bài đạt |
| `dotnet list package --vulnerable --include-transitive` | Không còn gói bị cảnh báo |
| Tiêu đề bảo mật giao diện | Có đủ chính sách nội dung, chống nhúng khung, chuyển vận bảo mật và hai tiêu đề mới |
| Ghi dữ liệu bằng công cụ tự động | Trả 403 |
| Đường dẫn bị quét | Trả 404 |
| Ghi dữ liệu sai định dạng | Trả 415 |
| Máy chủ giao diện gọi nội bộ | Được chấp nhận, trả lỗi kiểm tra dữ liệu thay vì chặn |
| Sáu tuyến đường chính ở hai ngôn ngữ | Trả 200 |
| Trợ năng đo tự động | `node .tmp/verify-a11y.mjs` đạt 15/15, `node .tmp/verify-a11y-2.mjs` đạt 16/16; đo trên cây trợ năng của Chrome và định kiểu tính toán |
| Tương phản chữ ở biểu mẫu đóng góp | Chú giải 6,98:1 bản sáng và 8,53:1 bản tối; khối lỗi 6,86:1; đều vượt ngưỡng 4,5:1 |
| Rào mềm công cụ kiểm tra | F12, Ctrl+Shift+I/J/C và Ctrl+U bị chặn ở lớp sự kiện; Ctrl+A, Ctrl+C và phím chữ thường không bị chặn; menu chuột phải bị tắt ở mọi vị trí, kể cả liên kết, ảnh, ô nhập và đoạn chữ bôi đen |

Ba dòng cuối thực hiện ngày 3 tháng 11 năm 2026 trên máy phát triển, đo ở cổng 3001.

## 7. Lệnh chạy lại

```powershell
# Giao diện
cd frontend
npm run audit
npm test
npm run typecheck
npm run build

# Máy chủ dữ liệu
cd ..\backend
dotnet list package --vulnerable --include-transitive
dotnet test WorldHistory.sln
```

Khi phát hiện hạng mục không đạt, tạo báo cáo lỗi theo mẫu trong thư mục `báo_cáo_lỗi`, gắn nhãn `bảo-mật` nếu liên quan tới dữ liệu hoặc quyền truy cập.
