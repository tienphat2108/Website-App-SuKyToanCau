namespace WorldHistory.Core.Entities;

/// <summary>
/// Một nguồn tham khảo gắn với bài viết lịch sử.
/// Nguồn được hiển thị ở cuối bài để người đọc tra cứu và kiểm chứng nội dung.
/// </summary>
public sealed class EventSource
{
    /// <summary>Tên bài viết, tài liệu hoặc ấn phẩm tham khảo.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Cơ quan, nhà xuất bản hoặc tổ chức công bố nguồn.</summary>
    public string Publisher { get; set; } = string.Empty;

    /// <summary>Đường dẫn tới nguồn, chỉ chấp nhận địa chỉ bảo mật http hoặc https.</summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>Ngôn ngữ của nguồn, dùng mã <c>vi</c> hoặc <c>en</c>.</summary>
    public string Language { get; set; } = "vi";
}
