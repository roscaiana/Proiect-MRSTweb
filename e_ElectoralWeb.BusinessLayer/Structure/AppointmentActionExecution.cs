using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Appointment;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class AppointmentActionExecution : AppointmentActions, IAppointmentAction
{
    public Task<ActionResponce> CreateAppointmentAsync(AppointmentCreateDto data)
        => CreateAppointmentExecutionAsync(data);

    public Task<List<AppointmentDto>> GetAllAppointmentsAsync()
        => GetAllAppointmentsExecutionAsync();

    public Task<List<AppointmentDto>> GetAppointmentsByUserAsync(int userId)
        => GetAppointmentsByUserExecutionAsync(userId);

    public Task<AppointmentDto?> GetAppointmentByIdAsync(int id)
        => GetAppointmentByIdExecutionAsync(id);

    public Task<ActionResponce> UpdateAppointmentStatusAsync(int id, AppointmentStatusUpdateDto data)
        => UpdateAppointmentStatusExecutionAsync(id, data);

    public Task<ActionResponce> UpdateAppointmentAsync(int id, AppointmentDto data)
        => UpdateAppointmentExecutionAsync(id, data);
}
