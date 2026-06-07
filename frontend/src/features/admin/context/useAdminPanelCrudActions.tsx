import { useCallback } from "react";
import type { Dispatch } from "react";
import type { AdminAppointmentRecord, AdminNewsArticle, AdminNewsArticleInput, AdminState, AdminTestInput, AdminUserRecord, AppointmentStatus, ExamSettings } from "../types";
import type { AdminAction } from "./adminPanelTypes";
import { newsService } from "../../../services/newsService";
import { appointmentService } from "../../../services/appointmentService";
import { examSettingsService } from "../../../services/examSettingsService";
import { userService } from "../../../services/userService";
import { writeExamSettings } from "../storage";
import type { AppointmentDto, NewsDto, UserInfoDto } from "../../../services/types";

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

export const useAdminPanelCrudActions = (state: AdminState, dispatch: Dispatch<AdminAction>) => {
    const createTest = useCallback((input: AdminTestInput) => { dispatch({ type: "test/create", payload: input }); }, [dispatch]);
    const updateTest = useCallback((id: string, input: AdminTestInput) => { dispatch({ type: "test/update", payload: { id, data: input } }); }, [dispatch]);
    const deleteTest = useCallback((id: string) => { dispatch({ type: "test/delete", payload: { id } }); }, [dispatch]);
    const updateSettings = useCallback((settings: ExamSettings) => {
        dispatch({ type: "settings/update", payload: settings });
        examSettingsService.update({
            testQuestionCount: settings.testQuestionCount,
            testDurationMinutes: settings.testDurationMinutes,
            passingThreshold: settings.passingThreshold,
            appointmentsPerDay: settings.appointmentsPerDay,
            appointmentLeadTimeHours: settings.appointmentLeadTimeHours,
            maxReschedulesPerUser: settings.maxReschedulesPerUser,
            rejectionCooldownDays: settings.rejectionCooldownDays,
            appointmentLocation: settings.appointmentLocation,
            appointmentRoom: settings.appointmentRoom,
            allowedWeekdays: settings.allowedWeekdays,
            blockedDates: settings.blockedDates.map((b) => ({ date: b.date, note: b.note ?? null })),
            capacityOverrides: settings.capacityOverrides,
            slotOverrides: settings.slotOverrides.map((s) => ({
                date: s.date,
                slots: s.slots.map((sl) => ({ id: sl.id, startTime: sl.startTime, endTime: sl.endTime, available: sl.available ?? true })),
            })),
        })
            .then(() => writeExamSettings(settings))
            .catch((err) => console.error("Failed to save exam settings to API:", err));
    }, [dispatch]);
    const toggleUserBlocked = useCallback((userId: string) => {
        const numericId = parseInt(userId, 10);
        if (isNaN(numericId)) {
            dispatch({ type: "user/toggle-block", payload: { id: userId } });
            return;
        }

        userService.toggleBlocked(numericId)
            .then(() => userService.getAll())
            .then((items) => dispatch({ type: "users/set", payload: items.map(mapUserDto) }))
            .catch((err) => console.error("Failed to toggle user block status:", err));
    }, [dispatch]);

    const updateAppointment = useCallback((appointmentId: string, patch: Partial<AdminAppointmentRecord>) => {
        const numericId = parseInt(appointmentId, 10);
        if (isNaN(numericId)) {
            dispatch({ type: "appointment/update", payload: { id: appointmentId, patch } });
            return;
        }
        const current = state.appointments.find((a) => a.id === appointmentId);
        if (!current) return;
        const merged = { ...current, ...patch };
        const dto: AppointmentDto = {
            id: numericId,
            fullName: merged.fullName,
            idOrPhone: merged.idOrPhone,
            userEmail: merged.userEmail ?? '',
            date: merged.date,
            slotStart: merged.slotStart,
            slotEnd: merged.slotEnd,
            status: merged.status,
            statusReason: merged.statusReason ?? null,
            adminNote: merged.adminNote ?? null,
            cancelledBy: merged.cancelledBy ?? null,
            rescheduleCount: merged.rescheduleCount ?? 0,
            createdAt: merged.createdAt,
            updatedAt: merged.updatedAt ?? null,
        };
        appointmentService.update(numericId, dto)
            .then(() => appointmentService.getAll())
            .then((items) => dispatch({ type: "appointments/set", payload: items.map(mapAppointmentDto) }))
            .catch((err) => console.error("Failed to update appointment:", err));
    }, [dispatch, state.appointments]);

    const createNewsArticle = useCallback((input: AdminNewsArticleInput) => {
        newsService.create({
            title: input.title,
            description: input.description,
            category: input.category,
            image: input.image,
            sourceUrl: input.sourceUrl,
            publishedAt: input.publishedAt,
        }).then(() => newsService.getAll())
          .then((items) => dispatch({ type: "news/set", payload: items.map(mapNewsDto) }))
          .catch((err) => console.error("Failed to create news:", err));
    }, [dispatch]);

    const updateNewsArticle = useCallback((id: string, input: AdminNewsArticleInput) => {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return;
        newsService.update(numericId, {
            title: input.title,
            description: input.description,
            category: input.category,
            image: input.image,
            sourceUrl: input.sourceUrl,
            publishedAt: input.publishedAt,
        }).then(() => newsService.getAll())
          .then((items) => dispatch({ type: "news/set", payload: items.map(mapNewsDto) }))
          .catch((err) => console.error("Failed to update news:", err));
    }, [dispatch]);

    const deleteNewsArticle = useCallback((id: string) => {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return;
        newsService.remove(numericId)
          .then(() => newsService.getAll())
          .then((items) => dispatch({ type: "news/set", payload: items.map(mapNewsDto) }))
          .catch((err) => console.error("Failed to delete news:", err));
    }, [dispatch]);

    return { createTest, updateTest, deleteTest, updateSettings, toggleUserBlocked, updateAppointment, createNewsArticle, updateNewsArticle, deleteNewsArticle };
};
