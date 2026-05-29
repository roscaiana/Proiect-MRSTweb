using e_ElectoralWeb.Domain.Models.Appointment;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IAppointmentAction
{
    Task<ActionResponce> CreateAppointmentAsync(AppointmentCreateDto data);
    Task<List<AppointmentDto>> GetAllAppointmentsAsync();
    Task<List<AppointmentDto>> GetAppointmentsByUserAsync(int userId);
    Task<AppointmentDto?> GetAppointmentByIdAsync(int id);
    Task<ActionResponce> UpdateAppointmentStatusAsync(int id, AppointmentStatusUpdateDto data);
    Task<ActionResponce> UpdateAppointmentAsync(int id, AppointmentDto data);
}
