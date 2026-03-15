import { formatDayMonth } from "../../../utils/dateUtils";

type OccupancyPreviewDay = {
    date: Date;
    blocked: boolean;
    blockedNote?: string;
    capacity: number;
    occupied: number;
    remaining: number;
};

type AdminAppointmentHeatmapDayProps = {
    day: OccupancyPreviewDay;
    isActive: boolean;
    onSelect: (dateKey: string) => void;
    dateKey: string;
};

export default function AdminAppointmentHeatmapDay({
    day,
    isActive,
    onSelect,
    dateKey,
}: AdminAppointmentHeatmapDayProps) {
    const ratio = day.capacity > 0 ? day.occupied / day.capacity : 0;
    const levelClass = day.blocked
        ? "blocked"
        : day.remaining === 0
          ? "full"
          : ratio >= 0.8
            ? "high"
            : ratio > 0
              ? "medium"
              : "low";

    return (
        <button
            type="button"
            className={`admin-appointment-heatmap-day ${levelClass} ${isActive ? "active" : ""}`}
            onClick={() => onSelect(dateKey)}
            title={day.blocked ? `Blocată${day.blockedNote ? `: ${day.blockedNote}` : ""}` : `${day.occupied}/${day.capacity} ocupate`}
        >
            <strong>{formatDayMonth(new Date(day.date))}</strong>
            <span>{day.blocked ? "blocată" : `${day.remaining} lib.`}</span>
        </button>
    );
}
