import { quizCategories, questionBanks } from "../../data/quizData";
import type {
    AdminAppointmentRecord,
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
} as const;

const emitStorageUpdate = (key: string): void => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app-storage-updated", { detail: { key } }));
    }
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
    localStorage.setItem(STORAGE_KEYS.tests, JSON.stringify(tests));
    emitStorageUpdate(STORAGE_KEYS.tests);
};

export const readExamSettings = (): ExamSettings => {
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
            blockedDates: Array.isArray(parsed.blockedDates)
                ? parsed.blockedDates
                      .map((item: any) => ({
                          date: String(item?.date || "").slice(0, 10),
                          note:
                              typeof item?.note === "string" && item.note.trim()
                                  ? item.note.trim()
                                  : undefined,
                      }))
                      .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date))
                : DEFAULT_SETTINGS.blockedDates,
            capacityOverrides: Array.isArray(parsed.capacityOverrides)
                ? parsed.capacityOverrides
                      .map((item: any) => ({
                          date: String(item?.date || "").slice(0, 10),
                          appointmentsPerDay: Number(item?.appointmentsPerDay) || 0,
                      }))
                      .filter(
                          (item) =>
                              /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.appointmentsPerDay > 0
                      )
                : DEFAULT_SETTINGS.capacityOverrides,
            slotOverrides: Array.isArray(parsed.slotOverrides)
                ? parsed.slotOverrides
                      .map((item: any) => ({
                          date: String(item?.date || "").slice(0, 10),
                          slots: Array.isArray(item?.slots)
                              ? item.slots
                                    .map((slot: any, slotIndex: number) => ({
                                        id: String(slot?.id || `slot-${slotIndex + 1}`),
                                        startTime: String(slot?.startTime || ""),
                                        endTime: String(slot?.endTime || ""),
                                        available:
                                            typeof slot?.available === "boolean"
                                                ? slot.available
                                                : true,
                                    }))
                                    .filter(
                                        (slot: any) =>
                                            slot.startTime.length > 0 && slot.endTime.length > 0
                                    )
                              : [],
                      }))
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
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    emitStorageUpdate(STORAGE_KEYS.settings);
};

export const readAdminUsers = (): AdminUserRecord[] => {
    const rawUsers = readArray<any>(localStorage.getItem(STORAGE_KEYS.users));

    return rawUsers.map((user, index) => ({
        id: user.id || `user-${index + 1}`,
        email: user.email || "",
        fullName: user.fullName || user.name || "Utilizator",
        role: user.role === "admin" ? "admin" : "user",
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        isBlocked: Boolean(user.isBlocked),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : undefined,
    }));
};

export const writeAdminUsers = (users: AdminUserRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    emitStorageUpdate(STORAGE_KEYS.users);
};

export const readAppointments = (): AdminAppointmentRecord[] => {
    const rawAppointments = readArray<any>(localStorage.getItem(STORAGE_KEYS.appointments));

    return rawAppointments.map((appointment, index) => ({
        id: appointment.id || `appointment-${index + 1}`,
        appointmentCode:
            typeof appointment.appointmentCode === "string" && appointment.appointmentCode.trim()
                ? appointment.appointmentCode.trim()
                : `AP-${String(index + 1).padStart(4, "0")}`,
        fullName: appointment.fullName || "",
        idOrPhone: appointment.idOrPhone || "",
        userEmail: appointment.userEmail || undefined,
        date: appointment.date || new Date().toISOString(),
        slotStart: appointment.slotStart || "00:00",
        slotEnd: appointment.slotEnd || "00:30",
        status:
            appointment.status === "approved" ||
            appointment.status === "rejected" ||
            appointment.status === "cancelled"
                ? appointment.status
                : "pending",
        statusReason:
            typeof appointment.statusReason === "string" && appointment.statusReason.trim()
                ? appointment.statusReason.trim()
                : undefined,
        adminNote:
            typeof appointment.adminNote === "string" && appointment.adminNote.trim()
                ? appointment.adminNote.trim()
                : undefined,
        cancelledBy:
            appointment.cancelledBy === "user" || appointment.cancelledBy === "admin"
                ? appointment.cancelledBy
                : undefined,
        previousAppointmentId:
            typeof appointment.previousAppointmentId === "string" &&
            appointment.previousAppointmentId.trim()
                ? appointment.previousAppointmentId.trim()
                : undefined,
        rescheduleCount:
            Number.isFinite(Number(appointment.rescheduleCount))
                ? Math.max(0, Number(appointment.rescheduleCount))
                : 0,
        createdAt: appointment.createdAt
            ? new Date(appointment.createdAt).toISOString()
            : new Date().toISOString(),
        updatedAt: appointment.updatedAt
            ? new Date(appointment.updatedAt).toISOString()
            : undefined,
    }));
};

