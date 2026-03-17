import type { AdminAppointmentRecord, AdminState, AppointmentStatus } from "../types";

type StatusPayload = {
    id: string;
    status: AppointmentStatus;
    reason?: string | null;
    adminNote?: string | null;
    cancelledBy?: "user" | "admin";
};

export const setAppointmentStatusReducer = (state: AdminState, payload: StatusPayload): AdminState => {
    return {
        ...state,
        appointments: state.appointments.map((appointment) =>
            appointment.id !== payload.id
                ? appointment
                : {
                      ...appointment,
                      status: payload.status,
                      statusReason: payload.reason !== undefined ? payload.reason || undefined : appointment.statusReason,
                      adminNote: payload.adminNote !== undefined ? payload.adminNote || undefined : appointment.adminNote,
                      cancelledBy: payload.status === "cancelled" ? payload.cancelledBy || appointment.cancelledBy : appointment.cancelledBy,
                      updatedAt: new Date().toISOString(),
                  }
        ),
    };
};

export const updateAppointmentReducer = (
    state: AdminState,
    payload: { id: string; patch: Partial<AdminAppointmentRecord> }
): AdminState => {
    return {
        ...state,
        appointments: state.appointments.map((appointment) =>
            appointment.id !== payload.id
                ? appointment
                : { ...appointment, ...payload.patch, updatedAt: new Date().toISOString() }
        ),
    };
};
