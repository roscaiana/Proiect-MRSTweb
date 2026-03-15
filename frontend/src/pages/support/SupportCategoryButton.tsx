import type { LucideIcon } from "lucide-react";

type SupportCategoryButtonProps = {
    id: string;
    title: string;
    icon: LucideIcon;
    isActive: boolean;
    onSelect: (id: string) => void;
};

export default function SupportCategoryButton({
    id,
    title,
    icon: Icon,
    isActive,
    onSelect,
}: SupportCategoryButtonProps) {
    return (
        <button onClick={() => onSelect(id)} className={`category-btn ${isActive ? "active" : ""}`}>
            <Icon className="category-icon" />
            {title}
        </button>
    );
}
