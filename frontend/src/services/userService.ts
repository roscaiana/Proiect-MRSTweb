import { apiClient } from "../api/axiosClient";
import type { ActionResponse, UserInfoDto } from "./types";

const RESOURCE = "/reg";

export const userService = {
    async getAll(): Promise<UserInfoDto[]> {
        const response = await apiClient.get<UserInfoDto[]>(`${RESOURCE}/getAll`);
        return response.data;
    },

    async toggleBlocked(id: number): Promise<ActionResponse> {
        const response = await apiClient.patch<ActionResponse>(`${RESOURCE}/${id}/toggle-block`);
        return response.data;
    },
};
