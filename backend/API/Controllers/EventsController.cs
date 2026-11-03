using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using WorldHistory.Application.DTOs;
using WorldHistory.Application.Interfaces;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Api.Controllers;

/// <summary>
/// Cung cấp dữ liệu sự kiện lịch sử cho website và ứng dụng di động trong tương lai.
/// </summary>
[ApiController]
[Route("api/events")]
[Produces("application/json")]
public sealed class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    /// <summary>
    /// Khởi tạo bộ điều khiển sự kiện.
    /// </summary>
    /// <param name="eventService">Nghiệp vụ sự kiện.</param>
    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    /// <summary>
    /// Lấy danh sách sự kiện có lọc và phân trang.
    /// </summary>
    /// <param name="query">Tham số truy vấn từ đường dẫn.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách sự kiện của trang hiện tại.</returns>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<EventSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<EventSummaryDto>>> ListAsync(
        [FromQuery] EventQuery query,
        CancellationToken cancellationToken)
    {
        var filter = new EventFilter(
            Era: query.Era,
            Country: query.Country,
            Search: query.Search,
            FromYear: query.FromYear,
            ToYear: query.ToYear,
            FeaturedOnly: query.Featured,
            Page: query.Page,
            PageSize: query.PageSize);

        return Ok(await _eventService.ListAsync(filter, cancellationToken));
    }

    /// <summary>
    /// Lấy danh mục thời kỳ lịch sử.
    /// </summary>
    /// <returns>Danh sách thời kỳ theo thứ tự.</returns>
    [HttpGet("eras")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<EraDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<EraDto>> GetEras() =>
        Ok(_eventService.GetEras());

    /// <summary>
    /// Lấy chi tiết một sự kiện theo khóa đường dẫn.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn của sự kiện.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Chi tiết sự kiện.</returns>
    [HttpGet("{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventDetailDto>> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken)
    {
        return Ok(await _eventService.GetBySlugAsync(slug, cancellationToken));
    }

    /// <summary>
    /// Lấy đoạn tóm tắt tham khảo từ bách khoa toàn thư mở cho một sự kiện.
    /// </summary>
    /// <param name="slug">Khóa đường dẫn của sự kiện.</param>
    /// <param name="language">Mã ngôn ngữ, mặc định là tiếng Việt.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đoạn tóm tắt hoặc phản hồi rỗng nếu không có dữ liệu.</returns>
    [HttpGet("{slug}/external")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ExternalSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult<ExternalSummaryDto>> GetExternalSummaryAsync(
        string slug,
        [FromQuery] string language = "vi",
        CancellationToken cancellationToken = default)
    {
        var result = await _eventService.GetExternalSummaryAsync(slug, language, cancellationToken);
        return result is null ? NoContent() : Ok(result);
    }
}

/// <summary>
/// Tham số truy vấn cho danh sách sự kiện.
/// </summary>
public sealed class EventQuery
{
    /// <summary>Khóa thời kỳ cần lọc.</summary>
    public string? Era { get; set; }

    /// <summary>Tên quốc gia hoặc khu vực cần lọc.</summary>
    public string? Country { get; set; }

    /// <summary>Từ khóa tìm kiếm.</summary>
    public string? Search { get; set; }

    /// <summary>Năm bắt đầu của khoảng thời gian.</summary>
    public int? FromYear { get; set; }

    /// <summary>Năm kết thúc của khoảng thời gian.</summary>
    public int? ToYear { get; set; }

    /// <summary>Chỉ lấy sự kiện nổi bật.</summary>
    public bool Featured { get; set; }

    /// <summary>Trang hiện tại, bắt đầu từ một.</summary>
    public int Page { get; set; } = 1;

    /// <summary>Số bản ghi mỗi trang, tối đa 48.</summary>
    public int PageSize { get; set; } = 12;
}
