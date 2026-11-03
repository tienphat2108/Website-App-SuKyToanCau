using Microsoft.Extensions.Logging.Abstractions;
using WorldHistory.Application.DTOs;
using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Services;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Enums;
using WorldHistory.Core.Exceptions;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Tests.Services;

/// <summary>
/// Kiểm thử nghiệp vụ đọc dữ liệu sự kiện.
/// Các ca kiểm thử tập trung vào chuẩn hóa bộ lọc, phân trang, ánh xạ thời kỳ
/// và cách xử lý sự kiện liên quan hoặc nguồn tham khảo bên ngoài.
/// </summary>
public sealed class EventServiceTests
{
    /// <summary>
    /// Trang và kích thước trang phải được kẹp về khoảng hợp lệ trước khi truy vấn.
    /// </summary>
    [Fact]
    public async Task ListAsync_ClampsPageAndPageSize()
    {
        var repository = new FakeHistoricalEventRepository();
        var service = CreateService(repository);

        await service.ListAsync(new EventFilter(Page: 0, PageSize: 1000));

        Assert.NotNull(repository.LastFilter);
        Assert.Equal(1, repository.LastFilter!.Page);
        Assert.Equal(200, repository.LastFilter.PageSize);
    }

    /// <summary>
    /// Khóa thời kỳ không tồn tại phải bị từ chối thay vì trả về danh sách rỗng.
    /// </summary>
    [Fact]
    public async Task ListAsync_InvalidEra_ThrowsValidationException()
    {
        var service = CreateService(new FakeHistoricalEventRepository());

        var exception = await Assert.ThrowsAsync<ValidationException>(
            () => service.ListAsync(new EventFilter(Era: "khong-ton-tai")));

        Assert.Contains("era", exception.Errors.Keys);
    }

    /// <summary>
    /// Khoảng năm bị đảo phải được tự động sắp xếp lại để truy vấn đúng.
    /// </summary>
    [Fact]
    public async Task ListAsync_SwapsReversedYearRange()
    {
        var repository = new FakeHistoricalEventRepository();
        var service = CreateService(repository);

        await service.ListAsync(new EventFilter(FromYear: 1945, ToYear: 1802));

        Assert.Equal(1802, repository.LastFilter!.FromYear);
        Assert.Equal(1945, repository.LastFilter.ToYear);
    }

    /// <summary>
    /// Từ khóa tìm kiếm phải được làm sạch và cắt theo giới hạn trước khi tới kho dữ liệu.
    /// </summary>
    [Fact]
    public async Task ListAsync_SanitizesAndTruncatesSearch()
    {
        var repository = new FakeHistoricalEventRepository();
        var service = CreateService(repository);

        await service.ListAsync(new EventFilter(Search: "<b>Bạch Đằng</b>"));
        Assert.Equal("Bạch Đằng", repository.LastFilter!.Search);

        await service.ListAsync(new EventFilter(Search: new string('a', 500)));
        Assert.Equal(120, repository.LastFilter!.Search!.Length);
    }

    /// <summary>
    /// Tổng số trang phải được tính đúng từ tổng số bản ghi và kích thước trang.
    /// </summary>
    [Fact]
    public async Task ListAsync_ComputesTotalPages()
    {
        var repository = new FakeHistoricalEventRepository();

        for (var index = 0; index < 25; index++)
        {
            repository.Events.Add(CreateEvent($"su-kien-{index}", index));
        }

        var service = CreateService(repository);

        var result = await service.ListAsync(new EventFilter(Page: 1, PageSize: 10));

        Assert.Equal(25, result.Total);
        Assert.Equal(3, result.TotalPages);
        Assert.Equal(10, result.Items.Count);
    }

