using e_ElectoralWeb.Domain.Entities.SupportQuestion;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class SupportQuestionConfiguration : IEntityTypeConfiguration<SupportQuestionData>
{
    public void Configure(EntityTypeBuilder<SupportQuestionData> builder)
    {
        builder.ToTable("SupportQuestions");

        builder.HasKey(question => question.Id);

        builder.Property(question => question.Category)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(question => question.Question)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(question => question.Answer)
            .HasMaxLength(3000)
            .IsRequired();

        builder.Property(question => question.IsPublished)
            .HasDefaultValue(true);

        builder.HasIndex(question => new { question.Category, question.SortOrder });
    }
}
