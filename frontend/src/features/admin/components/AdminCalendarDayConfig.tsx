import type { AdminAppointmentRecord, AppointmentBlockedDate, AppointmentStatus, ExamSettings } from "../types";
import { WEEKDAY_OPTIONS } from "../../../utils/dateUtils";
import type { TimeSlot } from "../../../types/appointment";
import { appointmentStatusLabelFeminine } from "../../../utils/appointmentUtils";
import CompactDatePicker from "../../../components/CompactDatePicker/CompactDatePicker";
import AdminAppointmentCalendarSlotItem from "./AdminAppointmentCalendarSlotItem";
import { parseDateKey } from "../../../utils/appointmentScheduling";

type CalendarRow = {
    key: string;
    slot: TimeSlot;
    occupiedAppointment: AdminAppointmentRecord | undefined;
};

type AdminCalendarDayConfigProps = {
    configDate: string;
    onConfigDateChange: (date: string) => void;
    configDayCalendarRows: CalendarRow[];
    settings: ExamSettings;
    blockDate: boolean;
    blockNote: string;
    overrideCapacity: boolean;
    capacityValue: number;
    overrideSlots: boolean;
    slotDraftText: string;
    locationValue: string;
    roomValue: string;
    configDayAppointments: AdminAppointmentRecord[];
    configDayCapacity: number;
    configDaySlots: TimeSlot[];
    configDayBlockedEntry: AppointmentBlockedDate | undefined;
    onBlockDateChange: (value: boolean) => void;
    onBlockNoteChange: (value: string) => void;
    onOverrideCapacityChange: (value: boolean) => void;
    onCapacityValueChange: (value: number) => void;
    onOverrideSlotsChange: (value: boolean) => void;
    onSlotDraftTextChange: (value: string) => void;
    onLocationValueChange: (value: string) => void;
    onRoomValueChange: (value: string) => void;
    allowedWeekdays: number[];
    onAllowedWeekdaysChange: (days: number[]) => void;
    onSave: () => void;
};

