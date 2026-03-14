import { formatNotificationDate } from "../../hooks/useNotifications";
import type { AppNotification } from "../../utils/notificationUtils";

type NotificationListItemProps = {
    notification: AppNotification;
    onSelect: (notification: AppNotification) => void;
};

export default function NotificationListItem({ notification, onSelect }: NotificationListItemProps) {
    return (
        <button
            type="button"
            className={`notification-item ${notification.read ? "" : "unread"}`}
            onClick={() => onSelect(notification)}
        >
            <span className="notification-title">{notification.title}</span>
            <span className="notification-message">{notification.message}</span>
            <span className="notification-time">{formatNotificationDate(notification.createdAt)}</span>
        </button>
    );
}
