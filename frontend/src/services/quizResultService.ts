import { apiClient } from "../api/axiosClient";
import type {
    ActionResponse,
    QuizAnswerCheckRequestDto,
    QuizAnswerCheckResultDto,
    QuizEvaluationRequestDto,
    QuizEvaluationResultDto,
    QuizResultSubmitDto,
} from "./types";

const RESOURCE = "/QuizResult";

export const quizResultService = {
    async checkAnswer(dto: QuizAnswerCheckRequestDto): Promise<QuizAnswerCheckResultDto> {
        const response = await apiClient.post<ActionResponse<QuizAnswerCheckResultDto>>(`${RESOURCE}/check-answer`, dto);
        if (!response.data.isSuccess || !response.data.data) {
            throw new Error(response.data.message || "Nu s-a putut verifica raspunsul.");
        }

        return response.data.data;
    },

    async evaluate(dto: QuizEvaluationRequestDto): Promise<QuizEvaluationResultDto> {
        const response = await apiClient.post<ActionResponse<QuizEvaluationResultDto>>(`${RESOURCE}/evaluate`, dto);
        if (!response.data.isSuccess || !response.data.data) {
            throw new Error(response.data.message || "Nu s-a putut evalua testul.");
        }

        return response.data.data;
    },

    async submit(dto: QuizResultSubmitDto): Promise<ActionResponse> {
        const response = await apiClient.post<ActionResponse>(`${RESOURCE}/submit`, dto);
        if (!response.data.isSuccess) {
            throw new Error(response.data.message || "Nu s-a putut salva rezultatul.");
        }

        return response.data;
    },
};
