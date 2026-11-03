using WorldHistory.Application.DTOs;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Enums;

namespace WorldHistory.Application.Services;

/// <summary>
/// Chuyển đổi thực thể sang cấu trúc dữ liệu trả về cho giao diện.
/// Việc ánh xạ tập trung tại đây giúp tránh lặp logic và giảm dữ liệu dư thừa trong phản hồi.
/// </summary>
public static class HistoryMappings
{
    /// <summary>
    /// Ánh xạ một sự kiện sang thông tin tóm tắt.
    /// </summary>
    /// <param name="historicalEvent">Thực thể cần ánh xạ.</param>
    /// <returns>Thông tin tóm tắt không chứa nội dung đầy đủ.</returns>
    public static EventSummaryDto ToSummaryDto(this HistoricalEvent historicalEvent)
    {
        var era = EraCatalog.Find(historicalEvent.Era);

        return new EventSummaryDto(
            historicalEvent.Slug,
            historicalEvent.Era,
            era?.NameVi ?? historicalEvent.Era,
            era?.NameEn ?? historicalEvent.Era,
            historicalEvent.Country,
            historicalEvent.CountryEn,
            historicalEvent.StartYear,
            historicalEvent.EndYear,
            historicalEvent.DateLabelVi,
            historicalEvent.DateLabelEn,
            historicalEvent.TitleVi,
            historicalEvent.TitleEn,
            historicalEvent.SummaryVi,
            historicalEvent.SummaryEn,
            historicalEvent.LocationVi,
            historicalEvent.LocationEn,
            historicalEvent.Latitude,
            historicalEvent.Longitude,
            historicalEvent.ImagePath,
            historicalEvent.ImageAltVi,
            historicalEvent.ImageAltEn,
            historicalEvent.TagsVi.AsReadOnly(),
            historicalEvent.TagsEn.AsReadOnly(),
            historicalEvent.Featured);
    }

    /// <summary>
    /// Ánh xạ một sự kiện sang thông tin chi tiết, bao gồm nội dung và liên kết liên quan.
    /// </summary>
    /// <param name="historicalEvent">Thực thể cần ánh xạ.</param>
    /// <param name="related">Danh sách sự kiện liên quan đã tải.</param>
    /// <returns>Thông tin chi tiết.</returns>
    public static EventDetailDto ToDetailDto(
        this HistoricalEvent historicalEvent,
        IReadOnlyList<EventSummaryDto> related)
    {
        var era = EraCatalog.Find(historicalEvent.Era);

        return new EventDetailDto(
            historicalEvent.Slug,
            historicalEvent.Era,
            era?.NameVi ?? historicalEvent.Era,
            era?.NameEn ?? historicalEvent.Era,
            historicalEvent.Country,
            historicalEvent.CountryEn,
            historicalEvent.StartYear,
            historicalEvent.EndYear,
            historicalEvent.DateLabelVi,
            historicalEvent.DateLabelEn,
            historicalEvent.TitleVi,
            historicalEvent.TitleEn,
            historicalEvent.SummaryVi,
            historicalEvent.SummaryEn,
            historicalEvent.GetVietnameseParagraphs(),
            historicalEvent.GetEnglishParagraphs(),
            historicalEvent.LocationVi,
            historicalEvent.LocationEn,
            historicalEvent.Latitude,
            historicalEvent.Longitude,
            historicalEvent.ImagePath,
            historicalEvent.ImageAltVi,
            historicalEvent.ImageAltEn,
            historicalEvent.TagsVi.AsReadOnly(),
            historicalEvent.TagsEn.AsReadOnly(),
            historicalEvent.Sources
                .Select(source => new EventSourceDto(source.Title, source.Publisher, source.Url, source.Language))
                .ToList()
                .AsReadOnly(),
            historicalEvent.WikiTitle,
            historicalEvent.Featured,
            related,
            historicalEvent.UpdatedAt);
    }

    /// <summary>
    /// Chuyển trạng thái đóng góp sang chuỗi thống nhất dùng trong giao diện.
    /// </summary>
    /// <param name="status">Trạng thái cần chuyển.</param>
    /// <returns>Chuỗi chữ thường tương ứng.</returns>
    public static string ToApiValue(this ContributionStatus status) =>
        status.ToString().ToLowerInvariant();
}
