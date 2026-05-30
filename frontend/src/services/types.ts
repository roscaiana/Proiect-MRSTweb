// Shared DTO types that mirror the backend domain models.
// Keep in sync with e_ElectoralWeb.Domain/Models/**.

export type QuizInfoDto = {
    id: number;
    title: string;
    description?: string | null;
};

export type QuizCreateDto = {
    title: string;
    description?: string | null;
};

export type QuizUpdateDto = QuizCreateDto;

export type QuestionInfoDto = {
    id: number;
    text: string;
    quizId: number;
};

export type QuestionCreateDto = {
    text: string;
    quizId: number;
};

export type QuestionUpdateDto = {
    text: string;
};

export type AnswerOptionInfoDto = {
    id: number;
    text: string;
    isCorrect: boolean;
    questionId: number;
};

export type AnswerOptionPublicDto = {
    id: number;
    text: string;
    questionId: number;
};

export type AnswerOptionCreateDto = {
    text: string;
    isCorrect: boolean;
    questionId: number;
};

export type AnswerOptionUpdateDto = {
    text: string;
    isCorrect: boolean;
};

export type UserLoginDto = {
    credentialType: string;
    password: string;
};

export type UserRegisterDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type ActionResponse<T = unknown> = {
    isSuccess: boolean;
    message?: string | null;
    data?: T | null;
};

export type UserInfoDto = {
    id: number;
    fullName: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    userName: string;
    phone?: string;
    nickname?: string | null;
    avatarDataUrl?: string | null;
    role: string;
    isBlocked: boolean;
    registeredOn: string;
};

export type UserProfileUpdateDto = {
    fullName: string;
    email: string;
    phone?: string;
    nickname?: string;
    avatarDataUrl?: string;
};

export type ContactMessageDto = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

export type QuizAnswerCheckRequestDto = {
    questionId: number;
    answerOptionId: number;
};

export type QuizAnswerCheckResultDto = {
    questionId: number;
    answerOptionId: number;
    isCorrect: boolean;
    correctAnswerText: string;
};

export type QuizEvaluationSubmissionDto = {
    questionId: number;
    answerOptionId: number | null;
};

export type QuizEvaluationRequestDto = {
    quizId: number;
    mode: string;
    timeTaken: number;
    durationSeconds: number;
    completedAt: string;
    questionIds: number[];
    answers: QuizEvaluationSubmissionDto[];
};

export type QuizEvaluationAnswerDto = {
    questionId: number;
    questionText: string;
    userAnswerId?: number | null;
    userAnswerText?: string | null;
    correctAnswerText?: string | null;
    isCorrect: boolean;
};

export type QuizEvaluationResultDto = {
    quizId: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
    score: number;
    timeTaken: number;
    durationSeconds: number;
    completedAt: string;
    answers: QuizEvaluationAnswerDto[];
};

export type QuizResultSubmitDto = {
    quizId: number;
    userId: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
    score: number;
    timeTaken: number;
    mode: string;
    completedAt: string;
};

export type NewsDto = {
    id: number;
    title: string;
    description: string;
    category: string;
    image: string;
    sourceUrl?: string | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
};

export type NewsCreateDto = {
    title: string;
    description: string;
    category: string;
    image: string;
    sourceUrl?: string;
    publishedAt: string;
};

export type HealthStatus = {
    status: string;
    timestamp: string;
};
