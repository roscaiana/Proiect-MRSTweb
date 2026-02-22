import { useEffect, useMemo, useState } from "react";
import type { User } from "../types/user";
import {
    AppNotification,
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
    if (!user) {
        return null;
    }

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
        };

        const handleNotificationsUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ storageKey?: string }>;
            if (notificationStorageKey && customEvent.detail?.storageKey === notificationStorageKey) {
                loadForCurrentUser();
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener(
            "notifications-updated",
            handleNotificationsUpdated as EventListener
        );

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(
                "notifications-updated",
                handleNotificationsUpdated as EventListener
            );
        };
    }, [notificationStorageKey, isAuthenticated, isAdmin, user]);

    useEffect(() => {
        if (!isAuthenticated || !notificationStorageKey) {
            return;
        }

        saveNotifications(notificationStorageKey, notifications);
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
