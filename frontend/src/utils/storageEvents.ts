export const emitStorageUpdate = (key: string): void => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app-storage-updated", { detail: { key } }));
    }
};

export const emitNotificationsUpdated = (storageKey: string): void => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { storageKey } }));
    }
};
