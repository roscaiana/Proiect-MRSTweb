import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { readAdminNews, STORAGE_KEYS } from "../../features/admin/storage";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useStorageSync } from "../../hooks/useStorageSync";
import { formatDateLong } from "../../utils/dateUtils";
import LegislativeHeroTag from "./LegislativeHeroTag";
import LegislativeResourceCard, { type ResourceCard } from "./LegislativeResourceCard";
import LegislativeSidebarLink from "./LegislativeSidebarLink";
import "./LegislativeMaterialsPage.css";

type NavItem = {
    id: string;
    label: string;
    description: string;
};

type LegislativeContentItem = NavItem & ResourceCard;

const HERO_TAGS = ["Sesiunea 2026", "Actualizări legislative", "Resurse oficiale"];

const FALLBACK_ITEMS: LegislativeContentItem[] = [
    {
        id: "material-1",
        label: "Actualizări ale Codului Electoral",
        title: "Actualizări ale Codului Electoral",
        description: "Analiza principalelor modificări aduse cadrului normativ electoral.",
        tag: "Legislativ",
    },
];

function loadLegislativeItems(): LegislativeContentItem[] {
    const legislativeArticles = readAdminNews().filter((item) => item.category === "Legislativ");

    if (legislativeArticles.length === 0) {
        return FALLBACK_ITEMS;
    }

    return legislativeArticles.map((item) => ({
        id: item.id,
        label: item.title,
        title: item.title,
        description: item.description,
        tag: `${item.category} • ${formatDateLong(item.publishedAt)}`,
    }));
}

export default function LegislativeMaterialsPage() {
    const [items, setItems] = useState<LegislativeContentItem[]>(() => loadLegislativeItems());
    const [activeId, setActiveId] = useState(() => loadLegislativeItems()[0]?.id ?? "intro");
    const [activeCard, setActiveCard] = useState<ResourceCard | null>(null);

    useStorageSync([STORAGE_KEYS.news], () => {
        const nextItems = loadLegislativeItems();
        setItems(nextItems);
        setActiveId((current) =>
            nextItems.some((item) => item.id === current) ? current : (nextItems[0]?.id ?? "intro"),
        );
    });

    const activeItem = useMemo(
        () => items.find((item) => item.id === activeId) ?? items[0],
        [items, activeId],
    );

    useEscapeKey(() => setActiveCard(null), activeCard !== null);

    return (
        <section className="legislative-page">
            <div className="legislative-hero">
                <div className="container">
                    <div className="legislative-hero-content">
                        <div className="page-hero-badge">
                            <span className="page-hero-badge-icon" aria-hidden="true">
                                <FileText />
                            </span>
                            Resurse legislative
                        </div>
                        <h1>
                            Materiale legislative <span className="hero-title-highlight">pentru certificare</span>
                        </h1>
                        <p>
                            Acces rapid la materialele legislative administrate din panoul intern, actualizate pentru pregătirea de certificare.
                        </p>
                        <div className="hero-tags">
                            {HERO_TAGS.map((tag) => (
                                <LegislativeHeroTag key={tag} tag={tag} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="section legislative-body">
                <div className="container legislative-layout">
                    <aside className="legislative-sidebar">
                        <div className="sidebar-title">
                            <span>Sesiunea de certificare</span>
                            <strong>2026</strong>
                        </div>
                        <div className="sidebar-links">
                            {items.map((item) => (
                                <LegislativeSidebarLink
                                    key={item.id}
                                    id={item.id}
                                    label={item.label}
                                    isActive={activeId === item.id}
                                    onSelect={setActiveId}
                                />
                            ))}
                        </div>
                        <div className="sidebar-note">
                            <div className="note-badge">Actualizat</div>
                            <p>Conținutul de pe această pagină poate fi gestionat direct din panoul de administrare.</p>
                        </div>
                    </aside>

                    <div className="legislative-main">
                        <div className="legislative-header">
                            <span className="section-kicker">Secțiune activă</span>
                            <h2>{activeItem?.label}</h2>
                            <p>{activeItem?.description}</p>
                        </div>

                        <div className="legislative-cards">
                            {items.map((card) => (
                                <LegislativeResourceCard key={card.id} card={card} onOpen={setActiveCard} />
                            ))}
                        </div>

                        <div className="legislative-highlight">
                            <div className="highlight-icon">
                                <i className="fas fa-circle-info" aria-hidden="true"></i>
                            </div>
                            <div>
                                <h4>Notă importantă</h4>
                                <p>
                                    Materialele legislative publicate aici sunt actualizate din zona de administrare și pot fi revizuite ori de câte ori apar modificări.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeCard && (
                <div className="legislative-modal-overlay" role="dialog" aria-modal="true">
                    <div className="legislative-modal">
                        <button
                            type="button"
                            className="legislative-modal-close"
                            onClick={() => setActiveCard(null)}
                            aria-label="Închide"
                        >
                            ×
                        </button>
                        <span className="legislative-modal-tag">{activeCard.tag}</span>
                        <h2>{activeCard.title}</h2>
                        <p>{activeCard.description}</p>
                        <p>Acest material a fost publicat din panoul de administrare pentru utilizatorii platformei.</p>
                    </div>
                    <button
                        type="button"
                        className="legislative-modal-backdrop"
                        onClick={() => setActiveCard(null)}
                        aria-label="Închide"
                    />
                </div>
            )}
        </section>
    );
}
