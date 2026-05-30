namespace e_ElectoralWeb.Domain.Models.ExamSettings;

public class BlockedDateDto
{
    public string Date { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class CapacityOverrideDto
{
    public string Date { get; set; } = string.Empty;
    public int AppointmentsPerDay { get; set; }
}

public class SlotDto
{
    public string Id { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public bool Available { get; set; } = true;
}

public class SlotOverrideDto
{
    public string Date { get; set; } = string.Empty;
    public List<SlotDto> Slots { get; set; } = [];
}

public class ExamSettingsDto
{
    public int TestQuestionCount { get; set; } = 30;
    public int TestDurationMinutes { get; set; } = 30;
    public int PassingThreshold { get; set; } = 70;
    public int AppointmentsPerDay { get; set; } = 30;
    public int AppointmentLeadTimeHours { get; set; } = 24;
    public int MaxReschedulesPerUser { get; set; } = 2;
    public int RejectionCooldownDays { get; set; } = 2;
    public string AppointmentLocation { get; set; } = string.Empty;
    public string AppointmentRoom { get; set; } = string.Empty;
    public List<int> AllowedWeekdays { get; set; } = [];
    public List<BlockedDateDto> BlockedDates { get; set; } = [];
    public List<CapacityOverrideDto> CapacityOverrides { get; set; } = [];
    public List<SlotOverrideDto> SlotOverrides { get; set; } = [];
}
