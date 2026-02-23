import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import {
    appendNotification,
    buildNotificationStorageKey,
    type NotificationRole,
} from "../../../utils/notificationUtils";
import { notifyAppointmentStatusChanged } from "../../../utils/appEventNotifications";
import {
    STORAGE_KEYS,
    loadAdminState,
    writeAdminTests,
    writeAdminUsers,
    writeAppointments,
    writeExamSettings,
    writeSentNotifications,
} from "../storage";
import type {
    AdminAppointmentRecord,
    AdminState,
    AdminTestInput,
    AppointmentStatus,
    ExamSettings,
    SendNotificationInput,
    SentNotificationLog,
} from "../types";

type AdminAction =
    | { type: "hydrate"; payload: AdminState }
    | { type: "test/create"; payload: AdminTestInput }
    | { type: "test/update"; payload: { id: string; data: AdminTestInput } }
    | { type: "test/delete"; payload: { id: string } }
    | { type: "settings/update"; payload: ExamSettings }
    | { type: "user/toggle-block"; payload: { id: string } }
    | {
          type: "appointment/set-status";
          payload: {
              id: string;
              status: AppointmentStatus;
              reason?: string | null;
              adminNote?: string | null;
              cancelledBy?: "user" | "admin";
          };
      }
    | { type: "appointment/update"; payload: { id: string; patch: Partial<AdminAppointmentRecord> } }
    | { type: "notifications/log"; payload: SentNotificationLog };

type AdminPanelContextValue = {
    state: AdminState;
    createTest: (input: AdminTestInput) => void;
    updateTest: (id: string, input: AdminTestInput) => void;
    deleteTest: (id: string) => void;
    updateSettings: (settings: ExamSettings) => void;
    toggleUserBlocked: (userId: string) => void;
    updateAppointmentStatus: (
        appointmentId: string,
        status: AppointmentStatus,
        options?: { reason?: string | null; adminNote?: string | null; cancelledBy?: "user" | "admin" }
    ) => void;
    updateAppointment: (appointmentId: string, patch: Partial<AdminAppointmentRecord>) => void;
    sendNotification: (input: SendNotificationInput) => number;
    refreshState: () => void;
};

const AdminPanelContext = createContext<AdminPanelContextValue | undefined>(undefined);

const createId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const normalizeQuestions = (questions: AdminTestInput["questions"], testId: string) => {
    return questions.map((question, index) => ({
        id: question.id || `${testId}-q-${index + 1}`,
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()),
        correctAnswer: question.correctAnswer,
    }));
};

const reducer = (state: AdminState, action: AdminAction): AdminState => {
    switch (action.type) {
        case "hydrate":
            return action.payload;
        case "test/create": {
            const now = new Date().toISOString();
            const id = createId("test");

            const nextTest = {
                id,
                ...action.payload,
                questions: normalizeQuestions(action.payload.questions, id),
                createdAt: now,
                updatedAt: now,
            };

            return {
                ...state,
                tests: [nextTest, ...state.tests],
            };
        }
        case "test/update": {
            const now = new Date().toISOString();

            return {
                ...state,
                tests: state.tests.map((test) => {
                    if (test.id !== action.payload.id) {
                        return test;
                    }

                    return {
                        ...test,
                        ...action.payload.data,
                        questions: normalizeQuestions(action.payload.data.questions, test.id),
                        updatedAt: now,
                    };
                }),
            };
        }
        case "test/delete":
            return {
                ...state,
                tests: state.tests.filter((test) => test.id !== action.payload.id),
            };
        case "settings/update":
            return {
                ...state,
                settings: action.payload,
            };
        case "user/toggle-block":
            return {
                ...state,
                users: state.users.map((user) =>
                    user.id === action.payload.id ? { ...user, isBlocked: !user.isBlocked } : user
                ),
            };
        case "appointment/set-status":
            return {
                ...state,
                appointments: state.appointments.map((appointment) =>
                    appointment.id === action.payload.id
                        ? {
                              ...appointment,
                              status: action.payload.status,
                              statusReason:
                                  action.payload.reason !== undefined
                                      ? action.payload.reason || undefined
                                      : appointment.statusReason,
                              adminNote:
                                  action.payload.adminNote !== undefined
                                      ? action.payload.adminNote || undefined
                                      : appointment.adminNote,
                              cancelledBy:
                                  action.payload.status === "cancelled"
                                      ? action.payload.cancelledBy || appointment.cancelledBy
                                      : appointment.cancelledBy,
                              updatedAt: new Date().toISOString(),
                          }
                        : appointment
                ),
            };
        case "appointment/update":
            return {
                ...state,
                appointments: state.appointments.map((appointment) =>
                    appointment.id === action.payload.id
                        ? {
                              ...appointment,
                              ...action.payload.patch,
                              updatedAt: new Date().toISOString(),
                          }
                        : appointment
                ),
            };
        case "notifications/log":
            return {
                ...state,
                sentNotifications: [action.payload, ...state.sentNotifications].slice(0, 100),
            };
        default:
            return state;
    }
};

