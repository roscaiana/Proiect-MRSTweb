export type NotificationRole = "admin" | "user";

export type AppNotification = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    link?: string;
    tag?: string;
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
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.map((item) => ({
            id: String(item?.id || `notif-${Date.now()}`),
            title: String(item?.title || ""),
            message: String(item?.message || ""),
            createdAt: item?.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
            read: Boolean(item?.read),
            link: typeof item?.link === "string" && item.link.trim() ? item.link.trim() : undefined,
            tag: typeof item?.tag === "string" && item.tag.trim() ? item.tag.trim() : undefined,
        }));
    } catch {
        return [];
    }
};

export const saveNotifications = (storageKey: string, notifications: AppNotification[]): void => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
};

export const appendNotification = (storageKey: string, notification: AppNotification): void => {
    const existing = readNotifications(storageKey);
    if (notification.tag && existing.some((item) => item.tag === notification.tag)) {
        return;
    }
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
