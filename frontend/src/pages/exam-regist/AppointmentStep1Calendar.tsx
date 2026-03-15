import React from 'react';
import { WEEK_DAYS } from '../../utils/calendarUtils';
import AppointmentCalendarWeekday from './AppointmentCalendarWeekday';
import AppointmentCalendarDayButton, { type CalendarDayCell } from './AppointmentCalendarDayButton';
import AppointmentAvailabilityDayButton, { type AvailabilityPreviewDay } from './AppointmentAvailabilityDayButton';

type AppointmentStep1CalendarProps = {
    isCalendarOpen: boolean;
    calendarPickerRef: React.RefObject<HTMLDivElement | null>;
    onToggleCalendar: () => void;
    calendarMonth: Date;
    canNavigatePrevMonth: boolean;
    canNavigateNextMonth: boolean;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    calendarDays: CalendarDayCell[];
    selectedDate: Date | null;
    selectedDateLabel: string;
    selectedBlockedEntry: { note?: string } | undefined;
    availabilityPreviewDays: AvailabilityPreviewDay[];
    selectedDateKey: string;
    leadTimeHours: number;
    minDate: Date;
    maxDate: Date;
    error: string | undefined;
    onDaySelect: (dateKey: string) => void;
    onAvailabilitySelect: (dateKey: string) => void;
    getMonthName: (date: Date) => string;
    getDayName: (date: Date) => string;
    formatDate: (date: Date) => string;
    allowedWeekdayNames: string;
};

export default function AppointmentStep1Calendar({
    isCalendarOpen,
    calendarPickerRef,
    onToggleCalendar,
    calendarMonth,
    canNavigatePrevMonth,
    canNavigateNextMonth,
    onPrevMonth,
    onNextMonth,
    calendarDays,
    selectedDate,
    selectedDateLabel,
    selectedBlockedEntry,
    availabilityPreviewDays,
    selectedDateKey,
    leadTimeHours,
    minDate,
    maxDate,
    error,
    onDaySelect,
    onAvailabilitySelect,
    getMonthName,
    getDayName,
    formatDate,
    allowedWeekdayNames,
}: AppointmentStep1CalendarProps) {
    return (
        <div className="form-card">
            <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            </div>
            <h3>Selectați Data</h3>
            <p className="card-description">
                Puteți programa examenul doar în zilele de <strong>{allowedWeekdayNames}</strong>.
            </p>

            <div className="form-group">
                <label htmlFor="examDate">
                    Alege Data <span className="required">*</span>
                </label>
                <div className={`custom-date-picker ${error ? 'error' : ''} ${isCalendarOpen ? 'open' : ''}`} ref={calendarPickerRef}>
                    <button
                        type="button"
                        id="examDate"
                        className={`date-trigger ${isCalendarOpen ? 'open' : ''}`}
                        onClick={onToggleCalendar}
                        aria-haspopup="dialog"
                        aria-expanded={isCalendarOpen}
                        aria-controls="appointment-calendar-popover"
                    >
                        <span className={selectedDate ? 'date-trigger-value' : 'date-trigger-placeholder'}>
                            {selectedDate ? selectedDateLabel : 'Selectați data programării'}
                        </span>
                        <svg className={`calendar-chevron ${isCalendarOpen ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {isCalendarOpen && (
                        <div
                            className="calendar-popover"
                            id="appointment-calendar-popover"
                            role="dialog"
                            aria-label="Calendar selecție dată"
                        >
                            <div className="calendar-popover-header">
                                <button
                                    type="button"
                                    className="calendar-nav-btn"
                                    onClick={onPrevMonth}
                                    disabled={!canNavigatePrevMonth}
                                    aria-label="Luna anterioară"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>

                                <strong className="calendar-month-label">
                                    {getMonthName(calendarMonth)} {calendarMonth.getFullYear()}
                                </strong>

                                <button
                                    type="button"
                                    className="calendar-nav-btn"
                                    onClick={onNextMonth}
                                    disabled={!canNavigateNextMonth}
                                    aria-label="Luna următoare"
                                >
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
                    )}
                </div>
                {error && <span className="error-message">{error}</span>}
                {selectedDate && (
                    <div className="selected-date-display">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {getDayName(selectedDate)}, {selectedDate.getDate()} {getMonthName(selectedDate)} {selectedDate.getFullYear()}
                    </div>
                )}
                {selectedBlockedEntry && (
                    <span className="error-message">
                        Zi blocată{selectedBlockedEntry.note ? `: ${selectedBlockedEntry.note}` : '.'}
                    </span>
                )}
            </div>

            <div className="availability-preview">
                <div className="availability-preview-header">
                    <strong>Zile disponibile (preview)</strong>
                    <span>următoarele {availabilityPreviewDays.length}</span>
                </div>
                <div className="availability-preview-grid">
                    {availabilityPreviewDays.map((day) => (
                        <AppointmentAvailabilityDayButton
                            key={day.dateKey}
                            day={day}
                            isSelected={selectedDateKey === day.dateKey}
                            onSelect={onAvailabilitySelect}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
