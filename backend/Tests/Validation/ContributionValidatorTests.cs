using WorldHistory.Application.DTOs;
using WorldHistory.Application.Validation;

namespace WorldHistory.Tests.Validation;

/// <summary>
/// Kiểm thử quy tắc kiểm tra dữ liệu đóng góp.
/// Mục tiêu: mọi trường đều có giới hạn rõ ràng và bẫy chống tự động gửi luôn hoạt động.
/// </summary>
public sealed class ContributionValidatorTests
{
    /// <summary>Nội dung mẫu dài 20 ký tự, đúng ngưỡng tối thiểu.</summary>
    private const string ValidMessage = "Đóng góp nội dung thử nghiệm.";

    /// <summary>
    /// Yêu cầu đầy đủ và hợp lệ phải không có lỗi.
    /// </summary>
    [Fact]
    public void Validate_ValidRequest_ReturnsNoErrors()
    {
        var request = new ContributionRequest("Nguyễn Văn A", "docgia@example.com", ValidMessage);

        var errors = ContributionValidator.Validate(request);

        Assert.Empty(errors);
    }

    /// <summary>
    /// Họ tên ngắn hơn hai ký tự phải bị từ chối.
    /// </summary>
    [Fact]
    public void Validate_ShortFullName_ReturnsError()
    {
        var request = new ContributionRequest("A", "docgia@example.com", ValidMessage);

        var errors = ContributionValidator.Validate(request);

        Assert.True(errors.ContainsKey("fullName"));
    }

    /// <summary>
    /// Họ tên dài hơn giới hạn phải bị từ chối.
    /// </summary>
    [Fact]
    public void Validate_LongFullName_ReturnsError()
    {
        var request = new ContributionRequest(
            new string('A', ContributionValidator.MaxNameLength + 1),
            "docgia@example.com",
            ValidMessage);

        var errors = ContributionValidator.Validate(request);

        Assert.Contains("fullName", errors.Keys);
    }

    /// <summary>
    /// Thư điện tử sai định dạng phải bị từ chối.
    /// </summary>
    [Fact]
    public void Validate_InvalidEmail_ReturnsError()
    {
        var request = new ContributionRequest("Nguyễn Văn A", "sai-dinh-dang", ValidMessage);

        var errors = ContributionValidator.Validate(request);

        Assert.Contains("email", errors.Keys);
    }

    /// <summary>
    /// Nội dung ngắn hơn hai mươi ký tự phải bị từ chối.
    /// </summary>
    [Fact]
    public void Validate_ShortMessage_ReturnsError()
    {
        var request = new ContributionRequest("Nguyễn Văn A", "docgia@example.com", "Quá ngắn");

        var errors = ContributionValidator.Validate(request);

        Assert.Contains("message", errors.Keys);
    }

    /// <summary>
    /// Nội dung dài hơn năm nghìn ký tự phải bị từ chối để bảo vệ dung lượng lưu trữ.
    /// </summary>
    [Fact]
    public void Validate_LongMessage_ReturnsError()
    {
        var request = new ContributionRequest(
            "Nguyễn Văn A",
            "docgia@example.com",
            new string('a', ContributionValidator.MaxMessageLength + 1));

        var errors = ContributionValidator.Validate(request);

        Assert.Contains("message", errors.Keys);
    }

    /// <summary>
    /// Gợi ý chủ đề dài hơn giới hạn phải bị từ chối.
    /// </summary>
    [Fact]
    public void Validate_LongSuggestion_ReturnsError()
    {
        var request = new ContributionRequest(
            "Nguyễn Văn A",
            "docgia@example.com",
            ValidMessage,
            new string('a', ContributionValidator.MaxSuggestionLength + 1));

        var errors = ContributionValidator.Validate(request);

        Assert.Contains("eventSuggestion", errors.Keys);
    }

    /// <summary>
    /// Trường ẩn chống tự động gửi có dữ liệu phải bị coi là yêu cầu không hợp lệ.
    /// </summary>
    [Fact]
    public void Validate_FilledHoneypot_ReturnsError()
    {
        var request = new ContributionRequest(
            "Nguyễn Văn A",
            "docgia@example.com",
            ValidMessage,
            Website: "http://spam.example");

        var errors = ContributionValidator.Validate(request);

        Assert.Contains("website", errors.Keys);
    }

    /// <summary>
    /// Gợi ý chủ đề và bẫy để trống là hợp lệ.
    /// </summary>
    [Fact]
    public void Validate_EmptyOptionalFields_ReturnsNoErrors()
    {
        var request = new ContributionRequest(
            "Nguyễn Văn A",
            "docgia@example.com",
            ValidMessage,
            EventSuggestion: null,
            Website: "   ");

        Assert.Empty(ContributionValidator.Validate(request));
    }
}
