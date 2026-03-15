import { formatDayMonth } from "../../utils/dateUtils";

export type AvailabilityPreviewDay = {
    date: Date;
    dateKey: string;
    blocked: boolean;
    blockedNote?: string;
    capacity: number;
    occupied: number;
    remaining: number;
};

type AppointmentAvailabilityDayButtonProps = {
    day: AvailabilityPreviewDay;
    isSelected: boolean;
    onSelect: (dateKey: string) => void;
};

export default function AppointmentAvailabilityDayButton({
    day,
    isSelected,
    onSelect,
}: AppointmentAvailabilityDayButtonProps) {
    const ratio = day.capacity > 0 ? day.occupied / day.capacity : 0;
    const statusClass = day.blocked
        ? "blocked"
        : day.remaining === 0
          ? "full"
          : ratio >= 0.8
            ? "tight"
            : "open";

    return (
        <button
            type="button"
            className={`availability-day ${statusClass} ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(day.dateKey)}
            title={day.blocked ? `Blocată${day.blockedNote ? `: ${day.blockedNote}` : ""}` : `${day.remaining}/${day.capacity} locuri libere`}
        >
            <span>{formatDayMonth(new Date(day.date))}</span>
            <small>{day.blocked ? "blocată" : `${day.remaining} lib.`}</small>
        </button>
    );
}
