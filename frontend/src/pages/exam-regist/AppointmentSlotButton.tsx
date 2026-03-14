import type { TimeSlot } from "../../types/appointment";

type AppointmentSlotButtonProps = {
    slot: TimeSlot;
    isSelected: boolean;
    onSelect: (slotId: string) => void;
};

export default function AppointmentSlotButton({
    slot,
    isSelected,
    onSelect,
}: AppointmentSlotButtonProps) {
    return (
        <button
            type="button"
            className={`time-slot ${isSelected ? "selected" : ""} ${!slot.available ? "disabled" : ""}`}
            onClick={() => onSelect(slot.id)}
            disabled={!slot.available}
        >
            <div className="slot-time">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{slot.startTime} - {slot.endTime}</span>
            </div>
            {isSelected && (
                <div className="check-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            )}
        </button>
    );
}
