import { createContext, useContext, useState, type ReactNode } from "react";

type ScrollLockContextValue = {
    locked: boolean;
    setLocked: (locked: boolean) => void;
    lock: () => void;
    unlock: () => void;
};

const ScrollLockContext = createContext<ScrollLockContextValue | undefined>(undefined);

type ScrollLockProviderProps = {
    children: ReactNode;
};

export const ScrollLockProvider = ({ children }: ScrollLockProviderProps) => {
    const [locked, setLocked] = useState(false);

    const lock = () => setLocked(true);
    const unlock = () => setLocked(false);

    return (
        <ScrollLockContext.Provider value={{ locked, setLocked, lock, unlock }}>
            {children}
        </ScrollLockContext.Provider>
    );
};

export const useScrollLockContext = () => {
    const context = useContext(ScrollLockContext);
    if (!context) {
        throw new Error("useScrollLockContext must be used within a ScrollLockProvider");
    }
    return context;
};
