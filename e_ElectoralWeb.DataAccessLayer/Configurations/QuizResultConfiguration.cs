using e_ElectoralWeb.Domain.Entities.QuizResult;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class QuizResultConfiguration : IEntityTypeConfiguration<QuizResultData>
{
    public void Configure(EntityTypeBuilder<QuizResultData> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Mode)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasOne(r => r.Quiz)
            .WithMany(q => q.QuizResults)
            .HasForeignKey(r => r.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.User)
            .WithMany(u => u.QuizResults)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
