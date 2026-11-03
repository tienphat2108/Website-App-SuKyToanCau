namespace WorldHistory.Application.DTOs;

/// <summary>
/// Thông tin tóm tắt của một sự kiện, dùng cho danh sách, thẻ và bản đồ.
/// Không chứa nội dung đầy đủ để giảm dung lượng phản hồi.
/// </summary>
public sealed record EventSummaryDto(
    string Slug,
    string Era,
    string EraNameVi,
    string EraNameEn,
    string Country,
    string CountryEn,
    int StartYear,
    int? EndYear,
    string DateLabelVi,
    string DateLabelEn,
    string TitleVi,
    string TitleEn,
    string SummaryVi,
    string SummaryEn,
    string LocationVi,
    string LocationEn,
    double Latitude,
    double Longitude,
    string ImagePath,
    string ImageAltVi,
    string ImageAltEn,
    IReadOnlyList<string> TagsVi,
    IReadOnlyList<string> TagsEn,
    bool Featured);

/// <summary>
/// Thông tin chi tiết của một sự kiện, bao gồm nội dung song ngữ và liên kết liên quan.
/// </summary>
public sealed record EventDetailDto(
    string Slug,
    string Era,
    string EraNameVi,
    string EraNameEn,
    string Country,
    string CountryEn,
    int StartYear,
    int? EndYear,
    string DateLabelVi,
    string DateLabelEn,
    string TitleVi,
    string TitleEn,
    string SummaryVi,
    string SummaryEn,
    IReadOnlyList<string> ContentVi,
    IReadOnlyList<string> ContentEn,
    string LocationVi,
    string LocationEn,
    double Latitude,
    double Longitude,
    string ImagePath,
    string ImageAltVi,
    string ImageAltEn,
    IReadOnlyList<string> TagsVi,
    IReadOnlyList<string> TagsEn,
    IReadOnlyList<EventSourceDto> Sources,
    string? WikiTitle,
    bool Featured,
    IReadOnlyList<EventSummaryDto> Related,
    DateTimeOffset UpdatedAt);

/// <summary>
/// Một nguồn tham khảo ở cuối bài viết.
/// </summary>
/// <param name="Title">Tên tài liệu hoặc bài viết.</param>
/// <param name="Publisher">Cơ quan hoặc tổ chức công bố.</param>
/// <param name="Url">Đường dẫn tới nguồn.</param>
/// <param name="Language">Ngôn ngữ của nguồn.</param>
public sealed record EventSourceDto(
    string Title,
    string Publisher,
    string Url,
    string Language);

/// <summary>
/// Kết quả phân trang dùng chung cho các danh sách.
/// </summary>
/// <typeparam name="T">Kiểu phần tử trong danh sách.</typeparam>
/// <param name="Items">Các phần tử của trang hiện tại.</param>
/// <param name="Page">Trang hiện tại, bắt đầu từ một.</param>
/// <param name="PageSize">Số phần tử mỗi trang.</param>
/// <param name="Total">Tổng số phần tử phù hợp bộ lọc.</param>
/// <param name="TotalPages">Tổng số trang.</param>
public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int Total,
    int TotalPages);

/// <summary>
/// Thông tin một thời kỳ lịch sử trả về cho giao diện.
/// </summary>
public sealed record EraDto(
    string Key,
    string NameVi,
    string NameEn,
    int Order,
    int FromYear,
    int ToYear);

/// <summary>
/// Số liệu tổng quan của kho dữ liệu lịch sử.
/// </summary>
public sealed record SiteStatsDto(
    int TotalEvents,
    int TotalEras,
    int TotalCountries,
    int FeaturedEvents,
    int EarliestYear,
    int LatestYear);

/// <summary>
/// Yêu cầu gửi đóng góp từ độc giả.
/// Trường <c>Website</c> là bẫy chống tự động gửi và phải luôn để trống.
/// </summary>
public sealed record ContributionRequest(
    string FullName,
    string Email,
    string Message,
    string? EventSuggestion = null,
    string? Website = null,
    string? Locale = null);

/// <summary>
/// Đóng góp trả về cho quản trị viên, bao gồm thư điện tử đã giải mã.
/// </summary>
public sealed record ContributionDto(
    Guid Id,
    string FullName,
    string Email,
    string Message,
    string? EventSuggestion,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ReviewedAt,
    string? ReviewedBy);

/// <summary>
/// Yêu cầu đăng nhập của quản trị viên.
/// </summary>
public sealed record LoginRequest(string Username, string Password);

/// <summary>
/// Kết quả đăng nhập thành công.
/// </summary>
public sealed record AuthResultDto(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    string Username,
    string Role);

/// <summary>
/// Yêu cầu cập nhật trạng thái một đóng góp.
/// </summary>
public sealed record ContributionStatusRequest(string Status);

/// <summary>
/// Đoạn tóm tắt tham khảo lấy từ bách khoa toàn thư mở, đã được làm sạch.
/// </summary>
public sealed record ExternalSummaryDto(
    string Title,
    string Extract,
    string SourceUrl,
    string Language);
