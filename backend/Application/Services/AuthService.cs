using WorldHistory.Application.DTOs;
using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Validation;
using WorldHistory.Core.Exceptions;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Application.Services;

/// <summary>
/// Nghiệp vụ xác thực quản trị viên với khóa tạm thời khi đăng nhập sai nhiều lần.
/// </summary>
public sealed class AuthService : IAuthService
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    /// <summary>
    /// Chuỗi băm hợp lệ nhưng không thuộc tài khoản nào.
    /// Dùng để cân bằng thời gian phản hồi khi tên đăng nhập không tồn tại.
    /// </summary>
    private const string DummyPasswordHash =
        "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";

    private readonly IAdminUserRepository _adminRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IClock _clock;

    /// <summary>
    /// Khởi tạo nghiệp vụ xác thực.
    /// </summary>
    /// <param name="adminRepository">Kho dữ liệu tài khoản quản trị.</param>
    /// <param name="unitOfWork">Đơn vị công việc.</param>
    /// <param name="passwordHasher">Dịch vụ kiểm tra mật khẩu.</param>
    /// <param name="tokenService">Dịch vụ cấp mã truy cập.</param>
    /// <param name="clock">Nguồn thời gian.</param>
    public AuthService(
        IAdminUserRepository adminRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IClock clock)
    {
        _adminRepository = adminRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _clock = clock;
    }

    /// <summary>
    /// Xác thực thông tin đăng nhập và cấp mã truy cập khi thành công.
    /// </summary>
    /// <param name="request">Tên đăng nhập và mật khẩu.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Mã truy cập và thời điểm hết hạn.</returns>
    /// <exception cref="UnauthorizedException">Khi thông tin đăng nhập không đúng.</exception>
    public async Task<AuthResultDto> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var username = InputSanitizer.NormalizeUsername(request.Username);
        var password = request.Password ?? string.Empty;

        if (username.Length == 0 || password.Length == 0 || password.Length > 256)
        {
            _passwordHasher.Verify(password, DummyPasswordHash);
            throw InvalidCredentials();
        }

        var user = await _adminRepository.GetByUsernameAsync(username, cancellationToken);
        var now = _clock.UtcNow;

        if (user is null)
        {
            _passwordHasher.Verify(password, DummyPasswordHash);
            throw InvalidCredentials();
        }

        if (user.IsLockedOut(now))
        {
            throw new UnauthorizedException(
                "Thông tin đăng nhập không đúng hoặc tài khoản đang tạm thời bị khóa.");
        }

        if (!_passwordHasher.Verify(password, user.PasswordHash))
        {
            user.FailedLoginCount++;
            user.UpdatedAt = now;

            if (user.FailedLoginCount >= MaxFailedAttempts)
            {
                user.LockoutEndUtc = now.Add(LockoutDuration);
                user.FailedLoginCount = 0;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw InvalidCredentials();
        }

        user.FailedLoginCount = 0;
        user.LockoutEndUtc = null;
        user.LastLoginAt = now;
        user.UpdatedAt = now;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var (token, expiresAt) = _tokenService.CreateToken(user);

        return new AuthResultDto(token, expiresAt, user.Username, user.Role);
    }

    /// <summary>
    /// Tạo lỗi xác thực chung, không tiết lộ tài khoản có tồn tại hay không.
    /// </summary>
    /// <returns>Lỗi xác thực.</returns>
    private static UnauthorizedException InvalidCredentials() =>
        new("Tên đăng nhập hoặc mật khẩu không đúng.");
}
