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
/// Nghiệp vụ tiếp nhận, bảo vệ dữ liệu cá nhân và duyệt đóng góp của độc giả.
/// </summary>
public sealed class ContributionService : IContributionService
{
    private const int MaxPageSize = 50;
    private const int DefaultPageSize = 20;

    private readonly IContributionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISensitiveDataProtector _dataProtector;
    private readonly IIpHasher _ipHasher;
    private readonly IThankYouEmailQueue _emailQueue;
    private readonly IClock _clock;
    private readonly ILogger<ContributionService> _logger;

    /// <summary>
    /// Khởi tạo nghiệp vụ đóng góp.
    /// </summary>
    /// <param name="repository">Kho dữ liệu đóng góp.</param>
    /// <param name="unitOfWork">Đơn vị công việc.</param>
    /// <param name="dataProtector">Dịch vụ mã hóa dữ liệu nhạy cảm.</param>
    /// <param name="ipHasher">Dịch vụ băm địa chỉ mạng.</param>
    /// <param name="emailQueue">Hàng đợi thư cảm ơn chạy nền.</param>
    /// <param name="clock">Nguồn thời gian.</param>
    /// <param name="logger">Bộ ghi nhật ký.</param>
    public ContributionService(
        IContributionRepository repository,
        IUnitOfWork unitOfWork,
        ISensitiveDataProtector dataProtector,
        IIpHasher ipHasher,
        IThankYouEmailQueue emailQueue,
        IClock clock,
        ILogger<ContributionService> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _dataProtector = dataProtector;
        _ipHasher = ipHasher;
        _emailQueue = emailQueue;
        _clock = clock;
        _logger = logger;
    }

    /// <summary>
    /// Tiếp nhận một đóng góp mới sau khi kiểm tra và làm sạch dữ liệu.
    /// </summary>
    /// <param name="request">Dữ liệu người dùng gửi lên.</param>
    /// <param name="ipAddress">Địa chỉ mạng của người gửi.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Mã đóng góp vừa tạo.</returns>
    /// <exception cref="ValidationException">Khi dữ liệu không hợp lệ.</exception>
    public async Task<Guid> SubmitAsync(
        ContributionRequest request,
        string ipAddress,
        CancellationToken cancellationToken = default)
    {
        var errors = ContributionValidator.Validate(request);
        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }

        var fullName = InputSanitizer.Clean(request.FullName, ContributionValidator.MaxNameLength);
        var message = InputSanitizer.Clean(request.Message, ContributionValidator.MaxMessageLength);
        var suggestion = string.IsNullOrWhiteSpace(request.EventSuggestion)
            ? null
            : InputSanitizer.Clean(request.EventSuggestion, ContributionValidator.MaxSuggestionLength);

        // Làm sạch lần hai nhằm bảo đảm độ dài sau khi loại bỏ thẻ vẫn nằm trong giới hạn.
        if (fullName.Length < ContributionValidator.MinNameLength)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["fullName"] = ["Họ tên không hợp lệ sau khi kiểm tra."]
            });
        }

        if (message.Length < ContributionValidator.MinMessageLength)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["message"] = ["Nội dung đóng góp quá ngắn sau khi kiểm tra."]
            });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var now = _clock.UtcNow;
        var contribution = new Contribution
        {
            FullName = fullName,
            EmailProtected = _dataProtector.Protect(normalizedEmail),
            Message = message,
            EventSuggestion = suggestion,
            Status = ContributionStatus.Pending,
            IpHash = _ipHasher.Hash(string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress),
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(contribution, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Thư cảm ơn chỉ được xếp hàng sau khi dữ liệu đã lưu; lỗi gửi thư không làm mất đóng góp.
        var queued = _emailQueue.TryEnqueue(
            new ThankYouEmail(normalizedEmail, fullName, contribution.Id, request.Locale ?? "vi"));

        if (!queued)
        {
            _logger.LogWarning(
                "Hàng đợi thư cảm ơn đã đầy; bỏ qua thư cho đóng góp {ContributionId}.",
                contribution.Id);
        }

        return contribution.Id;
    }

    /// <summary>
    /// Lấy danh sách đóng góp cho quản trị viên, có giải mã thư điện tử.
    /// </summary>
    /// <param name="status">Trạng thái cần lọc; null để lấy tất cả.</param>
    /// <param name="page">Trang hiện tại.</param>
    /// <param name="pageSize">Số bản ghi mỗi trang.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách đóng góp đã phân trang.</returns>
    /// <exception cref="ValidationException">Khi trạng thái không hợp lệ.</exception>
    public async Task<PagedResult<ContributionDto>> ListAsync(
        string? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        ContributionStatus? parsedStatus = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<ContributionStatus>(status, ignoreCase: true, out var value))
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["status"] = ["Trạng thái đóng góp không hợp lệ."]
                });
            }

            parsedStatus = value;
        }

        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var (items, total) = await _repository.ListAsync(
            parsedStatus,
            normalizedPage,
            normalizedPageSize,
            cancellationToken);

        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)normalizedPageSize);

        return new PagedResult<ContributionDto>(
            items.Select(ToDto).ToArray(),
            normalizedPage,
            normalizedPageSize,
            total,
            totalPages);
    }

    /// <summary>
    /// Cập nhật trạng thái duyệt của một đóng góp.
    /// </summary>
    /// <param name="id">Khóa của đóng góp.</param>
    /// <param name="status">Trạng thái mới dạng chuỗi.</param>
    /// <param name="reviewer">Tên đăng nhập của quản trị viên.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đóng góp sau khi cập nhật.</returns>
    /// <exception cref="NotFoundException">Khi không tìm thấy đóng góp.</exception>
    /// <exception cref="ValidationException">Khi trạng thái không hợp lệ.</exception>
    public async Task<ContributionDto> ReviewAsync(
        Guid id,
        string status,
        string reviewer,
        CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<ContributionStatus>(status, ignoreCase: true, out var parsedStatus))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["status"] = ["Trạng thái đóng góp không hợp lệ."]
            });
        }

        var contribution = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy đóng góp này.");

        contribution.Status = parsedStatus;
        contribution.ReviewedAt = _clock.UtcNow;
        contribution.ReviewedBy = InputSanitizer.Clean(reviewer, 80);
        contribution.UpdatedAt = _clock.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(contribution);
    }

    /// <summary>
    /// Chuyển thực thể đóng góp sang cấu trúc trả về cho quản trị viên.
    /// </summary>
    /// <param name="contribution">Thực thể cần chuyển.</param>
    /// <returns>Dữ liệu đã giải mã thư điện tử.</returns>
    private ContributionDto ToDto(Contribution contribution)
    {
        var email = string.Empty;

        try
        {
            email = _dataProtector.Unprotect(contribution.EmailProtected);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            // Khóa mã hóa có thể đã thay đổi; không làm hỏng toàn bộ danh sách vì một bản ghi.
            _logger.LogWarning(exception, "Không giải mã được thư điện tử của đóng góp {ContributionId}.", contribution.Id);
        }

        return new ContributionDto(
            contribution.Id,
            contribution.FullName,
            email,
            contribution.Message,
            contribution.EventSuggestion,
            contribution.Status.ToApiValue(),
            contribution.CreatedAt,
            contribution.ReviewedAt,
            contribution.ReviewedBy);
    }
}
