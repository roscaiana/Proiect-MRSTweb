import { useEffect } from "react";
import type { AdminState } from "../types";
import { writeAdminNews, writeAdminTests, writeAdminUsers, writeAppointments, writeExamSettings, writeSentNotifications } from "../storage";

export const useAdminPanelPersistence = (state: AdminState) => {
    useEffect(() => { writeAdminTests(state.tests); }, [state.tests]);
    useEffect(() => { writeExamSettings(state.settings); }, [state.settings]);
    useEffect(() => { writeAdminUsers(state.users); }, [state.users]);
    useEffect(() => { writeAppointments(state.appointments); }, [state.appointments]);
    useEffect(() => { writeSentNotifications(state.sentNotifications); }, [state.sentNotifications]);
    useEffect(() => { writeAdminNews(state.news); }, [state.news]);
};
