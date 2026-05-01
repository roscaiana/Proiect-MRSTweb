import { isAxiosError } from "axios";
import { apiClient } from "./axiosClient";
import type { AuthCredentials, RegisterData, User } from "../types/user";

type ApiUserDto = {
    id?: number | string;
    fullName?: string;
    email?: string;
    role?: string;
    registeredOn?: string;
    phone?: string;
};

type ApiAuthSuccessResponse = {
    isSuccess?: boolean;
    token?: string;
    user?: ApiUserDto;
    message?: string;
};

type ApiActionResponse = {
    isSuccess?: boolean;
    message?: string;
};

const toFrontendRole = (role: string | undefined): User["role"] => {
    return role?.trim().toLowerCase() === "admin" ? "admin" : "user";
};

const toFrontendUser = (apiUser: ApiUserDto): User => {
    return {
        id: String(apiUser.id ?? ""),
        fullName: apiUser.fullName ?? "",
        email: apiUser.email ?? "",
        role: toFrontendRole(apiUser.role),
        createdAt: apiUser.registeredOn ? new Date(apiUser.registeredOn) : new Date(),
        phoneNumber: apiUser.phone || undefined,
        isBlocked: false,
    };
};

export const loginWithApi = async (
    credentials: AuthCredentials,
): Promise<{ user: User; token: string }> => {
    try {
        const response = await apiClient.post<ApiAuthSuccessResponse>("/session/auth", credentials);
        const payload = response.data;

        if (!payload?.isSuccess || !payload.user || !payload.token) {
            throw new Error(payload?.message || "Autentificare esuata");
        }

        return {
            user: toFrontendUser(payload.user),
            token: payload.token,
        };
    } catch (error: unknown) {
        if (isAxiosError<ApiAuthSuccessResponse>(error)) {
            const apiMessage = error.response?.data?.message;
            throw new Error(apiMessage || "Autentificare esuata");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Autentificare esuata");
    }
};

export const registerWithApi = async (data: RegisterData): Promise<void> => {
    try {
        const response = await apiClient.post<ApiActionResponse>("/reg", data);
        const payload = response.data;

        if (!payload?.isSuccess) {
            throw new Error(payload?.message || "Inregistrare esuata");
        }
    } catch (error: unknown) {
        if (isAxiosError<ApiActionResponse>(error)) {
            const apiMessage = error.response?.data?.message;
            throw new Error(apiMessage || "Inregistrare esuata");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Inregistrare esuata");
    }
};
