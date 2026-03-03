import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CompactDatePicker.css";

type CompactDatePickerProps = {
    value: string;
    onChange: (nextValue: string) => void;
    min?: string;
    max?: string;
    disabled?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    ariaLabel?: string;
};

type CalendarCell = {
    date: Date;
    key: string;
    inCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    isDisabled: boolean;
};

const WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sa", "Du"];
const MONTHS = [
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

const startOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const toMonthKey = (date: Date): number => date.getFullYear() * 12 + date.getMonth();

const parseDateValue = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);

    if (
        Number.isNaN(parsed.getTime()) ||
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
    ) {
        return null;
    }

    return startOfDay(parsed);
};

const formatForValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatForLabel = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

const isSameDate = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

const clampMonth = (monthDate: Date, minDate?: Date | null, maxDate?: Date | null): Date => {
    const monthStart = startOfMonth(monthDate);
    if (minDate && toMonthKey(monthStart) < toMonthKey(startOfMonth(minDate))) {
        return startOfMonth(minDate);
    }
    if (maxDate && toMonthKey(monthStart) > toMonthKey(startOfMonth(maxDate))) {
        return startOfMonth(maxDate);
    }
    return monthStart;
};

const CompactDatePicker: React.FC<CompactDatePickerProps> = ({
    value,
    onChange,
    min,
    max,
    disabled = false,
    placeholder = "Selecteaza data",
    allowClear = true,
    ariaLabel = "Selectie data",
}) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const today = useMemo(() => startOfDay(new Date()), []);
    const selectedDate = useMemo(() => parseDateValue(value), [value]);
    const minDate = useMemo(() => (min ? parseDateValue(min) : null), [min]);
    const maxDate = useMemo(() => (max ? parseDateValue(max) : null), [max]);

    const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
        clampMonth(selectedDate || today, minDate, maxDate)
    );

    useEffect(() => {
        const nextSeed = selectedDate || today;
        setCalendarMonth((prev) => clampMonth(isOpen ? prev : nextSeed, minDate, maxDate));
    }, [selectedDate, today, minDate, maxDate, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (event: MouseEvent) => {
            if (!rootRef.current) return;
            if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const minMonth = minDate ? startOfMonth(minDate) : null;
    const maxMonth = maxDate ? startOfMonth(maxDate) : null;
    const canGoPrev = !minMonth || toMonthKey(calendarMonth) > toMonthKey(minMonth);
    const canGoNext = !maxMonth || toMonthKey(calendarMonth) < toMonthKey(maxMonth);

    const cells = useMemo<CalendarCell[]>(() => {
        const firstDay = startOfMonth(calendarMonth);
        const dayOffset = (firstDay.getDay() + 6) % 7;
        const gridStart = new Date(firstDay);
        gridStart.setDate(firstDay.getDate() - dayOffset);

        return Array.from({ length: 42 }).map((_, index) => {
            const date = new Date(gridStart);
            date.setDate(gridStart.getDate() + index);
            const normalized = startOfDay(date);
            const beforeMin = minDate ? normalized < minDate : false;
            const afterMax = maxDate ? normalized > maxDate : false;
            return {
                date: normalized,
                key: formatForValue(normalized),
                inCurrentMonth:
                    normalized.getMonth() === calendarMonth.getMonth() &&
                    normalized.getFullYear() === calendarMonth.getFullYear(),
                isSelected: selectedDate ? isSameDate(normalized, selectedDate) : false,
                isToday: isSameDate(normalized, today),
                isDisabled: beforeMin || afterMax || disabled,
            };
        });
    }, [calendarMonth, disabled, maxDate, minDate, selectedDate, today]);

    const selectedLabel = selectedDate ? formatForLabel(selectedDate) : placeholder;

    const handleSelect = (cell: CalendarCell) => {
        if (cell.isDisabled) return;
        onChange(cell.key);
        setIsOpen(false);
    };

    const goPrevMonth = () => {
        if (!canGoPrev) return;
        const previous = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
        setCalendarMonth(clampMonth(previous, minDate, maxDate));
    };

    const goNextMonth = () => {
        if (!canGoNext) return;
        const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
        setCalendarMonth(clampMonth(next, minDate, maxDate));
    };

    return (
        <div className={`compact-date-picker ${isOpen ? "open" : ""}`} ref={rootRef}>
            <button
                type="button"
                className="compact-date-picker-trigger"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <span className={selectedDate ? "has-value" : "placeholder"}>{selectedLabel}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </button>

            {isOpen && (
                <div className="compact-date-picker-popover" role="dialog" aria-label={ariaLabel}>
                    <div className="compact-date-picker-header">
                        <button type="button" onClick={goPrevMonth} disabled={!canGoPrev} aria-label="Luna anterioara">
                            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" strokeWidth="2.5" />
                            </svg>
                        </button>
                        <strong>{MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</strong>
                        <button type="button" onClick={goNextMonth} disabled={!canGoNext} aria-label="Luna urmatoare">
                            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                                <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2.5" />
                            </svg>
                        </button>
                    </div>

                    <div className="compact-date-picker-weekdays" aria-hidden="true">
                        {WEEK_DAYS.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    <div className="compact-date-picker-grid" role="grid">
                        {cells.map((cell) => (
                            <button
                                key={cell.key}
                                type="button"
                                className={[
                                    "compact-date-picker-cell",
                                    cell.inCurrentMonth ? "" : "outside",
                                    cell.isSelected ? "selected" : "",
                                    cell.isToday ? "today" : "",
                                ].join(" ").trim()}
                                onClick={() => handleSelect(cell)}
                                disabled={cell.isDisabled}
                                aria-selected={cell.isSelected}
                            >
                                {cell.date.getDate()}
                            </button>
                        ))}
                    </div>

                    {allowClear && value && (
                        <button
                            type="button"
                            className="compact-date-picker-clear"
                            onClick={() => {
                                onChange("");
                                setIsOpen(false);
                            }}
                        >
                            Sterge data
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompactDatePicker;
