# Bách khoa Lịch sử Thế giới

Website bách khoa lịch sử thế giới, ưu tiên lịch sử Việt Nam. Nội dung song ngữ Việt Anh, giao diện sáng tối, dòng thời gian lọc được, bản đồ lịch sử, biểu mẫu đóng góp và đầy đủ yếu tố tối ưu công cụ tìm kiếm.

Dự án gồm hai phần độc lập:

- `frontend`: Next.js 15, React 19, TypeScript, Tailwind, Zustand, Leaflet.
- `backend`: .NET 9 theo kiến trúc phân tầng, Entity Framework, SQLite cho máy cục bộ và PostgreSQL cho triển khai.

## 1. Tính năng chính

- 149 sự kiện lịch sử song ngữ của 51 quốc gia và khu vực, mỗi sự kiện có tóm tắt, bài viết đầy đủ nhiều đoạn, ảnh, nhãn, tọa độ, sự kiện liên quan và danh mục nguồn tham khảo chính thống ở cuối bài.
- Bộ chọn quốc gia hoặc khu vực được ghi nhớ trong cookie: lịch sử của nước đã chọn hiện trước trên trang chủ và ở đầu mỗi nhóm thời kỳ.
- Khối “Cùng năm, thế giới có gì?” trên trang chi tiết, gợi ý tối đa ba sự kiện quốc tế diễn ra cùng năm để đối chiếu lịch sử Việt Nam với thế giới.
- Khối “Trắc nghiệm ghi nhớ” cuối mỗi bài, đóng sẵn cho tới khi người đọc bấm vào tiêu đề hoặc mục “Trắc nghiệm” trong mục lục: chọn 5 hoặc 10 câu lấy trực tiếp từ dữ liệu sự kiện (năm, thời kỳ, quốc gia, địa điểm, ngày, câu hỏi ngược và câu xếp thứ tự thời gian), bộ câu đổi ngẫu nhiên mỗi lần tải lại hoặc quay lại bài, chấm điểm ngay trên trang, nêu đáp án đúng kèm giải thích và cho làm lại; không lưu điểm, không gửi dữ liệu đi.
- Trang hồ sơ chuyên sâu tại `/stories`: ba bài phân tích có lý do đáng đọc riêng, đoạn mở đầu và nguồn kiểm chứng được.
- Trang chủ, dòng thời gian, chi tiết sự kiện, hồ sơ chuyên sâu, bản đồ, giới thiệu, câu hỏi thường gặp, chính sách bảo mật, gửi đóng góp, trang cảm ơn.
- Liên kết mở vị trí trên OpenStreetMap và chỉ đường ngay dưới bản đồ của từng sự kiện.
- Cam kết thời gian phản hồi và liên kết thư trực tiếp tới hộp thư biên tập.
- Lọc theo thời kỳ, quốc gia, khoảng năm; tìm kiếm không phân biệt chữ hoa và dấu tiếng Việt.
- Đổi ngôn ngữ tại chỗ, giữ đúng trang đang đọc.
- Giao diện sáng, tối và theo thiết lập hệ điều hành, không nhấp nháy nền.
- Lưu yêu thích trong trình duyệt, chia sẻ liên kết, breadcrumb, dữ liệu có cấu trúc.
- Sơ đồ trang, tệp robots, ảnh chia sẻ, siêu dữ liệu riêng cho từng trang.
- Giới hạn tần suất, giới hạn kích thước yêu cầu, băm mật khẩu, mã hóa thư điện tử, băm địa chỉ mạng, chính sách bảo mật cấp dòng cho PostgreSQL.
- Chặn tác nhân tự động khi ghi dữ liệu, chặn đường dẫn bị quét phổ biến và bắt buộc thân JSON ở máy chủ dữ liệu.
- Công cụ quét bí mật trong mã nguồn và quét lỗ hổng phụ thuộc cho cả hai phía.
- Quản lý đồng ý đo lường, chỉ tải mã phân tích sau khi người đọc đồng ý.
- Trợ năng trình đọc màn hình theo chuẩn: bỏ qua điều hướng, tên vùng, trật tự đề mục, vòng tiêu điểm bàn phím, nhãn tiếng Việt cho điều khiển bản đồ, bản danh sách địa điểm bằng chữ thay cho bản đồ, thông báo “mở trong tab mới” và khối tổng hợp lỗi có đưa con trỏ tới. Không có công tắc bật chế độ đọc — luôn bật.
- Rào mềm công cụ kiểm tra của trình duyệt: chặn phím tắt và tắt menu chuột phải trên toàn trang. Bôi đen rồi Ctrl+C, Tab/Enter và chuột giữa vẫn dùng được. Chỉ làm khó, không chặn được triệt để.

