using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using WorldHistory.Core.Exceptions;

namespace WorldHistory.Api.Middleware;

/// <summary>
/// Bắt toàn bộ lỗi phát sinh trong xử lý yêu cầu và trả về phản hồi chuẩn, an toàn.
/// Không bao giờ đưa ngăn xếp lỗi hoặc thông tin hệ thống ra phía người dùng.
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    /// <summary>
    /// Khởi tạo bộ xử lý lỗi.
    /// </summary>
    /// <param name="next">Bước xử lý kế tiếp trong chuỗi.</param>
    /// <param name="logger">Bộ ghi nhật ký.</param>
    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Thực thi bước xử lý và chuyển lỗi thành phản hồi phù hợp.
    /// </summary>
    /// <param name="context">Ngữ cảnh yêu cầu hiện tại.</param>
    /// <returns>Tiến trình bất đồng bộ.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // Người dùng đã ngắt kết nối, không cần ghi phản hồi.
        }
        catch (ValidationException exception)
        {
            await WriteProblemAsync(
                context,
                StatusCodes.Status400BadRequest,
                "Dữ liệu chưa hợp lệ",
                exception.Message,
                exception.Errors);
        }
        catch (NotFoundException exception)
        {
            await WriteProblemAsync(context, StatusCodes.Status404NotFound, "Không tìm thấy", exception.Message);
        }
        catch (UnauthorizedException exception)
        {
            await WriteProblemAsync(context, StatusCodes.Status401Unauthorized, "Chưa xác thực", exception.Message);
        }
        catch (ConflictException exception)
        {
            await WriteProblemAsync(context, StatusCodes.Status409Conflict, "Xung đột trạng thái", exception.Message);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Lỗi không mong đợi khi xử lý {Method} {Path}.",
                context.Request.Method,
                context.Request.Path);

            await WriteProblemAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "Đã xảy ra lỗi",
                "Máy chủ không thể xử lý yêu cầu. Vui lòng thử lại sau.");
        }
    }

    /// <summary>
    /// Ghi phản hồi lỗi theo cấu trúc chuẩn, kèm mã truy vết và lỗi từng trường nếu có.
    /// </summary>
    /// <param name="context">Ngữ cảnh yêu cầu.</param>
    /// <param name="statusCode">Mã trạng thái HTTP.</param>
    /// <param name="title">Tiêu đề lỗi.</param>
    /// <param name="detail">Mô tả an toàn cho người dùng.</param>
    /// <param name="errors">Danh sách lỗi theo trường.</param>
    private static async Task WriteProblemAsync(
        HttpContext context,
        int statusCode,
        string title,
        string detail,
        IReadOnlyDictionary<string, string[]>? errors = null)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] = context.TraceIdentifier;

        if (errors is { Count: > 0 })
        {
            problem.Extensions["errors"] = errors;
        }

        await context.Response.WriteAsJsonAsync(problem, cancellationToken: context.RequestAborted);
    }
}

/// <summary>
/// Bổ sung các tiêu đề bảo mật cho mọi phản hồi của API.
/// </summary>
public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    /// <summary>
    /// Khởi tạo bộ bổ sung tiêu đề bảo mật.
    /// </summary>
    /// <param name="next">Bước xử lý kế tiếp.</param>
    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    /// <summary>
    /// Gắn tiêu đề bảo mật trước khi chuyển yêu cầu cho bước kế tiếp.
    /// </summary>
    /// <param name="context">Ngữ cảnh yêu cầu hiện tại.</param>
    /// <returns>Tiến trình bất đồng bộ.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        headers["X-Content-Type-Options"] = "nosniff";
        headers["X-Frame-Options"] = "DENY";
        headers["Referrer-Policy"] = "no-referrer";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
        headers["Cross-Origin-Opener-Policy"] = "same-origin";
        headers["Cross-Origin-Resource-Policy"] = "same-origin";
        headers["X-Permitted-Cross-Domain-Policies"] = "none";

        // Giao diện thử nghiệm API cần tài nguyên nội bộ, chỉ bỏ qua chính sách tại đường dẫn này.
        if (!context.Request.Path.StartsWithSegments("/swagger"))
        {
            headers["Content-Security-Policy"] =
                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
        }

        await _next(context);
    }
}

