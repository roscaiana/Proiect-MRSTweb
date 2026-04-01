import { quizCategories, questionBanks } from "../../data/quizData";
import { assertNoSimulatedServerError } from "../../utils/serverErrorSimulation";
import { emitStorageUpdate } from "../../utils/storageEvents";
import type {
    AdminAppointmentRecord,
    AdminNewsArticle,
    AdminState,
    AdminTest,
    AdminUserRecord,
    ExamSettings,
    QuizHistoryRecord,
    SentNotificationLog,
} from "./types";

export const STORAGE_KEYS = {
    tests: "adminTests",
    settings: "examSettings",
    users: "users",
    appointments: "appointments",
    quizHistory: "quizHistory",
    sentNotifications: "adminSentNotifications",
    news: "adminNews",
} as const;

const ensureNoSimulatedServerError = (): void => {
    assertNoSimulatedServerError();
};

const DEFAULT_SETTINGS: ExamSettings = {
    testDurationMinutes: 30,
    passingThreshold: 70,
    appointmentsPerDay: 30,
    appointmentLeadTimeHours: 24,
    maxReschedulesPerUser: 2,
    rejectionCooldownDays: 2,
    appointmentLocation: "Centrul de Instruire Continuă",
    appointmentRoom: "Sală A-12",
    allowedWeekdays: [1, 3, 5], // Mon, Wed, Fri
    blockedDates: [],
    capacityOverrides: [],
    slotOverrides: [],
};

