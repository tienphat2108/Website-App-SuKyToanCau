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
/// Kiểm thử nghiệp vụ tiếp nhận và duyệt đóng góp.
/// Trọng tâm là bảo vệ dữ liệu cá nhân: thư điện tử phải được mã hóa, địa chỉ mạng phải được băm,
/// nội dung phải được làm sạch trước khi lưu.
/// </summary>
public sealed class ContributionServiceTests
{
    /// <summary>Nội dung hợp lệ dài hơn ngưỡng tối thiểu.</summary>
    private const string ValidMessage = "Đóng góp nội dung thử nghiệm cho bách khoa.";

    /// <summary>
    /// Yêu cầu hợp lệ phải được làm sạch, mã hóa và lưu ở trạng thái chờ duyệt.
    /// </summary>
    [Fact]
    public async Task SubmitAsync_ValidRequest_StoresProtectedContribution()
    {
        var repository = new FakeContributionRepository();
        var unitOfWork = new FakeUnitOfWork();
        var clock = new FakeClock(new DateTimeOffset(2026, 10, 27, 8, 0, 0, TimeSpan.Zero));
        var service = CreateService(repository, unitOfWork, clock: clock);

        var id = await service.SubmitAsync(
            new ContributionRequest(
                "<b>Nguyễn Văn A</b>",
                "  DocGia@Example.COM  ",
                "<p>" + ValidMessage + "</p>",
                "<i>Trận Bạch Đằng</i>"),
            "203.0.113.9");

        var saved = Assert.Single(repository.Items);
        Assert.Equal(id, saved.Id);
        Assert.Equal("Nguyễn Văn A", saved.FullName);
        Assert.Equal("enc:docgia@example.com", saved.EmailProtected);
        Assert.Equal(ValidMessage, saved.Message);
        Assert.Equal("Trận Bạch Đằng", saved.EventSuggestion);
        Assert.Equal(ContributionStatus.Pending, saved.Status);
        Assert.Equal("hash:203.0.113.9", saved.IpHash);
        Assert.Equal(clock.UtcNow, saved.CreatedAt);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    /// <summary>
    /// Đóng góp hợp lệ phải xếp một thư cảm ơn gửi tới địa chỉ đã chuẩn hóa.
    /// </summary>
    [Fact]
    public async Task SubmitAsync_ValidRequest_EnqueuesThankYouEmail()
    {
        var queue = new FakeThankYouEmailQueue();
        var service = CreateService(
            new FakeContributionRepository(),
            new FakeUnitOfWork(),
            emailQueue: queue);

        var id = await service.SubmitAsync(
            new ContributionRequest(
                "  Nguyễn Văn A  ",
                "  DocGia@Example.COM  ",
                ValidMessage,
                Locale: "en"),
            "203.0.113.9");

        var email = Assert.Single(queue.Items);
        Assert.Equal("docgia@example.com", email.Recipient);
        Assert.Equal("Nguyễn Văn A", email.FullName);
        Assert.Equal(id, email.ContributionId);
        Assert.Equal("en", email.Locale);
    }

    /// <summary>
    /// Thiếu mã ngôn ngữ thì thư cảm ơn dùng bản tiếng Việt.
    /// </summary>
    [Fact]
    public async Task SubmitAsync_MissingLocale_DefaultsToVietnamese()
    {
        var queue = new FakeThankYouEmailQueue();
        var service = CreateService(
            new FakeContributionRepository(),
            new FakeUnitOfWork(),
            emailQueue: queue);

        await service.SubmitAsync(
            new ContributionRequest("Nguyễn Văn A", "docgia@example.com", ValidMessage),
            "203.0.113.9");

        Assert.Equal("vi", Assert.Single(queue.Items).Locale);
    }

    /// <summary>
    /// Đóng góp vẫn được lưu khi hàng đợi thư đầy; người dùng không thấy lỗi gửi thư.
    /// </summary>
    [Fact]
    public async Task SubmitAsync_FullEmailQueue_StillStoresContribution()
    {
        var repository = new FakeContributionRepository();
        var queue = new FakeThankYouEmailQueue { Accept = false };
        var service = CreateService(repository, new FakeUnitOfWork(), emailQueue: queue);

        var id = await service.SubmitAsync(
            new ContributionRequest("Nguyễn Văn A", "docgia@example.com", ValidMessage),
            "203.0.113.9");

        Assert.Equal(id, Assert.Single(repository.Items).Id);
        Assert.Empty(queue.Items);
    }

    /// <summary>
    /// Địa chỉ mạng trống phải được thay bằng giá trị trung tính trước khi băm.
    /// </summary>
    [Fact]
    public async Task SubmitAsync_MissingIpAddress_UsesPlaceholder()
    {
        var repository = new FakeContributionRepository();
        var service = CreateService(repository, new FakeUnitOfWork());

        await service.SubmitAsync(
            new ContributionRequest("Nguyễn Văn A", "docgia@example.com", ValidMessage),
            "   ");

        Assert.Equal("hash:unknown", Assert.Single(repository.Items).IpHash);
    }

    /// <summary>
    /// Dữ liệu không hợp lệ phải bị từ chối trước khi chạm tới kho dữ liệu.
    /// </summary>
    [Fact]
    public async Task SubmitAsync_InvalidEmail_ThrowsWithoutSaving()
    {
        var repository = new FakeContributionRepository();
        var queue = new FakeThankYouEmailQueue();
        var service = CreateService(repository, new FakeUnitOfWork(), emailQueue: queue);

        await Assert.ThrowsAsync<ValidationException>(() => service.SubmitAsync(
            new ContributionRequest("Nguyễn Văn A", "sai-dinh-dang", ValidMessage),
            "203.0.113.9"));

        Assert.Empty(repository.Items);
        Assert.Empty(queue.Items);
    }

    /// <summary>
    /// Nội dung chỉ toàn thẻ, sau khi làm sạch ngắn hơn ngưỡng, phải bị từ chối ở bước kiểm tra thứ hai.
    /// </summary>
    [Fact]
    public async Task SubmitAsync_MessageTooShortAfterCleaning_Throws()
    {
        var service = CreateService(new FakeContributionRepository(), new FakeUnitOfWork());

        var exception = await Assert.ThrowsAsync<ValidationException>(() => service.SubmitAsync(
            new ContributionRequest("Nguyễn Văn A", "docgia@example.com", "<strong>quá ngắn</strong>"),
            "203.0.113.9"));

        Assert.Contains("message", exception.Errors.Keys);
    }

    /// <summary>
    /// Trang và kích thước trang phải được kẹp về khoảng hợp lệ khi liệt kê cho quản trị viên.
    /// </summary>
    [Fact]
    public async Task ListAsync_ClampsPaging()
    {
        var repository = new FakeContributionRepository();
        var service = CreateService(repository, new FakeUnitOfWork());

        var result = await service.ListAsync(null, page: -5, pageSize: 500);

        Assert.Equal(1, result.Page);
        Assert.Equal(50, result.PageSize);
        Assert.Equal(1, repository.LastPage);
        Assert.Equal(50, repository.LastPageSize);
    }

    /// <summary>
    /// Trạng thái lọc không hợp lệ phải bị từ chối thay vì bỏ qua im lặng.
    /// </summary>
    [Fact]
    public async Task ListAsync_InvalidStatus_ThrowsValidationException()
    {
        var service = CreateService(new FakeContributionRepository(), new FakeUnitOfWork());

        var exception = await Assert.ThrowsAsync<ValidationException>(
            () => service.ListAsync("khong-ton-tai", 1, 20));

        Assert.Contains("status", exception.Errors.Keys);
    }

    /// <summary>
    /// Thư điện tử phải được giải mã khi trả về cho quản trị viên.
    /// </summary>
    [Fact]
    public async Task ListAsync_ReturnsDecryptedEmail()
    {
        var repository = new FakeContributionRepository();
        repository.Items.Add(CreateContribution(emailProtected: "enc:docgia@example.com"));
        var service = CreateService(repository, new FakeUnitOfWork());

        var result = await service.ListAsync(null, 1, 20);

        Assert.Equal("docgia@example.com", Assert.Single(result.Items).Email);
    }

    /// <summary>
    /// Một bản ghi không giải mã được không được làm hỏng toàn bộ danh sách.
    /// </summary>
    [Fact]
    public async Task ListAsync_UnprotectFailure_ReturnsEmptyEmail()
    {
        var repository = new FakeContributionRepository();
        repository.Items.Add(CreateContribution(emailProtected: "du-lieu-hong"));
        var service = CreateService(repository, new FakeUnitOfWork());

        var result = await service.ListAsync(null, 1, 20);

        Assert.Equal(string.Empty, Assert.Single(result.Items).Email);
    }

    /// <summary>
    /// Duyệt đóng góp phải cập nhật trạng thái, người duyệt và dấu thời gian.
    /// </summary>
    [Fact]
    public async Task ReviewAsync_UpdatesStatusAndReviewer()
    {
        var repository = new FakeContributionRepository();
        var contribution = CreateContribution();
        repository.Items.Add(contribution);

        var clock = new FakeClock(new DateTimeOffset(2026, 10, 27, 9, 30, 0, TimeSpan.Zero));
        var unitOfWork = new FakeUnitOfWork();
        var service = CreateService(repository, unitOfWork, clock: clock);

        var result = await service.ReviewAsync(contribution.Id, "approved", "  <b>admin</b>  ");

        Assert.Equal("approved", result.Status);
        Assert.Equal("admin", result.ReviewedBy);
        Assert.Equal(clock.UtcNow, result.ReviewedAt);
        Assert.Equal(ContributionStatus.Approved, contribution.Status);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    /// <summary>
    /// Duyệt một đóng góp không tồn tại phải trả lỗi không tìm thấy.
    /// </summary>
    [Fact]
    public async Task ReviewAsync_MissingContribution_ThrowsNotFoundException()
    {
        var service = CreateService(new FakeContributionRepository(), new FakeUnitOfWork());

        await Assert.ThrowsAsync<NotFoundException>(
            () => service.ReviewAsync(Guid.NewGuid(), "approved", "admin"));
    }

    /// <summary>
    /// Trạng thái duyệt không hợp lệ phải bị từ chối.
    /// </summary>
    [Fact]
    public async Task ReviewAsync_InvalidStatus_ThrowsValidationException()
    {
        var repository = new FakeContributionRepository();
        var contribution = CreateContribution();
        repository.Items.Add(contribution);
        var service = CreateService(repository, new FakeUnitOfWork());

        var exception = await Assert.ThrowsAsync<ValidationException>(
            () => service.ReviewAsync(contribution.Id, "dang-xem-xet", "admin"));

        Assert.Contains("status", exception.Errors.Keys);
    }

    /// <summary>
    /// Tạo nghiệp vụ với các phụ thuộc giả lập.
    /// </summary>
    private static ContributionService CreateService(
        IContributionRepository repository,
        IUnitOfWork unitOfWork,
        ISensitiveDataProtector? dataProtector = null,
        IIpHasher? ipHasher = null,
        IThankYouEmailQueue? emailQueue = null,
        IClock? clock = null) =>
        new(
            repository,
            unitOfWork,
            dataProtector ?? new FakeSensitiveDataProtector(),
            ipHasher ?? new FakeIpHasher(),
            emailQueue ?? new FakeThankYouEmailQueue(),
            clock ?? new FakeClock(DateTimeOffset.UtcNow),
            NullLogger<ContributionService>.Instance);

    /// <summary>
    /// Tạo một đóng góp mẫu để kiểm thử đọc và duyệt.
    /// </summary>
    private static Contribution CreateContribution(string emailProtected = "enc:docgia@example.com") =>
        new()
        {
            FullName = "Nguyễn Văn A",
            EmailProtected = emailProtected,
            Message = ValidMessage,
            Status = ContributionStatus.Pending,
            IpHash = "hash:203.0.113.9",
            CreatedAt = new DateTimeOffset(2026, 10, 26, 7, 0, 0, TimeSpan.Zero),
            UpdatedAt = new DateTimeOffset(2026, 10, 26, 7, 0, 0, TimeSpan.Zero)
        };
}

/// <summary>
/// Kho dữ liệu đóng góp giả lập trong bộ nhớ.
/// </summary>
internal sealed class FakeContributionRepository : IContributionRepository
{
    /// <summary>Danh sách đóng góp dùng cho kiểm thử.</summary>
    public List<Contribution> Items { get; } = [];

    /// <summary>Trang cuối cùng được yêu cầu.</summary>
    public int LastPage { get; private set; }

    /// <summary>Kích thước trang cuối cùng được yêu cầu.</summary>
    public int LastPageSize { get; private set; }

    /// <inheritdoc />
    public Task AddAsync(Contribution contribution, CancellationToken cancellationToken = default)
    {
        Items.Add(contribution);
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task<(IReadOnlyList<Contribution> Items, int Total)> ListAsync(
        ContributionStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        LastPage = page;
        LastPageSize = pageSize;

        var filtered = status is null
            ? Items
            : Items.Where(item => item.Status == status).ToList();

        IReadOnlyList<Contribution> pageItems = filtered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Task.FromResult((pageItems, filtered.Count));
    }

    /// <inheritdoc />
    public Task<Contribution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(Items.FirstOrDefault(item => item.Id == id));
}

/// <summary>
/// Đơn vị công việc giả lập, chỉ đếm số lần lưu.
/// </summary>
internal sealed class FakeUnitOfWork : IUnitOfWork
{
    /// <summary>Số lần lưu được gọi.</summary>
    public int SaveCount { get; private set; }

    /// <inheritdoc />
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SaveCount++;
        return Task.FromResult(1);
    }
}

/// <summary>
/// Dịch vụ mã hóa giả lập, thêm tiền tố để kiểm chứng dữ liệu đã đi qua lớp bảo vệ.
/// </summary>
internal sealed class FakeSensitiveDataProtector : ISensitiveDataProtector
{
    /// <inheritdoc />
    public string Protect(string plainText) => "enc:" + plainText;

    /// <inheritdoc />
    public string Unprotect(string protectedText) =>
        protectedText.StartsWith("enc:", StringComparison.Ordinal)
            ? protectedText[4..]
            : throw new InvalidOperationException("Dữ liệu không giải mã được.");
}

/// <summary>
/// Dịch vụ băm địa chỉ mạng giả lập.
/// </summary>
internal sealed class FakeIpHasher : IIpHasher
{
    /// <inheritdoc />
    public string Hash(string ipAddress) => "hash:" + ipAddress;
}

/// <summary>
/// Hàng đợi thư cảm ơn giả lập, ghi lại thư đã nhận.
/// </summary>
internal sealed class FakeThankYouEmailQueue : IThankYouEmailQueue
{
    /// <summary>Danh sách thư đã vào hàng đợi.</summary>
    public List<ThankYouEmail> Items { get; } = [];

    /// <summary>Cho phép hàng đợi nhận thư hay mô phỏng trạng thái đầy.</summary>
    public bool Accept { get; init; } = true;

    /// <inheritdoc />
    public bool TryEnqueue(ThankYouEmail email)
    {
        if (!Accept)
        {
            return false;
        }

        Items.Add(email);
        return true;
    }
}

/// <summary>
/// Nguồn thời gian cố định dùng cho kiểm thử.
/// </summary>
internal sealed class FakeClock : IClock
{
    /// <summary>
    /// Khởi tạo nguồn thời gian với một mốc cố định.
    /// </summary>
    /// <param name="utcNow">Mốc thời gian trả về.</param>
    public FakeClock(DateTimeOffset utcNow) => UtcNow = utcNow;

    /// <inheritdoc />
    public DateTimeOffset UtcNow { get; }
}
