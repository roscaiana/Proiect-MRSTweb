import { WEEK_DAYS } from '../../utils/calendarUtils';
import AppointmentCalendarWeekday from './AppointmentCalendarWeekday';
import AppointmentCalendarDayButton, { type CalendarDayCell } from './AppointmentCalendarDayButton';

type AppointmentCalendarPopoverProps = {
    isOpen: boolean;
    calendarMonth: Date;
    canNavigatePrevMonth: boolean;
    canNavigateNextMonth: boolean;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    calendarDays: CalendarDayCell[];
    minDate: Date;
    maxDate: Date;
    leadTimeHours: number;
    onDaySelect: (dateKey: string) => void;
    getMonthName: (date: Date) => string;
    getDayName: (date: Date) => string;
    formatDate: (date: Date) => string;
};

export default function AppointmentCalendarPopover({
    isOpen,
    calendarMonth,
    canNavigatePrevMonth,
    canNavigateNextMonth,
    onPrevMonth,
    onNextMonth,
    calendarDays,
    minDate,
    maxDate,
    leadTimeHours,
    onDaySelect,
    getMonthName,
    getDayName,
    formatDate,
}: AppointmentCalendarPopoverProps) {
    if (!isOpen) return null;

    return (
        <div className="calendar-popover" id="appointment-calendar-popover" role="dialog" aria-label="Calendar selecție dată">
            <div className="calendar-popover-header">
                <button type="button" className="calendar-nav-btn" onClick={onPrevMonth} disabled={!canNavigatePrevMonth} aria-label="Luna anterioară">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <strong className="calendar-month-label">
                    {getMonthName(calendarMonth)} {calendarMonth.getFullYear()}
                </strong>

                <button type="button" className="calendar-nav-btn" onClick={onNextMonth} disabled={!canNavigateNextMonth} aria-label="Luna următoare">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            <div className="calendar-week-row" aria-hidden="true">
                {WEEK_DAYS.map((dayLabel) => (
                    <AppointmentCalendarWeekday key={dayLabel} label={dayLabel} />
                ))}
            </div>

            <div className="calendar-grid" role="grid">
                {calendarDays.map((day) => (
                    <AppointmentCalendarDayButton
                        key={day.dateKey}
                        day={day}
                        minDate={minDate}
                        maxDate={maxDate}
                        leadTimeHours={leadTimeHours}
                        onSelect={onDaySelect}
                        getDayName={getDayName}
                        getMonthName={getMonthName}
                        formatDate={formatDate}
                    />
                ))}
            </div>

            <div className="calendar-legend" aria-hidden="true">
                <span><i className="legend-dot legend-open" />Disponibilă</span>
                <span><i className="legend-dot legend-tight" />Aproape plină</span>
                <span><i className="legend-dot legend-full" />Completă</span>
                <span><i className="legend-dot legend-blocked" />Blocată</span>
            </div>
        </div>
    );
}
