using Microsoft.Extensions.Logging;
using WorldHistory.Application.DTOs;
using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Validation;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Enums;
using WorldHistory.Core.Exceptions;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Application.Services;

/// <summary>
/// Nghiệp vụ đọc dữ liệu sự kiện lịch sử.
/// Chịu trách nhiệm chuẩn hóa bộ lọc, phân trang và tổng hợp sự kiện liên quan.
/// </summary>
public sealed class EventService : IEventService
{
    private const int MaxPageSize = 200;
    private const int MaxSearchLength = 120;
    private const int RelatedLimit = 3;

    private readonly IHistoricalEventRepository _repository;
    private readonly IExternalHistorySource _externalSource;
    private readonly ILogger<EventService> _logger;

    /// <summary>
    /// Khởi tạo nghiệp vụ sự kiện.
    /// </summary>
    /// <param name="repository">Kho dữ liệu sự kiện.</param>
    /// <param name="externalSource">Nguồn tóm tắt tham khảo bên ngoài.</param>
    /// <param name="logger">Bộ ghi nhật ký.</param>
    public EventService(
        IHistoricalEventRepository repository,
        IExternalHistorySource externalSource,
        ILogger<EventService> logger)
    {
        _repository = repository;
        _externalSource = externalSource;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách sự kiện theo bộ lọc và phân trang.
    /// </summary>
    /// <param name="filter">Bộ lọc từ phía người dùng.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Trang dữ liệu đã chuẩn hóa.</returns>
    /// <exception cref="ValidationException">Khi khóa thời kỳ không hợp lệ.</exception>
    public async Task<PagedResult<EventSummaryDto>> ListAsync(
        EventFilter filter,
        CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeFilter(filter);
        var (items, total) = await _repository.ListAsync(normalized, cancellationToken);

        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)normalized.PageSize);

