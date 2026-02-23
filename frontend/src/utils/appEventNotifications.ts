import { readAdminUsers } from "../features/admin/storage";
import type { AppointmentStatus } from "../features/admin/types";
import { appendNotification, buildNotificationStorageKey } from "./notificationUtils";

const createNotificationId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const pushNotification = ({
    role,
    email,
    title,
    message,
    link,
    tag,
}: {
    role: "user" | "admin";
    email: string;
    title: string;
    message: string;
    link?: string;
    tag?: string;
}) => {
    appendNotification(buildNotificationStorageKey(role, email), {
        id: createNotificationId("notif"),
        title,
        message,
        createdAt: new Date().toISOString(),
        read: false,
        link,
        tag,
    });
};

export const notifyUser = (
    email: string | undefined,
    payload: { title: string; message: string; link?: string; tag?: string }
) => {
    if (!email) return;
    pushNotification({ role: "user", email, ...payload });
};

export const notifyAdmins = (payload: { title: string; message: string; link?: string; tag?: string }) => {
    const adminEmails = new Set<string>(["admin@electoral.md"]);
    readAdminUsers()
        .filter((user) => user.role === "admin")
        .forEach((user) => adminEmails.add(user.email));

    adminEmails.forEach((email) => {
        pushNotification({
            role: "admin",
            email,
            ...payload,
            tag: payload.tag ? `${payload.tag}-${email}` : undefined,
        });
    });
};

export const appointmentStatusLabelRo = (status: AppointmentStatus): string => {
    if (status === "approved") return "aprobata";
    if (status === "rejected") return "respinsa";
    if (status === "cancelled") return "anulata";
    return "in asteptare";
};

export const notifyAppointmentStatusChanged = (params: {
    appointmentId?: string;
    userEmail?: string;
    appointmentCode?: string;
    status: AppointmentStatus;
    reason?: string;
}) => {
    const identityPart = params.appointmentId || params.appointmentCode || "unknown";
    notifyUser(params.userEmail, {
        title: "Status programare actualizat",
        message: `Programarea ${params.appointmentCode || ""} este ${appointmentStatusLabelRo(params.status)}.${params.reason ? ` Motiv: ${params.reason}` : ""}`.trim(),
        link: "/dashboard",
        tag: `appointment-status-${identityPart}-${params.status}-${params.reason || ""}`,
    });
};

export const notifyAppointmentCreated = (params: {
    userEmail?: string;
    appointmentCode?: string;
    dateLabel: string;
    intervalLabel: string;
}) => {
    notifyUser(params.userEmail, {
        title: "Programare inregistrata",
        message: `Programarea ${params.appointmentCode || ""} pentru ${params.dateLabel}, ${params.intervalLabel} a fost trimisa.`,
        link: "/dashboard",
        tag: `appointment-created-${params.appointmentCode || params.userEmail || "anon"}`,
    });

    notifyAdmins({
        title: "Programare noua",
        message: `Cerere noua ${params.appointmentCode || ""} (${params.dateLabel}, ${params.intervalLabel}).`,
        link: "/admin/appointments",
        tag: `admin-appointment-created-${params.appointmentCode || Date.now()}`,
    });
};

export const notifyQuizCompleted = (params: {
    userEmail?: string;
    categoryTitle: string;
    score: number;
    passed: boolean;
}) => {
    notifyUser(params.userEmail, {
        title: params.passed ? "Test promovat" : "Test finalizat",
        message: `${params.categoryTitle}: ${params.score}%${params.passed ? " (promovat)" : ""}.`,
        link: "/tests",
        tag: `quiz-${params.categoryTitle}-${params.score}-${Date.now()}`,
    });
};