export const writeAppointments = (appointments: AdminAppointmentRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
    emitStorageUpdate(STORAGE_KEYS.appointments);
};

export const readQuizHistory = (): QuizHistoryRecord[] => {
    const rawHistory = readArray<any>(localStorage.getItem(STORAGE_KEYS.quizHistory));

    return rawHistory.map((entry) => ({
        categoryId: entry.categoryId || "unknown",
        categoryTitle: entry.categoryTitle || "Test",
        score: Number(entry.score) || 0,
        mode: entry.mode === "training" || entry.mode === "exam" ? entry.mode : undefined,
        totalQuestions: Number.isFinite(Number(entry.totalQuestions))
            ? Number(entry.totalQuestions)
            : undefined,
        correctAnswers: Number.isFinite(Number(entry.correctAnswers))
            ? Number(entry.correctAnswers)
            : undefined,
        wrongAnswers: Number.isFinite(Number(entry.wrongAnswers))
            ? Number(entry.wrongAnswers)
            : undefined,
        unanswered: Number.isFinite(Number(entry.unanswered)) ? Number(entry.unanswered) : undefined,
        timeTaken: Number.isFinite(Number(entry.timeTaken)) ? Number(entry.timeTaken) : undefined,
        durationSeconds: Number.isFinite(Number(entry.durationSeconds))
            ? Number(entry.durationSeconds)
            : undefined,
        chapterStats: Array.isArray(entry.chapterStats)
            ? entry.chapterStats
                  .map((chapter: any) => ({
                      chapterId: String(chapter?.chapterId || "general"),
                      chapterTitle: String(chapter?.chapterTitle || "General"),
                      total: Number(chapter?.total) || 0,
                      correct: Number(chapter?.correct) || 0,
                      accuracy: Number(chapter?.accuracy) || 0,
                  }))
                  .filter((chapter: any) => chapter.total > 0)
            : undefined,
        completedAt: entry.completedAt
            ? new Date(entry.completedAt).toISOString()
            : new Date().toISOString(),
        userEmail: entry.userEmail || undefined,
        userName: entry.userName || undefined,
    }));
};

export const writeQuizHistory = (history: QuizHistoryRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.quizHistory, JSON.stringify(history));
    emitStorageUpdate(STORAGE_KEYS.quizHistory);
};

export const readSentNotifications = (): SentNotificationLog[] => {
    const rawLogs = readArray<any>(localStorage.getItem(STORAGE_KEYS.sentNotifications));

    return rawLogs.map((log, index) => ({
        id: log.id || `sent-log-${index + 1}`,
        target:
            log.target === "users" ||
            log.target === "admins" ||
            log.target === "email" ||
            log.target === "all"
                ? log.target
                : "all",
        title: log.title || "",
        message: log.message || "",
        targetEmail: log.targetEmail || undefined,
        sentAt: log.sentAt ? new Date(log.sentAt).toISOString() : new Date().toISOString(),
        recipientCount: Number(log.recipientCount) || 0,
    }));
};

export const writeSentNotifications = (logs: SentNotificationLog[]): void => {
    localStorage.setItem(STORAGE_KEYS.sentNotifications, JSON.stringify(logs));
    emitStorageUpdate(STORAGE_KEYS.sentNotifications);
};

export const loadAdminState = (): AdminState => {
    return {
        tests: readAdminTests(),
        settings: readExamSettings(),
        users: readAdminUsers(),
        appointments: readAppointments(),
        quizHistory: readQuizHistory(),
        sentNotifications: readSentNotifications(),
    };
};
