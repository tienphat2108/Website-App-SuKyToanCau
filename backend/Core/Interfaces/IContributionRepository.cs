using WorldHistory.Core.Entities;
using WorldHistory.Core.Enums;

namespace WorldHistory.Core.Interfaces;

/// <summary>
/// Hợp đồng truy cập dữ liệu đóng góp của độc giả.
/// </summary>
public interface IContributionRepository
{
    /// <summary>
    /// Thêm một đóng góp mới vào kho dữ liệu.
    /// </summary>
    /// <param name="contribution">Đóng góp đã được kiểm tra và làm sạch.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    Task AddAsync(Contribution contribution, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách đóng góp theo trạng thái, có phân trang.
    /// </summary>
    /// <param name="status">Trạng thái cần lọc; null để lấy tất cả.</param>
    /// <param name="page">Trang hiện tại, bắt đầu từ một.</param>
    /// <param name="pageSize">Số bản ghi mỗi trang.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách đóng góp và tổng số bản ghi.</returns>
    Task<(IReadOnlyList<Contribution> Items, int Total)> ListAsync(
        ContributionStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tìm một đóng góp theo khóa chính.
    /// </summary>
    /// <param name="id">Khóa chính.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đóng góp hoặc null nếu không tồn tại.</returns>
    Task<Contribution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

/// <summary>
/// Hợp đồng truy cập tài khoản quản trị.
/// </summary>
public interface IAdminUserRepository
{
    /// <summary>
    /// Tìm tài khoản theo tên đăng nhập đã chuẩn hóa.
    /// </summary>
    /// <param name="username">Tên đăng nhập chữ thường.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Tài khoản hoặc null nếu không tồn tại.</returns>
    Task<AdminUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);

    /// <summary>
    /// Kiểm tra một tên đăng nhập đã tồn tại hay chưa.
    /// </summary>
    /// <param name="username">Tên đăng nhập chữ thường.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đúng nếu tài khoản đã tồn tại.</returns>
    Task<bool> ExistsAsync(string username, CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm tài khoản quản trị mới.
    /// </summary>
    /// <param name="adminUser">Tài khoản cần thêm.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    Task AddAsync(AdminUser adminUser, CancellationToken cancellationToken = default);
}

/// <summary>
/// Đơn vị công việc dùng để xác nhận toàn bộ thay đổi trong một giao dịch.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Lưu mọi thay đổi đang theo dõi xuống kho dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số bản ghi bị ảnh hưởng.</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Ngữ cảnh bảo mật của yêu cầu hiện tại.
/// Tầng hạ tầng dùng giá trị này để thiết lập biến phiên phục vụ chính sách bảo mật cấp dòng.
/// </summary>
public interface ISecurityContextAccessor
{
    /// <summary>Cho biết yêu cầu hiện tại đã được xác thực với vai trò quản trị hay chưa.</summary>
    bool IsAdmin { get; set; }
}
