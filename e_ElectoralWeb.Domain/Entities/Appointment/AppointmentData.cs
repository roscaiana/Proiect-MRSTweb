using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using e_ElectoralWeb.Domain.Entities.User;

namespace e_ElectoralWeb.Domain.Entities.Appointment;

public class AppointmentData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string IdOrPhone { get; set; } = string.Empty;

    [StringLength(254)]
    public string UserEmail { get; set; } = string.Empty;

    public int? UserId { get; set; }
    public UserData? User { get; set; }

    public DateTime Date { get; set; }

    [StringLength(10)]
    public string SlotStart { get; set; } = string.Empty;

    [StringLength(10)]
    public string SlotEnd { get; set; } = string.Empty;

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

    [StringLength(500)]
    public string? StatusReason { get; set; }

    [StringLength(500)]
    public string? AdminNote { get; set; }

    [StringLength(10)]
    public string? CancelledBy { get; set; }

    public int RescheduleCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
