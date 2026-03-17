import { useCallback } from "react";
import type { Dispatch } from "react";
import type { AdminAppointmentRecord, AdminNewsArticleInput, AdminTestInput, ExamSettings } from "../types";
import type { AdminAction } from "./adminPanelTypes";

export const useAdminPanelCrudActions = (dispatch: Dispatch<AdminAction>) => {
    const createTest = useCallback((input: AdminTestInput) => { dispatch({ type: "test/create", payload: input }); }, [dispatch]);
    const updateTest = useCallback((id: string, input: AdminTestInput) => { dispatch({ type: "test/update", payload: { id, data: input } }); }, [dispatch]);
    const deleteTest = useCallback((id: string) => { dispatch({ type: "test/delete", payload: { id } }); }, [dispatch]);
    const updateSettings = useCallback((settings: ExamSettings) => { dispatch({ type: "settings/update", payload: settings }); }, [dispatch]);
    const toggleUserBlocked = useCallback((userId: string) => { dispatch({ type: "user/toggle-block", payload: { id: userId } }); }, [dispatch]);
    const updateAppointment = useCallback((appointmentId: string, patch: Partial<AdminAppointmentRecord>) => {
        dispatch({ type: "appointment/update", payload: { id: appointmentId, patch } });
    }, [dispatch]);
    const createNewsArticle = useCallback((input: AdminNewsArticleInput) => { dispatch({ type: "news/create", payload: input }); }, [dispatch]);
    const updateNewsArticle = useCallback((id: string, input: AdminNewsArticleInput) => { dispatch({ type: "news/update", payload: { id, data: input } }); }, [dispatch]);
    const deleteNewsArticle = useCallback((id: string) => { dispatch({ type: "news/delete", payload: { id } }); }, [dispatch]);

    return { createTest, updateTest, deleteTest, updateSettings, toggleUserBlocked, updateAppointment, createNewsArticle, updateNewsArticle, deleteNewsArticle };
};
