import { apiClient } from "../api/axiosClient";
import type { ActionResponse, UserLoginDto, UserRegisterDto } from "./types";

export const authService = {
    async login(dto: UserLoginDto): Promise<ActionResponse> {
        const response = await apiClient.post<ActionResponse>("/session/auth", dto);
        return response.data;
    },

    async register(dto: UserRegisterDto): Promise<ActionResponse> {
        const response = await apiClient.post<ActionResponse>("/reg", dto);
        return response.data;
    },
};
