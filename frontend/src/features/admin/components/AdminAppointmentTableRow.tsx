import type { AdminAppointmentRecord } from "../types";

type AdminAppointmentTableRowProps = {
    appointment: AdminAppointmentRecord;
    isSelected: boolean;
    onToggleSelection: (appointmentId: string) => void;
    onApprove: (appointmentId: string) => void;
    onReject: (appointmentId: string) => void;
    onReschedule: (appointmentId: string) => void;
    onCancel: (appointmentId: string) => void;
    formatDateLabel: (value: string) => string;
    formatDateTimeLabel: (value: string) => string;
    statusLabel: (status: AdminAppointmentRecord["status"]) => string;
};

export default function AdminAppointmentTableRow({
    appointment,
    isSelected,
    onToggleSelection,
    onApprove,
    onReject,
    onReschedule,
    onCancel,
    formatDateLabel,
    formatDateTimeLabel,
    statusLabel,
}: AdminAppointmentTableRowProps) {
    return (
        <tr>
            <td className="admin-table-checkbox-col">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(appointment.id)}
                    aria-label={`Selectează programarea ${appointment.fullName}`}
                />
            </td>
            <td>
                <strong>{appointment.fullName}</strong>
                <p>{appointment.userEmail || appointment.idOrPhone}</p>
                {appointment.userEmail && <p>{appointment.idOrPhone}</p>}
                <p>Creat: {formatDateTimeLabel(appointment.createdAt)}</p>
            </td>
            <td className="admin-appointment-meta-cell">
                <p>
                    <strong>{appointment.appointmentCode || "Fără cod"}</strong>
                </p>
                <p>Actualizat: {formatDateTimeLabel(appointment.updatedAt || appointment.createdAt)}</p>
                {typeof appointment.rescheduleCount === "number" && <p>Reprogramări: {appointment.rescheduleCount}</p>}
                {appointment.cancelledBy && <p>Anulată de: {appointment.cancelledBy}</p>}
            </td>
            <td>{formatDateLabel(appointment.date)}</td>
            <td>
                {appointment.slotStart} - {appointment.slotEnd}
            </td>
            <td>
                <span className={`admin-pill ${appointment.status}`}>{statusLabel(appointment.status)}</span>
                {appointment.statusReason && <p className="admin-appointment-status-note">Motiv: {appointment.statusReason}</p>}
                {appointment.adminNote && <p className="admin-appointment-status-note">Nota admin: {appointment.adminNote}</p>}
            </td>
            <td>
                <div className="admin-actions-row admin-actions-row-wrap">
                    <button
                        className="admin-text-btn"
                        type="button"
                        onClick={() => onApprove(appointment.id)}
                        disabled={appointment.status === "approved" || appointment.status === "cancelled"}
                    >
                        Aprobă
                    </button>
                    <button
                        className="admin-text-btn danger"
                        type="button"
                        onClick={() => onReject(appointment.id)}
                        disabled={appointment.status === "cancelled"}
                    >
                        Respinge
                    </button>
                    <button
                        className="admin-text-btn"
                        type="button"
                        onClick={() => onReschedule(appointment.id)}
                        disabled={appointment.status === "cancelled"}
                    >
                        Reprogramează
                    </button>
                    <button
                        className="admin-text-btn danger"
                        type="button"
                        onClick={() => onCancel(appointment.id)}
                        disabled={appointment.status === "cancelled"}
                    >
                        Anulează
                    </button>
                </div>
            </td>
        </tr>
    );
}
