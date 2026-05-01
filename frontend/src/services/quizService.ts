import { apiClient } from "../api/axiosClient";
import type { QuizCreateDto, QuizInfoDto, QuizUpdateDto } from "./types";

const RESOURCE = "/Quiz";

export const quizService = {
    async getAll(): Promise<QuizInfoDto[]> {
        const response = await apiClient.get<QuizInfoDto[]>(RESOURCE);
        return response.data;
    },

    async getById(id: number): Promise<QuizInfoDto> {
        const response = await apiClient.get<QuizInfoDto>(`${RESOURCE}/${id}`);
        return response.data;
    },

    async create(dto: QuizCreateDto): Promise<QuizInfoDto> {
        const response = await apiClient.post<QuizInfoDto>(RESOURCE, dto);
        return response.data;
    },

    async update(id: number, dto: QuizUpdateDto): Promise<QuizInfoDto> {
        const response = await apiClient.put<QuizInfoDto>(`${RESOURCE}/${id}`, dto);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`${RESOURCE}/${id}`);
    },
};
