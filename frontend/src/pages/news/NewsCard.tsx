import React from "react";
import { Bell, Calendar, FileText, Globe, Info, Newspaper, Users } from "lucide-react";
import type { NewsDisplayItem } from "../../features/admin/types";
import { formatDateLong } from "../../utils/dateUtils";

type NewsCardProps = {
    item: NewsDisplayItem;
};

const getIcon = (type: string) => {
    switch (type) {
        case "cert":
            return <FileText className="w-12 h-12 text-[#003366]" />;
        case "users":
            return <Users className="w-12 h-12 text-[#003366]" />;
        case "law":
            return <Info className="w-12 h-12 text-[#003366]" />;
        case "calendar":
            return <Calendar className="w-12 h-12 text-[#003366]" />;
        case "web":
            return <Bell className="w-12 h-12 text-[#003366]" />;
        case "globe":
            return <Globe className="w-12 h-12 text-[#003366]" />;
        default:
            return <Newspaper className="w-12 h-12 text-[#003366]" />;
    }
};

const ICON_KEYS = new Set(["cert", "users", "law", "calendar", "web", "globe"]);

export default function NewsCard({ item }: NewsCardProps) {
    const hasPhoto = !ICON_KEYS.has(item.image);

    return (
        <article className="news-card group">
            <div className="image-wrapper">
                <span className="category-badge">{item.category}</span>
                {hasPhoto ? (
                    <img className="news-photo" src={item.image} alt={item.title} loading="lazy" />
                ) : (
                    <div className="icon-display">{getIcon(item.image)}</div>
                )}
            </div>

            <div className="card-content">
                <div className="news-date">
                    <Calendar className="w-3 h-3 text-yellow-500" />
                    <span>{formatDateLong(item.publishedAt)}</span>
                </div>

                <h3 className="news-title group-hover:text-[#003366] transition-colors">{item.title}</h3>
                <p className="news-desc">{item.description}</p>

                {item.sourceUrl && (
                    <a className="news-card-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
                        Vezi noutatea pe CICDE
                    </a>
                )}
            </div>
        </article>
    );
}
