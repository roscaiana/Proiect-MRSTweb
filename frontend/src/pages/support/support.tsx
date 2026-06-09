import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, LifeBuoy, FileText, HelpCircle, Calculator } from "lucide-react";
import { FaqItem, FaqCategory } from "@/types/support1.1";
import { supportQuestionService } from "../../services";
import type { SupportQuestionDto } from "../../services";
import Sidebar from "../../components/SideBar/SideBar";
import SupportCategoryButton from "./SupportCategoryButton";
import SupportFaqItem from "./SupportFaqItem";
import "./support.css";

const Support: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [supportQuestions, setSupportQuestions] = useState<SupportQuestionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const categories: FaqCategory[] = [
        { id: "all", title: "Toate întrebările", icon: HelpCircle },
        { id: "general", title: "Informații Generale", icon: FileText },
        { id: "exam", title: "Examen și Certificare", icon: Calculator },
        { id: "technical", title: "Suport Tehnic", icon: LifeBuoy },
    ];

    const faqs: (FaqItem & { id: number; category: string })[] = useMemo(
        () =>
            supportQuestions.map((item) => ({
                id: item.id,
                category: item.category,
                question: item.question,
                answer: item.answer,
            })),
        [supportQuestions],
    );

    const filteredFaqs = useMemo(() => {
        return faqs.filter((faq) => {
            const matchesSearch =
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [activeCategory, faqs, searchQuery]);

    useEffect(() => {
        let ignore = false;

        const loadSupportQuestions = async () => {
            try {
                setLoading(true);
                setLoadError("");
                const data = await supportQuestionService.getPublished();
                if (!ignore) {
                    setSupportQuestions(data);
                }
            } catch {
                if (!ignore) {
                    setLoadError("Întrebările de suport nu au putut fi încărcate din backend.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        void loadSupportQuestions();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        setOpenFaqIndex(null);
    }, [activeCategory, searchQuery]);

    useEffect(() => {
        const body = globalThis["document"]?.body;
        body?.classList.toggle("no-scroll", sidebarOpen);
        return () => {
            body?.classList.remove("no-scroll");
        };
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <>
            <Sidebar open={sidebarOpen} onClose={closeSidebar} />
            <main>
                <div className="support-container">
                    <div className="support-hero">
                        <div className="hero-overlay-1"></div>
                        <div className="hero-overlay-2"></div>

                        <div className="hero-content">
                            <div className="page-hero-badge">
                                <span className="page-hero-badge-icon" aria-hidden="true">
                                    <LifeBuoy />
                                </span>
                                <span className="uppercase">Centrul de Ajutor e-Electoral</span>
                            </div>

                            <h1 className="hero-title">
                                Cum vă putem <span className="hero-title-highlight">ajuta astăzi?</span>
                            </h1>

                            <div className="hero-search-wrapper">
                                <Search className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Căutați întrebări, cursuri sau ghiduri..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="main-content">
                        <div className="support-grid">
                            <div className="support-sidebar">
                                <div className="categories-box">
                                    <h2 className="categories-title">CATEGORII</h2>
                                    <div className="category-list">
                                        {categories.map((category) => (
                                            <SupportCategoryButton
                                                key={category.id}
                                                id={category.id}
                                                title={category.title}
                                                icon={category.icon}
                                                isActive={activeCategory === category.id}
                                                onSelect={setActiveCategory}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="direct-support-card">
                                    <div className="support-blob"></div>
                                    <div className="support-card-content">
                                        <h3 className="support-card-title">
                                            <span className="support-card-dot"></span>
                                            SUPORT DIRECT
                                        </h3>
                                        <p className="support-card-text">
                                            Nu ați găsit răspunsul? Echipa noastră este gata să vă ajute.
                                        </p>
                                        <Link to="/contact" className="contact-btn">
                                            Contactați-ne
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="faq-section">
                                {loading && <div className="support-loading">Se încarcă întrebările de suport...</div>}

                                {loadError && (
                                    <div className="support-alert" role="alert">
                                        {loadError}
                                    </div>
                                )}

                                {!loading && !loadError && filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, index) => (
                                        <SupportFaqItem
                                            key={faq.id}
                                            faq={faq}
                                            index={index}
                                            isOpen={openFaqIndex === index}
                                            onToggle={(nextIndex) =>
                                                setOpenFaqIndex(openFaqIndex === nextIndex ? null : nextIndex)
                                            }
                                        />
                                    ))
                                ) : null}

                                {!loading && !loadError && filteredFaqs.length === 0 ? (
                                    <div className="no-results">
                                        <div className="no-results-icon">
                                            <Search className="w-12 h-12 text-slate-300" />
                                        </div>
                                        <h3 className="no-results-title">Niciun rezultat găsit</h3>
                                        <p className="no-results-text">
                                            Nu am găsit întrebări care să corespundă termenilor căutați. Încercați o altă formulare.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setActiveCategory("all");
                                            }}
                                            className="reset-btn"
                                        >
                                            Resetează filtrele
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Support;