## 2. Cấu trúc thư mục

```text
.
├── backend/
│   ├── Core/                 Thực thể, giao diện kho dữ liệu, ngoại lệ nghiệp vụ
│   ├── Application/          Dịch vụ nghiệp vụ, kiểm tra đầu vào, mô hình truyền dữ liệu
│   ├── Infrastructure/       Cơ sở dữ liệu, kho dữ liệu, bảo mật, nguồn tham khảo ngoài
│   ├── API/                  Điểm cuối, trung gian, cấu hình khởi động
│   ├── Tests/                Bài kiểm thử đơn vị và tích hợp
│   └── WorldHistory.sln
├── frontend/
│   ├── src/app/              Tuyến đường theo bộ định tuyến ứng dụng
│   ├── src/components/       Thành phần giao diện
│   ├── src/core/             Mô hình, từ điển, ngoại lệ, bộ trình bày
│   ├── src/services/         Dịch vụ đọc dữ liệu phía máy chủ
│   ├── src/store/            Kho trạng thái phía trình duyệt
│   ├── src/lib/              Siêu dữ liệu, tiện ích
│   ├── src/locales/          Từ điển tiếng Việt và tiếng Anh
│   └── public/               Ảnh, biểu tượng, ảnh chia sẻ
├── shared/
│   └── history-events.json   Nguồn dữ liệu duy nhất cho cả hai phía
├── docs_and_qa/              Tài liệu thiết kế, Jira, kịch bản kiểm thử, báo cáo lỗi
└── devops/                   Tệp dựng, tệp điều phối, cấu hình máy chủ đảo ngược
```

## 3. Yêu cầu môi trường

- Node.js 20 trở lên và npm.
- .NET SDK 9.
- Docker và Docker Compose nếu chạy theo cách đóng gói.

## 4. Chạy khi phát triển

### 4.1. Cách nhanh trên Windows

Nháy đúp tệp `run-local.cmd`, hoặc chạy trong PowerShell:

```powershell
.\run-local.ps1
```

Script tự kiểm tra công cụ, dựng giao diện khi thiếu bản dựng, chạy hai dịch vụ trong hai cửa sổ riêng rồi mở trình duyệt. Dịch vụ nào đang chạy sẵn thì được giữ nguyên.

Các tham số:

| Tham số | Tác dụng |
| --- | --- |
| Không tham số | Chạy với bản dựng hiện có |
| `-Build` | Dựng lại giao diện trước khi chạy |
| `-Dev` | Chạy chế độ phát triển, tự biên dịch lại khi sửa mã nguồn |
| `-Stop` | Dừng hai dịch vụ đang giữ cổng 5080 và 3000 |

Chế độ phát triển phù hợp khi đang sửa giao diện vì mỗi lần lưu tệp, trang tự cập nhật. Đổi lại, lần mở đầu tiên của mỗi trang sẽ chậm hơn do phải biên dịch tại chỗ, và bản dựng sẵn trong thư mục `.next` bị thay thế — sau khi dùng `-Dev`, muốn chạy lại bản phát hành thì cần `.\run-local.ps1 -Build`.

