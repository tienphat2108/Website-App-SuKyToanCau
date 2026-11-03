using System.Threading.Channels;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Services;
using WorldHistory.Infrastructure.Configuration;

namespace WorldHistory.Infrastructure.Email;

/// <summary>
/// Hàng đợi một luồng gửi thư cảm ơn ở chế độ nền.
/// Biểu mẫu được phản hồi ngay sau khi lưu đóng góp, không phải chờ máy chủ thư.
/// </summary>
public sealed class ThankYouEmailQueue : BackgroundService, IThankYouEmailQueue
{
    private readonly Channel<ThankYouEmail> _channel;
    private readonly IThankYouEmailSender _sender;
    private readonly ILogger<ThankYouEmailQueue> _logger;

    /// <summary>
    /// Khởi tạo hàng đợi với sức chứa giới hạn để tránh phình bộ nhớ.
    /// </summary>
    /// <param name="options">Cấu hình máy chủ thư.</param>
    /// <param name="sender">Dịch vụ gửi thư.</param>
    /// <param name="logger">Bộ ghi nhật ký.</param>
    public ThankYouEmailQueue(
        IOptions<EmailOptions> options,
        IThankYouEmailSender sender,
        ILogger<ThankYouEmailQueue> logger)
    {
        var capacity = Math.Clamp(options.Value.QueueCapacity, 1, 1000);

        _channel = Channel.CreateBounded<ThankYouEmail>(new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });

        _sender = sender;
        _logger = logger;
    }

    /// <inheritdoc />
    public bool TryEnqueue(ThankYouEmail email) => _channel.Writer.TryWrite(email);

    /// <inheritdoc />
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var email in _channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await _sender.SendAsync(ThankYouEmailTemplates.Create(email), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                // Chỉ ghi mã tiếp nhận; không ghi địa chỉ thư hay nội dung người dùng.
                _logger.LogWarning(
                    exception,
                    "Không gửi được thư cảm ơn cho đóng góp {ContributionId}.",
                    email.ContributionId);
            }
        }
    }
}
