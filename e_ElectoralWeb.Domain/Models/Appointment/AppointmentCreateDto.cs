namespace e_ElectoralWeb.Domain.Models.Appointment;

public class AppointmentCreateDto
{
    public string FullName { get; set; } = string.Empty;
    public string IdOrPhone { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public DateTime Date { get; set; }
    public string SlotStart { get; set; } = string.Empty;
    public string SlotEnd { get; set; } = string.Empty;
}