Nếu Windows chặn script, chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-local.ps1
```

### 4.2. Chạy thủ công máy chủ dữ liệu

```bash
dotnet run --project backend/API
```

Máy chủ chạy tại `http://localhost:5080`. Cơ sở dữ liệu SQLite được tạo tự động trong thư mục chạy và nạp sẵn 149 sự kiện.

Kiểm tra nhanh:

```bash
curl http://localhost:5080/api/health
curl http://localhost:5080/api/events
```

Tài liệu giao diện lập trình mở tại `http://localhost:5080/swagger` khi chạy ở môi trường phát triển.

### 4.3. Chạy thủ công giao diện

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:3000`. Giao diện đọc dữ liệu phía máy chủ từ `http://localhost:5080`. Nếu máy chủ dữ liệu không chạy, giao diện dùng bộ dữ liệu dự phòng trong `shared/history-events.json` nên vẫn hiển thị đủ nội dung.

### 4.4. Chạy bản phát hành

```bash
cd frontend
npm run build
npm start
```

## 5. Biến môi trường

### 5.1. Máy chủ dữ liệu

Cấu hình đọc từ `backend/API/appsettings.json`, ghi đè bằng biến môi trường theo quy tắc hai dấu gạch dưới.

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `Jwt__Key` | Có khi phát hành | Khóa ký mã truy cập, tối thiểu 32 byte |
| `Security__IpHashKey` | Có khi phát hành | Khóa băm địa chỉ mạng, tối thiểu 32 ký tự |
| `Security__SeedAdminUsername` | Khi cần tài khoản quản trị | Tên đăng nhập quản trị đầu tiên |
| `Security__SeedAdminPassword` | Khi cần tài khoản quản trị | Mật khẩu, tối thiểu 12 ký tự |
| `ConnectionStrings__Default` | Không | Chuỗi kết nối, mặc định dùng SQLite |
| `Database__Provider` | Không | `Sqlite` hoặc `Postgres` |
| `Database__ApplyRowLevelSecurity` | Không | Bật chính sách bảo mật cấp dòng cho PostgreSQL |
| `Security__AllowedOrigins__0` | Không | Địa chỉ giao diện được phép gọi |
| `Security__RequireHttps` | Không | Chuyển hướng sang giao thức bảo mật, mặc định bật |
| `Security__DataProtectionKeysPath` | Không | Thư mục lưu khóa bảo vệ dữ liệu |
| `Proxy__TrustForwardedHeaders` | Không | Tin tiêu đề chuyển tiếp khi đứng sau máy chủ đảo ngược |
| `ExternalApi__Enabled` | Không | Bật việc lấy thêm tóm tắt từ nguồn tham khảo ngoài |

Ở môi trường phát triển, nếu thiếu `Jwt__Key` hoặc `Security__IpHashKey`, máy chủ sinh khóa tạm thời trong bộ nhớ. Ở môi trường phát hành, thiếu khóa thì máy chủ dừng ngay khi khởi động để tránh chạy với cấu hình không an toàn.

### 5.2. Giao diện

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `API_BASE_URL` | Không | Địa chỉ máy chủ dữ liệu phía máy chủ Next.js, mặc định `http://localhost:5080` |
| `NEXT_PUBLIC_SITE_URL` | Khi phát hành | Địa chỉ công khai, dùng cho siêu dữ liệu, sơ đồ trang và chuyển hướng sang giao thức bảo mật |
| `NEXT_PUBLIC_GA_ID` | Không | Mã đo lường, chỉ tải sau khi người đọc đồng ý |

`NEXT_PUBLIC_*` được nhúng lúc dựng nên phải đặt trước khi chạy `npm run build`.

## 6. Kiểm thử

```bash
# Giao diện
cd frontend
npm test
npx tsc --noEmit
npm run build
npm run audit

# Máy chủ dữ liệu
cd backend
dotnet test WorldHistory.sln
dotnet list package --vulnerable --include-transitive
```

