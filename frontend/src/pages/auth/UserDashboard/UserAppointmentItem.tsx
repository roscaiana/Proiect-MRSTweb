import { Link } from "react-router-dom";
import type { AdminAppointmentRecord } from "../../../features/admin/types";

type UserAppointmentItemProps = {
    appointment: AdminAppointmentRecord;
    examSettingsMaxReschedules: number;
    formatDate: (value: string) => string;
    appointmentStatusLabel: (status: string) => string;
    canReschedule: boolean;
    canCancel: boolean;
    confirmationPath?: string;
    onReschedule: (id: string) => void;
    onCancel: (id: string) => void;
};

export default function UserAppointmentItem({
    appointment,
    examSettingsMaxReschedules,
    formatDate,
    appointmentStatusLabel,
    canReschedule,
    canCancel,
    confirmationPath,
    onReschedule,
    onCancel,
}: UserAppointmentItemProps) {
    const canViewConfirmation =
        Boolean(confirmationPath) &&
        (appointment.status === "pending" || appointment.status === "approved");

    return (
        <div className="history-item">
            <div className="history-content">
                <h4>{formatDate(appointment.date)}</h4>
                <p>Interval: {appointment.slotStart} - {appointment.slotEnd}</p>
                {appointment.appointmentCode && <p>Cod: {appointment.appointmentCode}</p>}
                {appointment.statusReason && <p className={`appointment-reason ${appointment.status}`}>Motiv: {appointment.statusReason}</p>}
                {appointment.adminNote && <p className="appointment-admin-note">Notă admin: {appointment.adminNote}</p>}
                <div className="appointment-item-actions">
                    {canViewConfirmation && (
                        <Link className="dashboard-mini-btn" to={confirmationPath}>
                            Vezi confirmare
                        </Link>
                    )}
                    <button
                        type="button"
                        className="dashboard-mini-btn"
                        disabled={!canReschedule}
                        onClick={() => onReschedule(appointment.id)}
                        title={canReschedule ? "Reprogramează" : `Limita de ${examSettingsMaxReschedules} reprogramări a fost atinsă`}
                    >
                        Reprogramează
                    </button>
                    <button type="button" className="dashboard-mini-btn danger" disabled={!canCancel} onClick={() => onCancel(appointment.id)}>
                        Anulează
                    </button>
                </div>
            </div>
            <div className={`appointment-status ${appointment.status}`}>{appointmentStatusLabel(appointment.status)}</div>
        </div>
    );
}
