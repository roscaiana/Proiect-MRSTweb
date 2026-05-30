import { useCallback } from "react";
import type { Dispatch } from "react";
import type { AdminAppointmentRecord, AdminNewsArticle, AdminNewsArticleInput, AdminTestInput, ExamSettings } from "../types";
import type { AdminAction } from "./adminPanelTypes";
import { newsService } from "../../../services/newsService";
import type { NewsDto } from "../../../services/types";

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

export const useAdminPanelCrudActions = (dispatch: Dispatch<AdminAction>) => {
    const createTest = useCallback((input: AdminTestInput) => { dispatch({ type: "test/create", payload: input }); }, [dispatch]);
    const updateTest = useCallback((id: string, input: AdminTestInput) => { dispatch({ type: "test/update", payload: { id, data: input } }); }, [dispatch]);
    const deleteTest = useCallback((id: string) => { dispatch({ type: "test/delete", payload: { id } }); }, [dispatch]);
    const updateSettings = useCallback((settings: ExamSettings) => { dispatch({ type: "settings/update", payload: settings }); }, [dispatch]);
    const toggleUserBlocked = useCallback((userId: string) => { dispatch({ type: "user/toggle-block", payload: { id: userId } }); }, [dispatch]);
    const updateAppointment = useCallback((appointmentId: string, patch: Partial<AdminAppointmentRecord>) => {
        dispatch({ type: "appointment/update", payload: { id: appointmentId, patch } });
    }, [dispatch]);

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
