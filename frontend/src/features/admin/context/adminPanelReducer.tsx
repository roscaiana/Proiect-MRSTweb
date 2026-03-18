import type { AdminState } from "../types";
import type { AdminAction } from "./adminPanelTypes";
import { createNewsReducer, deleteNewsReducer, logNotificationReducer, updateNewsReducer } from "./adminPanelNewsNotificationReducer";
import { createTestReducer, deleteTestReducer, updateTestReducer } from "./adminPanelTestReducer";
import { setAppointmentStatusReducer, updateAppointmentReducer } from "./adminPanelAppointmentReducer";

export const adminPanelReducer = (state: AdminState, action: AdminAction): AdminState => {
    switch (action.type) {
        case "hydrate": return action.payload;
        case "test/create": return createTestReducer(state, action.payload);
        case "test/update": return updateTestReducer(state, action.payload);
        case "test/delete": return deleteTestReducer(state, action.payload);
        case "settings/update": return { ...state, settings: action.payload };
        case "user/toggle-block":
            return { ...state, users: state.users.map((user) => (user.id === action.payload.id ? { ...user, isBlocked: !user.isBlocked } : user)) };
        case "appointment/set-status": return setAppointmentStatusReducer(state, action.payload);
        case "appointment/update": return updateAppointmentReducer(state, action.payload);
        case "notifications/log": return logNotificationReducer(state, action.payload);
        case "news/create": return createNewsReducer(state, action.payload);
        case "news/update": return updateNewsReducer(state, action.payload);
        case "news/delete": return deleteNewsReducer(state, action.payload);
        default: return state;
    }
};
