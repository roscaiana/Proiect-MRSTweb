export const WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sa", "Du"];

export const MONTHS = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
];

export const startOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const getMonthKey = (date: Date): number => date.getFullYear() * 12 + date.getMonth();

export const isSameDate = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

export const clampMonth = (monthDate: Date, minDate?: Date | null, maxDate?: Date | null): Date => {
    const monthStart = startOfMonth(monthDate);
    if (minDate && getMonthKey(monthStart) < getMonthKey(startOfMonth(minDate))) {
        return startOfMonth(minDate);
    }
    if (maxDate && getMonthKey(monthStart) > getMonthKey(startOfMonth(maxDate))) {
        return startOfMonth(maxDate);
    }
    return monthStart;
};

export const navigateMonth = (
    direction: 'prev' | 'next',
    current: Date,
    minDate: Date | null,
    maxDate: Date | null,
): Date => {
    const offset = direction === 'prev' ? -1 : 1;
    const target = new Date(current.getFullYear(), current.getMonth() + offset, 1);
    return clampMonth(target, minDate, maxDate);
};

/**
 * Returns 42 Date objects for a Mon-first 6-week calendar grid.
 * The grid starts from the Monday on or before the first day of the month.
 */
export const buildCalendarGrid = (firstDay: Date): Date[] => {
    const dayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - dayOffset);
    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return date;
    });
};
