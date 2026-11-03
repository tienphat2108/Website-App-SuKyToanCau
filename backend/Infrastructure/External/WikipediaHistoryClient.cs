using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WorldHistory.Application.DTOs;
using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Validation;
using WorldHistory.Infrastructure.Configuration;

namespace WorldHistory.Infrastructure.External;

/// <summary>
/// Lấy đoạn tóm tắt từ bách khoa toàn thư mở Wikipedia.
/// Kết quả được lưu đệm và làm sạch trước khi trả về; lỗi mạng không làm hỏng trang chính.
/// </summary>
public sealed class WikipediaHistoryClient : IExternalHistorySource
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ExternalApiOptions _options;
    private readonly ILogger<WikipediaHistoryClient> _logger;

    /// <summary>
    /// Khởi tạo máy khách bách khoa toàn thư mở.
    /// </summary>
    /// <param name="httpClient">Máy khách HTTP đã cấu hình thời gian chờ và nhận diện ứng dụng.</param>
    /// <param name="cache">Bộ nhớ đệm trong tiến trình.</param>
    /// <param name="options">Cấu hình nguồn bên ngoài.</param>
    /// <param name="logger">Bộ ghi nhật ký.</param>
    public WikipediaHistoryClient(
        HttpClient httpClient,
        IMemoryCache cache,
        IOptions<ExternalApiOptions> options,
        ILogger<WikipediaHistoryClient> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Lấy đoạn tóm tắt từ bách khoa toàn thư mở.
    /// </summary>
    /// <param name="title">Tiêu đề trang cần tra cứu.</param>
    /// <param name="language">Mã ngôn ngữ, chỉ chấp nhận <c>vi</c> hoặc <c>en</c>.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đoạn tóm tắt đã làm sạch hoặc null nếu không lấy được.</returns>
    public async Task<ExternalSummaryDto?> GetSummaryAsync(
        string title,
        string language,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled || language is not ("vi" or "en"))
        {
            return null;
        }

        var safeTitle = InputSanitizer.Clean(title, 200);
        if (string.IsNullOrWhiteSpace(safeTitle))
        {
            return null;
        }

        var cacheKey = $"wiki:{language}:{safeTitle.ToLowerInvariant()}";
        if (_cache.TryGetValue(cacheKey, out ExternalSummaryDto? cached) && cached is not null)
        {
            return cached;
        }

        var endpoint = string.Format(
            CultureInfo.InvariantCulture,
            _options.BaseUrlTemplate,
            language);

        var requestUri =
            $"{endpoint}?action=query&prop=extracts&explaintext=1&exintro=1&redirects=1&format=json&formatversion=2&titles={Uri.EscapeDataString(safeTitle)}";

        try
        {
            using var response = await _httpClient.GetAsync(requestUri, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Nguồn tham khảo trả về mã {StatusCode} cho tiêu đề {Title}.",
                    (int)response.StatusCode,
                    safeTitle);
                return null;
            }

            var payload = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = ParseResponse(payload, title, language);

            if (result is not null)
            {
                _cache.Set(cacheKey, result, TimeSpan.FromMinutes(Math.Max(1, _options.CacheMinutes)));
            }

            return result;
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogWarning(exception, "Không gọi được nguồn tham khảo cho tiêu đề {Title}.", safeTitle);
            return null;
        }
    }

    /// <summary>
    /// Phân tích phản hồi JSON của bách khoa toàn thư mở.
    /// </summary>
    /// <param name="payload">Nội dung JSON.</param>
    /// <param name="fallbackTitle">Tiêu đề dự phòng khi phản hồi thiếu tên trang.</param>
    /// <param name="language">Mã ngôn ngữ.</param>
    /// <returns>Đoạn tóm tắt hoặc null nếu trang không tồn tại.</returns>
    private ExternalSummaryDto? ParseResponse(string payload, string fallbackTitle, string language)
    {
        using var document = JsonDocument.Parse(payload);

        if (!document.RootElement.TryGetProperty("query", out var query) ||
            !query.TryGetProperty("pages", out var pages) ||
            pages.ValueKind != JsonValueKind.Array ||
            pages.GetArrayLength() == 0)
        {
            return null;
        }

        var page = pages[0];
        if (page.TryGetProperty("missing", out var missing) && missing.GetBoolean())
        {
            return null;
        }

        if (!page.TryGetProperty("extract", out var extractElement))
        {
            return null;
        }

        var extract = InputSanitizer.Clean(extractElement.GetString(), _options.MaxLength);
        if (extract.Length < 80)
        {
            return null;
        }

        var pageTitle = page.TryGetProperty("title", out var titleElement)
            ? titleElement.GetString() ?? fallbackTitle
            : fallbackTitle;

        var sourceUrl =
            $"https://{language}.wikipedia.org/wiki/{Uri.EscapeDataString(pageTitle.Replace(' ', '_'))}";

        return new ExternalSummaryDto(pageTitle, extract, sourceUrl, language);
    }
}
