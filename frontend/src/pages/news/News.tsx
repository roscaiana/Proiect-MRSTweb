import React, { useMemo, useState } from "react";
import { Calendar, Newspaper, Search } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useStorageSync } from "../../hooks/useStorageSync";
import NewsCard from "./NewsCard";
import type { NewsDisplayItem } from "../../features/admin/types";
import { formatDateLong } from "../../utils/dateUtils";
import "./News.css";

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

const News: React.FC = () => {
    const [news, setNews] = useState<NewsDisplayItem[]>(() => loadNewsFromStorage());
    const [searchQuery, setSearchQuery] = useState("");
    const [activeItem, setActiveItem] = useState<NewsDisplayItem | null>(null);

    useStorageSync(["adminNews"], () => setNews(loadNewsFromStorage()));

    const filteredNews = useMemo(() => {
        return news.filter(
            (item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [news, searchQuery]);

    useEscapeKey(() => setActiveItem(null), activeItem !== null);

    return (
        <div className="news-container">
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
                        Rămâneți la curent cu cele mai recente știri din domeniul electoral, sesiunile de
                        certificare și evenimentele CICDE.
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
                        <NewsCard key={item.id} item={item} onOpen={setActiveItem} />
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
                            <span>
                                {formatDateLong(activeItem.publishedAt)}
                            </span>
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
