type LegislativeSidebarLinkProps = {
    id: string;
    label: string;
    isActive: boolean;
    onSelect: (id: string) => void;
};

export default function LegislativeSidebarLink({ id, label, isActive, onSelect }: LegislativeSidebarLinkProps) {
    return (
        <button
            type="button"
            className={`sidebar-link ${isActive ? "active" : ""}`}
            onClick={() => onSelect(id)}
        >
            <span>{label}</span>
            <i className="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
    );
}
