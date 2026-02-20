import { useEffect, useMemo, useState } from "react";
import type { User } from "../types/user";

export type AppNotification = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
};

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
    if (!user) {
        return null;
    }

    return `notifications_${user.role}_${user.email}`;
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

export const useNotifications = ({ isAuthenticated, isAdmin, user }: UseNotificationsParams) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const notificationStorageKey = getStorageKey(user);

    useEffect(() => {
        if (!isAuthenticated || !user || !notificationStorageKey) {
            setNotifications([]);
            return;
        }

        const fallbackNotifications = getDefaultNotifications(isAdmin);
        const storedNotifications = localStorage.getItem(notificationStorageKey);

        if (!storedNotifications) {
            setNotifications(fallbackNotifications);
            localStorage.setItem(notificationStorageKey, JSON.stringify(fallbackNotifications));
            return;
        }

        try {
            const parsed = JSON.parse(storedNotifications) as AppNotification[];
            if (Array.isArray(parsed)) {
                setNotifications(parsed);
                return;
            }
        } catch {
            // Reset invalid data below.
        }

        setNotifications(fallbackNotifications);
        localStorage.setItem(notificationStorageKey, JSON.stringify(fallbackNotifications));
    }, [isAuthenticated, isAdmin, notificationStorageKey, user]);

    useEffect(() => {
        if (!isAuthenticated || !notificationStorageKey) {
            return;
        }

        localStorage.setItem(notificationStorageKey, JSON.stringify(notifications));
    }, [isAuthenticated, notificationStorageKey, notifications]);

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
