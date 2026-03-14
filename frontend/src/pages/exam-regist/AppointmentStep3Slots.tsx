import type { TimeSlot } from '../../types/appointment';
import AppointmentSlotButton from './AppointmentSlotButton';

export type SlotFilter = 'all' | 'midday' | 'afternoon';

type AppointmentStep3SlotsProps = {
    availableSlots: TimeSlot[];
    slotFilter: SlotFilter;
    selectedSlotId: string | undefined;
    recommendedSlot: TimeSlot | null;
    remainingAppointmentsForDay: number;
    currentDayCapacity: number;
    selectedDate: Date | null;
    error: string | undefined;
    onFilterChange: (filter: SlotFilter) => void;
    onSlotSelect: (slotId: string) => void;
};

export default function AppointmentStep3Slots({
    availableSlots,
    slotFilter,
    selectedSlotId,
    recommendedSlot,
    remainingAppointmentsForDay,
    currentDayCapacity,
    selectedDate,
    error,
    onFilterChange,
    onSlotSelect,
}: AppointmentStep3SlotsProps) {
    return (
        <div className="form-card">
            <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            </div>
            <h3>Selectați Intervalul Orar</h3>
            <p className="card-description">
                Alegeți intervalul orar care vi se potrivește pentru examen.
            </p>
            {selectedDate && (
                <p className="card-description">
                    Locuri rămase în ziua selectată: <strong>{remainingAppointmentsForDay}</strong> / {currentDayCapacity}
                </p>
            )}

            <div className="slot-filter-row">
                <div className="slot-filter-group" role="tablist" aria-label="Filtru intervale">
                    <button type="button" className={slotFilter === 'all' ? 'active' : ''} onClick={() => onFilterChange('all')}>Toate</button>
                    <button type="button" className={slotFilter === 'midday' ? 'active' : ''} onClick={() => onFilterChange('midday')}>Prânz</button>
                    <button type="button" className={slotFilter === 'afternoon' ? 'active' : ''} onClick={() => onFilterChange('afternoon')}>După-amiază</button>
                </div>
                <button
                    type="button"
                    className="slot-suggest-btn"
                    onClick={() => recommendedSlot && onSlotSelect(recommendedSlot.id)}
                    disabled={!recommendedSlot}
                >
                    Sugerează primul slot liber
                </button>
            </div>

            <div className="time-slots">
                {availableSlots.length === 0 && (
                    <div className="slot-empty-note">
                        Nu există intervale în filtrul selectat. Încearcă „Toate".
                    </div>
                )}
                {availableSlots.map((slot) => (
                    <AppointmentSlotButton
                        key={slot.id}
                        slot={slot}
                        isSelected={selectedSlotId === slot.id}
                        onSelect={onSlotSelect}
                    />
                ))}
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
}
