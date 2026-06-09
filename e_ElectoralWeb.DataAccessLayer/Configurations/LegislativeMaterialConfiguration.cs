using e_ElectoralWeb.Domain.Entities.LegislativeMaterial;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class LegislativeMaterialConfiguration : IEntityTypeConfiguration<LegislativeMaterialData>
{
    public void Configure(EntityTypeBuilder<LegislativeMaterialData> builder)
    {
        builder.ToTable("LegislativeMaterials");

        builder.HasKey(material => material.Id);

        builder.Property(material => material.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(material => material.Description)
            .HasMaxLength(3000)
            .IsRequired();

        builder.Property(material => material.Category)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(material => material.SourceUrl)
            .HasMaxLength(500);

        builder.Property(material => material.IsPublished)
            .HasDefaultValue(true);

        builder.HasIndex(material => new { material.IsPublished, material.SortOrder });
    }
}
