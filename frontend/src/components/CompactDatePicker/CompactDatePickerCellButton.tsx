type CalendarCell = {
    date: Date;
    key: string;
    inCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    isDisabled: boolean;
};

type CompactDatePickerCellButtonProps = {
    cell: CalendarCell;
    onSelect: (cell: CalendarCell) => void;
};

export type { CalendarCell };

export default function CompactDatePickerCellButton({ cell, onSelect }: CompactDatePickerCellButtonProps) {
    return (
        <button
            type="button"
            className={[
                "compact-date-picker-cell",
                cell.inCurrentMonth ? "" : "outside",
                cell.isSelected ? "selected" : "",
                cell.isToday ? "today" : "",
            ].join(" ").trim()}
            onClick={() => onSelect(cell)}
            disabled={cell.isDisabled}
            aria-selected={cell.isSelected}
        >
            {cell.date.getDate()}
        </button>
    );
}
