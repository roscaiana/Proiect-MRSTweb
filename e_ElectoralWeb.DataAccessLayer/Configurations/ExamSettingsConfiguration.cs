using e_ElectoralWeb.Domain.Entities.ExamSettings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class ExamSettingsConfiguration : IEntityTypeConfiguration<ExamSettingsData>
{
    public void Configure(EntityTypeBuilder<ExamSettingsData> builder)
    {
        builder.ToTable("ExamSettings");
        builder.HasKey(e => e.Id);
    }
}
