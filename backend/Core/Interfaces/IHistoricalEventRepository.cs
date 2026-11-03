using WorldHistory.Core.Entities;

namespace WorldHistory.Core.Interfaces;

/// <summary>
/// Bộ lọc và phân trang cho danh sách sự kiện lịch sử.
/// Mọi giá trị đều tùy chọn; tầng ứng dụng sẽ chuẩn hóa trước khi truy vấn.
/// </summary>
/// <param name="Era">Khóa thời kỳ cần lọc.</param>
/// <param name="Country">Tên quốc gia cần lọc, so khớp tương đối.</param>
/// <param name="Search">Từ khóa tìm trong tiêu đề, tóm tắt và nội dung.</param>
/// <param name="FromYear">Năm bắt đầu của khoảng thời gian.</param>
/// <param name="ToYear">Năm kết thúc của khoảng thời gian.</param>
/// <param name="FeaturedOnly">Chỉ lấy các sự kiện nổi bật.</param>
/// <param name="Page">Trang hiện tại, bắt đầu từ một.</param>
/// <param name="PageSize">Số bản ghi mỗi trang.</param>
public sealed record EventFilter(
    string? Era = null,
    string? Country = null,
    string? Search = null,
    int? FromYear = null,
    int? ToYear = null,
    bool FeaturedOnly = false,
    int Page = 1,
    int PageSize = 12);

/// <summary>
/// Hợp đồng truy cập dữ liệu sự kiện lịch sử.
/// Mọi truy vấn đều dùng tham số hóa thông qua EF Core để chống chèn câu lệnh.
/// </summary>
public interface IHistoricalEventRepository
{
    /// <summary>
    /// Lấy danh sách sự kiện theo bộ lọc, kèm tổng số bản ghi phù hợp.
    /// </summary>
    /// <param name="filter">Bộ lọc đã chuẩn hóa.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách sự kiện của trang hiện tại và tổng số bản ghi.</returns>
    Task<(IReadOnlyList<HistoricalEvent> Items, int Total)> ListAsync(
        EventFilter filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tìm một sự kiện theo khóa đường dẫn.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Sự kiện hoặc null nếu không tồn tại.</returns>
    Task<HistoricalEvent?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy nhiều sự kiện theo danh sách khóa, giữ đúng thứ tự đầu vào.
    /// </summary>
    /// <param name="slugs">Danh sách khóa cần lấy.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách sự kiện tìm thấy.</returns>
    Task<IReadOnlyList<HistoricalEvent>> GetBySlugsAsync(
        IReadOnlyCollection<string> slugs,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Đếm số sự kiện đang có trong hệ thống.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Tổng số sự kiện.</returns>
    Task<int> CountAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm nhiều sự kiện trong một lần gọi, dùng cho quá trình khởi tạo dữ liệu.
    /// </summary>
    /// <param name="events">Các sự kiện cần thêm.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    Task AddRangeAsync(IEnumerable<HistoricalEvent> events, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy số liệu tổng hợp phục vụ trang chủ và phần giới thiệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số liệu tổng hợp của kho dữ liệu.</returns>
    Task<EventStats> GetStatsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Số liệu tổng hợp của kho dữ liệu sự kiện.
/// </summary>
/// <param name="TotalEvents">Tổng số sự kiện.</param>
/// <param name="TotalCountries">Số quốc gia hoặc khu vực khác nhau.</param>
/// <param name="FeaturedEvents">Số sự kiện được đánh dấu nổi bật.</param>
/// <param name="EarliestYear">Năm sớm nhất trong dữ liệu.</param>
/// <param name="LatestYear">Năm muộn nhất trong dữ liệu.</param>
public sealed record EventStats(
    int TotalEvents,
    int TotalCountries,
    int FeaturedEvents,
    int EarliestYear,
    int LatestYear);
