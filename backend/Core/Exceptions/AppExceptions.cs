namespace WorldHistory.Core.Exceptions;

/// <summary>
/// Lớp cơ sở cho các lỗi nghiệp vụ đã được nhận diện.
/// Tầng trình diễn dựa vào kiểu lỗi để trả về mã trạng thái phù hợp, không làm lộ chi tiết hệ thống.
/// </summary>
public abstract class AppException : Exception
{
    /// <summary>
    /// Khởi tạo lỗi nghiệp vụ với thông điệp an toàn cho người dùng.
    /// </summary>
    /// <param name="message">Thông điệp mô tả lỗi.</param>
    protected AppException(string message) : base(message)
    {
    }
}

/// <summary>
/// Lỗi khi không tìm thấy tài nguyên được yêu cầu.
/// </summary>
public sealed class NotFoundException : AppException
{
    /// <summary>
    /// Khởi tạo lỗi không tìm thấy.
    /// </summary>
    /// <param name="message">Thông điệp an toàn cho người dùng.</param>
    public NotFoundException(string message) : base(message)
    {
    }
}

/// <summary>
/// Lỗi khi dữ liệu đầu vào không đạt quy tắc kiểm tra.
/// Chứa danh sách lỗi theo từng trường để giao diện hiển thị chính xác.
/// </summary>
public sealed class ValidationException : AppException
{
    /// <summary>
    /// Khởi tạo lỗi kiểm tra dữ liệu.
    /// </summary>
    /// <param name="errors">Từ điển ánh xạ tên trường sang các thông điệp lỗi.</param>
    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("Dữ liệu gửi lên chưa hợp lệ.")
    {
        Errors = errors;
    }

    /// <summary>Danh sách lỗi theo tên trường.</summary>
    public IReadOnlyDictionary<string, string[]> Errors { get; }
}

/// <summary>
/// Lỗi xác thực khi thông tin đăng nhập không đúng hoặc phiên đã hết hạn.
/// </summary>
public sealed class UnauthorizedException : AppException
{
    /// <summary>
    /// Khởi tạo lỗi xác thực.
    /// </summary>
    /// <param name="message">Thông điệp chung, không tiết lộ tài khoản có tồn tại hay không.</param>
    public UnauthorizedException(string message) : base(message)
    {
    }
}

/// <summary>
/// Lỗi xung đột trạng thái, ví dụ tài khoản đang bị khóa tạm thời.
/// </summary>
public sealed class ConflictException : AppException
{
    /// <summary>
    /// Khởi tạo lỗi xung đột trạng thái.
    /// </summary>
    /// <param name="message">Thông điệp an toàn cho người dùng.</param>
    public ConflictException(string message) : base(message)
    {
    }
}
