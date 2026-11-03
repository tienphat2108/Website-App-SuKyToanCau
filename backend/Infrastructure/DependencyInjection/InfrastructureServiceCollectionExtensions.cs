using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using WorldHistory.Application.Interfaces;
using WorldHistory.Core.Interfaces;
using WorldHistory.Infrastructure.Configuration;
using WorldHistory.Infrastructure.Email;
using WorldHistory.Infrastructure.External;
using WorldHistory.Infrastructure.Persistence;
using WorldHistory.Infrastructure.Persistence.Repositories;
using WorldHistory.Infrastructure.Persistence.Security;
using WorldHistory.Infrastructure.Security;

namespace WorldHistory.Infrastructure.DependencyInjection;

/// <summary>
/// Đăng ký toàn bộ thành phần hạ tầng vào bộ chứa phụ thuộc.
/// Tầng trình diễn chỉ cần gọi một phương thức duy nhất, không biết chi tiết triển khai.
/// </summary>
public static class InfrastructureServiceCollectionExtensions
{
    /// <summary>
    /// Thêm cơ sở dữ liệu, bảo mật, kho dữ liệu và nguồn tham khảo bên ngoài.
    /// </summary>
    /// <param name="services">Bộ chứa phụ thuộc.</param>
    /// <param name="configuration">Cấu hình ứng dụng.</param>
    /// <returns>Bộ chứa để nối tiếp cấu hình.</returns>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.Configure<SecurityOptions>(configuration.GetSection("Security"));
        services.Configure<DatabaseOptions>(configuration.GetSection("Database"));
        services.Configure<ExternalApiOptions>(configuration.GetSection("ExternalApi"));
        services.Configure<EmailOptions>(configuration.GetSection("Email"));

        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<ISecurityContextAccessor, SecurityContextAccessor>();
        services.AddScoped<RlsConnectionInterceptor>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<ISensitiveDataProtector, SensitiveDataProtector>();
        services.AddScoped<IIpHasher, HmacIpHasher>();

        var provider = configuration["Database:Provider"] ?? "Sqlite";
        var connectionString = configuration.GetConnectionString("Default")
            ?? "Data Source=worldhistory.db";

        services.AddDbContext<WorldHistoryDbContext>((serviceProvider, options) =>
        {
            if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
            {
                options.UseNpgsql(connectionString, npgsql =>
                    npgsql.EnableRetryOnFailure(3, TimeSpan.FromSeconds(3), null));
            }
            else
            {
                options.UseSqlite(connectionString, sqlite => sqlite.CommandTimeout(30));
            }

            options.AddInterceptors(serviceProvider.GetRequiredService<RlsConnectionInterceptor>());
        });

        services.AddScoped<IHistoricalEventRepository, HistoricalEventRepository>();
        services.AddScoped<IContributionRepository, ContributionRepository>();
        services.AddScoped<IAdminUserRepository, AdminUserRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<DatabaseInitializer>();

        var keysPath = configuration["Security:DataProtectionKeysPath"];
        if (string.IsNullOrWhiteSpace(keysPath))
        {
            keysPath = "keys";
        }

        if (!Path.IsPathRooted(keysPath))
        {
            keysPath = Path.Combine(AppContext.BaseDirectory, keysPath);
        }

        Directory.CreateDirectory(keysPath);

        services.AddDataProtection()
            .SetApplicationName("WorldHistory")
            .PersistKeysToFileSystem(new DirectoryInfo(keysPath));

        services.AddSingleton<IThankYouEmailSender, SmtpThankYouEmailSender>();
        services.AddSingleton<ThankYouEmailQueue>();
        services.AddSingleton<IThankYouEmailQueue>(serviceProvider =>
            serviceProvider.GetRequiredService<ThankYouEmailQueue>());
        services.AddHostedService(serviceProvider =>
            serviceProvider.GetRequiredService<ThankYouEmailQueue>());

        services.AddMemoryCache();
        services.AddHttpClient<IExternalHistorySource, WikipediaHistoryClient>((serviceProvider, client) =>
        {
            var options = serviceProvider.GetRequiredService<IOptions<ExternalApiOptions>>().Value;
            client.Timeout = TimeSpan.FromSeconds(Math.Clamp(options.TimeoutSeconds, 1, 30));
            client.DefaultRequestHeaders.UserAgent.ParseAdd(options.UserAgent);
        });

        return services;
    }
}
