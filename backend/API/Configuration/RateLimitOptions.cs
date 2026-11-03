namespace WorldHistory.Api.Configuration;

/// <summary>
/// Cấu hình giới hạn tần suất yêu cầu.
/// Giá trị được tách khỏi mã nguồn để môi trường kiểm thử có thể nới lỏng.
/// </summary>
public sealed class RateLimitOptions
{
    /// <summary>Tổng số yêu cầu tối đa cho mỗi địa chỉ trong một cửa sổ chung.</summary>
    public int GlobalPermitLimit { get; set; } = 300;

    /// <summary>Số lần đăng nhập tối đa trong một cửa sổ.</summary>
    public int LoginPermitLimit { get; set; } = 5;

    /// <summary>Số đóng góp tối đa trong một cửa sổ.</summary>
    public int ContributionPermitLimit { get; set; } = 3;

    /// <summary>Độ dài cửa sổ chung và cửa sổ đăng nhập, tính bằng giây.</summary>
    public int WindowSeconds { get; set; } = 60;

    /// <summary>Độ dài cửa sổ gửi đóng góp, tính bằng giây.</summary>
    public int ContributionWindowSeconds { get; set; } = 3600;
}
