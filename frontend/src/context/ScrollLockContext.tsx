import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ScrollLockContextValue = {
    locked: boolean;
    setLocked: (value: boolean) => void;
    lock: () => void;
    unlock: () => void;
};

const ScrollLockContext = createContext<ScrollLockContextValue | undefined>(undefined);

type ScrollLockProviderProps = {
    children: ReactNode;
};

export function ScrollLockProvider({ children }: ScrollLockProviderProps) {
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("no-scroll", locked);

        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [locked]);

    const value = useMemo<ScrollLockContextValue>(
        () => ({
            locked,
            setLocked,
            lock: () => setLocked(true),
            unlock: () => setLocked(false),
        }),
        [locked]
    );

    return <ScrollLockContext.Provider value={value}>{children}</ScrollLockContext.Provider>;
}

export function useScrollLockContext() {
    const context = useContext(ScrollLockContext);

    if (!context) {
        throw new Error("useScrollLockContext must be used within a ScrollLockProvider");
    }

    return context;
}
