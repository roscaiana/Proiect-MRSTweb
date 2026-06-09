using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Appointment;
using e_ElectoralWeb.Domain.Models.Appointment;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class AppointmentActions
{
    private readonly QuizDbContext _context;

    protected AppointmentActions(QuizDbContext context)
    {
        _context = context;
    }

    protected async Task<ActionResponce> CreateAppointmentExecutionAsync(AppointmentCreateDto data)
    {
        if (string.IsNullOrWhiteSpace(data.FullName))
            return new ActionResponce { IsSuccess = false, Message = "FullName is required." };
        if (string.IsNullOrWhiteSpace(data.IdOrPhone))
            return new ActionResponce { IsSuccess = false, Message = "IdOrPhone is required." };
        if (string.IsNullOrWhiteSpace(data.SlotStart))
            return new ActionResponce { IsSuccess = false, Message = "SlotStart is required." };
        if (string.IsNullOrWhiteSpace(data.SlotEnd))
            return new ActionResponce { IsSuccess = false, Message = "SlotEnd is required." };

        var context = _context;

        var entity = new AppointmentData
        {
            FullName = data.FullName,
            IdOrPhone = data.IdOrPhone,
            UserEmail = data.UserEmail ?? string.Empty,
            UserId = data.UserId,
            Date = data.Date,
            SlotStart = data.SlotStart,
            SlotEnd = data.SlotEnd,
            Status = AppointmentStatus.Pending,
            RescheduleCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        context.Appointments.Add(entity);
        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Programare creată.", Data = entity.Id };
    }

    protected async Task<List<AppointmentDto>> GetAllAppointmentsExecutionAsync()
    {
        var context = _context;
        return await context.Appointments
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => MapToDto(a))
            .ToListAsync();
    }

    protected async Task<List<AppointmentDto>> GetAppointmentsByUserExecutionAsync(int userId)
    {
        var context = _context;
        return await context.Appointments
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => MapToDto(a))
            .ToListAsync();
    }

    protected async Task<AppointmentDto?> GetAppointmentByIdExecutionAsync(int id)
    {
        var context = _context;
        var entity = await context.Appointments.FirstOrDefaultAsync(a => a.Id == id);
        if (entity == null) return null;
        return MapToDto(entity);
    }

    protected async Task<ActionResponce> UpdateAppointmentStatusExecutionAsync(int id, AppointmentStatusUpdateDto data)
    {
        if (string.IsNullOrWhiteSpace(data.Status))
            return new ActionResponce { IsSuccess = false, Message = "Status is required." };

        if (!Enum.TryParse<AppointmentStatus>(data.Status, ignoreCase: true, out var parsedStatus))
            return new ActionResponce { IsSuccess = false, Message = $"Invalid status value: {data.Status}." };

        var context = _context;

        var entity = await context.Appointments.FirstOrDefaultAsync(a => a.Id == id);
        if (entity == null)
            return new ActionResponce { IsSuccess = false, Message = "Programarea nu a fost găsită." };

        entity.Status = parsedStatus;
        entity.StatusReason = data.StatusReason;
        entity.AdminNote = data.AdminNote;
        entity.CancelledBy = data.CancelledBy;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Status actualizat." };
    }

    protected async Task<ActionResponce> UpdateAppointmentExecutionAsync(int id, AppointmentDto data)
    {
        var context = _context;

        var entity = await context.Appointments.FirstOrDefaultAsync(a => a.Id == id);
        if (entity == null)
            return new ActionResponce { IsSuccess = false, Message = "Programarea nu a fost găsită." };

        entity.FullName = data.FullName;
        entity.IdOrPhone = data.IdOrPhone;
        entity.UserEmail = data.UserEmail;
        entity.Date = data.Date;
        entity.SlotStart = data.SlotStart;
        entity.SlotEnd = data.SlotEnd;
        entity.StatusReason = data.StatusReason;
        entity.AdminNote = data.AdminNote;
        entity.CancelledBy = data.CancelledBy;
        entity.RescheduleCount = data.RescheduleCount;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Programare actualizată." };
    }

    private static AppointmentDto MapToDto(AppointmentData a) => new AppointmentDto
    {
        Id = a.Id,
        FullName = a.FullName,
        IdOrPhone = a.IdOrPhone,
        UserEmail = a.UserEmail,
        UserId = a.UserId,
        Date = a.Date,
        SlotStart = a.SlotStart,
        SlotEnd = a.SlotEnd,
        Status = a.Status.ToString().ToLowerInvariant(),
        StatusReason = a.StatusReason,
        AdminNote = a.AdminNote,
        CancelledBy = a.CancelledBy,
        RescheduleCount = a.RescheduleCount,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };
}
