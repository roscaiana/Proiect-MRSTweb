using e_ElectoralWeb.Domain.Entities.QuizSession;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class QuizSessionConfiguration : IEntityTypeConfiguration<QuizSessionData>
{
    public void Configure(EntityTypeBuilder<QuizSessionData> builder)
    {
        builder.ToTable("QuizSessions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Mode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.QuestionIdsJson)
            .IsRequired();

        builder.HasOne(s => s.Quiz)
            .WithMany()
            .HasForeignKey(s => s.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => s.ExpiresAt);
        builder.HasIndex(s => new { s.UserId, s.StartedAt });
    }
}
