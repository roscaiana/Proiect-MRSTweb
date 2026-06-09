import { apiClient } from "../api/axiosClient";
import type { ActionResponse, LegislativeMaterialDto, LegislativeMaterialInputDto } from "./types";

const RESOURCE = "/legislativematerials";

export const legislativeMaterialService = {
    async getPublished(): Promise<LegislativeMaterialDto[]> {
        const response = await apiClient.get<LegislativeMaterialDto[]>(RESOURCE);
        return response.data;
    },

    async getAllForAdmin(): Promise<LegislativeMaterialDto[]> {
        const response = await apiClient.get<LegislativeMaterialDto[]>(`${RESOURCE}/admin`);
        return response.data;
    },

    async create(dto: LegislativeMaterialInputDto): Promise<ActionResponse<number>> {
        const response = await apiClient.post<ActionResponse<number>>(RESOURCE, dto);
        return response.data;
    },

    async update(id: number, dto: LegislativeMaterialInputDto): Promise<ActionResponse> {
        const response = await apiClient.put<ActionResponse>(`${RESOURCE}/${id}`, dto);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`${RESOURCE}/${id}`);
    },
};
