import React from "react";

type ColorVariant = "blue" | "green" | "gold" | "purple" | "red" | "teal";

type Props = {
    title: string;
    value: string;
    hint?: string;
    iconClass: string;
    color?: ColorVariant;
};

const AdminStatCard: React.FC<Props> = ({ title, value, hint, iconClass, color = "blue" }) => {
    return (
        <article className={`admin-stat-card admin-stat-card--${color}`}>
            <div className="admin-stat-icon">
                <i className={iconClass}></i>
            </div>
            <div className="admin-stat-content">
                <p className="admin-stat-title">{title}</p>
                <p className="admin-stat-value">{value}</p>
                {hint && <p className="admin-stat-hint">{hint}</p>}
            </div>
        </article>
    );
};

export default AdminStatCard;
