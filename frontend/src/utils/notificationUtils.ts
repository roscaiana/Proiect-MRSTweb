export type NotificationRole = "admin" | "user";

export type AppNotification = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
};

export const buildNotificationStorageKey = (role: NotificationRole, email: string): string => {
    return `notifications_${role}_${email}`;
};

export const readNotifications = (storageKey: string): AppNotification[] => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as AppNotification[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveNotifications = (storageKey: string, notifications: AppNotification[]): void => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
};

export const appendNotification = (storageKey: string, notification: AppNotification): void => {
    const existing = readNotifications(storageKey);
    const next = [notification, ...existing].slice(0, 100);
    saveNotifications(storageKey, next);
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("notifications-updated", {
                detail: { storageKey },
            })
        );
    }
};
