import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { loadAdminState } from "../storage";
import type { AdminPanelContextValue } from "./adminPanelTypes";
import { adminPanelReducer } from "./adminPanelReducer";
import { useAdminPanelStorageListener } from "./useAdminPanelStorageListener";
import { useAdminPanelPersistence } from "./useAdminPanelPersistence";
import { useAdminPanelCrudActions } from "./useAdminPanelCrudActions";
import { useAdminPanelAppointmentStatusAction } from "./useAdminPanelAppointmentStatusAction";
import { useAdminPanelSendNotificationAction } from "./useAdminPanelSendNotificationAction";

const AdminPanelContext = createContext<AdminPanelContextValue | undefined>(undefined);

export const AdminPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(adminPanelReducer, undefined, loadAdminState);
    const refreshState = useCallback(() => { dispatch({ type: "hydrate", payload: loadAdminState() }); }, []);

    useAdminPanelStorageListener(refreshState);
    useAdminPanelPersistence(state);

    const crud = useAdminPanelCrudActions(dispatch);
    const updateAppointmentStatus = useAdminPanelAppointmentStatusAction(state, dispatch);
    const sendNotification = useAdminPanelSendNotificationAction(state, dispatch);

    const value = useMemo<AdminPanelContextValue>(() => ({
        state,
        ...crud,
        updateAppointmentStatus,
        sendNotification,
        refreshState,
    }), [state, crud, updateAppointmentStatus, sendNotification, refreshState]);

    return <AdminPanelContext.Provider value={value}>{children}</AdminPanelContext.Provider>;
};

export const useAdminPanelContext = (): AdminPanelContextValue => {
    const context = useContext(AdminPanelContext);
    if (!context) throw new Error("useAdminPanelContext must be used within AdminPanelProvider");
    return context;
};
