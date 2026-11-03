using Microsoft.Extensions.Options;
using WorldHistory.Application.Interfaces;
using WorldHistory.Infrastructure.Configuration;

namespace WorldHistory.Infrastructure.Security;

/// <summary>
/// Cung cấp thời gian thực của hệ thống.
/// </summary>
public sealed class SystemClock : IClock
{
    /// <summary>Thời điểm hiện tại theo múi giờ phối hợp quốc tế.</summary>
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}

/// <summary>
/// Băm và kiểm tra mật khẩu bằng BCrypt với hệ số công việc cao.
/// Mỗi lần băm đều sinh muối ngẫu nhiên riêng nên hai mật khẩu giống nhau cho ra chuỗi băm khác nhau.
/// </summary>
public sealed class BcryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    /// <summary>
    /// Tạo chuỗi băm từ mật khẩu văn bản gốc.
    /// </summary>
    /// <param name="password">Mật khẩu cần băm.</param>
    /// <returns>Chuỗi băm an toàn để lưu trữ.</returns>
    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

    /// <summary>
    /// Kiểm tra mật khẩu với chuỗi băm đã lưu.
    /// </summary>
    /// <param name="password">Mật khẩu người dùng nhập.</param>
    /// <param name="hash">Chuỗi băm trong kho dữ liệu.</param>
    /// <returns>Đúng nếu khớp; sai nếu chuỗi băm không hợp lệ.</returns>
    public bool Verify(string password, string hash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
        {
            return false;
        }

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }
}

/// <summary>
/// Băm địa chỉ mạng bằng HMAC để chống lạm dụng mà không lưu địa chỉ gốc.
/// </summary>
public sealed class HmacIpHasher : IIpHasher
{
    private readonly byte[] _key;

    /// <summary>
    /// Khởi tạo dịch vụ băm địa chỉ mạng.
    /// </summary>
    /// <param name="options">Cấu hình bảo mật chứa khóa băm.</param>
    /// <exception cref="InvalidOperationException">Khi khóa băm thiếu hoặc quá ngắn.</exception>
    public HmacIpHasher(IOptions<SecurityOptions> options)
    {
        var key = options.Value.IpHashKey;
        if (string.IsNullOrWhiteSpace(key) || key.Length < 32)
        {
            throw new InvalidOperationException(
                "Cấu hình Security:IpHashKey phải có ít nhất 32 ký tự.");
        }

        _key = System.Text.Encoding.UTF8.GetBytes(key);
    }

    /// <summary>
    /// Băm địa chỉ mạng với khóa bí mật của hệ thống.
    /// </summary>
    /// <param name="ipAddress">Địa chỉ mạng gốc.</param>
    /// <returns>Chuỗi băm dạng thập lục phân.</returns>
    public string Hash(string ipAddress)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA256(_key);
        var bytes = System.Text.Encoding.UTF8.GetBytes(ipAddress);
        return Convert.ToHexString(hmac.ComputeHash(bytes)).ToLowerInvariant();
    }
}
