import { apiClient } from "../api/axiosClient";
import type { QuestionCreateDto, QuestionInfoDto, QuestionUpdateDto } from "./types";

const RESOURCE = "/Question";

export const questionService = {
    async getAll(): Promise<QuestionInfoDto[]> {
        const response = await apiClient.get<QuestionInfoDto[]>(RESOURCE);
        return response.data;
    },

    async getById(id: number): Promise<QuestionInfoDto> {
        const response = await apiClient.get<QuestionInfoDto>(`${RESOURCE}/${id}`);
        return response.data;
    },

    async create(dto: QuestionCreateDto): Promise<QuestionInfoDto> {
        const response = await apiClient.post<QuestionInfoDto>(RESOURCE, dto);
        return response.data;
    },

    async update(id: number, dto: QuestionUpdateDto): Promise<QuestionInfoDto> {
        const response = await apiClient.put<QuestionInfoDto>(`${RESOURCE}/${id}`, dto);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`${RESOURCE}/${id}`);
    },
};
