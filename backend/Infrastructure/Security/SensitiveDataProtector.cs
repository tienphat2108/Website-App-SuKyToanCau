using Microsoft.AspNetCore.DataProtection;
using WorldHistory.Application.Interfaces;

namespace WorldHistory.Infrastructure.Security;

/// <summary>
/// Mã hóa thư điện tử và các trường nhạy cảm bằng khóa bảo vệ dữ liệu của ứng dụng.
/// Chuỗi đã mã hóa chỉ giải mã được trên máy chủ sở hữu khóa.
/// </summary>
public sealed class SensitiveDataProtector : ISensitiveDataProtector
{
    private readonly IDataProtector _protector;

    /// <summary>
    /// Khởi tạo dịch vụ mã hóa với mục đích cố định để tránh dùng lẫn khóa giữa các trường.
    /// </summary>
    /// <param name="provider">Nhà cung cấp bảo vệ dữ liệu của ứng dụng.</param>
    public SensitiveDataProtector(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("WorldHistory.Contributions.Email.v1");
    }

    /// <summary>
    /// Mã hóa một chuỗi nhạy cảm.
    /// </summary>
    /// <param name="plainText">Chuỗi gốc.</param>
    /// <returns>Chuỗi đã mã hóa.</returns>
    public string Protect(string plainText) => _protector.Protect(plainText);

    /// <summary>
    /// Giải mã chuỗi đã được bảo vệ.
    /// </summary>
    /// <param name="protectedText">Chuỗi đã mã hóa.</param>
    /// <returns>Chuỗi gốc.</returns>
    /// <exception cref="System.Security.Cryptography.CryptographicException">Khi khóa không còn phù hợp.</exception>
    public string Unprotect(string protectedText) => _protector.Unprotect(protectedText);
}
