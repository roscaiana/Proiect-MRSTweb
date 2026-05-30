import { useEffect } from "react";
import type { AdminState } from "../types";
import { writeAdminTests, writeAdminUsers, writeExamSettings, writeSentNotifications } from "../storage";

export const useAdminPanelPersistence = (state: AdminState) => {
    useEffect(() => { writeAdminTests(state.tests); }, [state.tests]);
    useEffect(() => { writeExamSettings(state.settings); }, [state.settings]);
    useEffect(() => { writeAdminUsers(state.users); }, [state.users]);
    useEffect(() => { writeSentNotifications(state.sentNotifications); }, [state.sentNotifications]);
};
