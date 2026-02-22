export type AppointmentStatus = "pending" | "approved" | "rejected";
export type NotificationTarget = "all" | "users" | "admins" | "email";

export interface AdminQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

export interface AdminTest {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    questions: AdminQuestion[];
    createdAt: string;
    updatedAt: string;
}

export interface AdminTestInput {
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    questions: AdminQuestion[];
}

export interface ExamSettings {
    testDurationMinutes: number;
    passingThreshold: number;
    appointmentsPerDay: number;
}

export interface AdminUserRecord {
    id: string;
    email: string;
    fullName: string;
    role: "admin" | "user";
    createdAt: string;
    isBlocked: boolean;
    lastLoginAt?: string;
}

export interface AdminAppointmentRecord {
    id: string;
    fullName: string;
    idOrPhone: string;
    userEmail?: string;
    date: string;
    slotStart: string;
    slotEnd: string;
    status: AppointmentStatus;
    createdAt: string;
}

export interface QuizHistoryRecord {
    categoryId: string;
    categoryTitle: string;
    score: number;
    completedAt: string;
    mode?: "training" | "exam";
    totalQuestions?: number;
    correctAnswers?: number;
    wrongAnswers?: number;
    unanswered?: number;
    timeTaken?: number;
    durationSeconds?: number;
    chapterStats?: Array<{
        chapterId: string;
        chapterTitle: string;
        total: number;
        correct: number;
        accuracy: number;
    }>;
    userEmail?: string;
    userName?: string;
}

export interface SentNotificationLog {
    id: string;
    target: NotificationTarget;
    title: string;
    message: string;
    targetEmail?: string;
    sentAt: string;
    recipientCount: number;
}

export interface SendNotificationInput {
    target: NotificationTarget;
    title: string;
    message: string;
    targetEmail?: string;
}

export interface AdminState {
    tests: AdminTest[];
    settings: ExamSettings;
    users: AdminUserRecord[];
    appointments: AdminAppointmentRecord[];
    quizHistory: QuizHistoryRecord[];
    sentNotifications: SentNotificationLog[];
}
