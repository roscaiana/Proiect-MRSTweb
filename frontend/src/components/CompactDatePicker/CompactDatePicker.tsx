import React, { useEffect, useMemo, useRef, useState } from "react";
import CompactDatePickerCellButton, { type CalendarCell } from "./CompactDatePickerCellButton";
import CompactDatePickerWeekday from "./CompactDatePickerWeekday";
import {
    WEEK_DAYS,
    MONTHS,
    startOfDay,
    startOfMonth,
    getMonthKey as toMonthKey,
    isSameDate,
    clampMonth,
    buildCalendarGrid,
    navigateMonth,
} from "../../utils/calendarUtils";
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
    allowedWeekdays?: number[];
};

const parseDateValue = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return null;
    }

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

const CompactDatePicker: React.FC<CompactDatePickerProps> = ({
    value,
    onChange,
    min,
    max,
    disabled = false,
    placeholder = "Selecteaza data",
    allowClear = true,
    ariaLabel = "Selectie data",
    allowedWeekdays,
}) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const today = useMemo(() => startOfDay(new Date()), []);
    const selectedDate = useMemo(() => parseDateValue(value), [value]);
    const minDate = useMemo(() => (min ? parseDateValue(min) : null), [min]);
    const maxDate = useMemo(() => (max ? parseDateValue(max) : null), [max]);

    const [calendarMonth, setCalendarMonth] = useState<Date>(() => clampMonth(selectedDate || today, minDate, maxDate));

    useEffect(() => {
        const nextSeed = selectedDate || today;
        setCalendarMonth((prev) => clampMonth(isOpen ? prev : nextSeed, minDate, maxDate));
    }, [selectedDate, today, minDate, maxDate, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleMouseDown = (event: MouseEvent) => {
            if (!rootRef.current) {
                return;
            }
            if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const minMonth = minDate ? startOfMonth(minDate) : null;
    const maxMonth = maxDate ? startOfMonth(maxDate) : null;
    const canGoPrev = !minMonth || toMonthKey(calendarMonth) > toMonthKey(minMonth);
    const canGoNext = !maxMonth || toMonthKey(calendarMonth) < toMonthKey(maxMonth);

    const cells = useMemo<CalendarCell[]>(() => {
        return buildCalendarGrid(startOfMonth(calendarMonth)).map((date) => {
            const normalized = startOfDay(date);
            const beforeMin = minDate ? normalized < minDate : false;
            const afterMax = maxDate ? normalized > maxDate : false;
            const notAllowedWeekday = allowedWeekdays ? !allowedWeekdays.includes(normalized.getDay()) : false;

            return {
                date: normalized,
                key: formatForValue(normalized),
                inCurrentMonth:
                    normalized.getMonth() === calendarMonth.getMonth() &&
                    normalized.getFullYear() === calendarMonth.getFullYear(),
                isSelected: selectedDate ? isSameDate(normalized, selectedDate) : false,
                isToday: isSameDate(normalized, today),
                isDisabled: beforeMin || afterMax || disabled || notAllowedWeekday,
            };
        });
    }, [allowedWeekdays, calendarMonth, disabled, maxDate, minDate, selectedDate, today]);

    const selectedLabel = selectedDate ? formatForLabel(selectedDate) : placeholder;

    const handleSelect = (cell: CalendarCell) => {
        if (cell.isDisabled) {
            return;
        }
        onChange(cell.key);
        setIsOpen(false);
    };

    const goPrevMonth = () => { if (canGoPrev) setCalendarMonth(navigateMonth('prev', calendarMonth, minDate, maxDate)); };
    const goNextMonth = () => { if (canGoNext) setCalendarMonth(navigateMonth('next', calendarMonth, minDate, maxDate)); };

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
                            <CompactDatePickerWeekday key={day} day={day} />
                        ))}
                    </div>

                    <div className="compact-date-picker-grid" role="grid">
                        {cells.map((cell) => (
                            <CompactDatePickerCellButton key={cell.key} cell={cell} onSelect={handleSelect} />
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
