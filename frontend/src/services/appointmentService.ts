import { apiClient } from "../api/axiosClient";
import type { ActionResponse, AppointmentCreateDto, AppointmentDto, AppointmentStatusUpdateDto } from "./types";

const RESOURCE = "/appointment";

export const appointmentService = {
    async getAll(): Promise<AppointmentDto[]> {
        const response = await apiClient.get<AppointmentDto[]>(RESOURCE);
        return response.data;
    },

    async create(dto: AppointmentCreateDto): Promise<ActionResponse> {
        const response = await apiClient.post<ActionResponse>(RESOURCE, dto);
        return response.data;
    },

    async getByUser(userId: number): Promise<AppointmentDto[]> {
        const response = await apiClient.get<AppointmentDto[]>(`${RESOURCE}/byUser`, {
            params: { userId },
        });
        return response.data;
    },

    async updateStatus(id: number, dto: AppointmentStatusUpdateDto): Promise<ActionResponse> {
        const response = await apiClient.patch<ActionResponse>(`${RESOURCE}/${id}/status`, dto);
        return response.data;
    },

    async update(id: number, dto: AppointmentDto): Promise<ActionResponse> {
        const response = await apiClient.patch<ActionResponse>(`${RESOURCE}/${id}`, dto);
        return response.data;
    },
};
