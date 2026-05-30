import { useCallback } from "react";
import type { Dispatch } from "react";
import { notifyAppointmentStatusChanged } from "../../../utils/appEventNotifications";
import type { AdminAppointmentRecord, AdminState, AppointmentStatus } from "../types";
import type { AdminAction } from "./adminPanelTypes";
import { appointmentService } from "../../../services/appointmentService";
import type { AppointmentDto } from "../../../services/types";

type Options = { reason?: string | null; adminNote?: string | null; cancelledBy?: "user" | "admin" };

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

export const useAdminPanelAppointmentStatusAction = (state: AdminState, dispatch: Dispatch<AdminAction>) => {
    return useCallback((appointmentId: string, status: AppointmentStatus, options?: Options) => {
        const targetAppointment = state.appointments.find((a) => a.id === appointmentId);
        let recipientEmail = targetAppointment?.userEmail;

        if (!recipientEmail && targetAppointment) {
            const phoneOrIdValue = targetAppointment.idOrPhone.trim();
            if (phoneOrIdValue.includes("@")) recipientEmail = phoneOrIdValue;
            else {
                const normalized = targetAppointment.fullName.trim().toLowerCase();
                const matchedUsers = state.users.filter((user) => user.role === "user" && user.fullName.trim().toLowerCase() === normalized);
                if (matchedUsers.length === 1) recipientEmail = matchedUsers[0].email;
            }
        }

        const numericId = parseInt(appointmentId, 10);
        if (!isNaN(numericId)) {
            appointmentService.updateStatus(numericId, {
                status,
                statusReason: options?.reason ?? null,
                adminNote: options?.adminNote ?? null,
                cancelledBy: options?.cancelledBy ?? null,
            })
                .then(() => appointmentService.getAll())
                .then((items) => dispatch({ type: "appointments/set", payload: items.map(mapAppointmentDto) }))
                .catch((err) => console.error("Failed to update appointment status:", err));
        } else {
            dispatch({ type: "appointment/set-status", payload: { id: appointmentId, status, reason: options?.reason, adminNote: options?.adminNote, cancelledBy: options?.cancelledBy } });
        }

        notifyAppointmentStatusChanged({
            appointmentId: targetAppointment?.id || appointmentId,
            userEmail: recipientEmail,
            appointmentCode: targetAppointment?.appointmentCode,
            status,
            reason: options?.reason || undefined,
        });
    }, [dispatch, state.appointments, state.users]);
};
