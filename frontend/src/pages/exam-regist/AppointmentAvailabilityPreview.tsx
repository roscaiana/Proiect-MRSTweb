import AppointmentAvailabilityDayButton, { type AvailabilityPreviewDay } from './AppointmentAvailabilityDayButton';

type AppointmentAvailabilityPreviewProps = {
    availabilityPreviewDays: AvailabilityPreviewDay[];
    selectedDateKey: string;
    onAvailabilitySelect: (dateKey: string) => void;
};

export default function AppointmentAvailabilityPreview({
    availabilityPreviewDays,
    selectedDateKey,
    onAvailabilitySelect,
}: AppointmentAvailabilityPreviewProps) {
    return (
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
    );
}
