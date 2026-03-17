import { useEffect } from "react";
import { STORAGE_KEYS } from "../storage";

const WATCHED_KEYS = [
    STORAGE_KEYS.tests,
    STORAGE_KEYS.settings,
    STORAGE_KEYS.users,
    STORAGE_KEYS.appointments,
    STORAGE_KEYS.quizHistory,
    STORAGE_KEYS.sentNotifications,
    STORAGE_KEYS.news,
];

export const useAdminPanelStorageListener = (refreshState: () => void) => {
    useEffect(() => {
        const watchedKeys = new Set<string>(WATCHED_KEYS);
        const handleStorageEvent = (event: StorageEvent) => {
            if (event.key && watchedKeys.has(event.key)) refreshState();
        };

        window.addEventListener("storage", handleStorageEvent);
        return () => window.removeEventListener("storage", handleStorageEvent);
    }, [refreshState]);
};
