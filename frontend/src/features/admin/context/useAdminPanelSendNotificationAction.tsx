import { useCallback } from "react";
import type { Dispatch } from "react";
import { appendNotification, buildNotificationStorageKey } from "../../../utils/notificationUtils";
import type { AdminState, SendNotificationInput } from "../types";
import { createId } from "./adminPanelHelpers";
import { resolveRecipients } from "./adminPanelRecipients";
import type { AdminAction } from "./adminPanelTypes";

export const useAdminPanelSendNotificationAction = (state: AdminState, dispatch: Dispatch<AdminAction>) => {
    return useCallback((input: SendNotificationInput): number => {
        const recipients = resolveRecipients(state, input);
        const sentAt = new Date().toISOString();

        recipients.forEach((recipient) => {
            const storageKey = buildNotificationStorageKey(recipient.role, recipient.email);
            appendNotification(storageKey, {
                id: createId("notif"),
                title: input.title.trim(),
                message: input.message.trim(),
                createdAt: sentAt,
                read: false,
            });
        });

        dispatch({
            type: "notifications/log",
            payload: {
                id: createId("sent"),
                target: input.target,
                title: input.title.trim(),
                message: input.message.trim(),
                targetEmail: input.target === "email" ? input.targetEmail?.trim() : undefined,
                sentAt,
                recipientCount: recipients.length,
            },
        });

        return recipients.length;
    }, [dispatch, state]);
};
