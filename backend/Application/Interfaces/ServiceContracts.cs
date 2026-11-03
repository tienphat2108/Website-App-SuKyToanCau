using WorldHistory.Application.DTOs;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Application.Interfaces;

/// <summary>
/// Nghiệp vụ đọc dữ liệu sự kiện lịch sử.
/// </summary>
public interface IEventService
{
    /// <summary>
    /// Lấy danh sách sự kiện theo bộ lọc và phân trang.
    /// </summary>
    /// <param name="filter">Bộ lọc từ phía người dùng.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Trang dữ liệu đã chuẩn hóa.</returns>
    Task<PagedResult<EventSummaryDto>> ListAsync(EventFilter filter, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy chi tiết một sự kiện theo khóa đường dẫn.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn của sự kiện.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Chi tiết sự kiện kèm các sự kiện liên quan.</returns>
    Task<EventDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh mục thời kỳ lịch sử.
    /// </summary>
    /// <returns>Danh sách thời kỳ theo thứ tự.</returns>
    IReadOnlyList<EraDto> GetEras();

    /// <summary>
    /// Lấy số liệu tổng quan của kho dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số liệu tổng quan.</returns>
    Task<SiteStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy đoạn tóm tắt tham khảo từ bách khoa toàn thư mở cho một sự kiện.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn của sự kiện.</param>
    /// <param name="language">Mã ngôn ngữ mong muốn, mặc định là tiếng Việt.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đoạn tóm tắt hoặc null nếu không có dữ liệu phù hợp.</returns>
    Task<ExternalSummaryDto?> GetExternalSummaryAsync(
        string slug,
        string language,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Nghiệp vụ tiếp nhận và duyệt đóng góp.
/// </summary>
public interface IContributionService
{
    /// <summary>
    /// Tiếp nhận một đóng góp mới sau khi kiểm tra và làm sạch dữ liệu.
    /// </summary>
    /// <param name="request">Dữ liệu người dùng gửi lên.</param>
    /// <param name="ipAddress">Địa chỉ mạng của người gửi, được băm trước khi lưu.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Mã đóng góp vừa tạo.</returns>
    Task<Guid> SubmitAsync(
        ContributionRequest request,
        string ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách đóng góp cho quản trị viên.
    /// </summary>
    /// <param name="status">Trạng thái cần lọc; null để lấy tất cả.</param>
    /// <param name="page">Trang hiện tại.</param>
    /// <param name="pageSize">Số bản ghi mỗi trang.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách đóng góp đã phân trang.</returns>
    Task<PagedResult<ContributionDto>> ListAsync(
        string? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật trạng thái duyệt của một đóng góp.
    /// </summary>
    /// <param name="id">Khóa của đóng góp.</param>
    /// <param name="status">Trạng thái mới dạng chuỗi.</param>
    /// <param name="reviewer">Tên đăng nhập của quản trị viên xử lý.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đóng góp sau khi cập nhật.</returns>
    Task<ContributionDto> ReviewAsync(
        Guid id,
        string status,
        string reviewer,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Thông tin cần thiết để gửi thư cảm ơn sau khi tiếp nhận đóng góp.
/// </summary>
/// <param name="Recipient">Địa chỉ thư điện tử của người đóng góp, đã chuẩn hóa.</param>
/// <param name="FullName">Họ tên đã làm sạch để chào trong thư.</param>
/// <param name="ContributionId">Mã tiếp nhận dùng làm căn cứ tra cứu.</param>
/// <param name="Locale">Mã ngôn ngữ của lần gửi, dùng chọn bản thư Việt hoặc Anh.</param>
public sealed record ThankYouEmail(
    string Recipient,
    string FullName,
    Guid ContributionId,
    string Locale);

/// <summary>
/// Nội dung một thư điện tử đã soạn xong.
/// </summary>
/// <param name="To">Địa chỉ người nhận.</param>
/// <param name="Subject">Tiêu đề thư.</param>
/// <param name="Body">Nội dung văn bản thuần.</param>
public sealed record EmailMessage(string To, string Subject, string Body);

/// <summary>
/// Hàng đợi thư cảm ơn chạy nền để không làm chậm phản hồi của biểu mẫu.
/// </summary>
public interface IThankYouEmailQueue
{
    /// <summary>
    /// Đưa một thư vào hàng đợi mà không chờ gửi xong.
    /// </summary>
    /// <param name="email">Thông tin thư cần gửi.</param>
    /// <returns>Đúng nếu thư đã vào hàng đợi; sai khi hàng đợi đầy.</returns>
    bool TryEnqueue(ThankYouEmail email);
}

/// <summary>
/// Dịch vụ chuyển thư điện tử tới máy chủ thư.
/// </summary>
public interface IThankYouEmailSender
{
    /// <summary>
    /// Gửi một thư đã soạn sẵn.
    /// </summary>
    /// <param name="message">Nội dung thư.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
}

/// <summary>
/// Nghiệp vụ xác thực quản trị viên.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Xác thực thông tin đăng nhập và cấp mã truy cập khi thành công.
    /// </summary>
    /// <param name="request">Tên đăng nhập và mật khẩu.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Mã truy cập và thời điểm hết hạn.</returns>
    Task<AuthResultDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}

/// <summary>
/// Dịch vụ băm và kiểm tra mật khẩu.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Tạo chuỗi băm từ mật khẩu văn bản gốc.
    /// </summary>
    /// <param name="password">Mật khẩu cần băm.</param>
    /// <returns>Chuỗi băm an toàn để lưu trữ.</returns>
    string Hash(string password);

    /// <summary>
    /// Kiểm tra mật khẩu với chuỗi băm đã lưu.
    /// </summary>
    /// <param name="password">Mật khẩu người dùng nhập.</param>
    /// <param name="hash">Chuỗi băm trong kho dữ liệu.</param>
    /// <returns>Đúng nếu khớp.</returns>
    bool Verify(string password, string hash);
}

/// <summary>
/// Dịch vụ tạo mã truy cập cho quản trị viên.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Tạo mã truy cập và thời điểm hết hạn cho tài khoản.
    /// </summary>
    /// <param name="user">Tài khoản đã xác thực.</param>
    /// <returns>Cặp giá trị gồm mã truy cập và thời điểm hết hạn.</returns>
    (string Token, DateTimeOffset ExpiresAt) CreateToken(AdminUser user);
}

/// <summary>
/// Dịch vụ mã hóa và giải mã dữ liệu nhạy cảm trước khi lưu trữ.
/// </summary>
public interface ISensitiveDataProtector
{
    /// <summary>
    /// Mã hóa một chuỗi nhạy cảm.
    /// </summary>
    /// <param name="plainText">Chuỗi gốc.</param>
    /// <returns>Chuỗi đã mã hóa, có thể lưu an toàn.</returns>
    string Protect(string plainText);

    /// <summary>
    /// Giải mã chuỗi đã được bảo vệ.
    /// </summary>
    /// <param name="protectedText">Chuỗi đã mã hóa.</param>
    /// <returns>Chuỗi gốc.</returns>
    string Unprotect(string protectedText);
}

/// <summary>
/// Dịch vụ băm địa chỉ mạng để chống lạm dụng mà không lưu địa chỉ gốc.
/// </summary>
public interface IIpHasher
{
    /// <summary>
    /// Băm địa chỉ mạng với khóa bí mật của hệ thống.
    /// </summary>
    /// <param name="ipAddress">Địa chỉ mạng gốc.</param>
    /// <returns>Chuỗi băm không thể đảo ngược.</returns>
    string Hash(string ipAddress);
}

/// <summary>
/// Nguồn dữ liệu tham khảo bên ngoài.
/// </summary>
public interface IExternalHistorySource
{
    /// <summary>
    /// Lấy đoạn tóm tắt từ bách khoa toàn thư mở.
    /// </summary>
    /// <param name="title">Tiêu đề trang cần tra cứu.</param>
    /// <param name="language">Mã ngôn ngữ, ví dụ <c>vi</c> hoặc <c>en</c>.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đoạn tóm tắt hoặc null nếu không lấy được.</returns>
    Task<ExternalSummaryDto?> GetSummaryAsync(
        string title,
        string language,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Nguồn thời gian có thể thay thế trong kiểm thử.
/// </summary>
public interface IClock
{
    /// <summary>Thời điểm hiện tại theo múi giờ phối hợp quốc tế.</summary>
    DateTimeOffset UtcNow { get; }
}
