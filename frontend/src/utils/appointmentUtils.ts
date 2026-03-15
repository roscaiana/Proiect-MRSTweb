import type { AppointmentStatus } from "../features/admin/types";

export const appointmentStatusLabelFeminine = (status: AppointmentStatus): string => {
    if (status === "pending") return "În așteptare";
    if (status === "approved") return "Aprobată";
    if (status === "rejected") return "Respinsă";
    return "Anulată";
};

export const appointmentStatusLabelMasculine = (status: string): string => {
    if (status === "approved") return "Aprobat";
    if (status === "rejected") return "Respins";
    if (status === "cancelled") return "Anulat";
    return "În așteptare";
};
