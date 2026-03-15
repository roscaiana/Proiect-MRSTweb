import type { AdminAppointmentRecord } from "../types";

type AdminAppointmentPendingItemProps = {
    appointment: AdminAppointmentRecord;
    formatDateLabel: (value: string) => string;
    onApprove: (appointmentId: string) => void;
    onReject: (appointmentId: string) => void;
};

export default function AdminAppointmentPendingItem({
    appointment,
    formatDateLabel,
    onApprove,
    onReject,
}: AdminAppointmentPendingItemProps) {
    return (
        <div className="admin-simple-item">
            <div>
                <strong>{appointment.fullName}</strong>
                <p>
                    {formatDateLabel(appointment.date)} · {appointment.slotStart}-{appointment.slotEnd}
                </p>
                <p>{appointment.appointmentCode || "Fără cod"}</p>
            </div>
            <div className="admin-actions-row admin-actions-row-wrap">
                <button className="admin-text-btn" type="button" onClick={() => onApprove(appointment.id)}>
                    Aprobă
                </button>
                <button className="admin-text-btn danger" type="button" onClick={() => onReject(appointment.id)}>
                    Respinge
                </button>
            </div>
        </div>
    );
}
