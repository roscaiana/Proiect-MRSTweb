import { apiClient } from "../api/axiosClient";
import type { ActionResponse, NewsCreateDto, NewsDto } from "./types";

const RESOURCE = "/news";

export const newsService = {
    async getAll(): Promise<NewsDto[]> {
        const response = await apiClient.get<NewsDto[]>(RESOURCE);
        return response.data;
    },

    async getById(id: number): Promise<NewsDto> {
        const response = await apiClient.get<NewsDto>(`${RESOURCE}/${id}`);
        return response.data;
    },

    async create(dto: NewsCreateDto): Promise<ActionResponse<number>> {
        const response = await apiClient.post<ActionResponse<number>>(RESOURCE, dto);
        return response.data;
    },

    async update(id: number, dto: NewsCreateDto): Promise<ActionResponse> {
        const response = await apiClient.put<ActionResponse>(`${RESOURCE}/${id}`, dto);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`${RESOURCE}/${id}`);
    },
};