Hiện có 82 bài kiểm thử giao diện và 74 bài kiểm thử máy chủ. Lệnh `npm run audit` quét bí mật trong mã nguồn rồi quét lỗ hổng phụ thuộc. Kịch bản kiểm thử thủ công nằm trong `docs_and_qa/kịch_bản_kiểm_thử/`, gồm sáu bộ: chức năng chính, bảo mật, đa ngôn ngữ, tối ưu công cụ tìm kiếm, gọi dữ liệu và trợ năng.

Hai tập lệnh kiểm tra trợ năng tự động, đo trực tiếp trên trình duyệt không đầu:

```bash
node .tmp/verify-a11y.mjs 3000    # 15 kiểm tra, đạt 15/15
node .tmp/verify-a11y-2.mjs 3000  # 16 kiểm tra, đạt 16/16
```

## 7. Triển khai

### 7.1. Docker Compose (đủ cả hai phần)

Toàn bộ hệ thống chạy bằng Docker Compose với bốn dịch vụ: cơ sở dữ liệu, máy chủ dữ liệu, giao diện và máy chủ đảo ngược.

```bash
cp devops/.env.example devops/.env
# điền giá trị trong devops/.env
docker compose -f devops/docker-compose.yml --env-file devops/.env up -d --build
```

Chi tiết xem `devops/README.md`.

### 7.2. Netlify (chỉ phần giao diện)

Netlify chỉ chứa được phần giao diện (`frontend/`); máy chủ dữ liệu .NET phải đặt ở nơi khác (VPS chạy Docker, hoặc một nền tảng hỗ trợ .NET). Khi chưa có máy chủ dữ liệu, website vẫn hiển thị đủ 149 sự kiện vì dữ liệu được nhúng lúc dựng, riêng biểu mẫu đóng góp báo "Không thể gửi đóng góp lúc này."

Lệnh dựng và các biến bắt buộc đã ghi sẵn trong `netlify.toml` ở thư mục gốc kho, nên trên giao diện Netlify chỉ còn phải đặt đúng một mục:

| Mục trong Netlify | Giá trị |
| --- | --- |
| Base directory | `frontend` (bắt buộc; thư mục gốc không có `package.json`, mà Netlify lại không đọc được `base` từ tệp cấu hình) |

Phần `netlify.toml` lo:

| Mục | Giá trị |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `.next` (đường dẫn tương đối so với Base directory) |
| Bộ cắm dựng | `[[plugins]] package = "@netlify/plugin-nextjs"` |
| `NODE_VERSION` | `22`, khớp ảnh `node:22-alpine` trong `devops/Dockerfile.web` |
| `NEXT_PUBLIC_SITE_URL` | `https://sukytoancau.netlify.app`; đổi tên miền thì sửa trong tệp này |
| `NETLIFY_NEXT_SKEW_PROTECTION` | `true` |

Phải khai báo rõ `publish` và bộ cắm `@netlify/plugin-nextjs`. Nếu thiếu, Netlify vẫn chạy `npm run build` thành công nhưng rồi phát thẳng nội dung thư mục `frontend` (mã nguồn, không có `_next`, không có function): site trả 404 dù log dựng không báo lỗi. Dấu hiệu nhận biết là bản dựng có `0 functions` và danh sách tệp là `src/`, `package.json`.

Có thể tạo biến môi trường cùng tên ở **Project configuration → Environment variables** để ghi đè mà không sửa tệp, nhưng chỉ nên chọn một chỗ làm nguồn chính; để cả hai dễ dẫn tới giá trị dựng không như ý.

Hai biến để trống có chủ đích: `API_BASE_URL` (địa chỉ máy chủ .NET; chưa triển khai thì biểu mẫu đóng góp báo "Không thể gửi đóng góp lúc này.") và `NEXT_PUBLIC_GA_ID` (chưa bật đo lường, tránh chuyển dữ liệu ra nước ngoài).

