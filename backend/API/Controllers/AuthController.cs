using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using WorldHistory.Application.DTOs;
using WorldHistory.Application.Interfaces;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Api.Controllers;

/// <summary>
/// Xác thực quản trị viên và cấp mã truy cập.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    /// <summary>
    /// Khởi tạo bộ điều khiển xác thực.
    /// </summary>
    /// <param name="authService">Nghiệp vụ xác thực.</param>
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Đăng nhập và nhận mã truy cập.
    /// </summary>
    /// <param name="request">Tên đăng nhập và mật khẩu.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Mã truy cập và thời điểm hết hạn.</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    [RequestSizeLimit(4_096)]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<AuthResultDto>> LoginAsync(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _authService.LoginAsync(request, cancellationToken));
    }
}

/// <summary>
/// Cung cấp thông tin tổng quan và trạng thái hoạt động của hệ thống.
/// </summary>
[ApiController]
[Route("api")]
[Produces("application/json")]
public sealed class MetaController : ControllerBase
{
    private readonly IEventService _eventService;
    private readonly WorldHistory.Infrastructure.Persistence.WorldHistoryDbContext _dbContext;

    /// <summary>
    /// Khởi tạo bộ điều khiển thông tin hệ thống.
    /// </summary>
    /// <param name="eventService">Nghiệp vụ sự kiện.</param>
    /// <param name="dbContext">Ngữ cảnh cơ sở dữ liệu để kiểm tra kết nối.</param>
    public MetaController(
        IEventService eventService,
        WorldHistory.Infrastructure.Persistence.WorldHistoryDbContext dbContext)
    {
        _eventService = eventService;
        _dbContext = dbContext;
    }

    /// <summary>
    /// Lấy số liệu tổng quan của kho dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số liệu tổng quan.</returns>
    [HttpGet("meta/stats")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SiteStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SiteStatsDto>> GetStatsAsync(CancellationToken cancellationToken)
    {
        return Ok(await _eventService.GetStatsAsync(cancellationToken));
    }

    /// <summary>
    /// Kiểm tra trạng thái hoạt động và kết nối cơ sở dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Trạng thái hệ thống.</returns>
    [HttpGet("health")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> HealthAsync(CancellationToken cancellationToken)
    {
        var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
        var payload = new
        {
            status = canConnect ? "healthy" : "unhealthy",
            database = canConnect ? "connected" : "unavailable",
            timestamp = DateTimeOffset.UtcNow
        };

        return canConnect
            ? Ok(payload)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, payload);
    }
}
