import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useStorageSync } from "../../hooks/useStorageSync";
import {
    readAppointments,
    readExamSettings,
    STORAGE_KEYS,
} from "../../features/admin/storage";
import type { AdminAppointmentRecord, ExamSettings } from "../../features/admin/types";
import type { AppointmentFormData } from "../../types/appointment";
import { formatDate, getDayName } from "../../utils/dateUtils";
import { APP_ROUTES } from "../../routes/appRoutes";
import AppointmentStep5Confirm from "./AppointmentStep5Confirm";
import "./AppointmentPage.css";

const buildFallbackFormData = (appointment: AdminAppointmentRecord): AppointmentFormData => ({
    fullName: appointment.fullName,
    idOrPhone: appointment.idOrPhone,
    selectedDate: appointment.date ? new Date(appointment.date) : null,
    selectedSlot: appointment.slotStart && appointment.slotEnd
        ? {
              id: `slot-${appointment.slotStart}-${appointment.slotEnd}`,
              startTime: appointment.slotStart,
              endTime: appointment.slotEnd,
              available: true,
          }
        : null,
});

export default function AppointmentConfirmationPage() {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState<AdminAppointmentRecord[]>(() => readAppointments());
    const [examSettings, setExamSettings] = useState<ExamSettings>(() => readExamSettings());

    useStorageSync([STORAGE_KEYS.appointments, STORAGE_KEYS.settings], () => {
        setAppointments(readAppointments());
        setExamSettings(readExamSettings());
    });

    useEffect(() => {
        if (!appointmentId) return;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [appointmentId]);

    const appointment = useMemo(
        () => appointments.find((item) => item.id === appointmentId) || null,
        [appointments, appointmentId]
    );

    const isOwner = useMemo(() => {
        if (!appointment || !user?.email) return false;
        return appointment.userEmail?.trim().toLowerCase() === user.email.trim().toLowerCase();
    }, [appointment, user?.email]);

    if (!appointmentId) {
        return (
            <div className="appointment-page">
                <div className="container">
                    <div className="success-card">
                        <h2>Confirmare indisponibilă</h2>
                        <p className="success-message">Nu am primit un ID valid pentru programare.</p>
                        <div className="success-actions">
                            <Link className="success-btn success-btn-primary" to={APP_ROUTES.dashboard}>
                                Înapoi la dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="appointment-page">
                <div className="container">
                    <div className="success-card">
                        <h2>Programare negăsită</h2>
                        <p className="success-message">Nu am găsit această programare în contul tău.</p>
                        <div className="success-actions">
                            <Link className="success-btn success-btn-primary" to={APP_ROUTES.userAppointments}>
                                Vezi programările mele
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="appointment-page">
                <div className="container">
                    <div className="success-card">
                        <h2>Acces restricționat</h2>
                        <p className="success-message">Această confirmare nu aparține contului curent.</p>
                        <div className="success-actions">
                            <Link className="success-btn success-btn-primary" to={APP_ROUTES.dashboard}>
                                Înapoi la dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formData = buildFallbackFormData(appointment);

    return (
        <AppointmentStep5Confirm
            submitMessage=""
            submittedAppointment={appointment}
            formData={formData}
            appointmentLocation={examSettings.appointmentLocation}
            appointmentRoom={examSettings.appointmentRoom}
            getDayName={getDayName}
            formatDate={formatDate}
            onNewAppointment={() => navigate(APP_ROUTES.appointment)}
        />
    );
}
