import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import type { AdminAppointmentRecord, AppointmentStatus, ExamSettings } from "../../../features/admin/types";
import { notifyAdmins, notifyUser } from "../../../utils/appEventNotifications";
import { DEFAULT_SETTINGS } from "../../../features/admin/storage";
import { appointmentService } from "../../../services/appointmentService";
import { examSettingsService } from "../../../services/examSettingsService";
import type { AppointmentDto, ExamSettingsDto } from "../../../services/types";

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

const mapExamSettingsDto = (dto: ExamSettingsDto): ExamSettings => ({
    ...dto,
    blockedDates: dto.blockedDates.map((item) => ({
        date: item.date,
        note: item.note ?? undefined,
    })),
});

export const useUserAppointmentsPageController = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [examSettings, setExamSettings] = useState(DEFAULT_SETTINGS);
    const [appointments, setAppointments] = useState<AdminAppointmentRecord[]>([]);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        const userId = user?.id ? parseInt(user.id, 10) : null;
        if (!userId || isNaN(userId)) return;

        setLoadError("");
        Promise.all([
            appointmentService.getByUser(userId),
            examSettingsService.get(),
        ])
            .then(([items, settings]) => {
                setAppointments(items.map(mapAppointmentDto));
                setExamSettings(mapExamSettingsDto(settings));
            })
            .catch(() => {
                setAppointments([]);
                setLoadError("Programările nu au putut fi încărcate din backend.");
            });
    }, [user?.id]);

    const userAppointments = useMemo(() => {
        if (!user?.email) return [];
        const email = user.email.toLowerCase();
        return appointments
            .filter((a) => (a.userEmail ?? "").toLowerCase() === email || !a.userEmail)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, user?.email]);

    const canCancelAppointment = (status: string) => status === "pending" || status === "approved";
    const canRescheduleAppointment = (appointment: AdminAppointmentRecord) =>
        (appointment.status === "pending" || appointment.status === "approved") &&
        (appointment.rescheduleCount || 0) < examSettings.maxReschedulesPerUser;

    const reloadAppointments = async () => {
        const userId = user?.id ? parseInt(user.id, 10) : null;
        if (!userId || isNaN(userId)) return;
        const items = await appointmentService.getByUser(userId);
        setAppointments(items.map(mapAppointmentDto));
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        const target = appointments.find((a) => a.id === appointmentId);
        if (!target) return;

        const updatedAt = new Date().toISOString();
        const numericId = parseInt(appointmentId, 10);
        if (isNaN(numericId)) {
            setLoadError("Programarea nu are identificator valid pentru backend.");
            return;
        }

        try {
            await appointmentService.updateStatus(numericId, {
                status: "cancelled",
                statusReason: "Anulată din dashboard de utilizator",
                cancelledBy: "user",
            });
            await reloadAppointments();
            setLoadError("");
        } catch (err) {
            console.error("Failed to cancel appointment:", err);
            setLoadError("Programarea nu a putut fi anulată în backend.");
            return;
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
        loadError,
        canCancelAppointment,
        canRescheduleAppointment,
        handleCancelAppointment,
        handleRescheduleAppointment,
    };
};
