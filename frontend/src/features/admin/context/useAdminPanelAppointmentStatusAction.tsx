import { useCallback } from "react";
import type { Dispatch } from "react";
import { notifyAppointmentStatusChanged } from "../../../utils/appEventNotifications";
import type { AdminState, AppointmentStatus } from "../types";
import type { AdminAction } from "./adminPanelTypes";

type Options = { reason?: string | null; adminNote?: string | null; cancelledBy?: "user" | "admin" };

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

        if (recipientEmail && targetAppointment && !targetAppointment.userEmail) {
            dispatch({ type: "appointment/update", payload: { id: appointmentId, patch: { userEmail: recipientEmail } } });
        }

        dispatch({ type: "appointment/set-status", payload: { id: appointmentId, status, reason: options?.reason, adminNote: options?.adminNote, cancelledBy: options?.cancelledBy } });
        notifyAppointmentStatusChanged({
            appointmentId: targetAppointment?.id || appointmentId,
            userEmail: recipientEmail,
            appointmentCode: targetAppointment?.appointmentCode,
            status,
            reason: options?.reason || undefined,
        });
    }, [dispatch, state.appointments, state.users]);
};
