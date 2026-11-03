using WorldHistory.Application.Services;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Enums;

namespace WorldHistory.Tests.Entities;

/// <summary>
/// Kiểm thử cách tách đoạn nội dung và ánh xạ thực thể sang cấu trúc trả về.
/// Mục tiêu: bảo đảm giao diện nhận đúng dữ liệu song ngữ và không nhận nội dung thừa.
/// </summary>
public sealed class HistoricalEventTests
{
    /// <summary>
    /// Nội dung nhiều đoạn phải được tách theo dấu xuống dòng kép.
    /// </summary>
    [Fact]
    public void GetVietnameseParagraphs_SplitsOnDoubleNewline()
    {
        var historicalEvent = CreateEvent();
        historicalEvent.ContentVi = "Đoạn một.\n\nĐoạn hai.\n\nĐoạn ba.";

        var paragraphs = historicalEvent.GetVietnameseParagraphs();

        Assert.Equal(["Đoạn một.", "Đoạn hai.", "Đoạn ba."], paragraphs);
    }

    /// <summary>
    /// Dấu xuống dòng kiểu Windows phải được xử lý giống kiểu Unix.
    /// </summary>
    [Fact]
    public void GetEnglishParagraphs_SplitsOnWindowsNewline()
    {
        var historicalEvent = CreateEvent();
        historicalEvent.ContentEn = "First paragraph.\r\n\r\nSecond paragraph.";

        Assert.Equal(["First paragraph.", "Second paragraph."], historicalEvent.GetEnglishParagraphs());
    }

    /// <summary>
    /// Dòng trống thừa không được tạo ra đoạn văn rỗng trên giao diện.
    /// </summary>
    [Fact]
    public void GetVietnameseParagraphs_IgnoresEmptyParagraphs()
    {
        var historicalEvent = CreateEvent();
        historicalEvent.ContentVi = "Một.\n\n\n\nHai.\n\n   \n\n";

        Assert.Equal(["Một.", "Hai."], historicalEvent.GetVietnameseParagraphs());
    }

    /// <summary>
    /// Nội dung trống phải trả mảng rỗng thay vì một phần tử rỗng.
    /// </summary>
    [Fact]
    public void GetVietnameseParagraphs_EmptyContent_ReturnsEmptyArray()
    {
        var historicalEvent = CreateEvent();
        historicalEvent.ContentVi = "   ";

        Assert.Empty(historicalEvent.GetVietnameseParagraphs());
    }

    /// <summary>
    /// Bản tóm tắt phải chứa tên thời kỳ song ngữ lấy từ danh mục và giữ nguyên nhãn.
    /// </summary>
    [Fact]
    public void ToSummaryDto_MapsEraNamesAndTags()
    {
        var historicalEvent = CreateEvent();
        historicalEvent.Era = EraCatalog.CanDai;
        historicalEvent.TagsVi = ["chiến tranh", "ngoại giao"];
        historicalEvent.TagsEn = ["war", "diplomacy"];

        var summary = historicalEvent.ToSummaryDto();

        Assert.Equal("Cận đại", summary.EraNameVi);
        Assert.Equal("Early modern", summary.EraNameEn);
        Assert.Equal(["chiến tranh", "ngoại giao"], summary.TagsVi);
        Assert.Equal(["war", "diplomacy"], summary.TagsEn);
    }

    /// <summary>
    /// Khóa thời kỳ lạ không có trong danh mục phải được giữ nguyên thay vì gây lỗi.
    /// </summary>
    [Fact]
    public void ToSummaryDto_UnknownEra_FallsBackToKey()
    {
        var historicalEvent = CreateEvent();
        historicalEvent.Era = "thoi-ky-la";

        var summary = historicalEvent.ToSummaryDto();

        Assert.Equal("thoi-ky-la", summary.EraNameVi);
        Assert.Equal("thoi-ky-la", summary.EraNameEn);
    }

    /// <summary>
    /// Bản chi tiết phải chứa nội dung đã tách đoạn và danh sách liên quan được truyền vào.
    /// </summary>
    [Fact]
    public void ToDetailDto_IncludesParagraphsAndRelated()
    {
        var historicalEvent = CreateEvent();
        historicalEvent.WikiTitle = "Trận Bạch Đằng (938)";
        var related = CreateEvent().ToSummaryDto();

        var detail = historicalEvent.ToDetailDto([related]);

        Assert.Equal(["Đoạn một.", "Đoạn hai."], detail.ContentVi);
        Assert.Equal(["Paragraph one.", "Paragraph two."], detail.ContentEn);
        Assert.Single(detail.Related);
        Assert.Equal("Trận Bạch Đằng (938)", detail.WikiTitle);
        Assert.Equal(historicalEvent.UpdatedAt, detail.UpdatedAt);
    }

    /// <summary>
    /// Trạng thái đóng góp phải được chuyển thành chữ thường khi trả về API.
    /// </summary>
    [Theory]
    [InlineData(ContributionStatus.Pending, "pending")]
    [InlineData(ContributionStatus.Approved, "approved")]
    [InlineData(ContributionStatus.Rejected, "rejected")]
    public void ToApiValue_ReturnsLowercaseName(ContributionStatus status, string expected)
    {
        Assert.Equal(expected, status.ToApiValue());
    }

    /// <summary>
    /// Tạo một sự kiện mẫu đủ trường để kiểm thử ánh xạ.
    /// </summary>
    private static HistoricalEvent CreateEvent() =>
        new()
        {
            Slug = "su-kien-mau",
            Era = EraCatalog.TrungDai,
            Country = "Việt Nam",
            CountryEn = "Vietnam",
            StartYear = 938,
            DateLabelVi = "Năm 938",
            DateLabelEn = "938 CE",
            TitleVi = "Sự kiện mẫu",
            TitleEn = "Sample event",
            SummaryVi = "Tóm tắt tiếng Việt.",
            SummaryEn = "English summary.",
            ContentVi = "Đoạn một.\n\nĐoạn hai.",
            ContentEn = "Paragraph one.\n\nParagraph two.",
            LocationVi = "Việt Nam",
            LocationEn = "Vietnam",
            ImagePath = "/images/trung-dai.svg",
            ImageAltVi = "Minh họa thời trung đại",
            ImageAltEn = "Medieval illustration",
            TagsVi = ["lịch sử"],
            TagsEn = ["history"]
        };
}
