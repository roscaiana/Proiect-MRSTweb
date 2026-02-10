import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, LifeBuoy, FileText, HelpCircle, Calculator } from 'lucide-react';
import { FaqItem, FaqCategory } from '../types';
import TopBar from "../HomePage/TopBar/TopBar";
import Header from "../HomePage/Header/Header";
import Sidebar from "../HomePage/SideBar/SideBar";
import Footer from "../HomePage/Footer/Footer";
import './Support.css';

const Support: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const categories: FaqCategory[] = [
        { id: 'all', title: 'Toate întrebările', icon: HelpCircle },
        { id: 'general', title: 'Informații Generale', icon: FileText },
        { id: 'exam', title: 'Examen și Certificare', icon: Calculator },
        { id: 'technical', title: 'Suport Tehnic', icon: LifeBuoy },
    ];

    const faqs: (FaqItem & { category: string })[] = [
        {
            category: 'general',
            question: 'Cine se poate înscrie la cursurile e-Electoral?',
            answer: 'La cursurile de pe platforma e-Electoral se pot înscrie toți candidații care doresc să obțină certificarea în domeniul electoral, inclusiv viitori funcționari, observatori sau reprezentanți politici.'
        },
        {
            category: 'exam',
            question: 'Cum pot accesa simulările de examen?',
            answer: 'Simulările de examen pot fi accesate din secțiunea Resources Studiu după autentificare. Acestea imită formatul oficial al examenului de certificare.'
        },
        {
            category: 'general',
            question: 'Se oferă sprijin post-certificare?',
            answer: 'Da, e-Electoral oferă resurse de actualizare a cunoștințelor și după promovarea examenului, pentru a fi la curent cu ultimele modificări legislative.'
        },
        {
            category: 'exam',
            question: 'Cât timp este valabil certificatul obținut?',
            answer: 'Certificatul de calificare electorală este valabil pentru o perioadă de 4 ani, după care este necesară o nouă evaluare pentru reconfirmarea competențelor.'
        },
        {
            category: 'exam',
            question: 'Ce se întâmplă dacă nu promovez examenul?',
            answer: 'În cazul în care nu obțineți punctajul minim, aveți dreptul la o reevaluare după o perioadă de studiu suplimentar. Platforma e-Electoral vă va recomanda modulele pe care trebuie să le revizuiți.'
        },
        {
            category: 'technical',
            question: 'Cum îmi pot recupera parola?',
            answer: 'Dacă ați uitat parola, utilizați funcția de recuperare de pe pagina de login. Veți primi un e-mail cu instrucțiuni pentru setarea unei parole noi.'
        },
        {
            category: 'technical',
            question: 'Pot accesa cursurile de pe dispozitive mobile?',
            answer: 'Da, platforma e-Electoral este complet responsivă și poate fi accesată de pe smartphone sau tabletă, oferind o experiență de învățare optimizată pentru orice ecran.'
        },
        {
            category: 'general',
            question: 'Care este durata medie a unui curs de pregătire?',
            answer: 'Durata variază în funcție de complexitatea modulului, dar în medie, un curs complet de pregătire pentru certificare durează între 20 și 40 de ore de studiu individual.'
        },
        {
            category: 'technical',
            question: 'Ce fac dacă întâmpin probleme tehnice în timpul simulării?',
            answer: 'Dacă întâmpinați erori tehnice, vă rugăm să contactați echipa de suport prin formularul de contact sau să utilizați chat-ul de asistență disponibil în colțul din dreapta jos al ecranului.'
        }
    ];

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const openSidebar = () => {
        setSidebarOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        document.body.style.overflow = "";
    };

    return (
        <>
            <TopBar />
            <Header onOpenSidebar={openSidebar} />
            <Sidebar open={sidebarOpen} onClose={closeSidebar} />
            <main>
                <div className="support-container">
            {/* Hero Section */}
            <div className="support-hero">
                <div className="hero-overlay-1"></div>
                <div className="hero-overlay-2"></div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <LifeBuoy className="w-4 h-4 text-blue-200" />
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
                    {/* Sidebar Section */}
                    <div className="support-sidebar">
                        {/* Categories Box */}
                        <div className="categories-box">
                            <h2 className="categories-title">CATEGORII</h2>
                            <div className="category-list">
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`category-btn ${isActive ? 'active' : ''}`}
                                        >
                                            <Icon className="category-icon" />
                                            {cat.title}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Direct Support Card */}
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
                                <a href="/contact" className="contact-btn">
                                    Contactați-ne
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Content Section */}
                    <div className="faq-section">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq: FaqItem, idx: number) => (
                                <div
                                    key={idx}
                                    className={`faq-item ${openFaqIndex === idx ? 'active' : ''}`}
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                        className="faq-question-btn"
                                    >
                                        <span className="faq-question-text">{faq.question}</span>
                                        <div className="faq-icon-wrapper">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </button>
                                    <div className="faq-answer-wrapper">
                                        <div className="faq-answer-inner">
                                            <div className="faq-answer-content">
                                                <div className="faq-divider"></div>
                                                <p className="faq-answer-text">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <div className="no-results-icon">
                                    <Search className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="no-results-title">Niciun rezultat găsit</h3>
                                <p className="no-results-text">Nu am găsit întrebări care să corespundă termenilor căutați. Încercați o altă formulare.</p>
                                <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="reset-btn">
                                    Resetează filtrele
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
            </main>
            <Footer />
        </>
    );
};

export default Support;
