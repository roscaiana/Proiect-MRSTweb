import React, { useEffect, useMemo, useState } from 'react';
import { Search, Calendar, Newspaper, Bell, FileText, Users, Globe, Info } from 'lucide-react';
import './News.css';

type NewsDisplayItem = {
    id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    publishedAt: string;
};

function loadNewsFromStorage(): NewsDisplayItem[] {
    try {
        const raw = localStorage.getItem("adminNews");
        if (raw) {
            const parsed = JSON.parse(raw) as any[];
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((item, i) => ({
                    id: item.id || String(i),
                    title: item.title || "",
                    description: item.description || "",
                    category: item.category || "",
                    image: item.image || "cert",
                    publishedAt: item.publishedAt || new Date().toISOString(),
                }));
            }
        }
    } catch {
        // ignore
    }
    return [];
}

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
    const [news, setNews] = useState<NewsDisplayItem[]>(() => loadNewsFromStorage());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeItem, setActiveItem] = useState<NewsDisplayItem | null>(null);

    useEffect(() => {
        const handleStorageUpdate = () => setNews(loadNewsFromStorage());
        window.addEventListener("app-storage-updated", handleStorageUpdate);
        return () => window.removeEventListener("app-storage-updated", handleStorageUpdate);
    }, []);

    const filteredNews = useMemo(() => {
        return news.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [news, searchQuery]);

    useEffect(() => {
        if (!activeItem) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActiveItem(null);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [activeItem]);

    return (
        <div className="news-container">
            {/* Hero Section */}
            <div className="news-hero">
                <div className="hero-overlay-1"></div>
                <div className="hero-overlay-2"></div>

                <div className="hero-content">
                    <div className="page-hero-badge">
                        <span className="page-hero-badge-icon" aria-hidden="true">
                            <Newspaper />
                        </span>
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
                    {filteredNews.map((item) => (
                        <article
                            key={item.id}
                            className="news-card group"
                            role="button"
                            tabIndex={0}
                            aria-label={`Deschide știrea: ${item.title}`}
                            onClick={() => setActiveItem(item)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setActiveItem(item);
                                }
                            }}
                        >
                            <div className="image-wrapper">
                                <span className="category-badge">{item.category}</span>
                                <div className="icon-display">
                                    {getIcon(item.image)}
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="news-date">
                                    <Calendar className="w-3 h-3 text-yellow-500" />
                                    <span>{new Date(item.publishedAt).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })}</span>
                                </div>
                                <h3 className="news-title group-hover:text-[#003366] transition-colors">{item.title}</h3>
                                <p className="news-desc">{item.description}</p>

                            </div>
                        </article>
                    ))}
                </div>
            </main>

            {activeItem && (
                <div className="news-modal-overlay" role="dialog" aria-modal="true">
                    <div className="news-modal">
                        <button
                            type="button"
                            className="news-modal-close"
                            onClick={() => setActiveItem(null)}
                            aria-label="Închide"
                        >
                            ×
                        </button>
                        <span className="news-modal-category">{activeItem.category}</span>
                        <h2>{activeItem.title}</h2>
                        <div className="news-modal-date">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(activeItem.publishedAt).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })}</span>
                        </div>
                        <p>{activeItem.description}</p>
                    </div>
                    <button
                        type="button"
                        className="news-modal-backdrop"
                        onClick={() => setActiveItem(null)}
                        aria-label="Închide"
                    />
                </div>
            )}
        </div>
    );
};

export default News;
