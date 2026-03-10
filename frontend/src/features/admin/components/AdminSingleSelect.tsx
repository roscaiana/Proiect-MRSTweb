import React, { useEffect, useId, useMemo, useRef, useState } from "react";

export type AdminSingleSelectOption<T extends string> = {
    value: T;
    label: string;
};

type AdminSingleSelectProps<T extends string> = {
    options: ReadonlyArray<AdminSingleSelectOption<T>>;
    value: T;
    onChange: (nextValue: T) => void;
    ariaLabel: string;
    placeholder?: string;
};

const AdminSingleSelect = <T extends string,>({
    options,
    value,
    onChange,
    ariaLabel,
    placeholder = "Selectează",
}: AdminSingleSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const listboxId = useId();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (rootRef.current?.contains(event.target as Node)) {
                return;
            }
            setIsOpen(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
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

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options, value]
    );

    return (
        <div className={`admin-multi-select ${isOpen ? "is-open" : ""}`} ref={rootRef}>
            <button
                type="button"
                className="admin-multi-select-trigger"
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className={`admin-multi-select-value ${!selectedOption ? "is-placeholder" : ""}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <span className="admin-multi-select-caret" aria-hidden="true">
                    <i className="fas fa-chevron-down"></i>
                </span>
            </button>

            {isOpen && (
                <div className="admin-multi-select-menu" id={listboxId} role="listbox">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                type="button"
                                key={option.value}
                                className={`admin-multi-select-option ${isSelected ? "is-active" : ""}`}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{option.label}</span>
                                {isSelected && <i className="fas fa-check admin-single-select-check" aria-hidden="true"></i>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminSingleSelect;
