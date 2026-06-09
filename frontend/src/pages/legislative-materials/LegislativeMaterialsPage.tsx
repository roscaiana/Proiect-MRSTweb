import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { legislativeMaterialService } from "../../services";
import type { LegislativeMaterialDto } from "../../services";
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
const ALL_MATERIALS_ID = "all";

function mapLegislativeMaterial(item: LegislativeMaterialDto): LegislativeContentItem {
    return {
        id: String(item.id),
        label: item.title,
        title: item.title,
        description: item.description,
        tag: `${item.category} • ${formatDateLong(item.publishedAt)}`,
        sourceUrl: item.sourceUrl,
    };
}

export default function LegislativeMaterialsPage() {
    const [items, setItems] = useState<LegislativeContentItem[]>([]);
    const [activeId, setActiveId] = useState(ALL_MATERIALS_ID);
    const [activeCard, setActiveCard] = useState<ResourceCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadMaterials = async () => {
            try {
                setLoading(true);
                setLoadError("");
                const data = await legislativeMaterialService.getPublished();
                const nextItems = data.map(mapLegislativeMaterial);

                if (!ignore) {
                    setItems(nextItems);
                    setActiveId((current) =>
                        current === ALL_MATERIALS_ID || nextItems.some((item) => item.id === current)
                            ? current
                            : ALL_MATERIALS_ID,
                    );
                }
            } catch {
                if (!ignore) {
                    setLoadError("Materialele legislative nu au putut fi încărcate din backend.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        void loadMaterials();

        return () => {
            ignore = true;
        };
    }, []);

    const activeItem = useMemo(
        () => items.find((item) => item.id === activeId) ?? items[0],
        [items, activeId],
    );

    const isAllSelected = activeId === ALL_MATERIALS_ID;
    const visibleCards = isAllSelected ? items : activeItem ? [activeItem] : [];

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
                            <LegislativeSidebarLink
                                id={ALL_MATERIALS_ID}
                                label="Toate materialele"
                                isActive={isAllSelected}
                                onSelect={setActiveId}
                            />
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
                    </aside>

                    <div className="legislative-main">
                        <div className="legislative-header">
                            <span className="section-kicker">Secțiune activă</span>
                            {loading ? (
                                <>
                                    <h2>Se încarcă materialele...</h2>
                                    <p>Materialele legislative sunt citite din backend.</p>
                                </>
                            ) : loadError ? (
                                <>
                                    <h2>Materialele nu au fost încărcate</h2>
                                    <p>{loadError}</p>
                                </>
                            ) : isAllSelected ? (
                                <>
                                    <h2>Toate materialele legislative</h2>
                                    <p>Alege un material din listă sau deschide documentul direct din card.</p>
                                </>
                            ) : activeItem ? (
                                <>
                                    <h2>{activeItem.label}</h2>
                                    <p>{activeItem.description}</p>
                                </>
                            ) : (
                                <>
                                    <h2>Nu există materiale publicate</h2>
                                    <p>Materialele adăugate de admin vor apărea aici după publicare.</p>
                                </>
                            )}
                        </div>

                        <div className="legislative-cards">
                            {visibleCards.map((card) => (
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
                        {activeCard.sourceUrl && (
                            <a
                                className="admin-btn primary"
                                href={activeCard.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Deschide documentul
                            </a>
                        )}
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
