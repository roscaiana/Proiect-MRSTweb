import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useStorageSync } from "../../../hooks/useStorageSync";
import type { AdminAppointmentRecord } from "../../../features/admin/types";
import { notifyAdmins, notifyUser } from "../../../utils/appEventNotifications";
import { readAppointments, readExamSettings, STORAGE_KEYS, writeAppointments } from "../../../features/admin/storage";

const APPOINTMENT_RESCHEDULE_KEY = "appointmentRescheduleDraft";

export const useUserAppointmentsPageController = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [examSettings, setExamSettings] = useState(() => readExamSettings());
    const [appointments, setAppointments] = useState(() => readAppointments());

    useStorageSync([STORAGE_KEYS.settings, STORAGE_KEYS.appointments], () => {
        setExamSettings(readExamSettings());
        setAppointments(readAppointments());
    });

    const userAppointments = useMemo(() => {
        if (!user?.email) return [];
        return appointments
            .filter((appointment) => appointment.userEmail === user.email)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, user?.email]);

    const canCancelAppointment = (status: string) => status === "pending" || status === "approved";
    const canRescheduleAppointment = (appointment: AdminAppointmentRecord) =>
        (appointment.status === "pending" || appointment.status === "approved") &&
        (appointment.rescheduleCount || 0) < examSettings.maxReschedulesPerUser;

    const handleCancelAppointment = (appointmentId: string) => {
        const target = appointments.find((appointment) => appointment.id === appointmentId);
        if (!target) return;

        const updatedAt = new Date().toISOString();
        const nextAppointments: AdminAppointmentRecord[] = appointments.map((appointment) =>
            appointment.id === appointmentId
                ? {
                      ...appointment,
                      status: "cancelled",
                      cancelledBy: "user",
                      statusReason: "Anulată din dashboard de utilizator",
                      updatedAt,
                  }
                : appointment
        );

        writeAppointments(nextAppointments);
        setAppointments(nextAppointments);

        notifyUser(user?.email, {
            title: "Programare anulată",
            message: `Programarea ${target.appointmentCode || ""} a fost anulată din dashboard.`,
            link: "/dashboard",
            tag: `appointment-cancelled-user-${appointmentId}-${updatedAt}`,
        });
        notifyAdmins({
            title: "Programare anulată de utilizator",
            message: `Cererea ${target.appointmentCode || ""} (${target.fullName}) a fost anulată din dashboard.`,
            link: "/admin/appointments",
            tag: `admin-appointment-cancelled-user-${appointmentId}-${updatedAt}`,
        });
    };

    const handleRescheduleAppointment = (appointmentId: string) => {
        localStorage.setItem(
            APPOINTMENT_RESCHEDULE_KEY,
            JSON.stringify({ appointmentId, createdAt: new Date().toISOString() })
        );
        navigate(`/appointment?reschedule=${encodeURIComponent(appointmentId)}`);
    };

    return {
        examSettings,
        userAppointments,
        canCancelAppointment,
        canRescheduleAppointment,
        handleCancelAppointment,
        handleRescheduleAppointment,
    };
};
