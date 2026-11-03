namespace WorldHistory.Core.Enums;

/// <summary>
/// Trạng thái xử lý của một đóng góp do độc giả gửi lên.
/// Giá trị được lưu dưới dạng chuỗi trong cơ sở dữ liệu để dễ đọc khi vận hành.
/// </summary>
public enum ContributionStatus
{
    /// <summary>Đóng góp mới, đang chờ quản trị viên xem xét.</summary>
    Pending = 0,

    /// <summary>Đóng góp đã được duyệt và có thể dùng làm tư liệu biên tập.</summary>
    Approved = 1,

    /// <summary>Đóng góp bị từ chối do không đạt yêu cầu nội dung.</summary>
    Rejected = 2
}
