using e_ElectoralWeb.Domain.Entities.Appointment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace e_ElectoralWeb.DataAccessLayer.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<AppointmentData>
{
    public void Configure(EntityTypeBuilder<AppointmentData> builder)
    {
        builder.ToTable("Appointments");

        builder.HasKey(a => a.Id);

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
