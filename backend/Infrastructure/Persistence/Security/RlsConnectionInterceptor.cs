using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;
using WorldHistory.Core.Interfaces;

namespace WorldHistory.Infrastructure.Persistence.Security;

/// <summary>
/// Thiết lập biến phiên <c>app.is_admin</c> cho mỗi kết nối Postgres.
/// Chính sách bảo mật cấp dòng dựa vào biến này để cho phép hoặc chặn thao tác ghi.
/// </summary>
public sealed class RlsConnectionInterceptor : DbConnectionInterceptor
{
    private const string SetConfigSql = "SELECT set_config('app.is_admin', @is_admin, false)";

    private readonly ISecurityContextAccessor _securityContext;

    /// <summary>
    /// Khởi tạo bộ chặn kết nối.
    /// </summary>
    /// <param name="securityContext">Ngữ cảnh bảo mật của yêu cầu hiện tại.</param>
    public RlsConnectionInterceptor(ISecurityContextAccessor securityContext)
    {
        _securityContext = securityContext;
    }

    /// <summary>
    /// Thiết lập biến phiên ngay sau khi kết nối được mở.
    /// </summary>
    /// <param name="connection">Kết nối vừa mở.</param>
    /// <param name="eventData">Dữ liệu sự kiện của EF Core.</param>
    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        Apply(connection);
        base.ConnectionOpened(connection, eventData);
    }

    /// <summary>
    /// Thiết lập biến phiên ngay sau khi kết nối được mở bất đồng bộ.
    /// </summary>
    /// <param name="connection">Kết nối vừa mở.</param>
    /// <param name="eventData">Dữ liệu sự kiện của EF Core.</param>
    /// <param name="cancellationToken">Tín hiệu hủy thao tác.</param>
    /// <returns>Tiến trình bất đồng bộ.</returns>
    public override Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        Apply(connection);
        return base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }

    /// <summary>
    /// Gửi giá trị quyền quản trị hiện tại xuống phiên cơ sở dữ liệu.
    /// Npgsql tự đặt lại trạng thái phiên khi trả kết nối về bể, nên không cần xử lý thủ công khi đóng.
    /// </summary>
    /// <param name="connection">Kết nối cần thiết lập.</param>
    private void Apply(DbConnection connection)
    {
        if (connection is not NpgsqlConnection npgsqlConnection || npgsqlConnection.State != System.Data.ConnectionState.Open)
        {
            return;
        }

        using var command = npgsqlConnection.CreateCommand();
        command.CommandText = SetConfigSql;
        command.Parameters.Add(new NpgsqlParameter("is_admin", _securityContext.IsAdmin ? "true" : "false"));
        command.ExecuteNonQuery();
    }
}

/// <summary>
/// Lưu trạng thái quyền quản trị trong phạm vi một yêu cầu.
/// </summary>
public sealed class SecurityContextAccessor : ISecurityContextAccessor
{
    /// <summary>Cho biết yêu cầu hiện tại có quyền quản trị hay không.</summary>
    public bool IsAdmin { get; set; }
}
