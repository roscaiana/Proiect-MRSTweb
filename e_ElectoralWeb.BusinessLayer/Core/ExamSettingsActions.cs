using System.Text.Json;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.ExamSettings;
using e_ElectoralWeb.Domain.Models.ExamSettings;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class ExamSettingsActions
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly QuizDbContext _context;

    protected ExamSettingsActions(QuizDbContext context)
    {
        _context = context;
    }

    protected async Task<ExamSettingsDto> GetActionExecutionAsync()
    {
        var context = _context;
        var entity = await context.ExamSettings.FirstOrDefaultAsync();
        if (entity == null)
            return BuildDefault();
        return MapToDto(entity);
    }

    protected async Task<ActionResponce> UpdateActionExecutionAsync(ExamSettingsDto dto)
    {
        var context = _context;
        var entity = await context.ExamSettings.FirstOrDefaultAsync();
        if (entity == null)
        {
            entity = new ExamSettingsData();
            context.ExamSettings.Add(entity);
        }

        entity.TestQuestionCount = dto.TestQuestionCount > 0 ? dto.TestQuestionCount : 30;
        entity.TestDurationMinutes = dto.TestDurationMinutes > 0 ? dto.TestDurationMinutes : 30;
        entity.PassingThreshold = dto.PassingThreshold is > 0 and <= 100 ? dto.PassingThreshold : 70;
        entity.AppointmentsPerDay = dto.AppointmentsPerDay > 0 ? dto.AppointmentsPerDay : 30;
        entity.AppointmentLeadTimeHours = dto.AppointmentLeadTimeHours >= 0 ? dto.AppointmentLeadTimeHours : 24;
        entity.MaxReschedulesPerUser = dto.MaxReschedulesPerUser >= 0 ? dto.MaxReschedulesPerUser : 2;
        entity.RejectionCooldownDays = dto.RejectionCooldownDays >= 0 ? dto.RejectionCooldownDays : 2;
        entity.AppointmentLocation = string.IsNullOrWhiteSpace(dto.AppointmentLocation)
            ? "Centrul de Instruire Continua"
            : dto.AppointmentLocation.Trim();
        entity.AppointmentRoom = string.IsNullOrWhiteSpace(dto.AppointmentRoom)
            ? "Sala A-12"
            : dto.AppointmentRoom.Trim();

        entity.AllowedWeekdays = JsonSerializer.Serialize(dto.AllowedWeekdays ?? [], JsonOpts);
        entity.BlockedDates = JsonSerializer.Serialize(dto.BlockedDates ?? [], JsonOpts);
        entity.CapacityOverrides = JsonSerializer.Serialize(dto.CapacityOverrides ?? [], JsonOpts);
        entity.SlotOverrides = JsonSerializer.Serialize(dto.SlotOverrides ?? [], JsonOpts);

        await context.SaveChangesAsync();
        return new ActionResponce { IsSuccess = true, Message = "Exam settings updated." };
    }

    private static ExamSettingsDto MapToDto(ExamSettingsData entity)
    {
        return new ExamSettingsDto
        {
            TestQuestionCount = entity.TestQuestionCount,
            TestDurationMinutes = entity.TestDurationMinutes,
            PassingThreshold = entity.PassingThreshold,
            AppointmentsPerDay = entity.AppointmentsPerDay,
            AppointmentLeadTimeHours = entity.AppointmentLeadTimeHours,
            MaxReschedulesPerUser = entity.MaxReschedulesPerUser,
            RejectionCooldownDays = entity.RejectionCooldownDays,
            AppointmentLocation = entity.AppointmentLocation,
            AppointmentRoom = entity.AppointmentRoom,
            AllowedWeekdays = Deserialize<List<int>>(entity.AllowedWeekdays) ?? [1, 3, 5],
            BlockedDates = Deserialize<List<BlockedDateDto>>(entity.BlockedDates) ?? [],
            CapacityOverrides = Deserialize<List<CapacityOverrideDto>>(entity.CapacityOverrides) ?? [],
            SlotOverrides = Deserialize<List<SlotOverrideDto>>(entity.SlotOverrides) ?? [],
        };
    }

    private static ExamSettingsDto BuildDefault() => new()
    {
        TestQuestionCount = 30,
        TestDurationMinutes = 30,
        PassingThreshold = 70,
        AppointmentsPerDay = 30,
        AppointmentLeadTimeHours = 24,
        MaxReschedulesPerUser = 2,
        RejectionCooldownDays = 2,
        AppointmentLocation = "Centrul de Instruire Continua",
        AppointmentRoom = "Sala A-12",
        AllowedWeekdays = [1, 3, 5],
        BlockedDates = [],
        CapacityOverrides = [],
        SlotOverrides = [],
    };

    private static T? Deserialize<T>(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return default;
        try { return JsonSerializer.Deserialize<T>(json, JsonOpts); }
        catch { return default; }
    }
}
