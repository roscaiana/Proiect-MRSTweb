import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type ScrollLockContextValue = {
    locked: boolean;
    acquire: (id: string) => void;
    release: (id: string) => void;
};

const ScrollLockContext = createContext<ScrollLockContextValue | null>(null);

export const ScrollLockProvider = ({ children }: { children: ReactNode }) => {
    const [locks, setLocks] = useState<Set<string>>(() => new Set());

    const acquire = useCallback((id: string) => {
        setLocks((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }, []);

    const release = useCallback((id: string) => {
        setLocks((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({
            locked: locks.size > 0,
            acquire,
            release,
        }),
        [locks, acquire, release]
    );

    return <ScrollLockContext.Provider value={value}>{children}</ScrollLockContext.Provider>;
};

export const useScrollLockContext = () => {
    const context = useContext(ScrollLockContext);
    if (!context) {
        throw new Error("useScrollLockContext must be used within ScrollLockProvider");
    }
    return context;
};
