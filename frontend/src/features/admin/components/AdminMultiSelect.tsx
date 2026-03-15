import React, { useId, useMemo } from "react";
import { useDropdown } from "../../../hooks/useDropdown";
import AdminMultiSelectOptionButton from "./AdminMultiSelectOptionButton";

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
    const { isOpen, setIsOpen, rootRef } = useDropdown();
    const listboxId = useId();

    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

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
                    <AdminMultiSelectOptionButton
                        label={placeholder}
                        checked={selectedValues.length === 0}
                        onSelect={() => onChange([])}
                        isClear
                    />

                    {options.map((option) => (
                        <AdminMultiSelectOptionButton
                            key={option.value}
                            label={option.label}
                            checked={selectedSet.has(option.value)}
                            onSelect={() => toggleOption(option.value)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminMultiSelect;
