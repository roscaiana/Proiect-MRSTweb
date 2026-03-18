import { Link } from "react-router-dom";
import { formatDateLong } from "../../../utils/dateUtils";
import { appointmentStatusLabelMasculine } from "../../../utils/appointmentUtils";
import type { AdminAppointmentRecord } from "../../../features/admin/types";
import { APP_ROUTES } from "../../../routes/appRoutes";
import UserAppointmentItem from "./UserAppointmentItem";

type UserAppointmentsCardProps = {
    appointments: AdminAppointmentRecord[];
    totalAppointmentsCount: number;
    hasMoreAppointments: boolean;
    maxReschedulesPerUser: number;
    canCancel: (status: string) => boolean;
    canReschedule: (appointment: AdminAppointmentRecord) => boolean;
    onReschedule: (id: string) => void;
    onCancel: (id: string) => void;
};

export default function UserAppointmentsCard({
    appointments,
    totalAppointmentsCount,
    hasMoreAppointments,
    maxReschedulesPerUser,
    canCancel,
    canReschedule,
    onReschedule,
    onCancel,
}: UserAppointmentsCardProps) {
    return (
        <div className="dashboard-card appointments-card">
            <div className="card-header">
                <h2>Programările mele</h2>
                {hasMoreAppointments && (
                    <Link to={APP_ROUTES.userAppointments} className="card-action">
                        Vezi toate ({totalAppointmentsCount}) -&gt;
                    </Link>
                )}
            </div>
            <div className="history-list">
                {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                        <UserAppointmentItem
                            key={appointment.id}
                            appointment={appointment}
                            examSettingsMaxReschedules={maxReschedulesPerUser}
                            formatDate={formatDateLong}
                            appointmentStatusLabel={appointmentStatusLabelMasculine}
                            canReschedule={canReschedule(appointment)}
                            canCancel={canCancel(appointment.status)}
                            confirmationPath={`${APP_ROUTES.appointmentConfirmationBase}/${appointment.id}`}
                            onReschedule={onReschedule}
                            onCancel={onCancel}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>Nu ai programări înregistrate.</p>
                        <Link to={APP_ROUTES.appointment} className="btn-primary">
                            Creează programare
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
