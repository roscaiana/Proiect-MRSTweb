import { Link } from "react-router-dom";
import { formatDateTimeLong } from "../../../utils/dateUtils";
import { appointmentStatusLabelMasculine } from "../../../utils/appointmentUtils";
import { APP_ROUTES } from "../../../routes/appRoutes";
import UserAppointmentItem from "../UserDashboard/UserAppointmentItem";
import { useUserAppointmentsPageController } from "./useUserAppointmentsPageController";
import "../UserDashboard/UserDashboard.css";

export default function UserAppointmentsPage() {
    const controller = useUserAppointmentsPageController();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Programările mele</h1>
                <p>Toate programările tale, într-o pagină separată.</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card history-card">
                    <div className="card-header">
                        <h2>Toate programările</h2>
                        <Link to={APP_ROUTES.dashboard} className="card-action">
                            Înapoi la profil -&gt;
                        </Link>
                    </div>
                    <div className="history-list">
                        {controller.userAppointments.length > 0 ? (
                            controller.userAppointments.map((appointment) => (
                                <UserAppointmentItem
                                    key={appointment.id}
                                    appointment={appointment}
                                    examSettingsMaxReschedules={controller.examSettings.maxReschedulesPerUser}
                                    formatDate={formatDateTimeLong}
                                    appointmentStatusLabel={appointmentStatusLabelMasculine}
                                    canReschedule={controller.canRescheduleAppointment(appointment)}
                                    canCancel={controller.canCancelAppointment(appointment.status)}
                                    onReschedule={controller.handleRescheduleAppointment}
                                    onCancel={controller.handleCancelAppointment}
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
            </div>
        </div>
    );
}
