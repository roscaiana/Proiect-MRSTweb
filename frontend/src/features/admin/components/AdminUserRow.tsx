type AdminUserRowProps = {
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
    lastLoginAt?: string | null;
    isBlocked: boolean;
    formatDate: (value: string) => string;
    onToggleBlocked: (id: string) => void;
};

export default function AdminUserRow({
    id,
    fullName,
    email,
    role,
    createdAt,
    lastLoginAt,
    isBlocked,
    formatDate,
    onToggleBlocked,
}: AdminUserRowProps) {
    return (
        <tr>
            <td>
                <strong>{fullName}</strong>
                <p>{email}</p>
            </td>
            <td>{role}</td>
            <td>{formatDate(createdAt)}</td>
            <td>{lastLoginAt ? formatDate(lastLoginAt) : "N/A"}</td>
            <td>
                <span className={`admin-pill ${isBlocked ? "rejected" : "approved"}`}>
                    {isBlocked ? "blocat" : "activ"}
                </span>
            </td>
            <td>
                <button
                    className={`admin-text-btn ${isBlocked ? "" : "danger"}`}
                    type="button"
                    onClick={() => onToggleBlocked(id)}
                >
                    {isBlocked ? "Deblochează" : "Blochează"}
                </button>
            </td>
        </tr>
    );
}
