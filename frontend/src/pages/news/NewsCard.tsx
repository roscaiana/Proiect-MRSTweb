import React from "react";
import { Bell, Calendar, FileText, Globe, Info, Newspaper, Users } from "lucide-react";
import type { NewsDisplayItem } from "../../features/admin/types";
import { formatDateLong } from "../../utils/dateUtils";
import { handleKeyActivation } from "../../utils/a11yUtils";

type NewsCardProps = {
    item: NewsDisplayItem;
    onOpen: (item: NewsDisplayItem) => void;
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

export default function NewsCard({ item, onOpen }: NewsCardProps) {
    return (
        <article
            className="news-card group"
            role="button"
            tabIndex={0}
            aria-label={`Deschide știrea: ${item.title}`}
            onClick={() => onOpen(item)}
            onKeyDown={handleKeyActivation(() => onOpen(item))}
        >
            <div className="image-wrapper">
                <span className="category-badge">{item.category}</span>
                <div className="icon-display">{getIcon(item.image)}</div>
            </div>
            <div className="card-content">
                <div className="news-date">
                    <Calendar className="w-3 h-3 text-yellow-500" />
                    <span>{formatDateLong(item.publishedAt)}</span>
                </div>
                <h3 className="news-title group-hover:text-[#003366] transition-colors">{item.title}</h3>
                <p className="news-desc">{item.description}</p>
            </div>
        </article>
    );
}
