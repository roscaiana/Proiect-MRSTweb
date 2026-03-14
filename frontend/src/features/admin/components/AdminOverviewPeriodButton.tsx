type AdminOverviewPeriodButtonProps = {
    days: 1 | 7 | 30;
    isActive: boolean;
    onSelect: (days: 1 | 7 | 30) => void;
};

export default function AdminOverviewPeriodButton({ days, isActive, onSelect }: AdminOverviewPeriodButtonProps) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`admin-btn ${isActive ? "primary" : "ghost"}`}
            onClick={() => onSelect(days)}
        >
            {days === 1 ? "Azi" : `${days} zile`}
        </button>
    );
}
