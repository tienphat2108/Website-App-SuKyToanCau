using Microsoft.EntityFrameworkCore;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Interfaces;
using WorldHistory.Infrastructure.Persistence;

namespace WorldHistory.Infrastructure.Persistence.Repositories;

/// <summary>
/// Triển khai truy vấn sự kiện lịch sử bằng EF Core.
/// Mọi điều kiện lọc đều được truyền dưới dạng tham số, không nối chuỗi câu lệnh.
/// </summary>
public sealed class HistoricalEventRepository : IHistoricalEventRepository
{
    private readonly WorldHistoryDbContext _dbContext;

    /// <summary>
    /// Khởi tạo kho dữ liệu sự kiện.
    /// </summary>
    /// <param name="dbContext">Ngữ cảnh cơ sở dữ liệu.</param>
    public HistoricalEventRepository(WorldHistoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Lấy danh sách sự kiện theo bộ lọc, kèm tổng số bản ghi phù hợp.
    /// </summary>
    /// <param name="filter">Bộ lọc đã chuẩn hóa.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách sự kiện của trang hiện tại và tổng số bản ghi.</returns>
    public async Task<(IReadOnlyList<HistoricalEvent> Items, int Total)> ListAsync(
        EventFilter filter,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(filter);
        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(item => item.StartYear)
            .ThenBy(item => item.Slug)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToArrayAsync(cancellationToken);

        return (items, total);
    }

    /// <summary>
    /// Tìm một sự kiện theo khóa đường dẫn.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Sự kiện hoặc null nếu không tồn tại.</returns>
    public Task<HistoricalEvent?> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default) =>
        _dbContext.HistoricalEvents
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Slug == slug, cancellationToken);

    /// <summary>
    /// Lấy nhiều sự kiện theo danh sách khóa, giữ đúng thứ tự đầu vào.
    /// </summary>
    /// <param name="slugs">Danh sách khóa cần lấy.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách sự kiện tìm thấy.</returns>
    public async Task<IReadOnlyList<HistoricalEvent>> GetBySlugsAsync(
        IReadOnlyCollection<string> slugs,
        CancellationToken cancellationToken = default)
    {
        if (slugs.Count == 0)
        {
            return [];
        }

        var normalized = slugs
            .Where(slug => !string.IsNullOrWhiteSpace(slug))
            .Select(slug => slug.Trim().ToLowerInvariant())
            .Distinct()
            .ToArray();

        var items = await _dbContext.HistoricalEvents
            .AsNoTracking()
            .Where(item => normalized.Contains(item.Slug))
            .ToArrayAsync(cancellationToken);

        var bySlug = items.ToDictionary(item => item.Slug, StringComparer.OrdinalIgnoreCase);
        return normalized
            .Where(bySlug.ContainsKey)
            .Select(slug => bySlug[slug])
            .ToArray();
    }

    /// <summary>
    /// Đếm số sự kiện đang có trong hệ thống.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Tổng số sự kiện.</returns>
    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        _dbContext.HistoricalEvents.CountAsync(cancellationToken);

    /// <summary>
    /// Thêm nhiều sự kiện trong một lần gọi.
    /// </summary>
    /// <param name="events">Các sự kiện cần thêm.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    public async Task AddRangeAsync(
        IEnumerable<HistoricalEvent> events,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.HistoricalEvents.AddRangeAsync(events, cancellationToken);
    }

    /// <summary>
    /// Lấy số liệu tổng hợp phục vụ trang chủ.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số liệu tổng hợp của kho dữ liệu.</returns>
    public async Task<EventStats> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var total = await _dbContext.HistoricalEvents.CountAsync(cancellationToken);
        if (total == 0)
        {
            return new EventStats(0, 0, 0, 0, 0);
        }

        var countries = await _dbContext.HistoricalEvents
            .Select(item => item.Country)
            .Distinct()
            .CountAsync(cancellationToken);

        var featured = await _dbContext.HistoricalEvents
            .CountAsync(item => item.Featured, cancellationToken);

        var earliest = await _dbContext.HistoricalEvents.MinAsync(item => item.StartYear, cancellationToken);
        var latest = await _dbContext.HistoricalEvents.MaxAsync(item => item.StartYear, cancellationToken);

        return new EventStats(total, countries, featured, earliest, latest);
    }

    /// <summary>
    /// Dựng truy vấn từ bộ lọc, chỉ thêm điều kiện khi có giá trị.
    /// </summary>
    /// <param name="filter">Bộ lọc đã chuẩn hóa.</param>
    /// <returns>Truy vấn chưa sắp xếp.</returns>
    private IQueryable<HistoricalEvent> BuildQuery(EventFilter filter)
    {
        var query = _dbContext.HistoricalEvents.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Era))
        {
            query = query.Where(item => item.Era == filter.Era);
        }

        if (!string.IsNullOrWhiteSpace(filter.Country))
        {
            var country = filter.Country.ToLower();
            query = query.Where(item =>
                item.Country.ToLower().Contains(country) ||
                item.CountryEn.ToLower().Contains(country));
        }

        if (filter.FromYear.HasValue)
        {
            query = query.Where(item =>
                (item.EndYear ?? item.StartYear) >= filter.FromYear.Value);
        }

        if (filter.ToYear.HasValue)
        {
            query = query.Where(item => item.StartYear <= filter.ToYear.Value);
        }

        if (filter.FeaturedOnly)
        {
            query = query.Where(item => item.Featured);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();
            query = query.Where(item =>
                item.TitleVi.ToLower().Contains(search) ||
                item.TitleEn.ToLower().Contains(search) ||
                item.SummaryVi.ToLower().Contains(search) ||
                item.SummaryEn.ToLower().Contains(search) ||
                item.LocationVi.ToLower().Contains(search) ||
                item.LocationEn.ToLower().Contains(search));
        }

        return query;
    }
}
