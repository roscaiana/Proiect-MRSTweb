import { ChevronDown } from "lucide-react";
import TermsSectionPoint from "./TermsSectionPoint";

type TermsSection = {
    id: string;
    title: string;
    summary: string;
    points: string[];
    note?: string;
};

type TermsAccordionItemProps = {
    section: TermsSection;
    isOpen: boolean;
    onToggle: (sectionId: string) => void;
};

export default function TermsAccordionItem({ section, isOpen, onToggle }: TermsAccordionItemProps) {
    const triggerId = `terms-trigger-${section.id}`;
    const panelId = `terms-panel-${section.id}`;

    return (
        <article id={`terms-item-${section.id}`} className={`terms-accordion-item ${isOpen ? "is-open" : ""}`}>
            <button
                id={triggerId}
                type="button"
                className="terms-accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => onToggle(section.id)}
            >
                <span className="terms-accordion-title-group">
                    <span className="terms-accordion-title">{section.title}</span>
                    <span className="terms-accordion-summary">{section.summary}</span>
                </span>
                <span className="terms-accordion-chevron" aria-hidden="true">
                    <ChevronDown size={18} />
                </span>
            </button>

            <div id={panelId} role="region" aria-labelledby={triggerId} className="terms-accordion-panel">
                <div className="terms-accordion-panel-inner">
                    <ul className="terms-bullet-list">
                        {section.points.map((point) => (
                            <TermsSectionPoint key={point} point={point} />
                        ))}
                    </ul>
                    {section.note ? <p className="terms-note">{section.note}</p> : null}
                </div>
            </div>
        </article>
    );
}
