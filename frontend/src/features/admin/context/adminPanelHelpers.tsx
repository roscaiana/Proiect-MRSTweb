import type { AdminTestInput } from "../types";

export const createId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

export const normalizeQuestions = (questions: AdminTestInput["questions"], testId: string) => {
    return questions.map((question, index) => ({
        id: question.id || `${testId}-q-${index + 1}`,
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()),
        correctAnswer: question.correctAnswer,
    }));
};
