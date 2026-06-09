import { apiClient } from "../api/axiosClient";
import type { ActionResponse, SupportQuestionDto, SupportQuestionInputDto } from "./types";

const RESOURCE = "/supportquestions";

export const supportQuestionService = {
    async getPublished(): Promise<SupportQuestionDto[]> {
        const response = await apiClient.get<SupportQuestionDto[]>(RESOURCE);
        return response.data;
    },

    async getAllForAdmin(): Promise<SupportQuestionDto[]> {
        const response = await apiClient.get<SupportQuestionDto[]>(`${RESOURCE}/admin`);
        return response.data;
    },

    async create(dto: SupportQuestionInputDto): Promise<ActionResponse<number>> {
        const response = await apiClient.post<ActionResponse<number>>(RESOURCE, dto);
        return response.data;
    },

    async update(id: number, dto: SupportQuestionInputDto): Promise<ActionResponse> {
        const response = await apiClient.put<ActionResponse>(`${RESOURCE}/${id}`, dto);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`${RESOURCE}/${id}`);
    },
};
