import React, { useState, useMemo } from 'react';
import { Search, Calendar, ArrowRight, Newspaper, Bell, FileText, Users, Globe, Info } from 'lucide-react';
import { Resource } from '@/types/news';
import './News.css';

// Using Resource type as NewsItem since they share similar structure
const mockNews: Resource[] = [
    {
        id: 1,
        title: "Rezultatele Sesiunii de Certificare 2025",
        price: 0,
        description: "A fost finalizată centralizarea rezultatelor pentru sesiunea de certificare 2025. Felicitări celor 7764 de candidați care au promovat!",
        category: "Certificare",
        image: "cert",
        rating: { rate: 5, count: 2025 } // Using rating fields for metadata (Year/Count)
    },
    {
        id: 2,
        title: "Lansarea Programului de Instruire pentru Observatori",
        price: 0,
        description: "CICDE lansează noul modul de instruire dedicat observatorilor naționali și internaționali pentru următoarele scrutine.",
        category: "Instruiri",
        image: "users",
        rating: { rate: 4.8, count: 156 }
    },
    {
        id: 3,
        title: "Actualizări ale Codului Electoral: Ce trebuie să știți",
        price: 0,
        description: "Analiza principalelor modificări aduse Codului Electoral și impactul acestora asupra procesului de certificare a funcționarilor.",
        category: "Legislativ",
        image: "law",
        rating: { rate: 4.9, count: 890 }
    },
    {
        id: 4,
        title: "Calendarul Electoral pentru Alegerile Locale 2026",
        price: 0,
        description: "Consultă etapele principale și termenele limită pentru organizarea scrutinelelor locale de anul viitor.",
        category: "Evenimente",
        image: "calendar",
        rating: { rate: 4.7, count: 423 }
    },
    {
        id: 5,
        title: "Nouă Platformă e-Electoral: Ghid de Utilizare",
        price: 0,
        description: "Am lansat o interfață modernizată pentru a facilita accesul la resursele de studiu și simulările de examen.",
        category: "Platformă",
        image: "web",
        rating: { rate: 5.0, count: 12000 }
    },
    {
        id: 6,
        title: "Parteneriat CICDE cu Organizații Internaționale",
        price: 0,
        description: "Colaborare nouă pentru schimbul de bune practici în domeniul educației electorale la nivel european.",
        category: "Extern",
        image: "globe",
        rating: { rate: 4.6, count: 75 }
    }
];

const getIcon = (type: string) => {
    switch (type) {
        case 'cert': return <FileText className="w-12 h-12 text-[#003366]" />;
        case 'users': return <Users className="w-12 h-12 text-[#003366]" />;
        case 'law': return <Info className="w-12 h-12 text-[#003366]" />;
        case 'calendar': return <Calendar className="w-12 h-12 text-[#003366]" />;
        case 'web': return <Bell className="w-12 h-12 text-[#003366]" />;
        case 'globe': return <Globe className="w-12 h-12 text-[#003366]" />;
        default: return <Newspaper className="w-12 h-12 text-[#003366]" />;
    }
};

const News: React.FC = () => {
    const [news] = useState<Resource[]>(mockNews);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNews = useMemo(() => {
        return news.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [news, searchQuery]);

    return (
        <div className="news-container">
            {/* Hero Section */}
            <div className="news-hero">
                <div className="hero-overlay-1"></div>
                <div className="hero-overlay-2"></div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <Newspaper className="w-4 h-4 text-blue-200" />
                        <span className="uppercase">Noutăți e-Electoral</span>
                    </div>

                    <h1 className="hero-title">
                        Noutăți <span className="hero-title-highlight">e-Electoral</span>
                    </h1>

                    <p className="hero-subtitle">
                        Rămâneți la curent cu cele mai recente știri din domeniul electoral, sesiunile de certificare și evenimentele CICDE.
                    </p>

                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Căutați știri, evenimente sau actualizări..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="main-content">
                <div className="news-grid">
                    {filteredNews.map((item: Resource) => (
                        <div key={item.id} className="news-card group">
                            <div className="image-wrapper">
                                <span className="category-badge yellow-badge">{item.category}</span>
                                <div className="icon-display">
                                    {getIcon(item.image)}
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="news-date">
                                    <Calendar className="w-3 h-3 text-yellow-500" />
                                    <span>24 Februarie 2026</span>
                                </div>
                                <h3 className="news-title group-hover:text-[#003366] transition-colors">{item.title}</h3>
                                <p className="news-desc">{item.description}</p>

                                <button className="read-more-btn-yellow">
                                    Citește Mai Mult
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default News;