const readArray = <T>(raw: string | null): T[] => {
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as T[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const asRecord = (value: unknown): Record<string, unknown> =>
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const createSeedTests = (): AdminTest[] => {
    const now = new Date().toISOString();

    return quizCategories.map((category) => {
        const questions = (questionBanks[category.id] || []).map((question, index) => ({
            id: question.id || `${category.id}-q-${index + 1}`,
            text: question.text || `Întrebarea ${index + 1}`,
            options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
            correctAnswer: typeof question.correctAnswer === "number" ? question.correctAnswer : 0,
        }));

        return {
            id: category.id,
            title: category.title,
            description: category.description,
            durationMinutes: category.estimatedTime || 30,
            passingScore: 70,
            questions,
            createdAt: now,
            updatedAt: now,
        };
    });
};

const normalizeTest = (test: Partial<AdminTest>, index: number): AdminTest => {
    const now = new Date().toISOString();
    const questions = Array.isArray(test.questions)
        ? test.questions.map((question, questionIndex) => ({
              id: question.id || `${test.id || `test-${index + 1}`}-q-${questionIndex + 1}`,
              text: question.text || "",
              options: Array.isArray(question.options)
                  ? question.options.map((option) => option || "")
                  : ["", "", "", ""],
              correctAnswer: typeof question.correctAnswer === "number" ? question.correctAnswer : 0,
          }))
        : [];

    return {
        id: test.id || `test-${index + 1}`,
        title: test.title || "Test nou",
        description: test.description || "",
        durationMinutes: Number(test.durationMinutes) || DEFAULT_SETTINGS.testDurationMinutes,
        passingScore: Number(test.passingScore) || DEFAULT_SETTINGS.passingThreshold,
        questions,
        createdAt: test.createdAt || now,
        updatedAt: test.updatedAt || now,
    };
};

export const readAdminTests = (): AdminTest[] => {
    ensureNoSimulatedServerError();
    const tests = readArray<Partial<AdminTest>>(localStorage.getItem(STORAGE_KEYS.tests)).map(
        normalizeTest
    );

    if (tests.length > 0) {
        return tests;
    }

    const seeded = createSeedTests();
    localStorage.setItem(STORAGE_KEYS.tests, JSON.stringify(seeded));
    return seeded;
};

export const writeAdminTests = (tests: AdminTest[]): void => {
    ensureNoSimulatedServerError();
    localStorage.setItem(STORAGE_KEYS.tests, JSON.stringify(tests));
    emitStorageUpdate(STORAGE_KEYS.tests);
};

export const readExamSettings = (): ExamSettings => {
    ensureNoSimulatedServerError();
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) {
        return DEFAULT_SETTINGS;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<ExamSettings>;
        return {
            testDurationMinutes:
                Number(parsed.testDurationMinutes) || DEFAULT_SETTINGS.testDurationMinutes,
            passingThreshold: Number(parsed.passingThreshold) || DEFAULT_SETTINGS.passingThreshold,
            appointmentsPerDay:
                Number(parsed.appointmentsPerDay) || DEFAULT_SETTINGS.appointmentsPerDay,
            appointmentLeadTimeHours:
                Math.max(0, Number(parsed.appointmentLeadTimeHours)) ||
                DEFAULT_SETTINGS.appointmentLeadTimeHours,
            maxReschedulesPerUser:
                Math.max(0, Number(parsed.maxReschedulesPerUser)) ||
                DEFAULT_SETTINGS.maxReschedulesPerUser,
            rejectionCooldownDays:
                Math.max(0, Number(parsed.rejectionCooldownDays)) ||
                DEFAULT_SETTINGS.rejectionCooldownDays,
            appointmentLocation:
                typeof parsed.appointmentLocation === "string" && parsed.appointmentLocation.trim()
                    ? parsed.appointmentLocation.trim()
                    : DEFAULT_SETTINGS.appointmentLocation,
            appointmentRoom:
                typeof parsed.appointmentRoom === "string" && parsed.appointmentRoom.trim()
                    ? parsed.appointmentRoom.trim()
                    : DEFAULT_SETTINGS.appointmentRoom,
            allowedWeekdays:
                Array.isArray(parsed.allowedWeekdays) && parsed.allowedWeekdays.length > 0
                    ? (parsed.allowedWeekdays as number[]).filter(
                          (d) => Number.isInteger(d) && d >= 0 && d <= 6
                      )
                    : DEFAULT_SETTINGS.allowedWeekdays,
            blockedDates: Array.isArray(parsed.blockedDates)
                ? parsed.blockedDates
                      .map((item) => {
                          const record = asRecord(item);
                          const note = typeof record.note === "string" && record.note.trim() ? record.note.trim() : undefined;
                          return {
                              date: String(record.date || "").slice(0, 10),
                              note,
                          };
                      })
                      .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date))
                : DEFAULT_SETTINGS.blockedDates,
            capacityOverrides: Array.isArray(parsed.capacityOverrides)
                ? parsed.capacityOverrides
                      .map((item) => {
                          const record = asRecord(item);
                          return {
                              date: String(record.date || "").slice(0, 10),
                              appointmentsPerDay: Number(record.appointmentsPerDay) || 0,
                          };
                      })
                      .filter(
                          (item) =>
                              /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.appointmentsPerDay > 0
                      )
                : DEFAULT_SETTINGS.capacityOverrides,
            slotOverrides: Array.isArray(parsed.slotOverrides)
                ? parsed.slotOverrides
                      .map((item) => {
                          const record = asRecord(item);
                          const slotsRaw = Array.isArray(record.slots) ? record.slots : [];
                          const slots = slotsRaw
                              .map((slot, slotIndex: number) => {
                                  const slotRecord = asRecord(slot);
                                  return {
                                      id: String(slotRecord.id || `slot-${slotIndex + 1}`),
                                      startTime: String(slotRecord.startTime || ""),
                                      endTime: String(slotRecord.endTime || ""),
                                      available:
                                          typeof slotRecord.available === "boolean"
                                              ? slotRecord.available
                                              : true,
                                  };
                              })
                              .filter((slot) => slot.startTime.length > 0 && slot.endTime.length > 0);
                          return {
                              date: String(record.date || "").slice(0, 10),
                              slots,
                          };
                      })
                      .filter(
                          (item) =>
                              /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
                              Array.isArray(item.slots) &&
                              item.slots.length > 0
                      )
                : DEFAULT_SETTINGS.slotOverrides,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const writeExamSettings = (settings: ExamSettings): void => {
    ensureNoSimulatedServerError();
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    emitStorageUpdate(STORAGE_KEYS.settings);
};

export const readAdminUsers = (): AdminUserRecord[] => {
    ensureNoSimulatedServerError();
    const rawUsers = readArray<Record<string, unknown>>(localStorage.getItem(STORAGE_KEYS.users));

    return rawUsers.map((user, index) => {
        const record = asRecord(user);
        return {
            id: typeof record.id === "string" ? record.id : `user-${index + 1}`,
            email: typeof record.email === "string" ? record.email : "",
            fullName:
                typeof record.fullName === "string"
                    ? record.fullName
                    : typeof record.name === "string"
                        ? record.name
                        : "Utilizator",
            nickname:
                typeof record.nickname === "string" && record.nickname.trim()
                    ? record.nickname.trim()
                    : undefined,
            phoneNumber:
                typeof record.phoneNumber === "string" && record.phoneNumber.trim()
                    ? record.phoneNumber.trim()
                    : undefined,
            avatarDataUrl:
                typeof record.avatarDataUrl === "string" && record.avatarDataUrl.trim()
                    ? record.avatarDataUrl
                    : undefined,
            role: record.role === "admin" ? "admin" : "user",
            createdAt: record.createdAt ? new Date(String(record.createdAt)).toISOString() : new Date().toISOString(),
            isBlocked: Boolean(record.isBlocked),
            lastLoginAt: record.lastLoginAt ? new Date(String(record.lastLoginAt)).toISOString() : undefined,
        };
    });
};

export const writeAdminUsers = (users: AdminUserRecord[]): void => {
    ensureNoSimulatedServerError();
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    emitStorageUpdate(STORAGE_KEYS.users);
};

export const readAppointments = (): AdminAppointmentRecord[] => {
    ensureNoSimulatedServerError();
    const rawAppointments = readArray<Record<string, unknown>>(localStorage.getItem(STORAGE_KEYS.appointments));

    return rawAppointments.map((appointment, index) => {
        const record = asRecord(appointment);
        return {
            id: typeof record.id === "string" ? record.id : `appointment-${index + 1}`,
            appointmentCode:
                typeof record.appointmentCode === "string" && record.appointmentCode.trim()
                    ? record.appointmentCode.trim()
                    : `AP-${String(index + 1).padStart(4, "0")}`,
            fullName: typeof record.fullName === "string" ? record.fullName : "",
            idOrPhone: typeof record.idOrPhone === "string" ? record.idOrPhone : "",
            userEmail: typeof record.userEmail === "string" ? record.userEmail : undefined,
            date: typeof record.date === "string" ? record.date : new Date().toISOString(),
            slotStart: typeof record.slotStart === "string" ? record.slotStart : "00:00",
            slotEnd: typeof record.slotEnd === "string" ? record.slotEnd : "00:30",
            status:
                record.status === "approved" ||
                record.status === "rejected" ||
                record.status === "cancelled"
                    ? record.status
                    : "pending",
            statusReason:
                typeof record.statusReason === "string" && record.statusReason.trim()
                    ? record.statusReason.trim()
                    : undefined,
            adminNote:
                typeof record.adminNote === "string" && record.adminNote.trim()
                    ? record.adminNote.trim()
                    : undefined,
            cancelledBy:
                record.cancelledBy === "user" || record.cancelledBy === "admin"
                    ? record.cancelledBy
                    : undefined,
            previousAppointmentId:
                typeof record.previousAppointmentId === "string" &&
                record.previousAppointmentId.trim()
                    ? record.previousAppointmentId.trim()
                    : undefined,
            rescheduleCount:
                Number.isFinite(Number(record.rescheduleCount))
                    ? Math.max(0, Number(record.rescheduleCount))
                    : 0,
            createdAt: record.createdAt
                ? new Date(String(record.createdAt)).toISOString()
                : new Date().toISOString(),
            updatedAt: record.updatedAt
                ? new Date(String(record.updatedAt)).toISOString()
                : undefined,
        };
    });
};

export const writeAppointments = (appointments: AdminAppointmentRecord[]): void => {
    ensureNoSimulatedServerError();
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
    emitStorageUpdate(STORAGE_KEYS.appointments);
};

export const readQuizHistory = (): QuizHistoryRecord[] => {
    ensureNoSimulatedServerError();
    const rawHistory = readArray<Record<string, unknown>>(localStorage.getItem(STORAGE_KEYS.quizHistory));

    return rawHistory.map((entry) => {
        const record = asRecord(entry);
        const chapterStatsRaw = Array.isArray(record.chapterStats) ? record.chapterStats : [];
        const chapterStats = chapterStatsRaw
            .map((chapter) => {
                const chapterRecord = asRecord(chapter);
                return {
                    chapterId: String(chapterRecord.chapterId || "general"),
                    chapterTitle: String(chapterRecord.chapterTitle || "General"),
                    total: Number(chapterRecord.total) || 0,
                    correct: Number(chapterRecord.correct) || 0,
                    accuracy: Number(chapterRecord.accuracy) || 0,
                };
            })
            .filter((chapter) => chapter.total > 0);

        return {
            categoryId: typeof record.categoryId === "string" ? record.categoryId : "unknown",
            categoryTitle: typeof record.categoryTitle === "string" ? record.categoryTitle : "Test",
            score: Number(record.score) || 0,
            mode: record.mode === "training" || record.mode === "exam" ? record.mode : undefined,
            totalQuestions: Number.isFinite(Number(record.totalQuestions))
                ? Number(record.totalQuestions)
                : undefined,
            correctAnswers: Number.isFinite(Number(record.correctAnswers))
                ? Number(record.correctAnswers)
                : undefined,
            wrongAnswers: Number.isFinite(Number(record.wrongAnswers))
                ? Number(record.wrongAnswers)
                : undefined,
            unanswered: Number.isFinite(Number(record.unanswered)) ? Number(record.unanswered) : undefined,
            timeTaken: Number.isFinite(Number(record.timeTaken)) ? Number(record.timeTaken) : undefined,
            durationSeconds: Number.isFinite(Number(record.durationSeconds))
                ? Number(record.durationSeconds)
                : undefined,
            chapterStats: chapterStats.length > 0 ? chapterStats : undefined,
            completedAt: record.completedAt
                ? new Date(String(record.completedAt)).toISOString()
                : new Date().toISOString(),
            userEmail: typeof record.userEmail === "string" ? record.userEmail : undefined,
            userName: typeof record.userName === "string" ? record.userName : undefined,
        };
    });
};

export const writeQuizHistory = (history: QuizHistoryRecord[]): void => {
    ensureNoSimulatedServerError();
    localStorage.setItem(STORAGE_KEYS.quizHistory, JSON.stringify(history));
    emitStorageUpdate(STORAGE_KEYS.quizHistory);
};

export const readSentNotifications = (): SentNotificationLog[] => {
    ensureNoSimulatedServerError();
    const rawLogs = readArray<Record<string, unknown>>(localStorage.getItem(STORAGE_KEYS.sentNotifications));

    return rawLogs.map((log, index) => {
        const record = asRecord(log);
        return {
            id: typeof record.id === "string" ? record.id : `sent-log-${index + 1}`,
            target:
                record.target === "users" ||
                record.target === "admins" ||
                record.target === "email" ||
                record.target === "all"
                    ? record.target
                    : "all",
            title: typeof record.title === "string" ? record.title : "",
            message: typeof record.message === "string" ? record.message : "",
            targetEmail: typeof record.targetEmail === "string" ? record.targetEmail : undefined,
            sentAt: record.sentAt ? new Date(String(record.sentAt)).toISOString() : new Date().toISOString(),
            recipientCount: Number(record.recipientCount) || 0,
        };
    });
};

export const writeSentNotifications = (logs: SentNotificationLog[]): void => {
    ensureNoSimulatedServerError();
    localStorage.setItem(STORAGE_KEYS.sentNotifications, JSON.stringify(logs));
    emitStorageUpdate(STORAGE_KEYS.sentNotifications);
};

const SEED_NEWS: AdminNewsArticle[] = [
    { id: "news-1", title: "Rezultatele Sesiunii de Certificare 2025", description: "A fost finalizată centralizarea rezultatelor pentru sesiunea de certificare 2025. Felicitări celor 7764 de candidați care au promovat!", category: "Certificare", image: "cert", publishedAt: "2025-02-24T00:00:00.000Z", createdAt: "2025-02-24T00:00:00.000Z", updatedAt: "2025-02-24T00:00:00.000Z" },
    { id: "news-2", title: "Lansarea Programului de Instruire pentru Observatori", description: "CICDE lansează noul modul de instruire dedicat observatorilor naționali și internaționali pentru următoarele scrutine.", category: "Instruiri", image: "users", publishedAt: "2025-02-24T00:00:00.000Z", createdAt: "2025-02-24T00:00:00.000Z", updatedAt: "2025-02-24T00:00:00.000Z" },
    { id: "news-3", title: "Actualizări ale Codului Electoral: Ce trebuie să știți", description: "Analiza principalelor modificări aduse Codului Electoral și impactul acestora asupra procesului de certificare a funcționarilor.", category: "Legislativ", image: "law", publishedAt: "2025-02-24T00:00:00.000Z", createdAt: "2025-02-24T00:00:00.000Z", updatedAt: "2025-02-24T00:00:00.000Z" },
    { id: "news-4", title: "Calendarul Electoral pentru Alegerile Locale 2026", description: "Consultă etapele principale și termenele limită pentru organizarea scrutinelelor locale de anul viitor.", category: "Evenimente", image: "calendar", publishedAt: "2025-02-24T00:00:00.000Z", createdAt: "2025-02-24T00:00:00.000Z", updatedAt: "2025-02-24T00:00:00.000Z" },
    { id: "news-5", title: "Nouă Platformă e-Electoral: Ghid de Utilizare", description: "Am lansat o interfață modernizată pentru a facilita accesul la resursele de studiu și simulările de examen.", category: "Platformă", image: "web", publishedAt: "2025-02-24T00:00:00.000Z", createdAt: "2025-02-24T00:00:00.000Z", updatedAt: "2025-02-24T00:00:00.000Z" },
    { id: "news-6", title: "Parteneriat CICDE cu Organizații Internaționale", description: "Colaborare nouă pentru schimbul de bune practici în domeniul educației electorale la nivel european.", category: "Extern", image: "globe", publishedAt: "2025-02-24T00:00:00.000Z", createdAt: "2025-02-24T00:00:00.000Z", updatedAt: "2025-02-24T00:00:00.000Z" },
];

export const readAdminNews = (): AdminNewsArticle[] => {
    ensureNoSimulatedServerError();
    const items = readArray<Record<string, unknown>>(localStorage.getItem(STORAGE_KEYS.news));
    if (items.length > 0) {
        return items.map((item, index) => {
            const record = asRecord(item);
            return {
                id: typeof record.id === "string" ? record.id : `news-${index + 1}`,
                title: typeof record.title === "string" ? record.title : "",
                description: typeof record.description === "string" ? record.description : "",
                category: typeof record.category === "string" ? record.category : "",
                image: typeof record.image === "string" ? record.image : "cert",
                publishedAt: record.publishedAt ? new Date(String(record.publishedAt)).toISOString() : new Date().toISOString(),
                createdAt: record.createdAt ? new Date(String(record.createdAt)).toISOString() : new Date().toISOString(),
                updatedAt: record.updatedAt ? new Date(String(record.updatedAt)).toISOString() : new Date().toISOString(),
            };
        });
    }
    localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(SEED_NEWS));
    return SEED_NEWS;
};

export const writeAdminNews = (news: AdminNewsArticle[]): void => {
    ensureNoSimulatedServerError();
    localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(news));
    emitStorageUpdate(STORAGE_KEYS.news);
};

export const loadAdminState = (): AdminState => {
    ensureNoSimulatedServerError();
    return {
        tests: readAdminTests(),
        settings: readExamSettings(),
        users: readAdminUsers(),
        appointments: readAppointments(),
        quizHistory: readQuizHistory(),
        sentNotifications: readSentNotifications(),
        news: readAdminNews(),
    };
};
