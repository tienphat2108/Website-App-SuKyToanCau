namespace WorldHistory.Core.Entities;

/// <summary>
/// Thực thể gốc của mọi thực thể nghiệp vụ, cung cấp dấu thời gian tạo và cập nhật.
/// </summary>
public abstract class EntityBase
{
    /// <summary>Thời điểm bản ghi được tạo, luôn lưu theo múi giờ phối hợp quốc tế.</summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>Thời điểm bản ghi được cập nhật gần nhất.</summary>
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
