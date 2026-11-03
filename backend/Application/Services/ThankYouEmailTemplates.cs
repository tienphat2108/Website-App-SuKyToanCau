using WorldHistory.Application.Interfaces;

namespace WorldHistory.Application.Services;

/// <summary>
/// Soạn thư cảm ơn gửi tới người đóng góp theo ngôn ngữ của lần gửi.
/// Thư ở dạng văn bản thuần để tên người dùng không thể chèn mã vào nội dung.
/// </summary>
public static class ThankYouEmailTemplates
{
    /// <summary>
    /// Tạo tiêu đề và nội dung thư cảm ơn.
    /// </summary>
    /// <param name="email">Thông tin đóng góp vừa tiếp nhận.</param>
    /// <returns>Thư đã soạn sẵn theo ngôn ngữ yêu cầu.</returns>
    public static EmailMessage Create(ThankYouEmail email)
    {
        ArgumentNullException.ThrowIfNull(email);

        var name = ToSingleLine(email.FullName);
        var reference = email.ContributionId.ToString("D");
        var isEnglish = string.Equals(email.Locale, "en", StringComparison.OrdinalIgnoreCase);

        if (isEnglish)
        {
            return new EmailMessage(
                email.Recipient,
                "We received your contribution – World History Archive",
                $"""
                Hello {name},

                Thank you for sending your materials and feedback to World History Archive. Our editorial team has received your contribution and will review it as soon as possible.

                We will reply to this email address if we need to verify any details.

                Reference: {reference}

                Best regards,
                The World History Archive editorial team
                """);
        }

        return new EmailMessage(
            email.Recipient,
            "Đã nhận đóng góp của bạn – Sử Ký Toàn Cầu",
            $"""
            Xin chào {name},

            Cảm ơn bạn đã gửi tài liệu và góp ý cho Sử Ký Toàn Cầu. Đội ngũ biên tập đã nhận được đóng góp của bạn và sẽ xem xét trong thời gian sớm nhất.

            Chúng tôi sẽ phản hồi qua địa chỉ thư điện tử này nếu cần xác minh thêm thông tin.

            Mã tiếp nhận: {reference}

            Trân trọng,
            Đội ngũ biên tập Sử Ký Toàn Cầu
            """);
    }

    /// <summary>
    /// Gộp họ tên về một dòng để không phá bố cục phần chào của thư.
    /// </summary>
    private static string ToSingleLine(string value) =>
        string.Join(' ', value.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
}
