type AdminMultiSelectOptionButtonProps = {
    label: string;
    checked: boolean;
    onSelect: () => void;
    isClear?: boolean;
};

export default function AdminMultiSelectOptionButton({
    label,
    checked,
    onSelect,
    isClear = false,
}: AdminMultiSelectOptionButtonProps) {
    return (
        <button
            type="button"
            className={`admin-multi-select-option ${isClear ? "admin-multi-select-option-clear " : ""}${checked ? "is-active" : ""}`}
            role="option"
            aria-selected={checked}
            onClick={onSelect}
        >
            <span className="admin-multi-select-checkbox" aria-hidden="true">
                {checked ? "✓" : ""}
            </span>
            <span>{label}</span>
        </button>
    );
}
