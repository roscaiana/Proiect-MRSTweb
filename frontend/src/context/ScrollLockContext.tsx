import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ScrollLockContextValue = {
    locked: boolean;
    lockScroll: () => void;
    unlockScroll: () => void;
    setLocked: (value: boolean) => void;
};

const ScrollLockContext = createContext<ScrollLockContextValue | undefined>(undefined);

export const ScrollLockProvider = ({ children }: { children: ReactNode }) => {
    const [locked, setLocked] = useState(false);

    const value = useMemo(
        () => ({
            locked,
            lockScroll: () => setLocked(true),
            unlockScroll: () => setLocked(false),
            setLocked,
        }),
        [locked],
    );

    return <ScrollLockContext.Provider value={value}>{children}</ScrollLockContext.Provider>;
};

export const useScrollLockContext = () => {
    const context = useContext(ScrollLockContext);
    if (!context) {
        throw new Error("useScrollLockContext must be used within a ScrollLockProvider");
    }
    return context;
};
