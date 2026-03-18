import React, { useMemo, useState } from "react";
import { Calendar, Newspaper, Search } from "lucide-react";
import type { NewsDisplayItem } from "../../features/admin/types";
import { readAdminNews, STORAGE_KEYS } from "../../features/admin/storage";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useStorageSync } from "../../hooks/useStorageSync";
import { formatDateLong } from "../../utils/dateUtils";
import NewsCard from "./NewsCard";
import "./News.css";

function loadNewsFromStorage(): NewsDisplayItem[] {
    return readAdminNews().map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        image: item.image,
        publishedAt: item.publishedAt,
    }));
}

const News: React.FC = () => {
    const [news, setNews] = useState<NewsDisplayItem[]>(() => loadNewsFromStorage());
    const [searchQuery, setSearchQuery] = useState("");
    const [activeItem, setActiveItem] = useState<NewsDisplayItem | null>(null);

    useStorageSync([STORAGE_KEYS.news], () => setNews(loadNewsFromStorage()));

    const filteredNews = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return news;
        return news.filter(
            (item) =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
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
                            <span>{formatDateLong(activeItem.publishedAt)}</span>
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
