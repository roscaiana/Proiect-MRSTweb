import type { NotificationRole } from "../../../utils/notificationUtils";
import type { AdminState, SendNotificationInput } from "../types";

type Recipient = { role: NotificationRole; email: string };

export const resolveRecipients = (state: AdminState, input: SendNotificationInput): Recipient[] => {
    const users = state.users.map((user) => ({ role: user.role as NotificationRole, email: user.email }));
    const builtInAdmin = [{ role: "admin" as const, email: "admin@electoral.md" }];

    const recipientsByTarget: Record<SendNotificationInput["target"], Recipient[]> = {
        all: [...users, ...builtInAdmin],
        users: users.filter((recipient) => recipient.role === "user"),
        admins: [...users.filter((recipient) => recipient.role === "admin"), ...builtInAdmin],
        email: users.filter((recipient) => recipient.email === input.targetEmail),
    };

    if (input.target === "email" && input.targetEmail === "admin@electoral.md") {
        recipientsByTarget.email = [...recipientsByTarget.email, ...builtInAdmin];
    }

    const deduped = new Map<string, Recipient>();
    for (const recipient of recipientsByTarget[input.target]) deduped.set(`${recipient.role}-${recipient.email}`, recipient);
    return Array.from(deduped.values());
};
