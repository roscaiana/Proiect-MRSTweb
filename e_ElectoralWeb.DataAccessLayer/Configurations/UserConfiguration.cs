using e_ElectoralWeb.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<UserData>
{
    public void Configure(EntityTypeBuilder<UserData> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.FirstName)
            .HasMaxLength(30);

        builder.Property(u => u.LastName)
            .HasMaxLength(30);

        builder.Property(u => u.UserName)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(30);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.Password)
            .IsRequired()
            .HasMaxLength(48);

        builder.Property(u => u.Phone)
            .HasMaxLength(12);

        builder.Property(u => u.Role)
            .IsRequired();

        builder.Property(u => u.RegisteredOn)
            .IsRequired();

        builder.HasMany(u => u.QuizResults)
            .WithOne(r => r.User)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
