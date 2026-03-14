type AdminSingleSelectOptionButtonProps = {
    value: string;
    label: string;
    isSelected: boolean;
    onSelect: (value: string) => void;
};

export default function AdminSingleSelectOptionButton({
    value,
    label,
    isSelected,
    onSelect,
}: AdminSingleSelectOptionButtonProps) {
    return (
        <button
            type="button"
            className={`admin-multi-select-option ${isSelected ? "is-active" : ""}`}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(value)}
        >
            <span>{label}</span>
            {isSelected && <i className="fas fa-check admin-single-select-check" aria-hidden="true"></i>}
        </button>
    );
}