/// <summary>
/// Chặn các yêu cầu có dấu hiệu quét lỗ hổng hoặc do công cụ tự động gửi tới điểm cuối ghi dữ liệu.
/// Yêu cầu đọc thông thường của trình duyệt và máy chủ giao diện vẫn được giữ nguyên.
/// </summary>
public sealed class BotProtectionMiddleware
{
    private static readonly string[] ScannerPaths =
    [
        "/.env",
        "/.git",
        "/.aws",
        "/.ssh",
        "/wp-admin",
        "/wp-login",
        "/xmlrpc.php",
        "/phpmyadmin",
        "/actuator",
        "/server-status",
        "/cgi-bin",
        "/vendor/",
        "/backup",
        "/config.json"
    ];

    private static readonly Regex AutomatedAgent = new(
        "(googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|whatsapp|discordbot|crawler|spider|scrapy|curl/|wget/|python-requests|python/|aiohttp|httpx|go-http-client|java/|libwww-perl|httpclient|headlesschrome|phantomjs|selenium|puppeteer|playwright|postmanruntime|insomnia)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    /// <summary>
    /// Tác nhân của máy chủ giao diện khi gọi nội bộ tới API.
    /// </summary>
    private static readonly Regex TrustedServerAgent = new(
        "^(node|undici)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private readonly RequestDelegate _next;

    /// <summary>
    /// Khởi tạo bộ chặn yêu cầu tự động.
    /// </summary>
    /// <param name="next">Bước xử lý kế tiếp trong chuỗi.</param>
    public BotProtectionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    /// <summary>
    /// Kiểm tra đường dẫn và tác nhân người dùng trước khi chuyển yêu cầu đi tiếp.
    /// </summary>
    /// <param name="context">Ngữ cảnh yêu cầu hiện tại.</param>
    /// <returns>Tiến trình bất đồng bộ.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        if (IsScannerPath(path))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        if (IsWriteMethod(context.Request.Method))
        {
            var userAgent = context.Request.Headers.UserAgent.ToString();
            var isTrustedServer = TrustedServerAgent.IsMatch(userAgent);

            if (!isTrustedServer && (string.IsNullOrWhiteSpace(userAgent) || AutomatedAgent.IsMatch(userAgent)))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/problem+json";

                await context.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Status = StatusCodes.Status403Forbidden,
                    Title = "Yêu cầu bị chặn",
                    Detail = "Máy chủ không chấp nhận yêu cầu ghi dữ liệu từ công cụ tự động."
                });
                return;
            }

            // Yêu cầu ghi phải dùng định dạng JSON để hạn chế gửi chéo trang bằng biểu mẫu.
            if (context.Request.Method != HttpMethods.Delete && !context.Request.HasJsonContentType())
            {
                context.Response.StatusCode = StatusCodes.Status415UnsupportedMediaType;
                return;
            }
        }

        await _next(context);
    }

    /// <summary>
    /// Kiểm tra đường dẫn có thuộc nhóm tệp và trang thường bị công cụ quét dò hay không.
    /// </summary>
    /// <param name="path">Đường dẫn của yêu cầu.</param>
    /// <returns>Đúng nếu cần chặn.</returns>
    private static bool IsScannerPath(string path) =>
        ScannerPaths.Any(prefix => path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Cho biết phương thức có làm thay đổi dữ liệu hay không.
    /// </summary>
    /// <param name="method">Phương thức HTTP.</param>
    /// <returns>Đúng nếu là yêu cầu ghi.</returns>
    private static bool IsWriteMethod(string method) =>
        HttpMethods.IsPost(method) || HttpMethods.IsPut(method) || HttpMethods.IsPatch(method);
}
