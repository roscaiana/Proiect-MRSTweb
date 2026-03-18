import { useEffect, useMemo, useState } from "react";
import type { User } from "../types/user";
import { readAppointments, STORAGE_KEYS } from "../features/admin/storage";
import {
    AppNotification,
    appendNotification,
    buildNotificationStorageKey,
    readNotifications,
    saveNotifications,
} from "../utils/notificationUtils";

type UseNotificationsParams = {
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: User | null;
};

const getDefaultNotifications = (isAdmin: boolean): AppNotification[] => {
    const now = new Date().toISOString();

    if (isAdmin) {
        return [
            {
                id: "admin-notif-1",
                title: "Panou administrator",
                message: "Ai acces la functiile de administrare.",
                createdAt: now,
                read: false,
            },
        ];
    }

    return [
        {
            id: "user-notif-1",
            title: "Bine ai venit",
            message: "Contul tau este activ.",
            createdAt: now,
            read: false,
        },
    ];
};

const getStorageKey = (user: User | null): string | null => {
    if (!user) return null;
    return buildNotificationStorageKey(user.role, user.email);
};

export const formatNotificationDate = (value: string): string => {
    const date = new Date(value);
    return date.toLocaleString("ro-RO", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const pushUpcomingAppointmentReminders = (notificationStorageKey: string, user: User) => {
    const now = new Date();
    const appointments = readAppointments().filter(
        (appointment) =>
            appointment.userEmail === user.email &&
            (appointment.status === "pending" || appointment.status === "approved")
    );

    appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const diffMs = appointmentDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours > 0 && diffHours <= 24) {
            appendNotification(notificationStorageKey, {
                id: `reminder-24-${appointment.id}`,
                title: "Reminder examen (24h)",
                message: `Programarea ${appointment.appointmentCode || ""} este in mai putin de 24h.`,
                createdAt: now.toISOString(),
                read: false,
                link: "/dashboard",
                tag: `appointment-reminder-24h-${appointment.id}`,
            });
        }

        if (diffHours > 0 && diffHours <= 2) {
            appendNotification(notificationStorageKey, {
                id: `reminder-2-${appointment.id}`,
                title: "Reminder examen (2h)",
                message: `Programarea ${appointment.appointmentCode || ""} incepe curand.`,
                createdAt: now.toISOString(),
                read: false,
                link: "/dashboard",
                tag: `appointment-reminder-2h-${appointment.id}`,
            });
        }
    });
};

export const useNotifications = ({ isAuthenticated, isAdmin, user }: UseNotificationsParams) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const notificationStorageKey = getStorageKey(user);

    const loadForCurrentUser = () => {
        if (!isAuthenticated || !user || !notificationStorageKey) {
            setNotifications([]);
            return;
        }

        const fallbackNotifications = getDefaultNotifications(isAdmin);
        const storedNotifications = readNotifications(notificationStorageKey);

        if (storedNotifications.length === 0) {
            setNotifications(fallbackNotifications);
            saveNotifications(notificationStorageKey, fallbackNotifications);
            return;
        }

        setNotifications(storedNotifications);
    };

    useEffect(() => {
        loadForCurrentUser();
    }, [isAuthenticated, isAdmin, notificationStorageKey, user]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (notificationStorageKey && event.key === notificationStorageKey) {
                loadForCurrentUser();
            }

            if (!isAdmin && isAuthenticated && user && notificationStorageKey && event.key === STORAGE_KEYS.appointments) {
                pushUpcomingAppointmentReminders(notificationStorageKey, user);
            }
        };

        const handleNotificationsUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ storageKey?: string }>;
            if (notificationStorageKey && customEvent.detail?.storageKey === notificationStorageKey) {
                loadForCurrentUser();
            }
        };

        const handleAppStorageUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            if (
                !isAdmin &&
                isAuthenticated &&
                user &&
                notificationStorageKey &&
                customEvent.detail?.key === STORAGE_KEYS.appointments
            ) {
                pushUpcomingAppointmentReminders(notificationStorageKey, user);
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener("notifications-updated", handleNotificationsUpdated as EventListener);
        window.addEventListener("app-storage-updated", handleAppStorageUpdated as EventListener);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("notifications-updated", handleNotificationsUpdated as EventListener);
            window.removeEventListener("app-storage-updated", handleAppStorageUpdated as EventListener);
        };
    }, [notificationStorageKey, isAuthenticated, isAdmin, user]);

    useEffect(() => {
        if (!isAuthenticated || !notificationStorageKey) return;
        saveNotifications(notificationStorageKey, notifications);
    }, [isAuthenticated, notificationStorageKey, notifications]);

    useEffect(() => {
        if (!isAuthenticated || !user || isAdmin || !notificationStorageKey) return;
        pushUpcomingAppointmentReminders(notificationStorageKey, user);
    }, [isAdmin, isAuthenticated, notificationStorageKey, user]);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.read).length,
        [notifications]
    );

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    };
};
