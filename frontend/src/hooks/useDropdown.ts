import { useEffect, useRef, useState } from "react";

/**
 * Manages open/close state for a dropdown, closing it on outside click or Escape.
 * Returns isOpen, setIsOpen, and a rootRef to attach to the dropdown's root element.
 */
export function useDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent): void => {
            if (rootRef.current?.contains(event.target as Node)) {
                return;
            }
            setIsOpen(false);
        };

        const handleEscape = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return { isOpen, setIsOpen, rootRef };
}
