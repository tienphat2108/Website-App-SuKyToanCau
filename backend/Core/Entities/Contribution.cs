using WorldHistory.Core.Enums;

namespace WorldHistory.Core.Entities;

/// <summary>
/// Đóng góp nội dung do độc giả gửi lên.
/// Địa chỉ thư điện tử được mã hóa trước khi lưu để hạn chế rò rỉ dữ liệu cá nhân.
/// </summary>
public sealed class Contribution : EntityBase
{
    /// <summary>Khóa chính của đóng góp.</summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Tên người gửi, đã được kiểm tra và làm sạch.</summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>Địa chỉ thư điện tử đã mã hóa, chỉ quản trị viên có quyền giải mã.</summary>
    public string EmailProtected { get; set; } = string.Empty;

    /// <summary>Nội dung đóng góp hoặc chỉnh sửa đề xuất, ở dạng văn bản thuần.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Tên sự kiện hoặc chủ đề mà người gửi muốn bổ sung, có thể để trống.</summary>
    public string? EventSuggestion { get; set; }

    /// <summary>Trạng thái duyệt hiện tại.</summary>
    public ContributionStatus Status { get; set; } = ContributionStatus.Pending;

    /// <summary>Mã băm của địa chỉ mạng người gửi, phục vụ chống lạm dụng mà không lưu địa chỉ gốc.</summary>
    public string IpHash { get; set; } = string.Empty;

    /// <summary>Thời điểm quản trị viên xử lý đóng góp.</summary>
    public DateTimeOffset? ReviewedAt { get; set; }

    /// <summary>Tên đăng nhập của quản trị viên đã xử lý.</summary>
    public string? ReviewedBy { get; set; }
}
