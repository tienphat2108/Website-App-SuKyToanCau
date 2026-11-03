using WorldHistory.Application.DTOs;

namespace WorldHistory.Application.Validation;

/// <summary>
/// Kiểm tra dữ liệu đóng góp trước khi lưu.
/// Quy tắc được đặt tại tầng ứng dụng để mọi ứng dụng khách, kể cả ứng dụng di động trong tương lai, dùng chung.
/// </summary>
public static class ContributionValidator
{
    /// <summary>Độ dài tối thiểu của họ tên.</summary>
    public const int MinNameLength = 2;

    /// <summary>Độ dài tối đa của họ tên.</summary>
    public const int MaxNameLength = 120;

    /// <summary>Độ dài tối thiểu của nội dung đóng góp.</summary>
    public const int MinMessageLength = 20;

    /// <summary>Độ dài tối đa của nội dung đóng góp.</summary>
    public const int MaxMessageLength = 5000;

    /// <summary>Độ dài tối đa của gợi ý chủ đề.</summary>
    public const int MaxSuggestionLength = 200;

    /// <summary>
    /// Kiểm tra toàn bộ trường của yêu cầu đóng góp.
    /// </summary>
    /// <param name="request">Dữ liệu người dùng gửi lên.</param>
    /// <returns>Từ điển lỗi theo tên trường; rỗng nếu hợp lệ.</returns>
    public static IReadOnlyDictionary<string, string[]> Validate(ContributionRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Trim().Length < MinNameLength)
        {
            errors["fullName"] = ["Vui lòng nhập họ tên có ít nhất 2 ký tự."];
        }
        else if (request.FullName.Trim().Length > MaxNameLength)
        {
            errors["fullName"] = [$"Họ tên không được vượt quá {MaxNameLength} ký tự."];
        }

        if (!InputSanitizer.IsValidEmail(request.Email))
        {
            errors["email"] = ["Địa chỉ thư điện tử không hợp lệ."];
        }

        if (string.IsNullOrWhiteSpace(request.Message) || request.Message.Trim().Length < MinMessageLength)
        {
            errors["message"] = [$"Nội dung đóng góp cần ít nhất {MinMessageLength} ký tự."];
        }
        else if (request.Message.Trim().Length > MaxMessageLength)
        {
            errors["message"] = [$"Nội dung đóng góp không được vượt quá {MaxMessageLength} ký tự."];
        }

        if (!string.IsNullOrWhiteSpace(request.EventSuggestion) &&
            request.EventSuggestion.Trim().Length > MaxSuggestionLength)
        {
            errors["eventSuggestion"] = [$"Chủ đề gợi ý không được vượt quá {MaxSuggestionLength} ký tự."];
        }

        // Bẫy chống tự động gửi: trường ẩn phải luôn trống.
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            errors["website"] = ["Yêu cầu không hợp lệ."];
        }

        return errors;
    }
}
