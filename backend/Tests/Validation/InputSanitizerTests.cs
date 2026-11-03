using WorldHistory.Application.Validation;

namespace WorldHistory.Tests.Validation;

/// <summary>
/// Kiểm thử bộ làm sạch dữ liệu đầu vào.
/// Mục tiêu: bảo đảm mọi nội dung do người dùng gửi lên đều được chuyển thành văn bản thuần,
/// không còn thẻ siêu văn bản, ký tự điều khiển hay khoảng trắng bất thường.
/// </summary>
public sealed class InputSanitizerTests
{
    /// <summary>
    /// Thẻ siêu văn bản phải bị loại bỏ và khoảng trắng được thu gọn.
    /// Đầu vào: chuỗi có thẻ bao quanh. Đầu ra: câu văn thuần đã trim.
    /// </summary>
    [Fact]
    public void Clean_RemovesHtmlTags()
    {
        var result = InputSanitizer.Clean("<p>Xin <strong>chào</strong> bạn</p>");

        Assert.Equal("Xin chào bạn", result);
    }

    /// <summary>
    /// Thẻ đã được mã hóa thực thể phải được giải mã trước khi loại bỏ,
    /// nếu không kẻ tấn công có thể lách bộ lọc bằng chuỗi thoát.
    /// </summary>
    [Fact]
    public void Clean_DecodesEntitiesBeforeRemovingTags()
    {
        var result = InputSanitizer.Clean("&lt;script&gt;alert(1)&lt;/script&gt;");

        Assert.Equal("alert(1)", result);
    }

    /// <summary>
    /// Thực thể hợp lệ như dấu và phải được giữ nguyên.
    /// </summary>
    [Fact]
    public void Clean_KeepsDecodedAmpersand()
    {
        var result = InputSanitizer.Clean("Tom &amp; Jerry");

        Assert.Equal("Tom & Jerry", result);
    }

    /// <summary>
    /// Ký tự điều khiển và ký tự vô hình phải bị loại bỏ để tránh giả mạo nội dung.
    /// </summary>
    [Fact]
    public void Clean_RemovesControlAndInvisibleCharacters()
    {
        var result = InputSanitizer.Clean("a\u0000b\u200Bc\uFEFFd");

        Assert.Equal("a bcd", result);
    }

    /// <summary>
    /// Nhiều khoảng trắng, xuống dòng và tab phải được quy về một dấu cách.
    /// </summary>
    [Fact]
    public void Clean_CollapsesWhitespace()
    {
        var result = InputSanitizer.Clean("  nhiều   khoảng \n\t trắng  ");

        Assert.Equal("nhiều khoảng trắng", result);
    }

    /// <summary>
    /// Chuỗi dài hơn giới hạn phải bị cắt đúng số ký tự.
    /// </summary>
    [Fact]
    public void Clean_TruncatesToMaximumLength()
    {
        var result = InputSanitizer.Clean("abcdef", 3);

        Assert.Equal("abc", result);
    }

    /// <summary>
    /// Giá trị rỗng hoặc null phải trả về chuỗi rỗng thay vì ném lỗi.
    /// </summary>
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Clean_ReturnsEmptyForBlankInput(string? input)
    {
        Assert.Equal(string.Empty, InputSanitizer.Clean(input));
    }

    /// <summary>
    /// Tên đăng nhập phải được trim và chuyển về chữ thường để so khớp ổn định.
    /// </summary>
    [Fact]
    public void NormalizeUsername_TrimsAndLowercases()
    {
        Assert.Equal("admin", InputSanitizer.NormalizeUsername("  Admin "));
        Assert.Equal(string.Empty, InputSanitizer.NormalizeUsername(null));
    }

    /// <summary>
    /// Các địa chỉ thư điện tử hợp lệ phải được chấp nhận.
    /// </summary>
    [Theory]
    [InlineData("docgia@example.com")]
    [InlineData("bien.tap+viet@example.org")]
    [InlineData("  user@example.vn  ")]
    public void IsValidEmail_AcceptsWellFormedAddresses(string email)
    {
        Assert.True(InputSanitizer.IsValidEmail(email));
    }

    /// <summary>
    /// Các địa chỉ sai định dạng hoặc vượt giới hạn phải bị từ chối.
    /// </summary>
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("khong-co-a-cong")]
    [InlineData("a@b")]
    [InlineData("a b@example.com")]
    [InlineData("a..b@example.com")]
    [InlineData("a@example.c")]
    public void IsValidEmail_RejectsMalformedAddresses(string? email)
    {
        Assert.False(InputSanitizer.IsValidEmail(email));
    }

    /// <summary>
    /// Địa chỉ dài hơn 254 ký tự phải bị từ chối theo giới hạn của chuẩn thư điện tử.
    /// </summary>
    [Fact]
    public void IsValidEmail_RejectsAddressesLongerThanLimit()
    {
        var email = new string('a', 250) + "@example.com";

        Assert.False(InputSanitizer.IsValidEmail(email));
    }
}
