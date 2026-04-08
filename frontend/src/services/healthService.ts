import { apiClient } from "../api/axiosClient";
import type { HealthStatus } from "./types";

export const healthService = {
    async check(): Promise<HealthStatus> {
        const response = await apiClient.get<HealthStatus>("/health");
        return response.data;
    },
};
