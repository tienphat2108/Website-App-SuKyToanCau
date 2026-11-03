using WorldHistory.Application.Interfaces;
using WorldHistory.Application.Services;

namespace WorldHistory.Tests.Services;

/// <summary>
/// Kiểm thử nội dung thư cảm ơn gửi sau khi tiếp nhận đóng góp.
/// </summary>
public sealed class ThankYouEmailTemplatesTests
{
    private static readonly Guid ContributionId =
        Guid.Parse("7f0c2f84-9c1b-4f5e-b4c2-6d0c2a9e8b11");

    /// <summary>
    /// Bản tiếng Việt phải chào đúng tên, nêu mã tiếp nhận và ở dạng văn bản thuần.
    /// </summary>
    [Fact]
    public void Create_Vietnamese_WritesThankYouInPlainText()
    {
        var message = ThankYouEmailTemplates.Create(
            new ThankYouEmail("docgia@example.com", "Nguyễn Văn A", ContributionId, "vi"));

        Assert.Equal("docgia@example.com", message.To);
        Assert.Contains("Đã nhận đóng góp", message.Subject);
        Assert.Contains("Xin chào Nguyễn Văn A", message.Body);
        Assert.Contains(ContributionId.ToString("D"), message.Body);
        Assert.DoesNotContain("<", message.Body);
        Assert.DoesNotContain(">", message.Body);
    }

    /// <summary>
    /// Mã ngôn ngữ tiếng Anh phải chọn bản thư tiếng Anh.
    /// </summary>
    [Fact]
    public void Create_English_WritesEnglishSubject()
    {
        var message = ThankYouEmailTemplates.Create(
            new ThankYouEmail("reader@example.com", "Alex Smith", ContributionId, "en"));

        Assert.Contains("We received your contribution", message.Subject);
        Assert.Contains("Hello Alex Smith", message.Body);
        Assert.Contains("World History Archive editorial team", message.Body);
        Assert.DoesNotContain("Xin chào", message.Body);
    }

    /// <summary>
    /// Tên có xuống dòng phải được gộp về một dòng để không phá bố cục thư.
    /// </summary>
    [Fact]
    public void Create_NameWithLineBreaks_KeepsGreetingOnOneLine()
    {
        var message = ThankYouEmailTemplates.Create(
            new ThankYouEmail("reader@example.com", "  Nguyễn\r\nVăn\tA  ", ContributionId, "vi"));

        Assert.Contains("Xin chào Nguyễn Văn A", message.Body);
        Assert.DoesNotContain("Nguyễn\r\n", message.Body);
        Assert.DoesNotContain("\t", message.Body);
    }

    /// <summary>
    /// Mã ngôn ngữ lạ hoặc trống phải quay về bản tiếng Việt.
    /// </summary>
    [Theory]
    [InlineData("")]
    [InlineData("fr")]
    public void Create_UnknownLocale_FallsBackToVietnamese(string locale)
    {
        var message = ThankYouEmailTemplates.Create(
            new ThankYouEmail("reader@example.com", "Minh Anh", ContributionId, locale));

        Assert.Contains("Sử Ký Toàn Cầu", message.Subject);
        Assert.Contains("Xin chào Minh Anh", message.Body);
    }
}
