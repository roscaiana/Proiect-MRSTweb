import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { loadAdminState } from "../storage";
import type { AdminAppointmentRecord, AdminNewsArticle, AdminUserRecord, AppointmentStatus } from "../types";
import type { AdminPanelContextValue } from "./adminPanelTypes";
import { adminPanelReducer } from "./adminPanelReducer";
import { useAdminPanelStorageListener } from "./useAdminPanelStorageListener";
import { useAdminPanelPersistence } from "./useAdminPanelPersistence";
import { useAdminPanelCrudActions } from "./useAdminPanelCrudActions";
import { useAdminPanelAppointmentStatusAction } from "./useAdminPanelAppointmentStatusAction";
import { useAdminPanelSendNotificationAction } from "./useAdminPanelSendNotificationAction";
import { newsService } from "../../../services/newsService";
import { appointmentService } from "../../../services/appointmentService";
import { examSettingsService } from "../../../services/examSettingsService";
import { userService } from "../../../services/userService";
import { writeExamSettings } from "../storage";
import type { AppointmentDto, ExamSettingsDto, NewsDto, UserInfoDto } from "../../../services/types";
import type { ExamSettings } from "../types";

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

const mapUserDto = (dto: UserInfoDto): AdminUserRecord => ({
    id: String(dto.id),
    email: dto.email,
    fullName: dto.fullName || dto.userName || dto.email,
    nickname: dto.nickname ?? undefined,
    phoneNumber: dto.phone ?? undefined,
    avatarDataUrl: dto.avatarDataUrl ?? undefined,
    role: dto.role.toLowerCase() === "admin" ? "admin" : "user",
    createdAt: dto.registeredOn,
    isBlocked: dto.isBlocked,
});

const mapExamSettingsDto = (dto: ExamSettingsDto): ExamSettings => ({
    testQuestionCount: dto.testQuestionCount,
    testDurationMinutes: dto.testDurationMinutes,
    passingThreshold: dto.passingThreshold,
    appointmentsPerDay: dto.appointmentsPerDay,
    appointmentLeadTimeHours: dto.appointmentLeadTimeHours,
    maxReschedulesPerUser: dto.maxReschedulesPerUser,
    rejectionCooldownDays: dto.rejectionCooldownDays,
    appointmentLocation: dto.appointmentLocation,
    appointmentRoom: dto.appointmentRoom,
    allowedWeekdays: dto.allowedWeekdays,
    blockedDates: dto.blockedDates.map((b) => ({ date: b.date, note: b.note ?? undefined })),
    capacityOverrides: dto.capacityOverrides.map((c) => ({ date: c.date, appointmentsPerDay: c.appointmentsPerDay })),
    slotOverrides: dto.slotOverrides.map((s) => ({
        date: s.date,
        slots: s.slots.map((sl) => ({ id: sl.id, startTime: sl.startTime, endTime: sl.endTime, available: sl.available })),
    })),
});

const AdminPanelContext = createContext<AdminPanelContextValue | undefined>(undefined);

export const AdminPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(adminPanelReducer, undefined, loadAdminState);
    const refreshState = useCallback(() => { dispatch({ type: "hydrate", payload: loadAdminState() }); }, []);

    useEffect(() => {
        examSettingsService.get()
            .then((dto) => {
                const settings = mapExamSettingsDto(dto);
                dispatch({ type: "settings/update", payload: settings });
                writeExamSettings(settings);
            })
            .catch(() => { /* keep localStorage-seeded state on API failure */ });
    }, []);

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

    useEffect(() => {
        userService.getAll()
            .then((items) => dispatch({ type: "users/set", payload: items.map(mapUserDto) }))
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
