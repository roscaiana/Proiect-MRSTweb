namespace e_ElectoralWeb.Domain.Models.Appointment;

public class AppointmentDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string IdOrPhone { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public DateTime Date { get; set; }
    public string SlotStart { get; set; } = string.Empty;
    public string SlotEnd { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? StatusReason { get; set; }
    public string? AdminNote { get; set; }
    public string? CancelledBy { get; set; }
    public int RescheduleCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
