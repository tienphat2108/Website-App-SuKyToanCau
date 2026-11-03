namespace WorldHistory.Core.Entities;

/// <summary>
/// Tài khoản quản trị dùng để duyệt đóng góp.
/// Mật khẩu chỉ được lưu dưới dạng băm, không bao giờ lưu văn bản gốc.
/// </summary>
public sealed class AdminUser : EntityBase
{
    /// <summary>Khóa chính của tài khoản.</summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Tên đăng nhập duy nhất, được chuẩn hóa chữ thường.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Chuỗi băm mật khẩu do thuật toán BCrypt tạo ra.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>Vai trò của tài khoản, hiện hỗ trợ giá trị <c>Admin</c>.</summary>
    public string Role { get; set; } = "Admin";

    /// <summary>Số lần đăng nhập sai liên tiếp.</summary>
    public int FailedLoginCount { get; set; }

    /// <summary>Thời điểm kết thúc khóa tạm thời sau khi đăng nhập sai quá nhiều lần.</summary>
    public DateTimeOffset? LockoutEndUtc { get; set; }

    /// <summary>Thời điểm đăng nhập thành công gần nhất.</summary>
    public DateTimeOffset? LastLoginAt { get; set; }

    /// <summary>
    /// Kiểm tra tài khoản có đang bị khóa tạm thời tại thời điểm cho trước hay không.
    /// </summary>
    /// <param name="now">Thời điểm hiện tại theo múi giờ phối hợp quốc tế.</param>
    /// <returns>Đúng nếu tài khoản còn trong thời gian khóa.</returns>
    public bool IsLockedOut(DateTimeOffset now) =>
        LockoutEndUtc.HasValue && LockoutEndUtc.Value > now;
}
