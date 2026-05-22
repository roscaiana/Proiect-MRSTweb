import { apiClient } from "../api/axiosClient";
import type { ActionResponse, ContactMessageDto } from "./types";

const RESOURCE = "/contact";

export const contactService = {
    async send(dto: ContactMessageDto): Promise<ActionResponse> {
        const response = await apiClient.post<ActionResponse>(RESOURCE, dto);
        return response.data;
    },
};
