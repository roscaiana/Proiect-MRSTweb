import { apiClient } from "../api/axiosClient";
import type { ActionResponse, QuizSessionStartRequestDto, QuizSessionStartResultDto } from "./types";

const RESOURCE = "/QuizSession";

export const quizSessionService = {
    async start(dto: QuizSessionStartRequestDto): Promise<QuizSessionStartResultDto> {
        const response = await apiClient.post<ActionResponse<QuizSessionStartResultDto>>(`${RESOURCE}/start`, dto);
        if (!response.data.isSuccess || !response.data.data) {
            throw new Error(response.data.message || "Nu s-a putut porni sesiunea de test.");
        }

        return response.data.data;
    },
};
