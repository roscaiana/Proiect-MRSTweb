import type { AdminNewsArticle, AdminNewsArticleInput, AdminState, SentNotificationLog } from "../types";
import { createId } from "./adminPanelHelpers";

export const logNotificationReducer = (state: AdminState, payload: SentNotificationLog): AdminState => {
    return { ...state, sentNotifications: [payload, ...state.sentNotifications].slice(0, 100) };
};

export const createNewsReducer = (state: AdminState, payload: AdminNewsArticleInput): AdminState => {
    const now = new Date().toISOString();
    const id = createId("news");
    const article: AdminNewsArticle = { id, ...payload, createdAt: now, updatedAt: now };
    return { ...state, news: [article, ...state.news] };
};

export const updateNewsReducer = (state: AdminState, payload: { id: string; data: AdminNewsArticleInput }): AdminState => {
    const now = new Date().toISOString();
    return {
        ...state,
        news: state.news.map((article) =>
            article.id !== payload.id ? article : { ...article, ...payload.data, updatedAt: now }
        ),
    };
};

export const deleteNewsReducer = (state: AdminState, payload: { id: string }): AdminState => {
    return { ...state, news: state.news.filter((article) => article.id !== payload.id) };
};
