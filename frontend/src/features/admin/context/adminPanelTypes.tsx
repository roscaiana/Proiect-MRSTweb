import type {
    AdminAppointmentRecord,
    AdminNewsArticleInput,
    AdminState,
    AdminTestInput,
    AppointmentStatus,
    ExamSettings,
    SendNotificationInput,
    SentNotificationLog,
} from "../types";

export type AdminAction =
    | { type: "hydrate"; payload: AdminState }
    | { type: "test/create"; payload: AdminTestInput }
    | { type: "test/update"; payload: { id: string; data: AdminTestInput } }
    | { type: "test/delete"; payload: { id: string } }
    | { type: "settings/update"; payload: ExamSettings }
    | { type: "user/toggle-block"; payload: { id: string } }
    | { type: "appointment/set-status"; payload: { id: string; status: AppointmentStatus; reason?: string | null; adminNote?: string | null; cancelledBy?: "user" | "admin" } }
    | { type: "appointment/update"; payload: { id: string; patch: Partial<AdminAppointmentRecord> } }
    | { type: "notifications/log"; payload: SentNotificationLog }
    | { type: "news/create"; payload: AdminNewsArticleInput }
    | { type: "news/update"; payload: { id: string; data: AdminNewsArticleInput } }
    | { type: "news/delete"; payload: { id: string } };

export type AdminPanelContextValue = {
    state: AdminState;
    createTest: (input: AdminTestInput) => void;
    updateTest: (id: string, input: AdminTestInput) => void;
    deleteTest: (id: string) => void;
    updateSettings: (settings: ExamSettings) => void;
    toggleUserBlocked: (userId: string) => void;
    updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, options?: { reason?: string | null; adminNote?: string | null; cancelledBy?: "user" | "admin" }) => void;
    updateAppointment: (appointmentId: string, patch: Partial<AdminAppointmentRecord>) => void;
    sendNotification: (input: SendNotificationInput) => number;
    createNewsArticle: (input: AdminNewsArticleInput) => void;
    updateNewsArticle: (id: string, input: AdminNewsArticleInput) => void;
    deleteNewsArticle: (id: string) => void;
    refreshState: () => void;
};
