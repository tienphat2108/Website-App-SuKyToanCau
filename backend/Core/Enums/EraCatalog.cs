namespace WorldHistory.Core.Enums;

/// <summary>
/// Định nghĩa một thời kỳ lịch sử dùng chung cho API và giao diện.
/// </summary>
/// <param name="Key">Khóa ổn định, không dấu, dùng trong đường dẫn và bộ lọc.</param>
/// <param name="NameVi">Tên hiển thị tiếng Việt.</param>
/// <param name="NameEn">Tên hiển thị tiếng Anh.</param>
/// <param name="Order">Thứ tự sắp xếp từ cổ đến kim.</param>
/// <param name="FromYear">Năm bắt đầu ước lệ của thời kỳ.</param>
/// <param name="ToYear">Năm kết thúc ước lệ của thời kỳ.</param>
public sealed record EraDefinition(
    string Key,
    string NameVi,
    string NameEn,
    int Order,
    int FromYear,
    int ToYear);

/// <summary>
/// Danh mục thời kỳ lịch sử cố định của hệ thống.
/// Toàn bộ tầng khác chỉ tham chiếu tới khóa trong danh mục này, tránh chuỗi rời rạc.
/// </summary>
public static class EraCatalog
{
    /// <summary>Thời kỳ cổ đại, tính từ các nhà nước sơ khai đến trước thế kỷ thứ mười.</summary>
    public const string CoDai = "co-dai";

    /// <summary>Thời kỳ trung đại, từ thế kỷ thứ mười đến trước năm 1802.</summary>
    public const string TrungDai = "trung-dai";

    /// <summary>Thời kỳ cận đại, từ năm 1802 đến trước năm 1945.</summary>
    public const string CanDai = "can-dai";

    /// <summary>Thời kỳ hiện đại, từ năm 1945 đến nay.</summary>
    public const string HienDai = "hien-dai";

    /// <summary>
    /// Toàn bộ thời kỳ theo thứ tự hiển thị.
    /// </summary>
    public static readonly IReadOnlyList<EraDefinition> All =
    [
        new(CoDai, "Cổ đại", "Ancient", 1, -3000, 999),
        new(TrungDai, "Trung đại", "Medieval", 2, 1000, 1801),
        new(CanDai, "Cận đại", "Early modern", 3, 1802, 1944),
        new(HienDai, "Hiện đại", "Modern", 4, 1945, 2100)
    ];

    /// <summary>
    /// Kiểm tra một khóa thời kỳ có tồn tại trong danh mục hay không.
    /// </summary>
    /// <param name="key">Khóa cần kiểm tra, không phân biệt chữ hoa chữ thường.</param>
    /// <returns>Đúng nếu khóa hợp lệ.</returns>
    public static bool IsValid(string? key) =>
        !string.IsNullOrWhiteSpace(key) &&
        All.Any(era => string.Equals(era.Key, key, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Lấy thông tin thời kỳ theo khóa.
    /// </summary>
    /// <param name="key">Khóa thời kỳ.</param>
    /// <returns>Thông tin thời kỳ hoặc null nếu không tìm thấy.</returns>
    public static EraDefinition? Find(string? key) =>
        string.IsNullOrWhiteSpace(key)
            ? null
            : All.FirstOrDefault(era => string.Equals(era.Key, key, StringComparison.OrdinalIgnoreCase));
}