Biến `NEXT_PUBLIC_*` nhúng lúc dựng nên đổi xong phải bấm **Clear cache and deploy site**, không chỉ dựng lại.

`frontend/next.config.mjs` bật chế độ xuất standalone có điều kiện theo biến `NETLIFY`: ảnh Docker cần `.next/standalone`, còn OpenNext của Netlify không hỗ trợ chế độ này. Đã xác minh trên máy: `npm run build` thường vẫn sinh `.next/standalone`; `NETLIFY=true npm run build` bỏ qua bước đó và dựng xong bình thường, bảng tuyến không đổi.

Sau khi dựng, rà lại tiêu đề bảo mật theo chuẩn 20 mục bắt buộc:

```powershell
curl.exe -I https://<site>.netlify.app/
```

Phải còn `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` và `Strict-Transport-Security`. Thiếu mục nào là dựng sai cấu hình production, không phải lỗi nhỏ cần bỏ qua.

## 8. Dữ liệu dùng chung

`shared/history-events.json` là nguồn duy nhất cho nội dung sự kiện. Máy chủ nhúng tệp này lúc biên dịch. Giao diện nhập tệp lúc dựng làm phương án dự phòng. Sửa nội dung thì phải dựng lại cả hai phía.

Tệp phải lưu bằng UTF-8 không có ký tự đánh dấu đầu tệp. Quy tắc chi tiết xem `docs_and_qa/đồng_bộ_dữ_liệu.md`.

### Hình minh họa sự kiện

Mỗi sự kiện dùng một ảnh tư liệu thật lưu trong `frontend/public/images/events/<khóa>.<đuôi>`. Ảnh được lấy từ Wikimedia Commons, ưu tiên tác phẩm thuộc phạm vi công cộng hoặc giấy phép Creative Commons cho phép dùng lại. Không đưa vào ảnh không rõ nguồn gốc hoặc ảnh có bản quyền.

Thông tin tác giả, giấy phép và trang nguồn nằm trong `frontend/src/data/image-credits.json`, khóa theo `slug` của sự kiện. Trang chi tiết đọc tệp này để in dòng ghi nguồn ngay dưới ảnh lớn. Dữ liệu sự kiện của máy chủ không có trường ghi nguồn, nên phần này chỉ tồn tại ở giao diện; khi đổi ảnh phải sửa cả tệp ghi nguồn.

Quy trình thêm hoặc thay ảnh:

1. Tải ảnh gốc từ Wikimedia Commons, đặt tên theo khóa sự kiện, ví dụ `chien-thang-bach-dang-938.jpg`.
2. Chép vào `frontend/public/images/events/`.
3. Cập nhật `"image"` thành `/images/events/<khóa>.<đuôi>` và viết lại `imageAltVi`, `imageAltEn` cho đúng nội dung ảnh.
4. Thêm mục vào `image-credits.json` gồm `file`, `author`, `license`, `licenseUrl`, `sourceUrl`.
5. Dựng lại giao diện để Next.js tối ưu ảnh mới.

Máy chủ đồng bộ `shared/history-events.json` mỗi lần khởi động: bổ sung sự kiện mới, cập nhật nội dung và nguồn tham khảo của sự kiện đã có, đồng thời tự thêm cột `sources` cho cơ sở dữ liệu cũ mà không cần xóa dữ liệu. Sau khi sửa tệp dữ liệu, chỉ cần khởi động lại máy chủ. Giao diện cũng cần xóa `frontend/.next/cache` nếu vẫn hiển thị nội dung cũ.

## 9. Tài liệu

