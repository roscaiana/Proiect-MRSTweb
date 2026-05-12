using e_ElectoralWeb.Domain.Entities.Quiz;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class QuizConfiguration : IEntityTypeConfiguration<QuizData>
{
    public void Configure(EntityTypeBuilder<QuizData> builder)
    {
        builder.HasKey(q => q.Id);

        builder.Property(q => q.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(q => q.Description)
            .HasMaxLength(400);

        builder.HasMany(q => q.Questions)
            .WithOne(q => q.Quiz)
            .HasForeignKey(q => q.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.QuizResults)
            .WithOne(r => r.Quiz)
            .HasForeignKey(r => r.QuizId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
