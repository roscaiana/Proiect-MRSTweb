import { handleKeyActivation } from "../../utils/a11yUtils";

type ResourceCard = {
    title: string;
    description: string;
    tag: string;
};

type LegislativeResourceCardProps = {
    card: ResourceCard;
    onOpen: (card: ResourceCard) => void;
};

export type { ResourceCard };

export default function LegislativeResourceCard({ card, onOpen }: LegislativeResourceCardProps) {
    return (
        <article
            className="legislative-card"
            role="button"
            tabIndex={0}
            aria-label={`Deschide materialul: ${card.title}`}
            onClick={() => onOpen(card)}
            onKeyDown={handleKeyActivation(() => onOpen(card))}
        >
            <div className="card-top">
                <span className="card-tag">{card.tag}</span>
                <span className="card-arrow" aria-hidden="true">
                    →
                </span>
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
        </article>
    );
}
