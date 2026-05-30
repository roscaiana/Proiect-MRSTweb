using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace e_ElectoralWeb.Domain.Entities.ExamSettings;

public class ExamSettingsData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int TestQuestionCount { get; set; } = 30;
    public int TestDurationMinutes { get; set; } = 30;
    public int PassingThreshold { get; set; } = 70;
    public int AppointmentsPerDay { get; set; } = 30;
    public int AppointmentLeadTimeHours { get; set; } = 24;
    public int MaxReschedulesPerUser { get; set; } = 2;
    public int RejectionCooldownDays { get; set; } = 2;

    [Required]
    [StringLength(500)]
    public string AppointmentLocation { get; set; } = "Centrul de Instruire Continua";

    [Required]
    [StringLength(200)]
    public string AppointmentRoom { get; set; } = "Sala A-12";

    // JSON-serialised list columns
    [Column(TypeName = "nvarchar(max)")]
    public string AllowedWeekdays { get; set; } = "[1,3,5]";

    [Column(TypeName = "nvarchar(max)")]
    public string BlockedDates { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string CapacityOverrides { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string SlotOverrides { get; set; } = "[]";
}
