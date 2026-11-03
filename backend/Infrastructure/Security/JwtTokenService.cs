using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WorldHistory.Application.Interfaces;
using WorldHistory.Core.Entities;
using WorldHistory.Infrastructure.Configuration;

namespace WorldHistory.Infrastructure.Security;

/// <summary>
/// Tạo mã truy cập có chữ ký đối xứng cho quản trị viên.
/// </summary>
public sealed class JwtTokenService : ITokenService
{
    private readonly JwtOptions _options;
    private readonly IClock _clock;

    /// <summary>
    /// Khởi tạo dịch vụ cấp mã truy cập.
    /// </summary>
    /// <param name="options">Cấu hình mã truy cập.</param>
    /// <param name="clock">Nguồn thời gian.</param>
    public JwtTokenService(IOptions<JwtOptions> options, IClock clock)
    {
        _options = options.Value;
        _clock = clock;
    }

    /// <summary>
    /// Tạo mã truy cập và thời điểm hết hạn cho tài khoản.
    /// </summary>
    /// <param name="user">Tài khoản đã xác thực.</param>
    /// <returns>Cặp giá trị gồm mã truy cập và thời điểm hết hạn.</returns>
    public (string Token, DateTimeOffset ExpiresAt) CreateToken(AdminUser user)
    {
        var now = _clock.UtcNow;
        var expiresAt = now.AddMinutes(Math.Clamp(_options.ExpiryMinutes, 5, 240));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
