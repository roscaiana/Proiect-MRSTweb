import type { AdminAppointmentRecord } from "../types";

type DaySlot = {
    startTime: string;
    endTime: string;
};

type AdminAppointmentCalendarSlotItemProps = {
    slot: DaySlot;
    occupiedAppointment?: AdminAppointmentRecord;
    statusLabel: (status: AdminAppointmentRecord["status"]) => string;
};

export default function AdminAppointmentCalendarSlotItem({
    slot,
    occupiedAppointment,
    statusLabel,
}: AdminAppointmentCalendarSlotItemProps) {
    return (
        <div className={`admin-day-calendar-item ${occupiedAppointment ? "occupied" : "free"}`}>
            <div className="admin-day-calendar-slot">
                <strong>{slot.startTime} - {slot.endTime}</strong>
                <span>{occupiedAppointment ? "ocupat" : "liber"}</span>
            </div>
            <div className="admin-day-calendar-content">
                {occupiedAppointment ? (
                    <>
                        <strong>{occupiedAppointment.fullName}</strong>
                        <p>{occupiedAppointment.userEmail || occupiedAppointment.idOrPhone}</p>
                        <p>
                            {occupiedAppointment.appointmentCode || "Fără cod"} · {statusLabel(occupiedAppointment.status)}
                        </p>
                    </>
                ) : (
                    <p className="admin-muted-text">Slot disponibil</p>
                )}
            </div>
        </div>
    );
}
