using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using WorldHistory.Api.Configuration;
using WorldHistory.Api.Middleware;
using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Services;
using WorldHistory.Core.Interfaces;
using WorldHistory.Infrastructure.Configuration;
using WorldHistory.Infrastructure.DependencyInjection;
using WorldHistory.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------
// Kiểm tra cấu hình bí mật. Không có khóa nào được lưu trong kho mã nguồn.
// Môi trường phát triển được phép sinh khóa tạm thời để chạy thử.
// ---------------------------------------------------------------------
var generatedDevelopmentSecrets = false;

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (!builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Thiếu cấu hình Jwt:Key. Hãy cung cấp khóa tối thiểu 32 byte qua biến môi trường.");
    }

    jwtKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
    builder.Configuration["Jwt:Key"] = jwtKey;
    generatedDevelopmentSecrets = true;
}

if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Jwt:Key phải có tối thiểu 32 byte.");
}

var ipHashKey = builder.Configuration["Security:IpHashKey"];
if (string.IsNullOrWhiteSpace(ipHashKey))
{
    if (!builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Thiếu cấu hình Security:IpHashKey. Hãy cung cấp khóa tối thiểu 32 ký tự qua biến môi trường.");
    }

    builder.Configuration["Security:IpHashKey"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
    generatedDevelopmentSecrets = true;
}

// ---------------------------------------------------------------------
// Giới hạn tài nguyên máy chủ và đăng ký các tầng.
// ---------------------------------------------------------------------
builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.Limits.MaxRequestBodySize = 256 * 1024;
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IContributionService, ContributionService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.MaxDepth = 32;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

var allowedOrigins = builder.Configuration.GetSection("Security:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy => policy
        .WithOrigins(allowedOrigins)
        .WithMethods("GET", "POST", "PATCH", "OPTIONS")
        .WithHeaders("Content-Type", "Authorization", "X-Requested-With")
        .WithExposedHeaders("Retry-After")
        .SetPreflightMaxAge(TimeSpan.FromHours(1)));
});

// ---------------------------------------------------------------------
// Giới hạn tần suất: chung, đăng nhập và gửi đóng góp.
// ---------------------------------------------------------------------
var rateLimits = builder.Configuration.GetSection("RateLimit").Get<RateLimitOptions>()
    ?? new RateLimitOptions();

builder.Services.Configure<RateLimitOptions>(builder.Configuration.GetSection("RateLimit"));

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            $"global:{GetClientKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = Math.Max(1, rateLimits.GlobalPermitLimit),
                Window = TimeSpan.FromSeconds(Math.Max(1, rateLimits.WindowSeconds)),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            $"login:{GetClientKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = Math.Max(1, rateLimits.LoginPermitLimit),
                Window = TimeSpan.FromSeconds(Math.Max(1, rateLimits.WindowSeconds)),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.AddPolicy("contributions", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            $"contributions:{GetClientKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = Math.Max(1, rateLimits.ContributionPermitLimit),
                Window = TimeSpan.FromSeconds(Math.Max(1, rateLimits.ContributionWindowSeconds)),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.OnRejected = async (context, cancellationToken) =>
    {
        var response = context.HttpContext.Response;
        response.StatusCode = StatusCodes.Status429TooManyRequests;
        response.Headers["Retry-After"] = context.Lease.TryGetMetadata(
            MetadataName.RetryAfter,
            out var retryAfter)
            ? Math.Ceiling(retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture)
            : "60";

        await response.WriteAsJsonAsync(
            new ProblemDetails
            {
                Status = StatusCodes.Status429TooManyRequests,
                Title = "Quá nhiều yêu cầu",
                Detail = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút."
            },
            cancellationToken);
    };
});

// ---------------------------------------------------------------------
// Xác thực bằng mã truy cập và phân quyền quản trị.
// ---------------------------------------------------------------------
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
    ?? throw new InvalidOperationException("Thiếu cấu hình Jwt.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/problem+json";
                context.Response.Headers["WWW-Authenticate"] = "Bearer";

                await context.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Title = "Chưa xác thực",
                    Detail = "Vui lòng gửi mã truy cập hợp lệ để thực hiện thao tác này."
                });
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/problem+json";

                await context.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Status = StatusCodes.Status403Forbidden,
                    Title = "Không có quyền truy cập",
                    Detail = "Bạn không có quyền thực hiện thao tác này."
                });
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});

var trustForwardedHeaders = builder.Configuration.GetValue<bool>("Proxy:TrustForwardedHeaders");
if (trustForwardedHeaders)
{
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
        options.ForwardLimit = 1;
    });
}

// ---------------------------------------------------------------------
// Tài liệu API chỉ bật ở môi trường phát triển.
// ---------------------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Bách khoa Lịch sử Thế giới",
        Version = "v1",
        Description = "Giao diện lập trình ứng dụng cho website và ứng dụng di động trong tương lai."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập mã truy cập nhận được từ điểm cuối đăng nhập."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        }] = Array.Empty<string>()
    });
});

var app = builder.Build();

// ---------------------------------------------------------------------
// Chuỗi xử lý yêu cầu.
// ---------------------------------------------------------------------
if (trustForwardedHeaders)
{
    app.UseForwardedHeaders();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<BotProtectionMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();

    if (app.Configuration.GetValue("Security:RequireHttps", true))
    {
        app.UseHttpsRedirection();
    }
}

app.UseCors("frontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Ghi nhận quyền quản trị vào ngữ cảnh bảo mật để chính sách cấp dòng hoạt động.
app.Use(async (context, next) =>
{
    var securityContext = context.RequestServices.GetRequiredService<ISecurityContextAccessor>();
    securityContext.IsAdmin =
        context.User.Identity?.IsAuthenticated == true &&
        context.User.IsInRole("Admin");

    await next();
});

app.MapControllers();
app.MapGet("/", () => Results.Ok(new
{
    name = "Bách khoa Lịch sử Thế giới",
    health = "/api/health",
    documentation = app.Environment.IsDevelopment() ? "/swagger" : null
}));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Bách khoa Lịch sử Thế giới v1");
        options.DocumentTitle = "Tài liệu API lịch sử";
    });
}

// ---------------------------------------------------------------------
// Khởi tạo lược đồ, dữ liệu mẫu và chính sách bảo mật trước khi nhận yêu cầu.
// ---------------------------------------------------------------------
await using (var scope = app.Services.CreateAsyncScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (generatedDevelopmentSecrets)
    {
        logger.LogWarning(
            "Một số khóa bí mật chưa được cấu hình. Đã sinh khóa tạm thời cho môi trường phát triển; " +
            "mã truy cập sẽ hết hiệu lực khi khởi động lại.");
    }

    try
    {
        var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
        await initializer.InitializeAsync();
    }
    catch (Exception exception)
    {
        logger.LogCritical(exception, "Không thể khởi tạo cơ sở dữ liệu.");
        throw;
    }
}

app.Run();

/// <summary>
/// Lấy khóa phân vùng giới hạn tần suất từ địa chỉ mạng của kết nối.
/// Khi chạy sau máy chủ đảo ngược đáng tin cậy, địa chỉ đã được chuyển tiếp sẽ được sử dụng.
/// </summary>
static string GetClientKey(HttpContext context) =>
    context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

/// <summary>
/// Điểm vào của chương trình, được khai báo công khai để bộ kiểm thử tích hợp có thể tham chiếu.
/// </summary>
public partial class Program
{
}
