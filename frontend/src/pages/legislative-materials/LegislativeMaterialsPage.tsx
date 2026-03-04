import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import "./LegislativeMaterialsPage.css";

type NavItem = {
    id: string;
    label: string;
    description: string;
};

type ResourceCard = {
    title: string;
    description: string;
    tag: string;
};

const NAV_ITEMS: NavItem[] = [
    {
        id: "bibliografie",
        label: "Bibliografia",
        description: "Lista documentelor și materialelor obligatorii pentru studiu.",
    },
    {
        id: "banca",
        label: "Banca de întrebări",
        description: "Structura întrebărilor și tematicile acoperite în evaluare.",
    },
    {
        id: "cursuri",
        label: "Cursuri",
        description: "Module de instruire organizate pe capitole și teme.",
    },
    {
        id: "elearning",
        label: "eLearning",
        description: "Resurse digitale și materiale interactive pentru învățare.",
    },
    {
        id: "video",
        label: "Materiale video",
        description: "Resurse multimedia pentru aprofundarea conținutului.",
    },
];

const RESOURCE_CARDS: ResourceCard[] = [
    {
        title: "Bibliografia",
        description: "Documentele principale și sursele oficiale recomandate pentru studiu.",
        tag: "Documente",
    },
    {
        title: "Banca de întrebări",
        description: "Exemple și structură pentru întrebările utilizate în evaluare.",
        tag: "Întrebări",
    },
    {
        title: "Cursuri",
        description: "Module de instruire organizate pe capitole și niveluri.",
        tag: "Formare",
    },
    {
        title: "eLearning",
        description: "Platformă online cu materiale interactive și resurse digitale.",
        tag: "Online",
    },
];

const HERO_TAGS = ["Sesiunea 2026", "Actualizări legislative", "Resurse oficiale"];

export default function LegislativeMaterialsPage() {
    const [activeId, setActiveId] = useState(NAV_ITEMS[0]?.id ?? "intro");
    const [activeCard, setActiveCard] = useState<ResourceCard | null>(null);

    const activeItem = NAV_ITEMS.find((item) => item.id === activeId) ?? NAV_ITEMS[0];

    useEffect(() => {
        if (!activeCard) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveCard(null);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [activeCard]);

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
                            Materiale legislative{" "}
                            <span className="hero-title-highlight">pentru certificare</span>
                        </h1>
                        <p>
                            Acces rapid la cadrul normativ actualizat, structurat pe categorii, pentru o pregătire eficientă și riguroasă.
                        </p>
                        <div className="hero-tags">
                            {HERO_TAGS.map((tag) => (
                                <span key={tag} className="hero-tag">
                                    {tag}
                                </span>
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
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`sidebar-link ${activeId === item.id ? "active" : ""}`}
                                    onClick={() => setActiveId(item.id)}
                                >
                                    <span>{item.label}</span>
                                    <i className="fas fa-chevron-right" aria-hidden="true"></i>
                                </button>
                            ))}
                        </div>
                        <div className="sidebar-note">
                            <div className="note-badge">Actualizat</div>
                            <p>Elementele esențiale sunt marcate cu accente galbene pentru claritate.</p>
                        </div>
                    </aside>

                    <div className="legislative-main">
                        <div className="legislative-header">
                            <span className="section-kicker">Secțiune activă</span>
                            <h2>{activeItem?.label}</h2>
                            <p>{activeItem?.description}</p>
                        </div>

                        <div className="legislative-cards">
                            {RESOURCE_CARDS.map((card) => (
                                <article
                                    key={card.title}
                                    className="legislative-card"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Deschide materialul: ${card.title}`}
                                    onClick={() => setActiveCard(card)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            setActiveCard(card);
                                        }
                                    }}
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
                            ))}
                        </div>

                        <div className="legislative-highlight">
                            <div className="highlight-icon">
                                <i className="fas fa-circle-info" aria-hidden="true"></i>
                            </div>
                            <div>
                                <h4>Notă importantă</h4>
                                <p>
                                    Toate materialele sunt prezentate pentru studiu și informare. Versiunile oficiale pot fi consultate în format complet pe site-ul oficial CICDE.
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
                        <p>
                            Materialele complete pot fi consultate în format oficial pe site-ul CICDE.
                        </p>
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