const resolveRecipients = (
    state: AdminState,
    input: SendNotificationInput
): Array<{ role: NotificationRole; email: string }> => {
    const users = state.users.map((user) => ({
        role: user.role as NotificationRole,
        email: user.email,
    }));

    const builtInAdmin = [{ role: "admin" as const, email: "admin@electoral.md" }];

    const recipientsByTarget: Record<
        SendNotificationInput["target"],
        Array<{ role: NotificationRole; email: string }>
    > = {
        all: [...users, ...builtInAdmin],
        users: users.filter((recipient) => recipient.role === "user"),
        admins: [...users.filter((recipient) => recipient.role === "admin"), ...builtInAdmin],
        email: users.filter((recipient) => recipient.email === input.targetEmail),
    };

    if (input.target === "email" && input.targetEmail === "admin@electoral.md") {
        recipientsByTarget.email = [...recipientsByTarget.email, ...builtInAdmin];
    }

    const deduped = new Map<string, { role: NotificationRole; email: string }>();
    for (const recipient of recipientsByTarget[input.target]) {
        deduped.set(`${recipient.role}-${recipient.email}`, recipient);
    }

    return Array.from(deduped.values());
};

export const AdminPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, undefined, loadAdminState);
    const refreshState = useCallback(() => {
        dispatch({ type: "hydrate", payload: loadAdminState() });
    }, []);

    useEffect(() => {
        const watchedKeys = new Set<string>([
            STORAGE_KEYS.tests,
            STORAGE_KEYS.settings,
            STORAGE_KEYS.users,
            STORAGE_KEYS.appointments,
            STORAGE_KEYS.quizHistory,
            STORAGE_KEYS.sentNotifications,
        ]);

        const handleStorageEvent = (event: StorageEvent) => {
            if (event.key && watchedKeys.has(event.key)) {
                refreshState();
            }
        };

        window.addEventListener("storage", handleStorageEvent);

        return () => {
            window.removeEventListener("storage", handleStorageEvent);
        };
    }, [refreshState]);

    useEffect(() => {
        writeAdminTests(state.tests);
    }, [state.tests]);

    useEffect(() => {
        writeExamSettings(state.settings);
    }, [state.settings]);

    useEffect(() => {
        writeAdminUsers(state.users);
    }, [state.users]);

    useEffect(() => {
        writeAppointments(state.appointments);
    }, [state.appointments]);

    useEffect(() => {
        writeSentNotifications(state.sentNotifications);
    }, [state.sentNotifications]);

    const createTest = useCallback((input: AdminTestInput) => {
        dispatch({ type: "test/create", payload: input });
    }, []);

    const updateTest = useCallback((id: string, input: AdminTestInput) => {
        dispatch({ type: "test/update", payload: { id, data: input } });
    }, []);

    const deleteTest = useCallback((id: string) => {
        dispatch({ type: "test/delete", payload: { id } });
    }, []);

    const updateSettings = useCallback((settings: ExamSettings) => {
        dispatch({ type: "settings/update", payload: settings });
    }, []);

    const toggleUserBlocked = useCallback((userId: string) => {
        dispatch({ type: "user/toggle-block", payload: { id: userId } });
    }, []);

    const updateAppointmentStatus = useCallback(
        (
            appointmentId: string,
            status: AppointmentStatus,
            options?: { reason?: string | null; adminNote?: string | null; cancelledBy?: "user" | "admin" }
        ) => {
            const targetAppointment = state.appointments.find((a) => a.id === appointmentId);
            let recipientEmail = targetAppointment?.userEmail;

            // Backfill recipient for older appointments that were created without userEmail linkage.
            if (!recipientEmail && targetAppointment) {
                const phoneOrIdValue = targetAppointment.idOrPhone.trim();
                if (phoneOrIdValue.includes("@")) {
                    recipientEmail = phoneOrIdValue;
                } else {
                    const normalizedFullName = targetAppointment.fullName.trim().toLowerCase();
                    const matchedUsers = state.users.filter(
                        (user) =>
                            user.role === "user" &&
                            user.fullName.trim().toLowerCase() === normalizedFullName
                    );
                    if (matchedUsers.length === 1) {
                        recipientEmail = matchedUsers[0].email;
                    }
                }
            }

            if (recipientEmail && targetAppointment && !targetAppointment.userEmail) {
                dispatch({
                    type: "appointment/update",
                    payload: {
                        id: appointmentId,
                        patch: { userEmail: recipientEmail },
                    },
                });
            }

            dispatch({
                type: "appointment/set-status",
                payload: {
                    id: appointmentId,
                    status,
                    reason: options?.reason,
                    adminNote: options?.adminNote,
                    cancelledBy: options?.cancelledBy,
                },
            });

            notifyAppointmentStatusChanged({
                appointmentId: targetAppointment?.id || appointmentId,
                userEmail: recipientEmail,
                appointmentCode: targetAppointment?.appointmentCode,
                status,
                reason: options?.reason || undefined,
            });
        },
        [state.appointments, state.users]
    );

    const updateAppointment = useCallback((appointmentId: string, patch: Partial<AdminAppointmentRecord>) => {
        dispatch({ type: "appointment/update", payload: { id: appointmentId, patch } });
    }, []);

    const sendNotification = useCallback(
        (input: SendNotificationInput): number => {
            const recipients = resolveRecipients(state, input);
            const sentAt = new Date().toISOString();

            recipients.forEach((recipient) => {
                const storageKey = buildNotificationStorageKey(recipient.role, recipient.email);
                appendNotification(storageKey, {
                    id: createId("notif"),
                    title: input.title.trim(),
                    message: input.message.trim(),
                    createdAt: sentAt,
                    read: false,
                });
            });

            dispatch({
                type: "notifications/log",
                payload: {
                    id: createId("sent"),
                    target: input.target,
                    title: input.title.trim(),
                    message: input.message.trim(),
                    targetEmail: input.target === "email" ? input.targetEmail?.trim() : undefined,
                    sentAt,
                    recipientCount: recipients.length,
                },
            });

            return recipients.length;
        },
        [state]
    );

    const value = useMemo<AdminPanelContextValue>(
        () => ({
            state,
            createTest,
            updateTest,
            deleteTest,
            updateSettings,
            toggleUserBlocked,
            updateAppointmentStatus,
            updateAppointment,
            sendNotification,
            refreshState,
        }),
        [
            state,
            createTest,
            updateTest,
            deleteTest,
            updateSettings,
            toggleUserBlocked,
            updateAppointmentStatus,
            updateAppointment,
            sendNotification,
            refreshState,
        ]
    );

    return <AdminPanelContext.Provider value={value}>{children}</AdminPanelContext.Provider>;
};

export const useAdminPanelContext = (): AdminPanelContextValue => {
    const context = useContext(AdminPanelContext);
    if (!context) {
        throw new Error("useAdminPanelContext must be used within AdminPanelProvider");
    }
    return context;
};
