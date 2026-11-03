using System.Net;
using System.Text;
using System.Text.RegularExpressions;

namespace WorldHistory.Application.Validation;

/// <summary>
/// Chuẩn hóa và làm sạch dữ liệu văn bản do người dùng gửi lên.
/// Nội dung được lưu ở dạng văn bản thuần; thẻ siêu văn bản bị loại bỏ để giảm nguy cơ tấn công chèn mã.
/// </summary>
public static partial class InputSanitizer
{
    /// <summary>
    /// Làm sạch một chuỗi văn bản: giải mã thực thể, loại bỏ thẻ, ký tự điều khiển và khoảng trắng thừa.
    /// </summary>
    /// <param name="input">Chuỗi gốc, có thể null.</param>
    /// <param name="maxLength">Độ dài tối đa sau khi làm sạch.</param>
    /// <returns>Chuỗi sạch, không bao giờ null.</returns>
    public static string Clean(string? input, int maxLength = 5000)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var decoded = WebUtility.HtmlDecode(input);
        var withoutTags = HtmlTagRegex().Replace(decoded, " ");
        var withoutControlCharacters = ControlCharacterRegex().Replace(withoutTags, " ");
        var withoutInvisibleCharacters = InvisibleCharacterRegex().Replace(withoutControlCharacters, string.Empty);
        var normalized = WhitespaceRegex().Replace(withoutInvisibleCharacters, " ").Trim();

        return normalized.Length <= maxLength ? normalized : normalized[..maxLength].TrimEnd();
    }

    /// <summary>
    /// Chuẩn hóa tên đăng nhập: chữ thường, bỏ khoảng trắng đầu cuối.
    /// </summary>
    /// <param name="username">Tên đăng nhập gốc.</param>
    /// <returns>Tên đăng nhập đã chuẩn hóa.</returns>
    public static string NormalizeUsername(string? username) =>
        string.IsNullOrWhiteSpace(username) ? string.Empty : username.Trim().ToLowerInvariant();

    /// <summary>
    /// Kiểm tra định dạng thư điện tử ở mức cơ bản và an toàn.
    /// </summary>
    /// <param name="email">Địa chỉ cần kiểm tra.</param>
    /// <returns>Đúng nếu định dạng hợp lệ và độ dài không vượt quá 254 ký tự.</returns>
    public static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email) || email.Length > 254)
        {
            return false;
        }

        var trimmed = email.Trim();
        return !trimmed.Contains(' ') &&
               EmailRegex().IsMatch(trimmed) &&
               !trimmed.Contains("..", StringComparison.Ordinal);
    }

    [GeneratedRegex("<[^>]+>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();

    [GeneratedRegex(@"[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]", RegexOptions.Compiled)]
    private static partial Regex ControlCharacterRegex();

    [GeneratedRegex(@"[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]", RegexOptions.Compiled)]
    private static partial Regex InvisibleCharacterRegex();

    [GeneratedRegex(@"\s+", RegexOptions.Compiled)]
    private static partial Regex WhitespaceRegex();

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$", RegexOptions.Compiled)]
    private static partial Regex EmailRegex();
}
