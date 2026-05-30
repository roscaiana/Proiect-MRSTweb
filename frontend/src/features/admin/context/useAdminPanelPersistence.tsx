import { useEffect } from "react";
import type { AdminState } from "../types";
import { writeAdminUsers, writeSentNotifications } from "../storage";

export const useAdminPanelPersistence = (state: AdminState) => {
    useEffect(() => { writeAdminUsers(state.users); }, [state.users]);
    useEffect(() => { writeSentNotifications(state.sentNotifications); }, [state.sentNotifications]);
};
