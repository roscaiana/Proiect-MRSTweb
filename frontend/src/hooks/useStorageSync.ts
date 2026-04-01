import { useEffect, useRef } from "react";

/**
 * Listens to both the native `storage` event and the custom `app-storage-updated`
 * event, calling onSync whenever one of the watched keys changes.
 *
 * Pass a stable (constant) array for `keys`. The callback can change between renders -
 * it is read from a ref so the listener always calls the latest version.
 */
export function useStorageSync(keys: string[], onSync: () => void): void {
    const onSyncRef = useRef(onSync);
    const keysRef = useRef(keys);

    useEffect(() => {
        onSyncRef.current = onSync;
    }, [onSync]);

    useEffect(() => {
        keysRef.current = keys;
    }, [keys]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent): void => {
            if (event.key && keysRef.current.includes(event.key)) {
                onSyncRef.current();
            }
        };

        const handleAppStorage = (event: Event): void => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            const key = customEvent.detail?.key;
            if (key && keysRef.current.includes(key)) {
                onSyncRef.current();
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener("app-storage-updated", handleAppStorage as EventListener);
        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("app-storage-updated", handleAppStorage as EventListener);
        };
    }, []);
}
