using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorldHistory.Core.Entities;

namespace WorldHistory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Cấu hình ánh xạ thực thể đóng góp sang bảng cơ sở dữ liệu.
/// </summary>
public sealed class ContributionConfiguration : IEntityTypeConfiguration<Contribution>
{
    /// <summary>
    /// Thiết lập khóa, độ dài và chỉ mục tra cứu cho đóng góp.
    /// </summary>
    /// <param name="builder">Bộ dựng cấu hình thực thể.</param>
    public void Configure(EntityTypeBuilder<Contribution> builder)
    {
        builder.ToTable("contributions");
        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.FullName)
            .HasColumnName("full_name")
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(item => item.EmailProtected)
            .HasColumnName("email_protected")
            .HasMaxLength(1500)
            .IsRequired();

        builder.Property(item => item.Message)
            .HasColumnName("message")
            .HasMaxLength(5000)
            .IsRequired();

        builder.Property(item => item.EventSuggestion)
            .HasColumnName("event_suggestion")
            .HasMaxLength(200);

        builder.Property(item => item.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(item => item.IpHash)
            .HasColumnName("ip_hash")
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(item => item.ReviewedAt).HasColumnName("reviewed_at");
        builder.Property(item => item.ReviewedBy)
            .HasColumnName("reviewed_by")
            .HasMaxLength(80);

        builder.Property(item => item.CreatedAt).HasColumnName("created_at");
        builder.Property(item => item.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(item => item.Status).HasDatabaseName("ix_contributions_status");
        builder.HasIndex(item => item.CreatedAt).HasDatabaseName("ix_contributions_created_at");
    }
}
