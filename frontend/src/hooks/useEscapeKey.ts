import { useEffect, useRef } from "react";

/**
 * Calls onEscape when the user presses the Escape key, but only while enabled is true.
 * Typically used to close modals/panels.
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean): void {
    const onEscapeRef = useRef(onEscape);
    onEscapeRef.current = onEscape;

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                onEscapeRef.current();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enabled]);
}
