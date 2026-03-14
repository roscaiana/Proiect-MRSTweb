/**
 * Returns an onKeyDown handler that triggers the callback on Enter or Space.
 * Use for elements that have role="button" but are not <button> elements.
 */
export const handleKeyActivation =
    (callback: () => void) =>
    (event: React.KeyboardEvent): void => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            callback();
        }
    };
