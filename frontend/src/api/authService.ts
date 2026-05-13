import { isAxiosError } from "axios";
import { apiClient } from "./axiosClient";
import type { AuthCredentials, RegisterData, User } from "../types/user";

type ApiUserDto = {
    userId?: number | string;
    email?: string;
    userName?: string;
    role?: string;
    token?: string;
};

type ApiActionResponse<TData> = {
    isSuccess?: boolean;
    message?: string;
    data?: TData;
};

const toFrontendRole = (role: string | undefined): User["role"] => {
    const normalizedRole = role?.trim().toLowerCase();
    if (normalizedRole === "admin") {
        return "admin";
    }

    if (normalizedRole === "manager") {
        return "manager";
    }

    return "user";
};

const toFrontendUser = (apiUser: ApiUserDto): User => {
    return {
        id: String(apiUser.userId ?? ""),
        fullName: apiUser.userName ?? apiUser.email ?? "",
        email: apiUser.email ?? "",
        role: toFrontendRole(apiUser.role),
        createdAt: new Date(),
        isBlocked: false,
    };
};

export const loginWithApi = async (
    credentials: AuthCredentials,
): Promise<{ user: User; token: string }> => {
    try {
        const response = await apiClient.post<ApiActionResponse<ApiUserDto>>("/auth/login", credentials);
        const payload = response.data;

        if (!payload?.isSuccess || !payload.data?.token) {
            throw new Error(payload?.message || "Autentificare esuata");
        }

        return {
            user: toFrontendUser(payload.data),
            token: payload.data.token,
        };
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            const apiMessage = typeof error.response?.data === "string"
                ? error.response.data
                : (error.response?.data as ApiActionResponse<ApiUserDto> | undefined)?.message;
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
        const response = await apiClient.post<ApiActionResponse<unknown>>("/auth/register", data);
        const payload = response.data;

        if (!payload?.isSuccess) {
            throw new Error(payload?.message || "Inregistrare esuata");
        }
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            const apiMessage = typeof error.response?.data === "string"
                ? error.response.data
                : (error.response?.data as ApiActionResponse<unknown> | undefined)?.message;
            throw new Error(apiMessage || "Inregistrare esuata");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Inregistrare esuata");
    }
};
