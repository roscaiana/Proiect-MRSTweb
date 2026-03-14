type AdminNotificationHistoryRowProps = {
    id: string;
    title: string;
    message: string;
    target: string;
    targetEmail?: string;
    recipientCount: number;
    sentAt: string;
    formatDateTime: (value: string) => string;
};

export default function AdminNotificationHistoryRow({
    title,
    message,
    target,
    targetEmail,
    recipientCount,
    sentAt,
    formatDateTime,
}: AdminNotificationHistoryRowProps) {
    return (
        <tr>
            <td>
                <strong>{title}</strong>
                <p>{message}</p>
            </td>
            <td>{targetEmail || target}</td>
            <td>{recipientCount}</td>
            <td>{formatDateTime(sentAt)}</td>
        </tr>
    );
}