export default function AdminCalendarDayConfig({
    configDate,
    onConfigDateChange,
    configDayCalendarRows,
    settings,
    blockDate,
    blockNote,
    overrideCapacity,
    capacityValue,
    overrideSlots,
    slotDraftText,
    locationValue,
    roomValue,
    configDayAppointments,
    configDayCapacity,
    configDaySlots,
    configDayBlockedEntry,
    onBlockDateChange,
    onBlockNoteChange,
    onOverrideCapacityChange,
    onCapacityValueChange,
    onOverrideSlotsChange,
    onSlotDraftTextChange,
    onLocationValueChange,
    onRoomValueChange,
    allowedWeekdays,
    onAllowedWeekdaysChange,
    onSave,
}: AdminCalendarDayConfigProps) {
    return (
        <>
            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-table-cells admin-card-header-icon"></i> Calendar zi (sloturi)</h3>
                    <span className="admin-muted-text">{configDate}</span>
                </div>
                {configDayCalendarRows.length === 0 ? (
                    <p className="admin-muted-text">Nu există sloturi configurate pentru ziua selectată.</p>
                ) : (
                    <div className="admin-day-calendar-list">
                        {configDayCalendarRows.map(({ key, slot, occupiedAppointment }) => (
                            <AdminAppointmentCalendarSlotItem
                                key={key}
                                slot={slot}
                                occupiedAppointment={occupiedAppointment}
                                statusLabel={appointmentStatusLabelFeminine}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-gear admin-card-header-icon"></i> Configurare zi / reguli programare</h3>
                    <button className="admin-btn secondary" type="button" onClick={onSave}>
                        Salvează
                    </button>
                </div>

                <div className="admin-form-grid admin-appointments-config-grid">
                    <label className="admin-field">
                        <span>Data configurare</span>
                        <CompactDatePicker
                            value={configDate}
                            onChange={onConfigDateChange}
                            allowClear={false}
                            ariaLabel="Calendar configurare zi"
                        />
                    </label>

                    <label className="admin-field">
                        <span>Locație examen</span>
                        <input
                            type="text"
                            value={locationValue}
                            onChange={(event) => onLocationValueChange(event.target.value)}
                        />
                    </label>

                    <label className="admin-field">
                        <span>Sală</span>
                        <input type="text" value={roomValue} onChange={(event) => onRoomValueChange(event.target.value)} />
                    </label>

                    <div className="admin-field admin-field-full">
                        <span>Zile active</span>
                        <div className="admin-inline-checkbox-group">
                            {WEEKDAY_OPTIONS.map((option) => (
                                <label key={option.value} className="admin-inline-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={allowedWeekdays.includes(option.value)}
                                        onChange={(event) => {
                                            const next = event.target.checked
                                                ? [...allowedWeekdays, option.value]
                                                : allowedWeekdays.filter((d) => d !== option.value);
                                            onAllowedWeekdaysChange(next);
                                        }}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                        <small className="admin-field-hint">Candidații pot programa examenul doar în zilele selectate.</small>
                    </div>

                    <label className="admin-field">
                        <span>Override capacitate zi</span>
                        <div className="admin-inline-checkbox">
                            <input
                                type="checkbox"
                                checked={overrideCapacity}
                                onChange={(event) => onOverrideCapacityChange(event.target.checked)}
                            />
                            <span>Activ</span>
                        </div>
                        <input
                            type="number"
                            min={1}
                            value={capacityValue}
                            disabled={!overrideCapacity}
                            onChange={(event) => onCapacityValueChange(Number(event.target.value) || 1)}
                        />
                        <small className="admin-field-hint">Default: {settings.appointmentsPerDay}</small>
                    </label>

                    <label className="admin-field admin-field-full">
                        <span>Zi blocată</span>
                        <div className="admin-inline-checkbox">
                            <input
                                type="checkbox"
                                checked={blockDate}
                                onChange={(event) => onBlockDateChange(event.target.checked)}
                            />
                            <span>Blocare zi {configDate}</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Motiv (opțional)"
                            value={blockNote}
                            disabled={!blockDate}
                            onChange={(event) => onBlockNoteChange(event.target.value)}
                        />
                    </label>

                    <label className="admin-field admin-field-full">
                        <span>Override sloturi pentru zi</span>
                        <div className="admin-inline-checkbox">
                            <input
                                type="checkbox"
                                checked={overrideSlots}
                                onChange={(event) => onOverrideSlotsChange(event.target.checked)}
                            />
                            <span>Folosește sloturi custom pentru {configDate}</span>
                        </div>
                        <textarea
                            rows={5}
                            disabled={!overrideSlots}
                            value={slotDraftText}
                            onChange={(event) => onSlotDraftTextChange(event.target.value)}
                            placeholder={"08:00-08:30\n09:00-09:30\n14:00-14:30"}
                        />
                        <small className="admin-field-hint">
                            Câte un slot pe linie, format HH:MM-HH:MM. Dacă este dezactivat, se folosesc sloturile implicite.
                        </small>
                    </label>
                </div>

                <div className="admin-appointments-day-summary">
                    <div className="admin-summary-chip">
                        <span>Data</span>
                        <strong>{configDate}</strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Zi</span>
                        <strong>
                            {parseDateKey(configDate).toLocaleDateString("ro-RO", { weekday: "long" })}
                        </strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Ocupare</span>
                        <strong>
                            {configDayAppointments.length}/{configDayCapacity}
                        </strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Sloturi libere</span>
                        <strong>
                            {configDaySlots.filter((slot) => slot.available).length}/{configDaySlots.length}
                        </strong>
                    </div>
                    <div className={`admin-summary-chip ${configDayBlockedEntry ? "danger" : ""}`}>
                        <span>Status zi</span>
                        <strong>{configDayBlockedEntry ? "Blocată" : "Activă"}</strong>
                    </div>
                </div>
            </section>
        </>
    );
}