    /// <summary>
    /// Tên thời kỳ song ngữ phải được lấy từ danh mục dùng chung, không phụ thuộc dữ liệu thô.
    /// </summary>
    [Fact]
    public async Task ListAsync_MapsEraNamesFromCatalog()
    {
        var repository = new FakeHistoricalEventRepository();
        repository.Events.Add(CreateEvent("bach-dang-938", 938, EraCatalog.TrungDai));

        var service = CreateService(repository);

        var result = await service.ListAsync(new EventFilter());

        var item = Assert.Single(result.Items);
        Assert.Equal("Trung đại", item.EraNameVi);
        Assert.Equal("Medieval", item.EraNameEn);
    }

    /// <summary>
    /// Khóa đường dẫn phải được chuẩn hóa trước khi tra cứu để chấp nhận chữ hoa và khoảng trắng thừa.
    /// </summary>
    [Fact]
    public async Task GetBySlugAsync_NormalizesSlug()
    {
        var repository = new FakeHistoricalEventRepository();
        repository.Events.Add(CreateEvent("bach-dang-938", 938));

        var service = CreateService(repository);

        var detail = await service.GetBySlugAsync("  Bach-Dang-938  ");

        Assert.Equal("bach-dang-938", detail.Slug);
    }

    /// <summary>
    /// Khóa đường dẫn không tồn tại phải trả lỗi không tìm thấy để tầng trình diễn trả mã 404.
    /// </summary>
    [Fact]
    public async Task GetBySlugAsync_MissingEvent_ThrowsNotFoundException()
    {
        var service = CreateService(new FakeHistoricalEventRepository());

        await Assert.ThrowsAsync<NotFoundException>(() => service.GetBySlugAsync("khong-co"));
    }

    /// <summary>
    /// Danh sách liên quan ưu tiên khóa do biên tập viên chỉ định, loại bỏ trùng lặp và chính nó,
    /// sau đó bổ sung sự kiện cùng thời kỳ cho đủ ba mục.
    /// </summary>
    [Fact]
    public async Task GetBySlugAsync_BuildsRelatedListWithoutDuplicates()
    {
        var repository = new FakeHistoricalEventRepository();
        repository.Events.AddRange(
        [
            CreateEvent("goc", 1000, EraCatalog.TrungDai, ["phu-1", "phu-2", "phu-1", "goc"]),
            CreateEvent("phu-1", 1001, EraCatalog.TrungDai),
            CreateEvent("phu-2", 1002, EraCatalog.TrungDai),
            CreateEvent("cung-thoi-ky", 1003, EraCatalog.TrungDai)
        ]);

        var service = CreateService(repository);

        var detail = await service.GetBySlugAsync("goc");

        Assert.Equal(3, detail.Related.Count);
        Assert.Equal(["phu-1", "phu-2", "cung-thoi-ky"], detail.Related.Select(item => item.Slug));
        Assert.DoesNotContain(detail.Related, item => item.Slug == "goc");
    }

    /// <summary>
    /// Danh mục thời kỳ phải trả đủ bốn thời kỳ theo đúng thứ tự từ cổ đến kim.
    /// </summary>
    [Fact]
    public void GetEras_ReturnsCatalogInOrder()
    {
        var service = CreateService(new FakeHistoricalEventRepository());

        var eras = service.GetEras();

        Assert.Equal(4, eras.Count);
        Assert.Equal(
            [EraCatalog.CoDai, EraCatalog.TrungDai, EraCatalog.CanDai, EraCatalog.HienDai],
            eras.Select(era => era.Key));
        Assert.Equal(new[] { 1, 2, 3, 4 }, eras.Select(era => era.Order));
    }

    /// <summary>
    /// Số liệu tổng quan phải dùng số thời kỳ từ danh mục thay vì số thời kỳ có trong dữ liệu.
    /// </summary>
    [Fact]
    public async Task GetStatsAsync_UsesEraCatalogCount()
    {
        var repository = new FakeHistoricalEventRepository
        {
            Stats = new EventStats(20, 6, 8, -3000, 2026)
        };

        var service = CreateService(repository);

        var stats = await service.GetStatsAsync();

        Assert.Equal(20, stats.TotalEvents);
        Assert.Equal(4, stats.TotalEras);
        Assert.Equal(6, stats.TotalCountries);
    }

