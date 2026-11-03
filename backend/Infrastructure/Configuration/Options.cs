namespace WorldHistory.Infrastructure.Configuration;

/// <summary>
/// Cấu hình cấp và kiểm tra mã truy cập.
/// Khóa bí mật chỉ được cung cấp qua biến môi trường, không lưu trong kho mã nguồn.
/// </summary>
public sealed class JwtOptions
{
    /// <summary>Tên miền phát hành mã truy cập.</summary>
    public string Issuer { get; set; } = "WorldHistory.Api";

    /// <summary>Đối tượng được phép sử dụng mã truy cập.</summary>
    public string Audience { get; set; } = "WorldHistory.Client";

    /// <summary>Khóa đối xứng dùng để ký, tối thiểu 32 byte.</summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>Thời gian sống của mã truy cập, tính bằng phút.</summary>
    public int ExpiryMinutes { get; set; } = 30;
}

/// <summary>
/// Cấu hình bảo mật chung của hệ thống.
/// </summary>
public sealed class SecurityOptions
{
    /// <summary>Khóa dùng để băm địa chỉ mạng, tối thiểu 32 ký tự.</summary>
    public string IpHashKey { get; set; } = string.Empty;

    /// <summary>Thư mục lưu khóa mã hóa dữ liệu nhạy cảm.</summary>
    public string DataProtectionKeysPath { get; set; } = "keys";

    /// <summary>Tên đăng nhập quản trị được tạo tự động khi khởi tạo lần đầu.</summary>
    public string SeedAdminUsername { get; set; } = string.Empty;

    /// <summary>Mật khẩu quản trị ban đầu, chỉ đọc từ biến môi trường.</summary>
    public string SeedAdminPassword { get; set; } = string.Empty;

    /// <summary>Danh sách nguồn gốc được phép gọi API.</summary>
    public string[] AllowedOrigins { get; set; } = [];
}

/// <summary>
/// Cấu hình kết nối cơ sở dữ liệu.
/// </summary>
public sealed class DatabaseOptions
{
    /// <summary>Nhà cung cấp dữ liệu: <c>Sqlite</c> hoặc <c>Postgres</c>.</summary>
    public string Provider { get; set; } = "Sqlite";

    /// <summary>Bật chính sách bảo mật cấp dòng khi dùng Postgres.</summary>
    public bool ApplyRowLevelSecurity { get; set; } = true;
}

/// <summary>
/// Cấu hình gửi thư cảm ơn qua máy chủ thư.
/// Mật khẩu ứng dụng chỉ đọc từ biến môi trường, không lưu trong kho mã nguồn.
/// </summary>
public sealed class EmailOptions
{
    /// <summary>Bật hoặc tắt việc gửi thư cảm ơn.</summary>
    public bool Enabled { get; set; }

    /// <summary>Tên máy chủ thư, mặc định dùng Gmail.</summary>
    public string Host { get; set; } = "smtp.gmail.com";

    /// <summary>Cổng máy chủ thư; Gmail dùng 587 với STARTTLS.</summary>
    public int Port { get; set; } = 587;

    /// <summary>Yêu cầu nâng cấp kết nối sang TLS trước khi gửi.</summary>
    public bool UseStartTls { get; set; } = true;

    /// <summary>Tên đăng nhập máy chủ thư.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Mật khẩu ứng dụng của máy chủ thư.</summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>Địa chỉ gửi hiển thị trên thư.</summary>
    public string FromAddress { get; set; } = string.Empty;

    /// <summary>Tên người gửi hiển thị trên thư.</summary>
    public string FromName { get; set; } = "Sử Ký Toàn Cầu";

    /// <summary>Địa chỉ nhận phản hồi; để trống nếu dùng chung địa chỉ gửi.</summary>
    public string ReplyToAddress { get; set; } = string.Empty;

    /// <summary>Thời gian chờ tối đa cho một lần gửi, tính bằng giây.</summary>
    public int TimeoutSeconds { get; set; } = 10;

    /// <summary>Số thư tối đa chờ trong hàng đợi nền.</summary>
    public int QueueCapacity { get; set; } = 100;
}

/// <summary>
/// Cấu hình nguồn dữ liệu tham khảo bên ngoài.
/// </summary>
public sealed class ExternalApiOptions
{
    /// <summary>Bật hoặc tắt tính năng lấy tóm tắt bên ngoài.</summary>
    public bool Enabled { get; set; } = true;

    /// <summary>Mẫu địa chỉ API theo mã ngôn ngữ.</summary>
    public string BaseUrlTemplate { get; set; } = "https://{0}.wikipedia.org/w/api.php";

    /// <summary>Thời gian chờ tối đa cho một yêu cầu, tính bằng giây.</summary>
    public int TimeoutSeconds { get; set; } = 5;

    /// <summary>Thời gian lưu bộ nhớ đệm, tính bằng phút.</summary>
    public int CacheMinutes { get; set; } = 360;

    /// <summary>Độ dài tối đa của đoạn tóm tắt trả về.</summary>
    public int MaxLength { get; set; } = 900;

    /// <summary>Chuỗi nhận diện ứng dụng khi gọi dịch vụ bên ngoài.</summary>
    public string UserAgent { get; set; } = "WorldHistoryEncyclopedia/1.0 (contact@example.com)";
}
