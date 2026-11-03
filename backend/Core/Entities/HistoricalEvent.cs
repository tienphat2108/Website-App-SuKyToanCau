using WorldHistory.Core.Enums;

namespace WorldHistory.Core.Entities;

/// <summary>
/// Sự kiện lịch sử song ngữ, là thực thể trung tâm của hệ thống.
/// Nội dung được lưu thành văn bản thuần; mỗi đoạn cách nhau bằng hai ký tự xuống dòng.
/// </summary>
public sealed class HistoricalEvent : EntityBase
{
    /// <summary>Khóa chính dạng đường dẫn, ví dụ <c>chien-thang-bach-dang-938</c>.</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Khóa thời kỳ, tham chiếu tới <see cref="EraCatalog"/>.</summary>
    public string Era { get; set; } = EraCatalog.HienDai;

    /// <summary>Tên quốc gia hoặc khu vực bằng tiếng Việt.</summary>
    public string Country { get; set; } = string.Empty;

    /// <summary>Tên quốc gia hoặc khu vực bằng tiếng Anh.</summary>
    public string CountryEn { get; set; } = string.Empty;

    /// <summary>Năm bắt đầu. Giá trị âm biểu thị năm trước Công nguyên.</summary>
    public int StartYear { get; set; }

    /// <summary>Năm kết thúc nếu sự kiện kéo dài nhiều năm; null nếu là mốc thời gian.</summary>
    public int? EndYear { get; set; }

    /// <summary>Nhãn thời gian hiển thị tiếng Việt, đã được biên tập sẵn.</summary>
    public string DateLabelVi { get; set; } = string.Empty;

    /// <summary>Nhãn thời gian hiển thị tiếng Anh.</summary>
    public string DateLabelEn { get; set; } = string.Empty;

    /// <summary>Tiêu đề sự kiện bằng tiếng Việt.</summary>
    public string TitleVi { get; set; } = string.Empty;

    /// <summary>Tiêu đề sự kiện bằng tiếng Anh.</summary>
    public string TitleEn { get; set; } = string.Empty;

    /// <summary>Tóm tắt ngắn bằng tiếng Việt, dùng cho thẻ và mô tả tìm kiếm.</summary>
    public string SummaryVi { get; set; } = string.Empty;

    /// <summary>Tóm tắt ngắn bằng tiếng Anh.</summary>
    public string SummaryEn { get; set; } = string.Empty;

    /// <summary>Nội dung đầy đủ tiếng Việt, các đoạn cách nhau bằng hai lần xuống dòng.</summary>
    public string ContentVi { get; set; } = string.Empty;

    /// <summary>Nội dung đầy đủ tiếng Anh, các đoạn cách nhau bằng hai lần xuống dòng.</summary>
    public string ContentEn { get; set; } = string.Empty;

    /// <summary>Địa điểm diễn ra sự kiện bằng tiếng Việt.</summary>
    public string LocationVi { get; set; } = string.Empty;

    /// <summary>Địa điểm diễn ra sự kiện bằng tiếng Anh.</summary>
    public string LocationEn { get; set; } = string.Empty;

    /// <summary>Vĩ độ dùng để đánh dấu trên bản đồ.</summary>
    public double Latitude { get; set; }

    /// <summary>Kinh độ dùng để đánh dấu trên bản đồ.</summary>
    public double Longitude { get; set; }

    /// <summary>Đường dẫn hình minh họa nội bộ, không phụ thuộc dịch vụ bên ngoài.</summary>
    public string ImagePath { get; set; } = "/images/co-dai.svg";

    /// <summary>Văn bản thay thế của hình minh họa bằng tiếng Việt.</summary>
    public string ImageAltVi { get; set; } = string.Empty;

    /// <summary>Văn bản thay thế của hình minh họa bằng tiếng Anh.</summary>
    public string ImageAltEn { get; set; } = string.Empty;

    /// <summary>Danh sách nhãn tiếng Việt, được tuần tự hóa thành một cột văn bản.</summary>
    public List<string> TagsVi { get; set; } = [];

    /// <summary>Danh sách nhãn tiếng Anh, được tuần tự hóa thành một cột văn bản.</summary>
    public List<string> TagsEn { get; set; } = [];

    /// <summary>Tiêu đề trang Wikipedia tương ứng để tra cứu thêm, có thể để trống.</summary>
    public string? WikiTitle { get; set; }

    /// <summary>Đánh dấu sự kiện nổi bật để hiển thị trên trang chủ.</summary>
    public bool Featured { get; set; }

    /// <summary>Danh sách khóa của các sự kiện liên quan, được tuần tự hóa thành một cột văn bản.</summary>
    public List<string> RelatedSlugs { get; set; } = [];

    /// <summary>Danh sách nguồn tham khảo, được tuần tự hóa thành một cột văn bản JSON.</summary>
    public List<EventSource> Sources { get; set; } = [];

    /// <summary>
    /// Tách nội dung tiếng Việt thành các đoạn văn để trình bày.
    /// </summary>
    /// <returns>Mảng đoạn văn đã loại bỏ khoảng trắng thừa.</returns>
    public string[] GetVietnameseParagraphs() => SplitParagraphs(ContentVi);

    /// <summary>
    /// Tách nội dung tiếng Anh thành các đoạn văn để trình bày.
    /// </summary>
    /// <returns>Mảng đoạn văn đã loại bỏ khoảng trắng thừa.</returns>
    public string[] GetEnglishParagraphs() => SplitParagraphs(ContentEn);

    /// <summary>
    /// Chuẩn hóa văn bản nhiều đoạn thành mảng đoạn văn.
    /// </summary>
    /// <param name="content">Văn bản gốc.</param>
    /// <returns>Mảng đoạn văn không rỗng.</returns>
    private static string[] SplitParagraphs(string content) =>
        string.IsNullOrWhiteSpace(content)
            ? []
            : content.Split(["\r\n\r\n", "\n\n"], StringSplitOptions.RemoveEmptyEntries)
                .Select(paragraph => paragraph.Trim())
                .Where(paragraph => paragraph.Length > 0)
                .ToArray();
}
