type AdminNewsRowProps = {
    id: string;
    title: string;
    description: string;
    category: string;
    publishedAt: string;
    formatDate: (value: string) => string;
    onEdit: () => void;
    onDelete: (id: string) => void;
};

export default function AdminNewsRow({
    id,
    title,
    description,
    category,
    publishedAt,
    formatDate,
    onEdit,
    onDelete,
}: AdminNewsRowProps) {
    return (
        <tr>
            <td>
                <strong>{title}</strong>
                <p className="admin-muted-text" style={{ margin: "2px 0 0", fontSize: "0.8rem" }}>
                    {description.length > 80 ? `${description.slice(0, 80)}…` : description}
                </p>
            </td>
            <td>{category}</td>
            <td>{formatDate(publishedAt)}</td>
            <td>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button type="button" className="admin-btn ghost" onClick={onEdit}>
                        <i className="fas fa-pen"></i> Editează
                    </button>
                    <button type="button" className="admin-btn danger" onClick={() => onDelete(id)} aria-label="Șterge">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
}
