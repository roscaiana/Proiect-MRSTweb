import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useStorageSync } from "../../../hooks/useStorageSync";
import type { AdminAppointmentRecord, AppointmentStatus } from "../../../features/admin/types";
import { notifyAdmins, notifyUser } from "../../../utils/appEventNotifications";
import { readAppointments, readExamSettings, STORAGE_KEYS, writeAppointments } from "../../../features/admin/storage";
import { appointmentService } from "../../../services/appointmentService";
import type { AppointmentDto } from "../../../services/types";

const APPOINTMENT_RESCHEDULE_KEY = "appointmentRescheduleDraft";

const mapAppointmentDto = (dto: AppointmentDto): AdminAppointmentRecord => ({
    id: String(dto.id),
    fullName: dto.fullName,
    idOrPhone: dto.idOrPhone,
    userEmail: dto.userEmail || undefined,
    date: dto.date,
    slotStart: dto.slotStart,
    slotEnd: dto.slotEnd,
    status: dto.status as AppointmentStatus,
    statusReason: dto.statusReason ?? undefined,
    adminNote: dto.adminNote ?? undefined,
    cancelledBy: (dto.cancelledBy as "user" | "admin") ?? undefined,
    rescheduleCount: dto.rescheduleCount,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? undefined,
});

export const useUserAppointmentsPageController = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [examSettings, setExamSettings] = useState(() => readExamSettings());
    const [appointments, setAppointments] = useState<AdminAppointmentRecord[]>(() => readAppointments());

    useStorageSync([STORAGE_KEYS.settings], () => {
        setExamSettings(readExamSettings());
    });

    useEffect(() => {
        const userId = user?.id ? parseInt(user.id, 10) : null;
        if (!userId || isNaN(userId)) return;
        appointmentService.getByUser(userId)
            .then((items) => setAppointments(items.map(mapAppointmentDto)))
            .catch(() => { /* keep localStorage-seeded state on API failure */ });
    }, [user?.id]);

    const userAppointments = useMemo(() => {
        if (!user?.email) return [];
        const email = user.email.toLowerCase();
        return appointments
            .filter((a) => (a.userEmail ?? '').toLowerCase() === email || !a.userEmail)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, user?.email]);

    const canCancelAppointment = (status: string) => status === "pending" || status === "approved";
    const canRescheduleAppointment = (appointment: AdminAppointmentRecord) =>
        (appointment.status === "pending" || appointment.status === "approved") &&
        (appointment.rescheduleCount || 0) < examSettings.maxReschedulesPerUser;

    const handleCancelAppointment = async (appointmentId: string) => {
        const target = appointments.find((a) => a.id === appointmentId);
        if (!target) return;

        const updatedAt = new Date().toISOString();
        const numericId = parseInt(appointmentId, 10);

        if (!isNaN(numericId)) {
            try {
                await appointmentService.updateStatus(numericId, {
                    status: "cancelled",
                    statusReason: "Anulată din dashboard de utilizator",
                    cancelledBy: "user",
                });
                const userId = user?.id ? parseInt(user.id, 10) : null;
                if (userId) {
                    const items = await appointmentService.getByUser(userId);
                    const mapped = items.map(mapAppointmentDto);
                    setAppointments(mapped);
                    writeAppointments(mapped);
                }
            } catch (err) {
                console.error("Failed to cancel appointment:", err);
                return;
            }
        } else {
            const nextAppointments = appointments.map((a) =>
                a.id === appointmentId
                    ? { ...a, status: "cancelled" as AppointmentStatus, cancelledBy: "user" as const, statusReason: "Anulată din dashboard de utilizator", updatedAt }
                    : a
            );
            writeAppointments(nextAppointments);
            setAppointments(nextAppointments);
        }

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
