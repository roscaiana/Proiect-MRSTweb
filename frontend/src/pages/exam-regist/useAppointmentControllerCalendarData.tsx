import { useMemo } from 'react';
import { formatAllowedWeekdayNames, getDayName, getMonthName, isAllowedDay } from '../../utils/dateUtils';
import {
    getBlockedDateEntry,
    getDailyCapacity,
    getAppointmentsForDate,
    isLeadTimeSatisfied,
    toDateKey,
} from '../../utils/appointmentScheduling';
import { getMonthKey, isSameDate as isSameCalendarDate, startOfMonth } from '../../utils/calendarUtils';
import type { AdminAppointmentRecord, ExamSettings } from '../../features/admin/types';

type UseAppointmentControllerCalendarDataParams = {
    selectedDate: Date | null;
    calendarMonth: Date;
    minDate: Date;
    maxDate: Date;
    appointments: AdminAppointmentRecord[];
    examSettings: ExamSettings;
    rescheduleSourceId: string | null;
};

export const useAppointmentControllerCalendarData = ({
    selectedDate,
    calendarMonth,
    minDate,
    maxDate,
    appointments,
    examSettings,
    rescheduleSourceId,
}: UseAppointmentControllerCalendarDataParams) => {
    const selectedDateKey = selectedDate ? toDateKey(selectedDate) : '';
    const selectedBlockedEntry = useMemo(
        () => (selectedDateKey ? getBlockedDateEntry(examSettings, selectedDateKey) : undefined),
        [examSettings, selectedDateKey]
    );
    const minMonth = useMemo(() => startOfMonth(minDate), [minDate]);
    const maxMonth = useMemo(() => startOfMonth(maxDate), [maxDate]);
    const canNavigatePrevMonth = getMonthKey(calendarMonth) > getMonthKey(minMonth);
    const canNavigateNextMonth = getMonthKey(calendarMonth) < getMonthKey(maxMonth);
    const allowedWeekdayNames = useMemo(
        () => formatAllowedWeekdayNames(examSettings.allowedWeekdays),
        [examSettings.allowedWeekdays]
    );
    const selectedDateLabel = useMemo(() => {
        if (!selectedDate) return 'Selectați data programării';
        return `${getDayName(selectedDate)}, ${selectedDate.getDate()} ${getMonthName(selectedDate)} ${selectedDate.getFullYear()}`;
    }, [selectedDate]);

    const calendarDays = useMemo(() => {
        const firstDayOfMonth = startOfMonth(calendarMonth);
        const monthStartWeekDay = (firstDayOfMonth.getDay() + 6) % 7;
        const gridStart = new Date(firstDayOfMonth);
        gridStart.setDate(firstDayOfMonth.getDate() - monthStartWeekDay);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Array.from({ length: 42 }, (_, index) => {
            const dayDate = new Date(gridStart);
            dayDate.setDate(gridStart.getDate() + index);
            dayDate.setHours(0, 0, 0, 0);

            const dateKey = toDateKey(dayDate);
            const dayAppointments = getAppointmentsForDate(appointments, dateKey, {
                activeOnly: true,
                excludeId: rescheduleSourceId || undefined,
            });
            const capacity = getDailyCapacity(examSettings, dateKey);
            const blockedEntry = getBlockedDateEntry(examSettings, dateKey);
            const remaining = Math.max(0, capacity - dayAppointments.length);
            const isAllowedWeekday = isAllowedDay(dayDate, examSettings.allowedWeekdays);
            const isWithinRange = dayDate >= minDate && dayDate <= maxDate;
            const isLeadTimeMet = isLeadTimeSatisfied(examSettings, dayDate);
            const isBlocked = Boolean(blockedEntry);
            const isFull = remaining === 0;

            return {
                date: dayDate,
                dateKey,
                inCurrentMonth: dayDate.getMonth() === calendarMonth.getMonth() && dayDate.getFullYear() === calendarMonth.getFullYear(),
                isToday: isSameCalendarDate(dayDate, today),
                isSelected: selectedDateKey === dateKey,
                isAllowedWeekday,
                isWithinRange,
                isLeadTimeMet,
                isBlocked,
                isFull,
                remaining,
                capacity,
                selectable: isWithinRange && isAllowedWeekday && isLeadTimeMet && !isBlocked && !isFull,
            };
        });
    }, [appointments, calendarMonth, examSettings, maxDate, minDate, rescheduleSourceId, selectedDateKey]);

    return {
        selectedDateKey,
        selectedBlockedEntry,
        canNavigatePrevMonth,
        canNavigateNextMonth,
        allowedWeekdayNames,
        selectedDateLabel,
        calendarDays,
    };
};
