import React, { useId, useMemo } from "react";
import { useDropdown } from "../../../hooks/useDropdown";
import AdminSingleSelectOptionButton from "./AdminSingleSelectOptionButton";

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
    const { isOpen, setIsOpen, rootRef } = useDropdown();
    const listboxId = useId();

    const selectedOption = useMemo(() => options.find((option) => option.value === value), [options, value]);

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
                    {options.map((option) => (
                        <AdminSingleSelectOptionButton
                            key={option.value}
                            value={option.value}
                            label={option.label}
                            isSelected={option.value === value}
                            onSelect={(nextValue) => {
                                onChange(nextValue as T);
                                setIsOpen(false);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminSingleSelect;
