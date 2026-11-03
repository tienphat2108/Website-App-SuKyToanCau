using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using WorldHistory.Application.DTOs;
using WorldHistory.Application.Interfaces;

namespace WorldHistory.Api.Controllers;

/// <summary>
/// Tiếp nhận đóng góp của độc giả và cung cấp công cụ duyệt cho quản trị viên.
/// </summary>
[ApiController]
[Route("api/contributions")]
[Produces("application/json")]
public sealed class ContributionsController : ControllerBase
{
    private readonly IContributionService _contributionService;

    /// <summary>
    /// Khởi tạo bộ điều khiển đóng góp.
    /// </summary>
    /// <param name="contributionService">Nghiệp vụ đóng góp.</param>
    public ContributionsController(IContributionService contributionService)
    {
        _contributionService = contributionService;
    }

    /// <summary>
    /// Gửi một đóng góp mới. Đây là điểm cuối công khai duy nhất của bộ điều khiển.
    /// </summary>
    /// <param name="request">Dữ liệu đóng góp.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Mã đóng góp vừa tạo.</returns>
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("contributions")]
    [RequestSizeLimit(32_768)]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> SubmitAsync(
        [FromBody] ContributionRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var id = await _contributionService.SubmitAsync(request, ipAddress, cancellationToken);

        return Accepted(new { id });
    }

    /// <summary>
    /// Lấy danh sách đóng góp cho quản trị viên.
    /// </summary>
    /// <param name="status">Trạng thái cần lọc.</param>
    /// <param name="page">Trang hiện tại.</param>
    /// <param name="pageSize">Số bản ghi mỗi trang.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách đóng góp đã phân trang.</returns>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PagedResult<ContributionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<ContributionDto>>> ListAsync(
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _contributionService.ListAsync(status, page, pageSize, cancellationToken));
    }

    /// <summary>
    /// Cập nhật trạng thái duyệt của một đóng góp.
    /// </summary>
    /// <param name="id">Khóa của đóng góp.</param>
    /// <param name="request">Trạng thái mới.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đóng góp sau khi cập nhật.</returns>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ContributionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContributionDto>> UpdateStatusAsync(
        Guid id,
        [FromBody] ContributionStatusRequest request,
        CancellationToken cancellationToken)
    {
        var reviewer = User.Identity?.Name ?? "unknown";
        return Ok(await _contributionService.ReviewAsync(id, request.Status, reviewer, cancellationToken));
    }
}
