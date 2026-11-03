using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WorldHistory.Application.Interfaces;
using WorldHistory.Infrastructure.Configuration;

namespace WorldHistory.Infrastructure.Email;

/// <summary>
/// Gửi thư cảm ơn qua giao thức SMTP.
/// Mọi thông tin đăng nhập chỉ đến từ cấu hình máy chủ, không nằm trong mã nguồn.
/// </summary>
public sealed class SmtpThankYouEmailSender : IThankYouEmailSender
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpThankYouEmailSender> _logger;
    private int _configurationWarningLogged;

    /// <summary>
    /// Khởi tạo dịch vụ gửi thư.
    /// </summary>
    /// <param name="options">Cấu hình máy chủ thư.</param>
    /// <param name="logger">Bộ ghi nhật ký.</param>
    public SmtpThankYouEmailSender(
        IOptions<EmailOptions> options,
        ILogger<SmtpThankYouEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(_options.Host) || string.IsNullOrWhiteSpace(_options.FromAddress))
        {
            if (Interlocked.Exchange(ref _configurationWarningLogged, 1) == 0)
            {
                _logger.LogWarning(
                    "Đã bật gửi thư nhưng thiếu Email:Host hoặc Email:FromAddress; thư cảm ơn sẽ không được gửi.");
            }

            return;
        }

        using var client = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.UseStartTls,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Timeout = Math.Clamp(_options.TimeoutSeconds, 3, 30) * 1000
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            client.Credentials = new NetworkCredential(_options.Username, _options.Password);
        }

        using var mail = new MailMessage
        {
            From = new MailAddress(_options.FromAddress, _options.FromName, Encoding.UTF8),
            Subject = message.Subject,
            SubjectEncoding = Encoding.UTF8,
            Body = message.Body,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = false
        };

        mail.To.Add(new MailAddress(message.To));

        if (!string.IsNullOrWhiteSpace(_options.ReplyToAddress))
        {
            mail.ReplyToList.Add(new MailAddress(_options.ReplyToAddress));
        }

        await client.SendMailAsync(mail, cancellationToken);
    }
}
