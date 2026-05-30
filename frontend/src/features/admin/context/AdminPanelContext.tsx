import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { loadAdminState } from "../storage";
import type { AdminAppointmentRecord, AdminNewsArticle, AppointmentStatus } from "../types";
import type { AdminPanelContextValue } from "./adminPanelTypes";
import { adminPanelReducer } from "./adminPanelReducer";
import { useAdminPanelStorageListener } from "./useAdminPanelStorageListener";
import { useAdminPanelPersistence } from "./useAdminPanelPersistence";
import { useAdminPanelCrudActions } from "./useAdminPanelCrudActions";
import { useAdminPanelAppointmentStatusAction } from "./useAdminPanelAppointmentStatusAction";
import { useAdminPanelSendNotificationAction } from "./useAdminPanelSendNotificationAction";
import { newsService } from "../../../services/newsService";
import { appointmentService } from "../../../services/appointmentService";
import type { AppointmentDto, NewsDto } from "../../../services/types";

const mapNewsDto = (dto: NewsDto): AdminNewsArticle => ({
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    category: dto.category,
    image: dto.image,
    sourceUrl: dto.sourceUrl ?? undefined,
    publishedAt: dto.publishedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
});

const mapAppointmentDto = (dto: AppointmentDto): AdminAppointmentRecord => ({
    id: String(dto.id),
    fullName: dto.fullName,
    idOrPhone: dto.idOrPhone,
    userEmail: dto.userEmail || undefined,
    date: dto.date,
    slotStart: dto.slotStart,
    slotEnd: dto.slotEnd,
    status: dto.status as AppointmentStatus,
    statusReason: dto.statusReason ?? undefined,
    adminNote: dto.adminNote ?? undefined,
    cancelledBy: (dto.cancelledBy as "user" | "admin") ?? undefined,
    rescheduleCount: dto.rescheduleCount,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? undefined,
});

const AdminPanelContext = createContext<AdminPanelContextValue | undefined>(undefined);

export const AdminPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(adminPanelReducer, undefined, loadAdminState);
    const refreshState = useCallback(() => { dispatch({ type: "hydrate", payload: loadAdminState() }); }, []);

    useEffect(() => {
        newsService.getAll()
            .then((items) => dispatch({ type: "news/set", payload: items.map(mapNewsDto) }))
            .catch(() => { /* keep localStorage-seeded state on API failure */ });
    }, []);

    useEffect(() => {
        appointmentService.getAll()
            .then((items) => dispatch({ type: "appointments/set", payload: items.map(mapAppointmentDto) }))
            .catch(() => { /* keep localStorage-seeded state on API failure */ });
    }, []);

    useAdminPanelStorageListener(refreshState);
    useAdminPanelPersistence(state);

    const crud = useAdminPanelCrudActions(state, dispatch);
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
