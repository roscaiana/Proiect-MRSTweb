import { apiClient } from "../api/axiosClient";
import type { QuizCategory, Question } from "../types/quiz";

type ApiQuiz = {
    id: number;
    title?: string;
    description?: string | null;
};

type ApiQuestion = {
    id: number;
    text?: string;
    quizId: number;
};

type ApiAnswerOption = {
    id: number;
    text?: string;
    questionId: number;
};

const CERTIFICATION_2026_TITLE =
    "Banca de întrebări pentru examenul de certificare general (Sesiunea de certificare 2026)";
const TEST_QUESTION_COUNT = 30;
const TEST_DURATION_MINUTES = 30;

export const quizCategories: QuizCategory[] = [];
export const questionBanks: Record<string, Question[]> = {};

const QUIZ_API_BASE_URL = "";

let apiQuizCategoriesCache: QuizCategory[] | null = null;
let apiQuestionBankCache: Record<string, Question[]> | null = null;

const toDifficulty = (questionCount: number): QuizCategory["difficulty"] => {
    if (questionCount <= 40) return "beginner";
    if (questionCount <= 120) return "intermediate";
    return "advanced";
};

const mapApiQuizData = (
    quizzes: ApiQuiz[],
    questions: ApiQuestion[],
    answerOptions: ApiAnswerOption[],
): { categories: QuizCategory[]; questionBank: Record<string, Question[]> } => {
    const certificationQuiz = quizzes.find((quiz) => (quiz.title || "").trim() === CERTIFICATION_2026_TITLE);
    if (!certificationQuiz) {
        return { categories: [], questionBank: {} };
    }

    const answerOptionsByQuestionId = answerOptions.reduce<Record<number, ApiAnswerOption[]>>((acc, option) => {
        if (!acc[option.questionId]) {
            acc[option.questionId] = [];
        }

        acc[option.questionId].push(option);
        return acc;
    }, {});

    const questionsByQuizId = questions.reduce<Record<number, Question[]>>((acc, question) => {
        const questionOptions = (answerOptionsByQuestionId[question.id] || []).slice().sort((a, b) => a.id - b.id);
        if (questionOptions.length === 0) {
            return acc;
        }

        const mappedQuestion: Question = {
            id: String(question.id),
            text: question.text || "",
            options: questionOptions.map((option) => ({
                id: option.id,
                text: option.text || "",
            })),
        };

        if (!acc[question.quizId]) {
            acc[question.quizId] = [];
        }

        acc[question.quizId].push(mappedQuestion);
        return acc;
    }, {});

    const bankQuestions = questionsByQuizId[certificationQuiz.id] || [];

    const categories: QuizCategory[] = [
        {
            id: String(certificationQuiz.id),
            title: certificationQuiz.title || "Test certificare 2026",
            description: `Fiecare sesiune generează ${TEST_QUESTION_COUNT} întrebări aleatorii din banca oficială.`,
            icon: "📝",
            questionCount: TEST_QUESTION_COUNT,
            estimatedTime: TEST_DURATION_MINUTES,
            difficulty: toDifficulty(bankQuestions.length),
        },
    ];

    const questionBank: Record<string, Question[]> = {
        [String(certificationQuiz.id)]: bankQuestions,
    };

    return { categories, questionBank };
};

export const hydrateQuizDataFromApi = (): Promise<boolean> => {
    return Promise.all([
        apiClient.get<ApiQuiz[]>(`${QUIZ_API_BASE_URL}/Quiz`),
        apiClient.get<ApiQuestion[]>(`${QUIZ_API_BASE_URL}/Question`),
        apiClient.get<ApiAnswerOption[]>(`${QUIZ_API_BASE_URL}/AnswerOption/public`),
    ])
        .then(([quizzesResponse, questionsResponse, answerOptionsResponse]) => {
            const mapped = mapApiQuizData(
                Array.isArray(quizzesResponse.data) ? quizzesResponse.data : [],
                Array.isArray(questionsResponse.data) ? questionsResponse.data : [],
                Array.isArray(answerOptionsResponse.data) ? answerOptionsResponse.data : [],
            );

            if (mapped.categories.length === 0) {
                return false;
            }

            apiQuizCategoriesCache = mapped.categories;
            apiQuestionBankCache = mapped.questionBank;
            return true;
        })
        .catch(() => false);
};

export const getQuestionsByCategory = (categoryId: string): Question[] => {
    return apiQuestionBankCache?.[categoryId] || [];
};

export const getCategoryById = (categoryId: string): QuizCategory | undefined => {
    return getQuizCategories().find((cat) => cat.id === categoryId);
};

export const getQuizCategories = (): QuizCategory[] => {
    return apiQuizCategoriesCache || [];
};
