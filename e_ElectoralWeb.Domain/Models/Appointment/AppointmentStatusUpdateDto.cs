namespace e_ElectoralWeb.Domain.Models.Appointment;

public class AppointmentStatusUpdateDto
{
    public string Status { get; set; } = string.Empty;
    public string? StatusReason { get; set; }
    public string? AdminNote { get; set; }
    public string? CancelledBy { get; set; }
}