    /// <summary>
    /// Ngôn ngữ ngoài phạm vi hỗ trợ phải bị từ chối.
    /// </summary>
    [Fact]
    public async Task GetExternalSummaryAsync_InvalidLanguage_ThrowsValidationException()
    {
        var service = CreateService(new FakeHistoricalEventRepository());

        var exception = await Assert.ThrowsAsync<ValidationException>(
            () => service.GetExternalSummaryAsync("bach-dang-938", "fr"));

        Assert.Contains("language", exception.Errors.Keys);
    }

    /// <summary>
    /// Sự kiện không có tiêu đề tham khảo phải trả null và không gọi dịch vụ bên ngoài.
    /// </summary>
    [Fact]
    public async Task GetExternalSummaryAsync_MissingWikiTitle_ReturnsNull()
    {
        var repository = new FakeHistoricalEventRepository();
        repository.Events.Add(CreateEvent("khong-wiki", 1000));

        var external = new FakeExternalHistorySource();
        var service = CreateService(repository, external);

        var summary = await service.GetExternalSummaryAsync("khong-wiki", "vi");

        Assert.Null(summary);
        Assert.Equal(0, external.Calls);
    }

    /// <summary>
    /// Lỗi từ nguồn bên ngoài phải được nuốt và ghi nhật ký để trang chi tiết vẫn hiển thị.
    /// </summary>
    [Fact]
    public async Task GetExternalSummaryAsync_ExternalFailure_ReturnsNull()
    {
        var repository = new FakeHistoricalEventRepository();
        var historicalEvent = CreateEvent("bach-dang-938", 938);
        historicalEvent.WikiTitle = "Trận Bạch Đằng (938)";
        repository.Events.Add(historicalEvent);

        var external = new FakeExternalHistorySource { ShouldThrow = true };
        var service = CreateService(repository, external);

        var summary = await service.GetExternalSummaryAsync("bach-dang-938", "vi");

        Assert.Null(summary);
        Assert.Equal(1, external.Calls);
    }

    /// <summary>
    /// Khi nguồn bên ngoài hoạt động, đoạn tóm tắt phải được trả về nguyên vẹn.
    /// </summary>
    [Fact]
    public async Task GetExternalSummaryAsync_Success_ReturnsSummary()
    {
        var repository = new FakeHistoricalEventRepository();
        var historicalEvent = CreateEvent("bach-dang-938", 938);
        historicalEvent.WikiTitle = "Trận Bạch Đằng (938)";
        repository.Events.Add(historicalEvent);

        var service = CreateService(repository, new FakeExternalHistorySource());

        var summary = await service.GetExternalSummaryAsync("bach-dang-938", "vi");

        Assert.NotNull(summary);
        Assert.Equal("vi", summary!.Language);
        Assert.Equal("Trận Bạch Đằng (938)", summary.Title);
    }

    /// <summary>
    /// Tạo nghiệp vụ với kho dữ liệu giả và nguồn ngoài giả.
    /// </summary>
    private static EventService CreateService(
        IHistoricalEventRepository repository,
        IExternalHistorySource? external = null) =>
        new(repository, external ?? new FakeExternalHistorySource(), NullLogger<EventService>.Instance);

    /// <summary>
    /// Tạo một sự kiện tối thiểu nhưng đủ trường bắt buộc để ánh xạ.
    /// </summary>
    private static HistoricalEvent CreateEvent(
        string slug,
        int startYear,
        string era = EraCatalog.HienDai,
        List<string>? relatedSlugs = null) =>
        new()
        {
            Slug = slug,
            Era = era,
            Country = "Việt Nam",
            CountryEn = "Vietnam",
            StartYear = startYear,
            DateLabelVi = startYear.ToString(),
            DateLabelEn = startYear.ToString(),
            TitleVi = $"Sự kiện {slug}",
            TitleEn = $"Event {slug}",
            SummaryVi = "Tóm tắt tiếng Việt.",
            SummaryEn = "English summary.",
            ContentVi = "Đoạn một.\n\nĐoạn hai.",
            ContentEn = "Paragraph one.\n\nParagraph two.",
            LocationVi = "Việt Nam",
            LocationEn = "Vietnam",
            ImagePath = "/images/hien-dai.svg",
            ImageAltVi = "Minh họa",
            ImageAltEn = "Illustration",
            TagsVi = ["lịch sử"],
            TagsEn = ["history"],
            RelatedSlugs = relatedSlugs ?? [],
            Featured = true
        };
}

