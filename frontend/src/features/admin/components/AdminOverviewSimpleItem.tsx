type AdminOverviewSimpleItemProps = {
    title: string;
    description?: string;
    badge: string | number;
    badgeClassName: string;
};

export default function AdminOverviewSimpleItem({
    title,
    description,
    badge,
    badgeClassName,
}: AdminOverviewSimpleItemProps) {
    return (
        <div className="admin-simple-item">
            <div>
                <strong>{title}</strong>
                {description ? <p>{description}</p> : null}
            </div>
            <span className={`admin-pill ${badgeClassName}`}>{badge}</span>
        </div>
    );
}
