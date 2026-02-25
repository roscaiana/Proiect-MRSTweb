import {
    readAdminUsers,
    readSentNotifications,
    writeSentNotifications,
} from "../features/admin/storage";
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

const appendAdminHistoryLog = (payload: {
    title: string;
    message: string;
    recipientCount: number;
    sentAt?: string;
}) => {
    const sentAt = payload.sentAt || new Date().toISOString();
    const logs = readSentNotifications();

    writeSentNotifications(
        [
            {
                id: createNotificationId("sent-auto"),
                target: "admins",
                title: payload.title,
                message: payload.message,
                sentAt,
                recipientCount: payload.recipientCount,
            },
            ...logs,
        ].slice(0, 100)
    );
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

    const sentAt = new Date().toISOString();

    adminEmails.forEach((email) => {
        pushNotification({
            role: "admin",
            email,
            title: payload.title,
            message: payload.message,
            link: payload.link,
            tag: payload.tag ? `${payload.tag}-${email}` : undefined,
        });
    });

    appendAdminHistoryLog({
        title: payload.title,
        message: payload.message,
        recipientCount: adminEmails.size,
        sentAt,
    });
};

export const appointmentStatusLabelRo = (status: AppointmentStatus): string => {
    if (status === "approved") return "aprobată";
    if (status === "rejected") return "respinsă";
    if (status === "cancelled") return "anulată";
    return "în așteptare";
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
        title: "Programare înregistrată",
        message: `Programarea ${params.appointmentCode || ""} pentru ${params.dateLabel}, ${params.intervalLabel} a fost trimisă.`,
        link: "/dashboard",
        tag: `appointment-created-${params.appointmentCode || params.userEmail || "anon"}`,
    });

    notifyAdmins({
        title: "Programare nouă",
        message: `Cerere nouă ${params.appointmentCode || ""} (${params.dateLabel}, ${params.intervalLabel}).`,
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
