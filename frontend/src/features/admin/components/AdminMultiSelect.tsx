import React, { useEffect, useId, useMemo, useRef, useState } from "react";

export type AdminMultiSelectOption<T extends string> = {
    value: T;
    label: string;
};

type AdminMultiSelectProps<T extends string> = {
    options: ReadonlyArray<AdminMultiSelectOption<T>>;
    selectedValues: ReadonlyArray<T>;
    onChange: (nextValues: T[]) => void;
    ariaLabel: string;
    placeholder?: string;
};

const AdminMultiSelect = <T extends string,>({
    options,
    selectedValues,
    onChange,
    ariaLabel,
    placeholder = "Toate",
}: AdminMultiSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const listboxId = useId();

    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

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

    const summaryLabel = useMemo(() => {
        const selectedLabels = options.filter((option) => selectedSet.has(option.value)).map((option) => option.label);

        if (selectedLabels.length === 0) {
            return placeholder;
        }

        if (selectedLabels.length <= 2) {
            return selectedLabels.join(", ");
        }

        return `${selectedLabels.length} selectate`;
    }, [options, placeholder, selectedSet]);

    const toggleOption = (value: T) => {
        if (selectedSet.has(value)) {
            onChange(selectedValues.filter((item) => item !== value));
            return;
        }

        onChange([...selectedValues, value]);
    };

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
                <span className={`admin-multi-select-value ${selectedValues.length === 0 ? "is-placeholder" : ""}`}>
                    {summaryLabel}
                </span>
                <span className="admin-multi-select-caret" aria-hidden="true">
                    <i className="fas fa-chevron-down"></i>
                </span>
            </button>

            {isOpen && (
                <div className="admin-multi-select-menu" id={listboxId} role="listbox" aria-multiselectable="true">
                    <button
                        type="button"
                        className={`admin-multi-select-option admin-multi-select-option-clear ${selectedValues.length === 0 ? "is-active" : ""}`}
                        role="option"
                        aria-selected={selectedValues.length === 0}
                        onClick={() => onChange([])}
                    >
                        <span className="admin-multi-select-checkbox" aria-hidden="true">
                            {selectedValues.length === 0 ? "✓" : ""}
                        </span>
                        <span>{placeholder}</span>
                    </button>

                    {options.map((option) => {
                        const checked = selectedSet.has(option.value);
                        return (
                            <button
                                type="button"
                                key={option.value}
                                className={`admin-multi-select-option ${checked ? "is-active" : ""}`}
                                role="option"
                                aria-selected={checked}
                                onClick={() => toggleOption(option.value)}
                            >
                                <span className="admin-multi-select-checkbox" aria-hidden="true">
                                    {checked ? "✓" : ""}
                                </span>
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminMultiSelect;
