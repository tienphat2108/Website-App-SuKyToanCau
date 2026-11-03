using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using WorldHistory.Core.Entities;

namespace WorldHistory.Infrastructure.Persistence;

/// <summary>
/// Ngữ cảnh truy cập cơ sở dữ liệu của hệ thống.
/// Cấu hình chi tiết cho từng thực thể được đặt trong thư mục <c>Configurations</c>.
/// </summary>
public sealed class WorldHistoryDbContext : DbContext
{
    /// <summary>
    /// Khởi tạo ngữ cảnh với các tùy chọn do tầng phụ thuộc cung cấp.
    /// </summary>
    /// <param name="options">Tùy chọn kết nối và hành vi của EF Core.</param>
    public WorldHistoryDbContext(DbContextOptions<WorldHistoryDbContext> options) : base(options)
    {
    }

    /// <summary>Tập sự kiện lịch sử.</summary>
    public DbSet<HistoricalEvent> HistoricalEvents => Set<HistoricalEvent>();

    /// <summary>Tập đóng góp của độc giả.</summary>
    public DbSet<Contribution> Contributions => Set<Contribution>();

    /// <summary>Tập tài khoản quản trị.</summary>
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    /// <summary>
    /// Áp dụng toàn bộ cấu hình thực thể trong assembly này.
    /// </summary>
    /// <param name="modelBuilder">Bộ dựng mô hình dữ liệu.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WorldHistoryDbContext).Assembly);
    }

    /// <summary>
    /// Tự động cập nhật dấu thời gian trước khi lưu thay đổi.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số bản ghi bị ảnh hưởng.</returns>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<EntityBase>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.CreatedAt == default)
                {
                    entry.Entity.CreatedAt = now;
                }

                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Tạo bộ chuyển đổi danh sách chuỗi sang cột văn bản JSON, dùng chung cho các trường nhãn và liên kết.
    /// </summary>
    /// <returns>Bộ chuyển đổi và bộ so sánh giá trị tương ứng.</returns>
    internal static (Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<List<string>, string> Converter,
        Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>> Comparer) CreateStringListConversion()
    {
        var converter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<List<string>, string>(
            value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
            value => string.IsNullOrWhiteSpace(value)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(value, (JsonSerializerOptions?)null) ?? new List<string>());

        var comparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
            (left, right) => left != null && right != null && left.SequenceEqual(right),
            value => value.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode(StringComparison.Ordinal))),
            value => value.ToList());

        return (converter, comparer);
    }

    /// <summary>
    /// Tạo bộ chuyển đổi danh sách nguồn tham khảo sang cột văn bản JSON.
    /// </summary>
    /// <returns>Bộ chuyển đổi và bộ so sánh giá trị tương ứng.</returns>
    internal static (Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<List<EventSource>, string> Converter,
        Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<EventSource>> Comparer) CreateEventSourceListConversion()
    {
        var converter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<List<EventSource>, string>(
            value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
            value => string.IsNullOrWhiteSpace(value)
                ? new List<EventSource>()
                : JsonSerializer.Deserialize<List<EventSource>>(value, (JsonSerializerOptions?)null) ?? new List<EventSource>());

        var comparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<EventSource>>(
            (left, right) => left != null && right != null && left.Count == right.Count &&
                left.Zip(right).All(pair =>
                    pair.First.Title == pair.Second.Title &&
                    pair.First.Publisher == pair.Second.Publisher &&
                    pair.First.Url == pair.Second.Url &&
                    pair.First.Language == pair.Second.Language),
            value => value.Aggregate(0, (hash, item) => HashCode.Combine(
                hash,
                item.Title.GetHashCode(StringComparison.Ordinal),
                item.Publisher.GetHashCode(StringComparison.Ordinal),
                item.Url.GetHashCode(StringComparison.Ordinal),
                item.Language.GetHashCode(StringComparison.Ordinal))),
            value => value.Select(item => new EventSource
            {
                Title = item.Title,
                Publisher = item.Publisher,
                Url = item.Url,
                Language = item.Language
            }).ToList());

        return (converter, comparer);
    }
}
