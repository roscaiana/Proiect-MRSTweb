using e_ElectoralWeb.Domain.Entities.AnswerOption;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class AnswerOptionConfiguration : IEntityTypeConfiguration<AnswerOptionData>
{
    public void Configure(EntityTypeBuilder<AnswerOptionData> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Text)
            .IsRequired()
            .HasMaxLength(400);

        builder.Property(a => a.IsCorrect)
            .IsRequired();

        builder.HasOne(a => a.Question)
            .WithMany(q => q.AnswerOptions)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
