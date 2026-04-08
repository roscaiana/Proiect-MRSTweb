export type CalendarDayCell = {
    date: Date;
    dateKey: string;
    inCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isAllowedWeekday: boolean;
    isWithinRange: boolean;
    isLeadTimeMet: boolean;
    isBlocked: boolean;
    isFull: boolean;
    remaining: number;
    capacity: number;
    selectable: boolean;
};

type AppointmentCalendarDayButtonProps = {
    day: CalendarDayCell;
    minDate: Date;
    maxDate: Date;
    leadTimeHours: number;
    onSelect: (dateKey: string) => void;
    getDayName: (date: Date) => string;
    getMonthName: (date: Date) => string;
    formatDate: (date: Date) => string;
};

export default function AppointmentCalendarDayButton({
    day,
    minDate,
    maxDate,
    leadTimeHours,
    onSelect,
    getDayName,
    getMonthName,
    formatDate,
}: AppointmentCalendarDayButtonProps) {
    const occupancyRatio = day.capacity > 0 ? (day.capacity - day.remaining) / day.capacity : 1;
    let statusClass = "status-open";

    if (day.isBlocked) statusClass = "status-blocked";
    else if (day.isFull) statusClass = "status-full";
    else if (!day.isAllowedWeekday || !day.isLeadTimeMet || !day.isWithinRange) statusClass = "status-muted";
    else if (occupancyRatio >= 0.8) statusClass = "status-tight";

    const tooltip = day.isBlocked
        ? "Zi blocată pentru programări."
        : !day.isWithinRange
          ? `Alegeți între ${formatDate(minDate)} și ${formatDate(maxDate)}.`
          : !day.isAllowedWeekday
            ? "Zi neeligibilă pentru programări."
            : !day.isLeadTimeMet
              ? `Este necesar un lead time de ${leadTimeHours} ore.`
              : day.isFull
                ? `Zi complet rezervată (${day.capacity}/${day.capacity}).`
                : `${day.remaining}/${day.capacity} locuri libere.`;

    return (
        <button
            type="button"
            className={`calendar-day-cell ${day.inCurrentMonth ? "" : "outside"} ${day.isToday ? "today" : ""} ${day.isSelected ? "selected" : ""} ${statusClass}`}
            onClick={() => onSelect(day.dateKey)}
            disabled={!day.selectable}
            title={tooltip}
            aria-label={`Selectează ${getDayName(day.date)} ${day.date.getDate()} ${getMonthName(day.date)} ${day.date.getFullYear()}`}
            aria-selected={day.isSelected}
        >
            <span>{day.date.getDate()}</span>
        </button>
    );
}
