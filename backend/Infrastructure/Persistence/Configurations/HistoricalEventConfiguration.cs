using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorldHistory.Core.Entities;

namespace WorldHistory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Cấu hình ánh xạ thực thể sự kiện lịch sử sang bảng cơ sở dữ liệu.
/// Tên bảng và tên cột dùng chữ thường có gạch dưới để thống nhất giữa các hệ quản trị.
/// </summary>
public sealed class HistoricalEventConfiguration : IEntityTypeConfiguration<HistoricalEvent>
{
    /// <summary>
    /// Thiết lập khóa, độ dài, chỉ mục và bộ chuyển đổi cho các trường danh sách.
    /// </summary>
    /// <param name="builder">Bộ dựng cấu hình thực thể.</param>
    public void Configure(EntityTypeBuilder<HistoricalEvent> builder)
    {
        builder.ToTable("historical_events");
        builder.HasKey(item => item.Slug);

        builder.Property(item => item.Slug)
            .HasColumnName("slug")
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(item => item.Era)
            .HasColumnName("era")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(item => item.Country)
            .HasColumnName("country")
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(item => item.CountryEn)
            .HasColumnName("country_en")
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(item => item.StartYear).HasColumnName("start_year");
        builder.Property(item => item.EndYear).HasColumnName("end_year");

        builder.Property(item => item.DateLabelVi)
            .HasColumnName("date_label_vi")
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(item => item.DateLabelEn)
            .HasColumnName("date_label_en")
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(item => item.TitleVi)
            .HasColumnName("title_vi")
            .HasMaxLength(220)
            .IsRequired();

        builder.Property(item => item.TitleEn)
            .HasColumnName("title_en")
            .HasMaxLength(220)
            .IsRequired();

        builder.Property(item => item.SummaryVi)
            .HasColumnName("summary_vi")
            .HasMaxLength(700)
            .IsRequired();

        builder.Property(item => item.SummaryEn)
            .HasColumnName("summary_en")
            .HasMaxLength(700)
            .IsRequired();

        builder.Property(item => item.ContentVi)
            .HasColumnName("content_vi")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(item => item.ContentEn)
            .HasColumnName("content_en")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(item => item.LocationVi)
            .HasColumnName("location_vi")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(item => item.LocationEn)
            .HasColumnName("location_en")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(item => item.Latitude).HasColumnName("latitude");
        builder.Property(item => item.Longitude).HasColumnName("longitude");

        builder.Property(item => item.ImagePath)
            .HasColumnName("image_path")
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(item => item.ImageAltVi)
            .HasColumnName("image_alt_vi")
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(item => item.ImageAltEn)
            .HasColumnName("image_alt_en")
            .HasMaxLength(300)
            .IsRequired();

        var (converter, comparer) = WorldHistoryDbContext.CreateStringListConversion();

        builder.Property(item => item.TagsVi)
            .HasColumnName("tags_vi")
            .HasColumnType("text")
            .HasConversion(converter)
            .Metadata.SetValueComparer(comparer);

        builder.Property(item => item.TagsEn)
            .HasColumnName("tags_en")
            .HasColumnType("text")
            .HasConversion(converter)
            .Metadata.SetValueComparer(comparer);

        builder.Property(item => item.RelatedSlugs)
            .HasColumnName("related_slugs")
            .HasColumnType("text")
            .HasConversion(converter)
            .Metadata.SetValueComparer(comparer);

        var (sourceConverter, sourceComparer) = WorldHistoryDbContext.CreateEventSourceListConversion();

        builder.Property(item => item.Sources)
            .HasColumnName("sources")
            .HasColumnType("text")
            .HasConversion(sourceConverter)
            .Metadata.SetValueComparer(sourceComparer);

        builder.Property(item => item.WikiTitle)
            .HasColumnName("wiki_title")
            .HasMaxLength(200);

        builder.Property(item => item.Featured).HasColumnName("featured");

        builder.Property(item => item.CreatedAt).HasColumnName("created_at");
        builder.Property(item => item.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(item => item.Era).HasDatabaseName("ix_historical_events_era");
        builder.HasIndex(item => item.Country).HasDatabaseName("ix_historical_events_country");
        builder.HasIndex(item => item.StartYear).HasDatabaseName("ix_historical_events_start_year");
        builder.HasIndex(item => item.Featured).HasDatabaseName("ix_historical_events_featured");
    }
}