        return new PagedResult<EventSummaryDto>(
            items.Select(item => item.ToSummaryDto()).ToArray(),
            normalized.Page,
            normalized.PageSize,
            total,
            totalPages);
    }

    /// <summary>
    /// Lấy chi tiết một sự kiện theo khóa đường dẫn.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn của sự kiện.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Chi tiết sự kiện kèm các sự kiện liên quan.</returns>
    /// <exception cref="NotFoundException">Khi không tìm thấy sự kiện.</exception>
    public async Task<EventDetailDto> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var historicalEvent = await _repository.GetBySlugAsync(normalizedSlug, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy sự kiện lịch sử này.");

        var related = await LoadRelatedAsync(historicalEvent, cancellationToken);
        return historicalEvent.ToDetailDto(related);
    }

    /// <summary>
    /// Lấy danh mục thời kỳ lịch sử.
    /// </summary>
    /// <returns>Danh sách thời kỳ theo thứ tự.</returns>
    public IReadOnlyList<EraDto> GetEras() =>
        EraCatalog.All
            .OrderBy(era => era.Order)
            .Select(era => new EraDto(era.Key, era.NameVi, era.NameEn, era.Order, era.FromYear, era.ToYear))
            .ToArray();

    /// <summary>
    /// Lấy số liệu tổng quan của kho dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số liệu tổng quan.</returns>
    public async Task<SiteStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var stats = await _repository.GetStatsAsync(cancellationToken);

        return new SiteStatsDto(
            stats.TotalEvents,
            EraCatalog.All.Count,
            stats.TotalCountries,
            stats.FeaturedEvents,
            stats.EarliestYear,
            stats.LatestYear);
    }

    /// <summary>
    /// Lấy đoạn tóm tắt tham khảo từ bách khoa toàn thư mở cho một sự kiện.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn của sự kiện.</param>
    /// <param name="language">Mã ngôn ngữ mong muốn.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đoạn tóm tắt hoặc null nếu không có dữ liệu phù hợp.</returns>
    public async Task<ExternalSummaryDto?> GetExternalSummaryAsync(
        string slug,
        string language,
        CancellationToken cancellationToken = default)
    {
        if (language is not ("vi" or "en"))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["language"] = ["Ngôn ngữ chỉ hỗ trợ vi hoặc en."]
            });
        }

        var historicalEvent = await _repository.GetBySlugAsync(
            slug.Trim().ToLowerInvariant(),
            cancellationToken);

        if (historicalEvent is null || string.IsNullOrWhiteSpace(historicalEvent.WikiTitle))
        {
            return null;
        }

        try
        {
            return await _externalSource.GetSummaryAsync(historicalEvent.WikiTitle, language, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            // Lỗi từ nguồn bên ngoài không được làm hỏng trang chi tiết sự kiện.
            _logger.LogWarning(exception, "Không lấy được tóm tắt tham khảo cho sự kiện {Slug}.", slug);
            return null;
        }
    }

    /// <summary>
    /// Chuẩn hóa bộ lọc để tránh truy vấn bất thường và giới hạn tài nguyên.
    /// </summary>
    /// <param name="filter">Bộ lọc gốc.</param>
    /// <returns>Bộ lọc đã chuẩn hóa.</returns>
    /// <exception cref="ValidationException">Khi khóa thời kỳ không hợp lệ.</exception>
    private static EventFilter NormalizeFilter(EventFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Era) && !EraCatalog.IsValid(filter.Era))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["era"] = ["Thời kỳ lịch sử không hợp lệ."]
            });
        }

        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, MaxPageSize);

        var fromYear = filter.FromYear;
        var toYear = filter.ToYear;

        if (fromYear.HasValue && toYear.HasValue && fromYear > toYear)
        {
            (fromYear, toYear) = (toYear, fromYear);
        }

        var search = string.IsNullOrWhiteSpace(filter.Search)
            ? null
            : InputSanitizer.Clean(filter.Search, MaxSearchLength);

        var country = string.IsNullOrWhiteSpace(filter.Country)
            ? null
            : InputSanitizer.Clean(filter.Country, 80);

        return filter with
        {
            Era = string.IsNullOrWhiteSpace(filter.Era) ? null : filter.Era.Trim().ToLowerInvariant(),
            Country = string.IsNullOrWhiteSpace(country) ? null : country,
            Search = string.IsNullOrWhiteSpace(search) ? null : search,
            FromYear = fromYear,
            ToYear = toYear,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Tải danh sách sự kiện liên quan, ưu tiên các khóa do biên tập viên chỉ định.
    /// </summary>
    /// <param name="historicalEvent">Sự kiện gốc.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Tối đa ba sự kiện liên quan.</returns>
    private async Task<IReadOnlyList<EventSummaryDto>> LoadRelatedAsync(
        HistoricalEvent historicalEvent,
        CancellationToken cancellationToken)
    {
        var related = new List<EventSummaryDto>();

        // Theo dõi các khóa đã dùng để không lặp lại thẻ khi dữ liệu biên tập bị trùng.
        var seenSlugs = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            historicalEvent.Slug
        };

        if (historicalEvent.RelatedSlugs.Count > 0)
        {
            var loaded = await _repository.GetBySlugsAsync(
                historicalEvent.RelatedSlugs.Distinct(StringComparer.OrdinalIgnoreCase).Take(RelatedLimit).ToArray(),
                cancellationToken);

            var bySlug = loaded.ToDictionary(item => item.Slug, StringComparer.OrdinalIgnoreCase);
            foreach (var relatedSlug in historicalEvent.RelatedSlugs)
            {
                if (related.Count >= RelatedLimit)
                {
                    break;
                }

                // Khóa trùng hoặc chính sự kiện đang xem đều bị bỏ qua.
                if (!seenSlugs.Add(relatedSlug))
                {
                    continue;
                }

                if (bySlug.TryGetValue(relatedSlug, out var item))
                {
                    related.Add(item.ToSummaryDto());
                }
            }
        }

        if (related.Count >= RelatedLimit)
        {
            return related;
        }

        // Nếu biên tập viên chưa chỉ định đủ, bổ sung các sự kiện cùng thời kỳ.
        var (sameEra, _) = await _repository.ListAsync(
            new EventFilter(Era: historicalEvent.Era, Page: 1, PageSize: RelatedLimit + 1),
            cancellationToken);

        foreach (var candidate in sameEra)
        {
            if (related.Count >= RelatedLimit)
            {
                break;
            }

            if (seenSlugs.Add(candidate.Slug))
            {
                related.Add(candidate.ToSummaryDto());
            }
        }

        return related;
    }
}
