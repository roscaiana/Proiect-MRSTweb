import { apiClient } from "../api/axiosClient";
import type {
    ActionResponse,
    AnswerOptionCreateDto,
    AnswerOptionInfoDto,
    AnswerOptionUpdateDto,
} from "./types";

const RESOURCE = "/AnswerOption";

export const answerOptionService = {
    async getAll(): Promise<AnswerOptionInfoDto[]> {
        const response = await apiClient.get<AnswerOptionInfoDto[]>(RESOURCE);
        return response.data;
    },

    async getById(id: number): Promise<AnswerOptionInfoDto> {
        const response = await apiClient.get<AnswerOptionInfoDto>(`${RESOURCE}/${id}`);
        return response.data;
    },

    async create(dto: AnswerOptionCreateDto): Promise<ActionResponse> {
        const response = await apiClient.post<ActionResponse>(RESOURCE, dto);
        return response.data;
    },

    async update(id: number, dto: AnswerOptionUpdateDto): Promise<ActionResponse> {
        const response = await apiClient.put<ActionResponse>(`${RESOURCE}/${id}`, dto);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`${RESOURCE}/${id}`);
    },
};
