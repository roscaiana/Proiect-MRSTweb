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

export type HealthStatus = {
    status: string;
    timestamp: string;
};
