import React, { useMemo, useState } from "react";
import { Search, LifeBuoy, FileText, HelpCircle, Calculator } from "lucide-react";
import { FaqItem, FaqCategory } from "@/types/support1.1";
import Sidebar from "../../components/SideBar/SideBar";
import { useScrollLock } from "../../hooks/useScrollLock";
import SupportCategoryButton from "./SupportCategoryButton";
import SupportFaqItem from "./SupportFaqItem";
import "./support.css";

const Support: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const categories: FaqCategory[] = [
        { id: "all", title: "Toate Г®ntrebДѓrile", icon: HelpCircle },
        { id: "general", title: "InformaИ›ii Generale", icon: FileText },
        { id: "exam", title: "Examen И™i Certificare", icon: Calculator },
        { id: "technical", title: "Suport Tehnic", icon: LifeBuoy },
    ];

    const faqs: (FaqItem & { category: string })[] = [
        {
            category: "general",
            question: "Cine se poate Г®nscrie la cursurile e-Electoral?",
            answer:
                "La cursurile de pe platforma e-Electoral se pot Г®nscrie toИ›i candidaИ›ii care doresc sДѓ obИ›inДѓ certificarea Г®n domeniul electoral, inclusiv viitori funcИ›ionari, observatori sau reprezentanИ›i politici.",
        },
        {
            category: "exam",
            question: "Cum pot accesa simulДѓrile de examen?",
            answer:
                "SimulДѓrile de examen pot fi accesate din secИ›iunea Resources Studiu dupДѓ autentificare. Acestea imitДѓ formatul oficial al examenului de certificare.",
        },
        {
            category: "general",
            question: "Se oferДѓ sprijin post-certificare?",
            answer:
                "Da, e-Electoral oferДѓ resurse de actualizare a cunoИ™tinИ›elor И™i dupДѓ promovarea examenului, pentru a fi la curent cu ultimele modificДѓri legislative.",
        },
        {
            category: "exam",
            question: "CГўt timp este valabil certificatul obИ›inut?",
            answer:
                "Certificatul de calificare electoralДѓ este valabil pentru o perioadДѓ de 4 ani, dupДѓ care este necesarДѓ o nouДѓ evaluare pentru reconfirmarea competenИ›elor.",
        },
        {
            category: "exam",
            question: "Ce se Г®ntГўmplДѓ dacДѓ nu promovez examenul?",
            answer:
                "ГЋn cazul Г®n care nu obИ›ineИ›i punctajul minim, aveИ›i dreptul la o reevaluare dupДѓ o perioadДѓ de studiu suplimentar. Platforma e-Electoral vДѓ va recomanda modulele pe care trebuie sДѓ le revizuiИ›i.",
        },
        {
            category: "technical",
            question: "Cum Г®mi pot recupera parola?",
            answer:
                "DacДѓ aИ›i uitat parola, utilizaИ›i funcИ›ia de recuperare de pe pagina de login. VeИ›i primi un e-mail cu instrucИ›iuni pentru setarea unei parole noi.",
        },
        {
            category: "technical",
            question: "Pot accesa cursurile de pe dispozitive mobile?",
            answer:
                "Da, platforma e-Electoral este complet responsivДѓ И™i poate fi accesatДѓ de pe smartphone sau tabletДѓ, oferind o experienИ›Дѓ de Г®nvДѓИ›are optimizatДѓ pentru orice ecran.",
        },
        {
            category: "general",
            question: "Care este durata medie a unui curs de pregДѓtire?",
            answer:
                "Durata variazДѓ Г®n funcИ›ie de complexitatea modulului, dar Г®n medie, un curs complet de pregДѓtire pentru certificare dureazДѓ Г®ntre 20 И™i 40 de ore de studiu individual.",
        },
        {
            category: "technical",
            question: "Ce fac dacДѓ Г®ntГўmpin probleme tehnice Г®n timpul simulДѓrii?",
            answer:
                "DacДѓ Г®ntГўmpinaИ›i erori tehnice, vДѓ rugДѓm sДѓ contactaИ›i echipa de suport prin formularul de contact sau sДѓ utilizaИ›i chat-ul de asistenИ›Дѓ disponibil Г®n colИ›ul din dreapta jos al ecranului.",
        },
    ];

    const filteredFaqs = useMemo(() => {
        return faqs.filter((faq) => {
            const matchesSearch =
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [activeCategory, searchQuery]);

    useScrollLock(sidebarOpen);

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
                                Cum vДѓ putem <span className="hero-title-highlight">ajuta astДѓzi?</span>
                            </h1>

                            <div className="hero-search-wrapper">
                                <Search className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="CДѓutaИ›i Г®ntrebДѓri, cursuri sau ghiduri..."
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
                                            Nu aИ›i gДѓsit rДѓspunsul? Echipa noastrДѓ este gata sДѓ vДѓ ajute.
                                        </p>
                                        <a href="/contact" className="contact-btn">
                                            ContactaИ›i-ne
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="faq-section">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, index) => (
                                        <SupportFaqItem
                                            key={`${faq.question}-${index}`}
                                            faq={faq}
                                            index={index}
                                            isOpen={openFaqIndex === index}
                                            onToggle={(nextIndex) =>
                                                setOpenFaqIndex(openFaqIndex === nextIndex ? null : nextIndex)
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="no-results">
                                        <div className="no-results-icon">
                                            <Search className="w-12 h-12 text-slate-300" />
                                        </div>
                                        <h3 className="no-results-title">Niciun rezultat gДѓsit</h3>
                                        <p className="no-results-text">
                                            Nu am gДѓsit Г®ntrebДѓri care sДѓ corespundДѓ termenilor cДѓutaИ›i. ГЋncercaИ›i o altДѓ formulare.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setActiveCategory("all");
                                            }}
                                            className="reset-btn"
                                        >
                                            ReseteazДѓ filtrele
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Support;

