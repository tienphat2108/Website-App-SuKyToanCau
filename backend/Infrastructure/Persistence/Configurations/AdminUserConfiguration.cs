using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorldHistory.Core.Entities;

namespace WorldHistory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Cấu hình ánh xạ thực thể tài khoản quản trị sang bảng cơ sở dữ liệu.
/// </summary>
public sealed class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    /// <summary>
    /// Thiết lập khóa, chỉ mục duy nhất cho tên đăng nhập và độ dài chuỗi băm.
    /// </summary>
    /// <param name="builder">Bộ dựng cấu hình thực thể.</param>
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.ToTable("admin_users");
        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.Username)
            .HasColumnName("username")
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(item => item.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(item => item.Role)
            .HasColumnName("role")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(item => item.FailedLoginCount).HasColumnName("failed_login_count");
        builder.Property(item => item.LockoutEndUtc).HasColumnName("lockout_end_utc");
        builder.Property(item => item.LastLoginAt).HasColumnName("last_login_at");
        builder.Property(item => item.CreatedAt).HasColumnName("created_at");
        builder.Property(item => item.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(item => item.Username)
            .IsUnique()
            .HasDatabaseName("ux_admin_users_username");
    }
}
