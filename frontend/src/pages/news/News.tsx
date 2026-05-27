import React, { useMemo, useState } from "react";
import { Newspaper, Search } from "lucide-react";
import type { NewsDisplayItem } from "../../features/admin/types";
import { readAdminNews, STORAGE_KEYS } from "../../features/admin/storage";
import { useStorageSync } from "../../hooks/useStorageSync";
import NewsCard from "./NewsCard";
import "./News.css";

function loadNewsFromStorage(): NewsDisplayItem[] {
    return readAdminNews().map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        image: item.image,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt,
    }));
}

const News: React.FC = () => {
    const [news, setNews] = useState<NewsDisplayItem[]>(() => loadNewsFromStorage());
    const [searchQuery, setSearchQuery] = useState("");

    useStorageSync([STORAGE_KEYS.news], () => setNews(loadNewsFromStorage()));

    const visibleNews = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const sorted = [...news].sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        const filtered = query
            ? sorted.filter(
                  (item) =>
                      item.title.toLowerCase().includes(query) ||
                      item.description.toLowerCase().includes(query) ||
                      item.category.toLowerCase().includes(query)
              )
            : sorted;

        return filtered.slice(0, 6);
    }, [news, searchQuery]);

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
                        <span className="uppercase">Noutati e-Electoral</span>
                    </div>

                    <h1 className="hero-title">
                        Noutati <span className="hero-title-highlight">e-Electoral</span>
                    </h1>

                    <p className="hero-subtitle">
                        Ramaneti la curent cu cele mai recente stiri din domeniul electoral, sesiunile de
                        certificare si evenimentele CICDE.
                    </p>

                    <div className="search-container">
                        <div className="search-wrapper">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Cautati stiri, evenimente sau actualizari..."
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
                    {visibleNews.map((item) => (
                        <NewsCard key={item.id} item={item} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default News;
