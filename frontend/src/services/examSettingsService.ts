import { apiClient } from "../api/axiosClient";
import type { ActionResponse, ExamSettingsDto } from "./types";

const RESOURCE = "/examsettings";

export const examSettingsService = {
    async get(): Promise<ExamSettingsDto> {
        const response = await apiClient.get<ExamSettingsDto>(RESOURCE);
        return response.data;
    },

    async update(dto: ExamSettingsDto): Promise<ActionResponse> {
        const response = await apiClient.put<ActionResponse>(RESOURCE, dto);
        return response.data;
    },
};
