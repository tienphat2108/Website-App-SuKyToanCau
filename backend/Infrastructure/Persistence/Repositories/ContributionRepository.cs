using Microsoft.EntityFrameworkCore;
using WorldHistory.Core.Entities;
using WorldHistory.Core.Enums;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Infrastructure.Persistence.Repositories;

/// <summary>
/// Triển khai truy cập dữ liệu đóng góp của độc giả.
/// </summary>
public sealed class ContributionRepository : IContributionRepository
{
    private readonly WorldHistoryDbContext _dbContext;

    /// <summary>
    /// Khởi tạo kho dữ liệu đóng góp.
    /// </summary>
    /// <param name="dbContext">Ngữ cảnh cơ sở dữ liệu.</param>
    public ContributionRepository(WorldHistoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Thêm một đóng góp mới.
    /// </summary>
    /// <param name="contribution">Đóng góp đã được kiểm tra.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    public async Task AddAsync(Contribution contribution, CancellationToken cancellationToken = default)
    {
        await _dbContext.Contributions.AddAsync(contribution, cancellationToken);
    }

    /// <summary>
    /// Lấy danh sách đóng góp theo trạng thái, có phân trang.
    /// </summary>
    /// <param name="status">Trạng thái cần lọc; null để lấy tất cả.</param>
    /// <param name="page">Trang hiện tại.</param>
    /// <param name="pageSize">Số bản ghi mỗi trang.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Danh sách đóng góp và tổng số bản ghi.</returns>
    public async Task<(IReadOnlyList<Contribution> Items, int Total)> ListAsync(
        ContributionStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Contributions.AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(item => item.Status == status.Value);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(item => item.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArrayAsync(cancellationToken);

        return (items, total);
    }

    /// <summary>
    /// Tìm một đóng góp theo khóa chính.
    /// </summary>
    /// <param name="id">Khóa chính.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đóng góp hoặc null nếu không tồn tại.</returns>
    public Task<Contribution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _dbContext.Contributions.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
}

/// <summary>
/// Triển khai truy cập tài khoản quản trị.
/// </summary>
public sealed class AdminUserRepository : IAdminUserRepository
{
    private readonly WorldHistoryDbContext _dbContext;

    /// <summary>
    /// Khởi tạo kho dữ liệu tài khoản quản trị.
    /// </summary>
    /// <param name="dbContext">Ngữ cảnh cơ sở dữ liệu.</param>
    public AdminUserRepository(WorldHistoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Tìm tài khoản theo tên đăng nhập đã chuẩn hóa.
    /// </summary>
    /// <param name="username">Tên đăng nhập chữ thường.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Tài khoản hoặc null nếu không tồn tại.</returns>
    public Task<AdminUser?> GetByUsernameAsync(
        string username,
        CancellationToken cancellationToken = default) =>
        _dbContext.AdminUsers
            .FirstOrDefaultAsync(item => item.Username == username, cancellationToken);

    /// <summary>
    /// Kiểm tra một tên đăng nhập đã tồn tại hay chưa.
    /// </summary>
    /// <param name="username">Tên đăng nhập chữ thường.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Đúng nếu tài khoản đã tồn tại.</returns>
    public Task<bool> ExistsAsync(string username, CancellationToken cancellationToken = default) =>
        _dbContext.AdminUsers.AnyAsync(item => item.Username == username, cancellationToken);

    /// <summary>
    /// Thêm tài khoản quản trị mới.
    /// </summary>
    /// <param name="adminUser">Tài khoản cần thêm.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    public async Task AddAsync(AdminUser adminUser, CancellationToken cancellationToken = default)
    {
        await _dbContext.AdminUsers.AddAsync(adminUser, cancellationToken);
    }
}

/// <summary>
/// Triển khai đơn vị công việc trên EF Core.
/// </summary>
public sealed class UnitOfWork : IUnitOfWork
{
    private readonly WorldHistoryDbContext _dbContext;

    /// <summary>
    /// Khởi tạo đơn vị công việc.
    /// </summary>
    /// <param name="dbContext">Ngữ cảnh cơ sở dữ liệu.</param>
    public UnitOfWork(WorldHistoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Lưu mọi thay đổi đang theo dõi xuống cơ sở dữ liệu.
    /// </summary>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Số bản ghi bị ảnh hưởng.</returns>
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
