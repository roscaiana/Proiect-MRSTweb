import { useEffect, useId } from "react";
import { useScrollLockContext } from "../context/ScrollLockContext";

export const useScrollLock = (locked: boolean) => {
    const id = useId();
    const { acquire, release } = useScrollLockContext();

    useEffect(() => {
        if (locked) {
            acquire(id);
        } else {
            release(id);
        }

        return () => {
            release(id);
        };
    }, [locked, id, acquire, release]);
};