| Tệp | Nội dung |
| --- | --- |
| `docs_and_qa/giao_diện_đáp_ứng.md` | Hệ thống thiết kế, bảng màu, kiểu chữ, thành phần |
| `docs_and_qa/đa_ngôn_ngữ.md` | Cách tổ chức từ điển và định tuyến ngôn ngữ |
| `docs_and_qa/đồng_bộ_dữ_liệu.md` | Cấu trúc tệp dùng chung và quy trình cập nhật |
| `docs_and_qa/bao_mat_va_trien_khai.md` | Đối chiếu bốn mươi hạng mục bảo mật và phát hành, kết quả kiểm chứng |
| `docs_and_qa/trợ_năng.md` | Cách website bảo đảm người dùng trình đọc màn hình và bàn phím đọc được toàn bộ nội dung |
| `docs_and_qa/kịch_bản_kiểm_thử/` | Sáu bộ kịch bản kiểm thử thủ công |
| `docs_and_qa/báo_cáo_lỗi/` | Mẫu báo cáo lỗi, quy trình xử lý, hai ví dụ và ba phiếu đang mở (BUG-003, BUG-004, BUG-005) |
| `docs_and_qa/tài_liệu_jira/` | Thiết lập bảng Jira, kế hoạch chu kỳ, đặc tả tính năng |

## 10. Giới hạn đã biết

- Bản đồ dùng máy chủ bản đồ công cộng. Khi lưu lượng lớn cần đánh giá lại điều khoản sử dụng và phương án tự lưu trữ.
- Giao diện quản trị duyệt đóng góp chưa được dựng; hiện dùng qua giao diện lập trình của máy chủ dữ liệu.
- Chính sách bảo mật cấp dòng mới được kiểm tra ở mức câu lệnh, chưa chạy đầu cuối với PostgreSQL trong môi trường phát triển hiện tại.
- Tệp điều phối Docker chưa được chạy trọn bộ trong môi trường phát triển hiện tại vì máy phát triển không có Docker. Cần chạy thử trên máy có Docker trước khi phát hành chính thức.
- Khung chờ của Next.js có thể không hiện trong một số môi trường tự động vì trình duyệt ẩn cửa sổ làm dừng khung hình. Đây là giới hạn môi trường, không phải lỗi website.
- Mỗi sự kiện chỉ lưu một tên bài Wikipedia nên liên kết ở bản tiếng Anh mở trang không tồn tại với 103 trên 149 sự kiện; xem `docs_and_qa/báo_cáo_lỗi/lỗi_liên_kết_04.md`.
- Mười sự kiện có năm bắt đầu nằm ngoài khoảng của thời kỳ đã gán; xem `docs_and_qa/báo_cáo_lỗi/lỗi_dữ_liệu_03.md`.
- 172 trên 400 lượt nguồn tham khảo chỉ ghi tên miền nhà xuất bản, chưa dẫn tới bài viết cụ thể; xem `docs_and_qa/báo_cáo_lỗi/lỗi_nguon_tham_khao_05.md`.
- Rào mềm công cụ kiểm tra của trình duyệt không chặn được triệt để: `F12` và `Ctrl+Shift+I` là phím tắt cấp trình duyệt, mã trang chỉ đánh chặn ở lớp sự kiện nên vẫn mở được công cụ qua menu của trình duyệt hoặc qua cửa sổ khác. Đây là giới hạn của website, không phải lỗi; không kiểm tra bảo mật nào phụ thuộc vào phần này. Tắt menu chuột phải trên toàn trang cũng là mất mát đã chấp nhận: không còn chuột phải để sao chép, lưu ảnh hay mở liên kết ở thẻ mới, nhưng Ctrl+C, Tab/Enter và chuột giữa vẫn dùng được.
- Trợ năng mới xác minh bằng cây trợ năng của Chrome, định kiểu tính toán và phím mô phỏng. Chưa nghe thật bằng NVDA hay VoiceOver, nên chưa loại trừ được hai vấn đề chỉ lộ ra khi nghe thật: nhịp thông báo của khối tổng hợp lỗi và cách trình đọc đọc danh sách 149 địa điểm.