/// <summary>
/// Kho dữ liệu sự kiện giả lập trong bộ nhớ, có ghi lại bộ lọc cuối cùng để kiểm tra chuẩn hóa.
/// </summary>
internal sealed class FakeHistoricalEventRepository : IHistoricalEventRepository
{
    /// <summary>Danh sách sự kiện dùng cho kiểm thử.</summary>
    public List<HistoricalEvent> Events { get; } = [];

    /// <summary>Bộ lọc cuối cùng mà nghiệp vụ chuyển xuống kho dữ liệu.</summary>
    public EventFilter? LastFilter { get; private set; }

    /// <summary>Số liệu tổng hợp trả về cho nghiệp vụ.</summary>
    public EventStats Stats { get; set; } = new(0, 0, 0, 0, 0);

    /// <inheritdoc />
    public Task<(IReadOnlyList<HistoricalEvent> Items, int Total)> ListAsync(
        EventFilter filter,
        CancellationToken cancellationToken = default)
    {
        LastFilter = filter;

        IEnumerable<HistoricalEvent> query = Events;
        if (!string.IsNullOrWhiteSpace(filter.Era))
        {
            query = query.Where(item => item.Era == filter.Era);
        }

        if (filter.FeaturedOnly)
        {
            query = query.Where(item => item.Featured);
        }

        var filtered = query.ToList();
        var page = filtered
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return Task.FromResult(((IReadOnlyList<HistoricalEvent>)page, filtered.Count));
    }

    /// <inheritdoc />
    public Task<HistoricalEvent?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default) =>
        Task.FromResult(Events.FirstOrDefault(item => item.Slug == slug));

    /// <inheritdoc />
    public Task<IReadOnlyList<HistoricalEvent>> GetBySlugsAsync(
        IReadOnlyCollection<string> slugs,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<HistoricalEvent> found = slugs
            .Select(slug => Events.FirstOrDefault(item => item.Slug == slug))
            .Where(item => item is not null)
            .Select(item => item!)
            .ToList();

        return Task.FromResult(found);
    }

    /// <inheritdoc />
    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(Events.Count);

    /// <inheritdoc />
    public Task AddRangeAsync(
        IEnumerable<HistoricalEvent> events,
        CancellationToken cancellationToken = default)
    {
        Events.AddRange(events);
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task<EventStats> GetStatsAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(Stats);
}

/// <summary>
/// Nguồn tóm tắt tham khảo giả lập, có thể đếm số lần gọi và giả lập lỗi mạng.
/// </summary>
internal sealed class FakeExternalHistorySource : IExternalHistorySource
{
    /// <summary>Số lần dịch vụ được gọi.</summary>
    public int Calls { get; private set; }

    /// <summary>Đặt true để giả lập lỗi từ dịch vụ bên ngoài.</summary>
    public bool ShouldThrow { get; set; }

    /// <inheritdoc />
    public Task<ExternalSummaryDto?> GetSummaryAsync(
        string title,
        string language,
        CancellationToken cancellationToken = default)
    {
        Calls++;

        if (ShouldThrow)
        {
            throw new HttpRequestException("Nguồn bên ngoài không phản hồi.");
        }

        return Task.FromResult<ExternalSummaryDto?>(
            new ExternalSummaryDto(title, "Đoạn tóm tắt tham khảo.", "https://vi.wikipedia.org", language));
    }
}
