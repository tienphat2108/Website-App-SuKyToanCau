using System.Reflection;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Validation;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Enums;
using WorldHistory.Core.Interfaces;
using WorldHistory.Infrastructure.Configuration;

namespace WorldHistory.Infrastructure.Persistence;

/// <summary>
/// Khởi tạo lược đồ, nạp dữ liệu lịch sử mẫu và áp dụng chính sách bảo mật cấp dòng.
/// Quá trình này chạy một lần khi ứng dụng khởi động và có thể chạy lặp lại an toàn.
/// </summary>
public sealed class DatabaseInitializer
{
    private const string SeedResourceName = "WorldHistory.Infrastructure.Seed.history-events.json";
    private const int MinimumAdminPasswordLength = 12;

    private readonly WorldHistoryDbContext _dbContext;
    private readonly ISecurityContextAccessor _securityContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly DatabaseOptions _databaseOptions;
    private readonly SecurityOptions _securityOptions;
    private readonly ILogger<DatabaseInitializer> _logger;

    /// <summary>
    /// Khởi tạo bộ nạp dữ liệu.
    /// </summary>
    /// <param name="dbContext">Ngữ cảnh cơ sở dữ liệu.</param>
    /// <param name="securityContext">Ngữ cảnh bảo mật để tạm thời có quyền ghi khi nạp dữ liệu.</param>
    /// <param name="passwordHasher">Dịch vụ băm mật khẩu.</param>
    /// <param name="databaseOptions">Cấu hình cơ sở dữ liệu.</param>
    /// <param name="securityOptions">Cấu hình bảo mật.</param>
    /// <param name="logger">Bộ ghi nhật ký.</param>
    public DatabaseInitializer(
        WorldHistoryDbContext dbContext,
        ISecurityContextAccessor securityContext,
        IPasswordHasher passwordHasher,
        IOptions<DatabaseOptions> databaseOptions,
        IOptions<SecurityOptions> securityOptions,
        ILogger<DatabaseInitializer> logger)
    {
        _dbContext = dbContext;
        _securityContext = securityContext;
        _passwordHasher = passwordHasher;
        _databaseOptions = databaseOptions.Value;
        _securityOptions = securityOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Thực hiện toàn bộ quá trình khởi tạo dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Tiến trình bất đồng bộ.</returns>
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.EnsureCreatedAsync(cancellationToken);
        await EnsureSourcesColumnAsync(cancellationToken);

        // Tạm thời nâng quyền để nạp dữ liệu trên môi trường Postgres có bật chính sách cấp dòng.
        _securityContext.IsAdmin = true;

        try
        {
            await SeedEventsAsync(cancellationToken);
            await SeedAdminAsync(cancellationToken);
        }
        finally
        {
            _securityContext.IsAdmin = false;
        }

        if (_databaseOptions.Provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase) &&
            _databaseOptions.ApplyRowLevelSecurity)
        {
            await ApplyRowLevelSecurityAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Nạp dữ liệu sự kiện từ tài nguyên nhúng nếu kho dữ liệu đang trống.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    private async Task SeedEventsAsync(CancellationToken cancellationToken)
    {
        var document = LoadSeedDocument();
        if (document is null || document.Events.Count == 0)
        {
            _logger.LogWarning("Không tìm thấy tệp dữ liệu mẫu hoặc tệp rỗng.");
            return;
        }

        var existing = await _dbContext.HistoricalEvents
            .ToDictionaryAsync(item => item.Slug, StringComparer.Ordinal, cancellationToken);

        var added = 0;
        var updated = 0;

        foreach (var seed in document.Events)
        {
            if (!IsValidSlug(seed.Slug))
            {
                _logger.LogWarning("Bỏ qua sự kiện có khóa không hợp lệ: {Slug}.", seed.Slug);
                continue;
            }

            if (!EraCatalog.IsValid(seed.Era))
            {
                _logger.LogWarning("Bỏ qua sự kiện {Slug} do thời kỳ không hợp lệ: {Era}.", seed.Slug, seed.Era);
                continue;
            }

            var isNew = !existing.TryGetValue(seed.Slug!, out var target);
            var changed = isNew;

            target ??= new HistoricalEvent { Slug = seed.Slug! };

            void Apply<T>(T current, T next, Action<T> setter)
            {
                if (!EqualityComparer<T>.Default.Equals(current, next))
                {
                    setter(next);
                    changed = true;
                }
            }

            Apply(target.Era, seed.Era!, value => target.Era = value);
            Apply(target.Country, InputSanitizer.Clean(seed.Country, 80), value => target.Country = value);
            Apply(target.CountryEn, InputSanitizer.Clean(seed.CountryEn, 80), value => target.CountryEn = value);
            Apply(target.StartYear, seed.StartYear, value => target.StartYear = value);
            Apply(target.EndYear, seed.EndYear, value => target.EndYear = value);
            Apply(target.DateLabelVi, InputSanitizer.Clean(seed.DateLabelVi, 120), value => target.DateLabelVi = value);
            Apply(target.DateLabelEn, InputSanitizer.Clean(seed.DateLabelEn, 120), value => target.DateLabelEn = value);
            Apply(target.TitleVi, InputSanitizer.Clean(seed.TitleVi, 220), value => target.TitleVi = value);
            Apply(target.TitleEn, InputSanitizer.Clean(seed.TitleEn, 220), value => target.TitleEn = value);
            Apply(target.SummaryVi, InputSanitizer.Clean(seed.SummaryVi, 700), value => target.SummaryVi = value);
            Apply(target.SummaryEn, InputSanitizer.Clean(seed.SummaryEn, 700), value => target.SummaryEn = value);
            Apply(target.ContentVi, string.Join("\n\n", seed.ContentVi), value => target.ContentVi = value);
            Apply(target.ContentEn, string.Join("\n\n", seed.ContentEn), value => target.ContentEn = value);
            Apply(target.LocationVi, InputSanitizer.Clean(seed.LocationVi, 200), value => target.LocationVi = value);
            Apply(target.LocationEn, InputSanitizer.Clean(seed.LocationEn, 200), value => target.LocationEn = value);
            Apply(target.Latitude, seed.Latitude, value => target.Latitude = value);
            Apply(target.Longitude, seed.Longitude, value => target.Longitude = value);
            Apply(target.ImagePath, InputSanitizer.Clean(seed.Image, 300), value => target.ImagePath = value);
            Apply(target.ImageAltVi, InputSanitizer.Clean(seed.ImageAltVi, 300), value => target.ImageAltVi = value);
            Apply(target.ImageAltEn, InputSanitizer.Clean(seed.ImageAltEn, 300), value => target.ImageAltEn = value);

            var tagsVi = seed.TagsVi.Take(8).Select(tag => InputSanitizer.Clean(tag, 50)).ToList();
            var tagsEn = seed.TagsEn.Take(8).Select(tag => InputSanitizer.Clean(tag, 50)).ToList();
            if (!target.TagsVi.SequenceEqual(tagsVi))
            {
                target.TagsVi = tagsVi;
                changed = true;
            }

            if (!target.TagsEn.SequenceEqual(tagsEn))
            {
                target.TagsEn = tagsEn;
                changed = true;
            }

            var wikiTitle = string.IsNullOrWhiteSpace(seed.WikiTitle)
                ? null
                : InputSanitizer.Clean(seed.WikiTitle, 200);
            Apply(target.WikiTitle, wikiTitle, value => target.WikiTitle = value);
            Apply(target.Featured, seed.Featured, value => target.Featured = value);

            var relatedSlugs = seed.Related.Take(3).ToList();
            if (!target.RelatedSlugs.SequenceEqual(relatedSlugs))
            {
                target.RelatedSlugs = relatedSlugs;
                changed = true;
            }

            var sources = seed.Sources
                .Select(ToSource)
                .Where(source => source is not null)
                .Select(source => source!)
                .Take(6)
                .ToList();
            if (!SourcesEqual(target.Sources, sources))
            {
                target.Sources = sources;
                changed = true;
            }

            if (isNew)
            {
                await _dbContext.HistoricalEvents.AddAsync(target, cancellationToken);
                added++;
            }
            else if (changed)
            {
                target.UpdatedAt = DateTimeOffset.UtcNow;
                updated++;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Đồng bộ dữ liệu lịch sử: thêm {Added}, cập nhật {Updated} trên tổng {Total} sự kiện.",
            added,
            updated,
            document.Events.Count);
    }

    /// <summary>
    /// Thêm cột nguồn tham khảo cho cơ sở dữ liệu đã tạo trước đó mà không cần xóa dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    private async Task EnsureSourcesColumnAsync(CancellationToken cancellationToken)
    {
        if (_databaseOptions.Provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
        {
            await _dbContext.Database.ExecuteSqlRawAsync(
                "ALTER TABLE historical_events ADD COLUMN IF NOT EXISTS sources text NOT NULL DEFAULT '[]'",
                cancellationToken);
            return;
        }

        var connection = _dbContext.Database.GetDbConnection();
        var shouldClose = connection.State != System.Data.ConnectionState.Open;
        if (shouldClose)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            var exists = false;
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info('historical_events')";
                using var reader = await command.ExecuteReaderAsync(cancellationToken);
                while (await reader.ReadAsync(cancellationToken))
                {
                    if (string.Equals(reader.GetString(1), "sources", StringComparison.OrdinalIgnoreCase))
                    {
                        exists = true;
                        break;
                    }
                }
            }

            if (!exists)
            {
                await _dbContext.Database.ExecuteSqlRawAsync(
                    "ALTER TABLE historical_events ADD COLUMN sources TEXT NOT NULL DEFAULT '[]'",
                    cancellationToken);
                _logger.LogInformation("Đã thêm cột nguồn tham khảo vào cơ sở dữ liệu hiện có.");
            }
        }
        finally
        {
            if (shouldClose)
            {
                await connection.CloseAsync();
            }
        }
    }

    /// <summary>
    /// Chuyển một nguồn trong tệp mẫu sang thực thể sau khi kiểm tra dữ liệu.
    /// </summary>
    /// <param name="seed">Nguồn thô.</param>
    /// <returns>Thực thể nguồn hoặc null nếu không hợp lệ.</returns>
    private static EventSource? ToSource(SeedSource seed)
    {
        if (string.IsNullOrWhiteSpace(seed.Title) || string.IsNullOrWhiteSpace(seed.Url))
        {
            return null;
        }

        if (!Uri.TryCreate(seed.Url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp))
        {
            return null;
        }

        return new EventSource
        {
            Title = InputSanitizer.Clean(seed.Title, 200),
            Publisher = InputSanitizer.Clean(seed.Publisher, 120),
            Url = InputSanitizer.Clean(seed.Url, 400),
            Language = string.Equals(seed.Language, "en", StringComparison.OrdinalIgnoreCase) ? "en" : "vi"
        };
    }

    /// <summary>
    /// So sánh hai danh sách nguồn theo nội dung để tránh cập nhật thừa.
    /// </summary>
    /// <param name="left">Danh sách hiện có.</param>
    /// <param name="right">Danh sách mới.</param>
    /// <returns>Đúng nếu hai danh sách tương đương.</returns>
    private static bool SourcesEqual(IReadOnlyList<EventSource> left, IReadOnlyList<EventSource> right) =>
        left.Count == right.Count &&
        left.Zip(right).All(pair =>
            pair.First.Title == pair.Second.Title &&
            pair.First.Publisher == pair.Second.Publisher &&
            pair.First.Url == pair.Second.Url &&
            pair.First.Language == pair.Second.Language);

    /// <summary>
    /// Tạo tài khoản quản trị đầu tiên nếu cấu hình có đủ tên đăng nhập và mật khẩu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    private async Task SeedAdminAsync(CancellationToken cancellationToken)
    {
        var username = InputSanitizer.NormalizeUsername(_securityOptions.SeedAdminUsername);
        if (string.IsNullOrWhiteSpace(username))
        {
            return;
        }

        if (await _dbContext.AdminUsers.AnyAsync(item => item.Username == username, cancellationToken))
        {
            return;
        }

        if (_securityOptions.SeedAdminPassword.Length < MinimumAdminPasswordLength)
        {
            _logger.LogWarning(
                "Không tạo tài khoản quản trị vì mật khẩu khởi tạo ngắn hơn {Length} ký tự.",
                MinimumAdminPasswordLength);
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var admin = new AdminUser
        {
            Username = username,
            PasswordHash = _passwordHasher.Hash(_securityOptions.SeedAdminPassword),
            Role = "Admin",
            CreatedAt = now,
            UpdatedAt = now
        };

        await _dbContext.AdminUsers.AddAsync(admin, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Không ghi mật khẩu hay chuỗi băm vào nhật ký.
        _logger.LogInformation("Đã tạo tài khoản quản trị {Username}.", username);
    }

    /// <summary>
    /// Áp dụng tệp chính sách bảo mật cấp dòng nhúng trong assembly.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    private async Task ApplyRowLevelSecurityAsync(CancellationToken cancellationToken)
    {
        var script = ReadEmbeddedText("WorldHistory.Infrastructure.Persistence.Security.rls.sql");
        if (string.IsNullOrWhiteSpace(script))
        {
            _logger.LogWarning("Không đọc được tệp chính sách bảo mật cấp dòng.");
            return;
        }

        await _dbContext.Database.ExecuteSqlRawAsync(script, cancellationToken);
        _logger.LogInformation("Đã áp dụng chính sách bảo mật cấp dòng cho Postgres.");
    }

    /// <summary>
    /// Đọc và giải tuần tự tệp dữ liệu mẫu nhúng.
    /// </summary>
    /// <returns>Tài liệu dữ liệu mẫu hoặc null nếu không đọc được.</returns>
    private SeedDocument? LoadSeedDocument()
    {
        var json = ReadEmbeddedText(SeedResourceName);
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        return JsonSerializer.Deserialize<SeedDocument>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    /// <summary>
    /// Đọc nội dung một tài nguyên nhúng trong assembly.
    /// </summary>
    /// <param name="resourceName">Tên đầy đủ của tài nguyên.</param>
    /// <returns>Nội dung văn bản hoặc null nếu không tìm thấy.</returns>
    private static string? ReadEmbeddedText(string resourceName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream is null)
        {
            return null;
        }

        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    /// <summary>
    /// Kiểm tra khóa đường dẫn chỉ gồm chữ thường, chữ số và dấu gạch nối.
    /// </summary>
    /// <param name="slug">Khóa cần kiểm tra.</param>
    /// <returns>Đúng nếu hợp lệ.</returns>
    private static bool IsValidSlug(string? slug) =>
        !string.IsNullOrWhiteSpace(slug) &&
        slug.Length is >= 3 and <= 120 &&
        slug.All(character => char.IsAsciiLetterLower(character) || char.IsAsciiDigit(character) || character == '-');

    /// <summary>
    /// Cấu trúc tệp dữ liệu mẫu.
    /// </summary>
    private sealed class SeedDocument
    {
        /// <summary>Danh sách sự kiện trong tệp.</summary>
        public List<SeedEvent> Events { get; set; } = [];
    }

    /// <summary>
    /// Cấu trúc một sự kiện trong tệp dữ liệu mẫu.
    /// </summary>
    private sealed class SeedEvent
    {
        /// <summary>Khóa đường dẫn.</summary>
        public string? Slug { get; set; }

        /// <summary>Khóa thời kỳ.</summary>
        public string? Era { get; set; }

        /// <summary>Tên quốc gia tiếng Việt.</summary>
        public string Country { get; set; } = string.Empty;

        /// <summary>Tên quốc gia tiếng Anh.</summary>
        public string CountryEn { get; set; } = string.Empty;

        /// <summary>Năm bắt đầu.</summary>
        public int StartYear { get; set; }

        /// <summary>Năm kết thúc.</summary>
        public int? EndYear { get; set; }

        /// <summary>Nhãn thời gian tiếng Việt.</summary>
        public string DateLabelVi { get; set; } = string.Empty;

        /// <summary>Nhãn thời gian tiếng Anh.</summary>
        public string DateLabelEn { get; set; } = string.Empty;

        /// <summary>Tiêu đề tiếng Việt.</summary>
        public string TitleVi { get; set; } = string.Empty;

        /// <summary>Tiêu đề tiếng Anh.</summary>
        public string TitleEn { get; set; } = string.Empty;

        /// <summary>Tóm tắt tiếng Việt.</summary>
        public string SummaryVi { get; set; } = string.Empty;

        /// <summary>Tóm tắt tiếng Anh.</summary>
        public string SummaryEn { get; set; } = string.Empty;

        /// <summary>Các đoạn nội dung tiếng Việt.</summary>
        public List<string> ContentVi { get; set; } = [];

        /// <summary>Các đoạn nội dung tiếng Anh.</summary>
        public List<string> ContentEn { get; set; } = [];

        /// <summary>Địa điểm tiếng Việt.</summary>
        public string LocationVi { get; set; } = string.Empty;

        /// <summary>Địa điểm tiếng Anh.</summary>
        public string LocationEn { get; set; } = string.Empty;

        /// <summary>Vĩ độ.</summary>
        public double Latitude { get; set; }

        /// <summary>Kinh độ.</summary>
        public double Longitude { get; set; }

        /// <summary>Đường dẫn hình minh họa.</summary>
        public string Image { get; set; } = "/images/co-dai.svg";

        /// <summary>Văn bản thay thế tiếng Việt.</summary>
        public string ImageAltVi { get; set; } = string.Empty;

        /// <summary>Văn bản thay thế tiếng Anh.</summary>
        public string ImageAltEn { get; set; } = string.Empty;

        /// <summary>Nhãn tiếng Việt.</summary>
        public List<string> TagsVi { get; set; } = [];

        /// <summary>Nhãn tiếng Anh.</summary>
        public List<string> TagsEn { get; set; } = [];

        /// <summary>Tiêu đề trang bách khoa toàn thư mở.</summary>
        public string? WikiTitle { get; set; }

        /// <summary>Đánh dấu nổi bật.</summary>
        public bool Featured { get; set; }

        /// <summary>Các khóa sự kiện liên quan.</summary>
        public List<string> Related { get; set; } = [];

        /// <summary>Các nguồn tham khảo của bài viết.</summary>
        public List<SeedSource> Sources { get; set; } = [];
    }

    /// <summary>
    /// Cấu trúc một nguồn tham khảo trong tệp dữ liệu mẫu.
    /// </summary>
    private sealed class SeedSource
    {
        /// <summary>Tên tài liệu hoặc bài viết.</summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>Cơ quan công bố.</summary>
        public string Publisher { get; set; } = string.Empty;

        /// <summary>Đường dẫn tới nguồn.</summary>
        public string Url { get; set; } = string.Empty;

        /// <summary>Ngôn ngữ của nguồn.</summary>
        public string Language { get; set; } = "vi";
    }
}
