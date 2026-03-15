import type { LucideIcon } from "lucide-react";

type TermsPrincipleCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
};

export default function TermsPrincipleCard({ title, description, icon: Icon }: TermsPrincipleCardProps) {
    return (
        <article className="terms-principle-card">
            <span className="terms-principle-icon" aria-hidden="true">
                <Icon size={18} />
            </span>
            <h2>{title}</h2>
            <p>{description}</p>
        </article>
    );
}
